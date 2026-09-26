import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse, zodErrorResponse } from "@/lib/api-response";
import {
  notifyKitStatusChange,
  getKitStatusPushPayload,
  notifyAdminsOfPickupRequest,
  getAdminPickupRequestPushPayload,
} from "@/lib/notifications";
import { sendPushToUser } from "@/lib/firebase/admin";
import {
  createConsignment,
  createPickup,
  isCourierConfigured,
  CourierApiError,
  CourierNotConfiguredError,
} from "@/lib/courier/chrono-diali";

// All optional: only required when the patient has no address on file
// yet and the courier is actually configured (see the check below).
const bodySchema = z.object({
  addressLine1: z.string().trim().min(1).max(200).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  country: z.string().trim().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return errorResponse("Not authenticated", 401);

  const rawBody = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(rawBody ?? {});
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { box: true },
  });
  if (!user) return errorResponse("Not authenticated", 401);
  if (!user.box) return errorResponse("No box is associated with your account", 404);

  if (user.box.kitStatus !== "NOT_REQUESTED") {
    return errorResponse("A pickup has already been requested for this box", 409);
  }

  const addressLine1 = parsed.data.addressLine1 ?? user.addressLine1 ?? undefined;
  const city = parsed.data.city ?? user.city ?? undefined;
  const country = parsed.data.country ?? user.country ?? "Morocco";

  let courierReferenceNumber: string | undefined;
  let courierPickupId: string | undefined;

  if (isCourierConfigured()) {
    if (!addressLine1 || !city) {
      return errorResponse(
        "Please provide your pickup address to request a courier pickup",
        400,
        {
          addressLine1: addressLine1 ? undefined : ["Address is required"],
          city: city ? undefined : ["City is required"],
        }
      );
    }

    const patient = {
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone || "",
      addressLine1,
      city,
      country,
    };

    try {
      const consignment = await createConsignment({
        ...patient,
        boxNumber: user.box.number,
      });
      courierReferenceNumber = consignment.referenceNumber;
      const pickup = await createPickup(patient);
      courierPickupId = pickup.pickupId;
    } catch (err) {
      if (err instanceof CourierNotConfiguredError) {
        // Race with isCourierConfigured() above — treat as local-only.
      } else if (err instanceof CourierApiError) {
        return errorResponse(
          `Courier request failed: ${err.message}`,
          err.status >= 400 && err.status < 500 ? 400 : 502
        );
      } else {
        return errorResponse("Courier request failed. Please try again.", 502);
      }
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (parsed.data.addressLine1 || parsed.data.city || parsed.data.country) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          addressLine1: parsed.data.addressLine1 ?? user.addressLine1,
          city: parsed.data.city ?? user.city,
          country: parsed.data.country ?? user.country,
        },
      });
    }

    const box = await tx.box.update({
      where: { id: user.box!.id },
      data: {
        kitStatus: "PICKUP_REQUESTED",
        pickupRequestedAt: new Date(),
        ...(courierReferenceNumber ? { courierReferenceNumber } : {}),
        ...(courierPickupId ? { courierPickupId } : {}),
      },
    });
    await notifyKitStatusChange(tx, user.id, "PICKUP_REQUESTED");
    const notifiedAdminIds = await notifyAdminsOfPickupRequest(
      tx,
      `${user.firstName} ${user.lastName}`,
      user.box!.number
    );
    return { box, notifiedAdminIds };
  });

  const pushPayload = getKitStatusPushPayload("PICKUP_REQUESTED");
  if (pushPayload) await sendPushToUser(user.id, pushPayload);

  const adminPushPayload = getAdminPickupRequestPushPayload(
    `${user.firstName} ${user.lastName}`,
    updated.box.number
  );
  await Promise.all(
    updated.notifiedAdminIds.map((adminId) =>
      sendPushToUser(adminId, adminPushPayload)
    )
  );

  return NextResponse.json({
    kitStatus: updated.box.kitStatus,
    pickupRequestedAt: updated.box.pickupRequestedAt,
    courierReferenceNumber: updated.box.courierReferenceNumber,
  });
}
