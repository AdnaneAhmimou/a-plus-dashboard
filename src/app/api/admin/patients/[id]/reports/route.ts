import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorResponse } from "@/lib/api-response";
import { notifyKitStatusChange, getKitStatusPushPayload } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/firebase/admin";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const PDF_MAGIC_BYTES = "%PDF-";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin(req);
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

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!formData || !(file instanceof File)) {
    return errorResponse("A PDF file is required", 400);
  }
  if (file.type !== "application/pdf") {
    return errorResponse("Only PDF files are accepted", 400);
  }
  if (file.size === 0) {
    return errorResponse("The uploaded file is empty", 400);
  }
  if (file.size > MAX_FILE_SIZE) {
    return errorResponse("File exceeds the 10 MB size limit", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("latin1") !== PDF_MAGIC_BYTES) {
    return errorResponse("The uploaded file is not a valid PDF", 400);
  }

  const latest = await prisma.report.findFirst({
    where: { boxId: patient.box.id },
    orderBy: { version: "desc" },
  });
  const version = (latest?.version ?? 0) + 1;
  const willMarkReady = patient.box.kitStatus !== "RESULTS_READY";

  const report = await prisma.$transaction(async (tx) => {
    const created = await tx.report.create({
      data: {
        boxId: patient.box!.id,
        version,
        fileName: file.name || `report-v${version}.pdf`,
        fileSize: file.size,
        content: buffer,
        uploadedById: session.sub,
      },
    });

    if (willMarkReady) {
      await tx.box.update({
        where: { id: patient.box!.id },
        data: { kitStatus: "RESULTS_READY", resultsReadyAt: new Date() },
      });
      await notifyKitStatusChange(tx, patient.id, "RESULTS_READY");
    }

    return created;
  });

  if (willMarkReady) {
    const pushPayload = getKitStatusPushPayload("RESULTS_READY");
    if (pushPayload) await sendPushToUser(patient.id, pushPayload);
  }

  return NextResponse.json(
    {
      report: {
        id: report.id,
        version: report.version,
        fileName: report.fileName,
        fileSize: report.fileSize,
        createdAt: report.createdAt,
      },
    },
    { status: 201 }
  );
}
