import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorResponse } from "@/lib/api-response";
import { getNextKitStatus, KIT_STATUS_TIMESTAMP_FIELD } from "@/lib/dashboard/kit-status";
import { notifyKitStatusChange, getKitStatusPushPayload } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/firebase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const patient = await prisma.user.findUnique({
    where: { id },
    include: { box: true },
  });
  if (!patient || patient.role !== "PATIENT") {
    return errorResponse("Patient not found", 404);
  }
  if (!patient.box) {
    return errorResponse("No box is associated with this patient", 404);
  }

  const next = getNextKitStatus(patient.box.kitStatus);
  if (!next) {
    return errorResponse("This box has no further status to advance to", 409);
  }

  const timestampField = KIT_STATUS_TIMESTAMP_FIELD[next];
  const updated = await prisma.$transaction(async (tx) => {
    const box = await tx.box.update({
      where: { id: patient.box!.id },
      data: {
        kitStatus: next,
        ...(timestampField ? { [timestampField]: new Date() } : {}),
      },
    });
    await notifyKitStatusChange(tx, patient.id, next);
    return box;
  });

  const pushPayload = getKitStatusPushPayload(next);
  if (pushPayload) await sendPushToUser(patient.id, pushPayload);

  return NextResponse.json({ kitStatus: updated.kitStatus });
}
