import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  chronoEventTypeToKitStatus,
  isForwardKitStatusProgress,
} from "@/lib/courier/status-mapping";
import { KIT_STATUS_TIMESTAMP_FIELD } from "@/lib/dashboard/kit-status";
import { notifyKitStatusChange, getKitStatusPushPayload } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/firebase/admin";

// Chrono Diali's docs don't specify HMAC signing for webhook deliveries,
// so a shared secret in the URL (registered with them as part of the
// webhook URL) is the only auth this endpoint has. If no secret is
// configured we accept anyway — safer to receive unauthenticated events
// than to silently drop real ones before the secret has been set up.
function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CHRONO_DIALI_WEBHOOK_SECRET;
  if (!expected) return true;
  return req.nextUrl.searchParams.get("secret") === expected;
}

// Always acknowledge with 200 for anything that isn't an auth/parsing
// failure — an unrecognized reference_number or a courier event with no
// KitStatus equivalent are both expected, routine cases, not errors, and
// a non-2xx here would make Chrono Diali retry indefinitely.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload.type !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const referenceNumber: string | undefined = payload.reference_number;
  const box = referenceNumber
    ? await prisma.box.findUnique({
        where: { courierReferenceNumber: referenceNumber },
        include: { user: true },
      })
    : null;

  await prisma.courierEvent.create({
    data: { type: payload.type, payload, boxId: box?.id },
  });

  if (!box || !box.user) {
    return NextResponse.json({ ok: true, matched: false });
  }

  const nextStatus = chronoEventTypeToKitStatus(payload.type);
  if (!nextStatus || !isForwardKitStatusProgress(box.kitStatus, nextStatus)) {
    return NextResponse.json({ ok: true, matched: true, statusChanged: false });
  }

  const timestampField = KIT_STATUS_TIMESTAMP_FIELD[nextStatus];
  await prisma.$transaction(async (tx) => {
    await tx.box.update({
      where: { id: box.id },
      data: {
        kitStatus: nextStatus,
        ...(timestampField ? { [timestampField]: new Date() } : {}),
      },
    });
    await notifyKitStatusChange(tx, box.user!.id, nextStatus);
  });

  const pushPayload = getKitStatusPushPayload(nextStatus);
  if (pushPayload) await sendPushToUser(box.user.id, pushPayload);

  return NextResponse.json({ ok: true, matched: true, statusChanged: true });
}
