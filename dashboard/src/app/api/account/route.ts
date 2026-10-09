import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { errorResponse } from "@/lib/api-response";

/**
 * Deletes the signed-in user's own account and their genetic data.
 *
 * Two things make this more than a `user.delete()`.
 *
 * First, almost none of a patient's data hangs off User. Reports,
 * analysis results, the ancestry profile, import runs and their raw
 * captures all belong to Box, and User -> Box is `SetNull`. Deleting the
 * user alone would leave every genetic result sitting in the database,
 * still attached to the box. This deletes those rows explicitly.
 *
 * Second, the box is not returned to AVAILABLE. Registration accepts any
 * box whose `userId` is null, so a freed number could be claimed by
 * whoever knows it — and the physical kit has already been used. The box
 * is RETIRED instead: kept for the lab's inventory record, unusable for
 * a new registration.
 *
 * The password is required again even though the caller is already
 * signed in. It is the difference between "someone is using this
 * account" and "the account owner decided to erase their genetic data",
 * and an unattended logged-in laptop should not be enough.
 */
export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return errorResponse("Not authenticated", 401);

  const body = await req.json().catch(() => null);
  const password = (body as { password?: unknown } | null)?.password;
  if (typeof password !== "string" || password.length === 0) {
    return errorResponse("Your password is required to delete the account", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { box: true },
  });
  if (!user) return errorResponse("Not authenticated", 401);

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    return errorResponse("That password is not correct", 400);
  }

  // An admin deleting themselves must not be able to lock everyone out of
  // the admin panel. There is no self-serve way back in: promoting an
  // account is a manual database update.
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    const remainingAdmins = await prisma.user.count({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, id: { not: user.id } },
    });
    if (remainingAdmins === 0) {
      return errorResponse(
        "This is the only administrator account. Promote another account before deleting this one.",
        409
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    if (user.box) {
      const boxId = user.box.id;

      // Order matters only for rows that do not cascade; the rest are
      // listed explicitly so that what is erased is readable here rather
      // than implied by the schema.
      await tx.analysisResult.deleteMany({ where: { boxId } });
      await tx.ancestryProfile.deleteMany({ where: { boxId } });
      await tx.report.deleteMany({ where: { boxId } });
      await tx.resultImport.deleteMany({ where: { boxId } }); // captures cascade
      // Courier events carry the patient's pickup address in their raw
      // payload, so they are erased too rather than kept as audit.
      await tx.courierEvent.deleteMany({ where: { boxId } });

      await tx.box.update({
        where: { id: boxId },
        data: {
          userId: null,
          status: "RETIRED",
          kitStatus: "NOT_REQUESTED",
          pickupRequestedAt: null,
          pickedUpAt: null,
          inTransitAt: null,
          testingAt: null,
          resultsReadyAt: null,
          courierReferenceNumber: null,
          courierPickupId: null,
        },
      });
    }

    // Notifications, push tokens, refresh tokens and password-reset
    // tokens all cascade from User.
    await tx.user.delete({ where: { id: user.id } });
  });

  const res = NextResponse.json({ success: true });
  clearAuthCookies(res);
  return res;
}
