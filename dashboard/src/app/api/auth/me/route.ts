import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/api-response";
import { isCourierConfigured } from "@/lib/courier/chrono-diali";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return errorResponse("Not authenticated", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      emailVerified: true,
      pushNotificationsEnabled: true,
      emailNotificationsEnabled: true,
      createdAt: true,
      addressLine1: true,
      city: true,
      box: {
        select: {
          number: true,
          kitStatus: true,
          pickupRequestedAt: true,
          pickedUpAt: true,
          inTransitAt: true,
          testingAt: true,
          resultsReadyAt: true,
        },
      },
    },
  });

  if (!user) {
    return errorResponse("Not authenticated", 401);
  }

  // Not consumed by the web app (it reads the user straight off Prisma in
  // server components — see getCurrentUser) — box/address/courier are
  // additive here only for the mobile client, which has no equivalent
  // server-side access and needs this over the wire.
  return NextResponse.json({
    user,
    courierConfigured: isCourierConfigured(),
  });
}
