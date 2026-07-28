import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorResponse, zodErrorResponse } from "@/lib/api-response";
import { updatePatientSchema } from "@/lib/admin/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const patient = await prisma.user.findUnique({ where: { id } });
  if (!patient || patient.role !== "PATIENT") {
    return errorResponse("Patient not found", 404);
  }

  const body = await req.json().catch(() => null);
  if (!body) return errorResponse("Invalid JSON body", 400);

  const parsed = updatePatientSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { firstName, lastName, phone } = parsed.data;

  const updated = await prisma.user.update({
    where: { id: patient.id },
    data: { firstName, lastName, phone: phone === "" ? null : phone },
  });

  return NextResponse.json({
    patient: {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
    },
  });
}
