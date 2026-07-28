import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorResponse, zodErrorResponse } from "@/lib/api-response";
import { createBoxSchema } from "@/lib/admin/validation";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json().catch(() => null);
  if (!body) return errorResponse("Invalid JSON body", 400);

  const parsed = createBoxSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const existing = await prisma.box.findUnique({
    where: { number: parsed.data.number },
  });
  if (existing) {
    return errorResponse("A box with this number already exists", 409);
  }

  const box = await prisma.box.create({
    data: { number: parsed.data.number },
  });

  return NextResponse.json({ box }, { status: 201 });
}
