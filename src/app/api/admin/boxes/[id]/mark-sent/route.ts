import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorResponse } from "@/lib/api-response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const box = await prisma.box.findUnique({ where: { id } });
  if (!box) return errorResponse("Box not found", 404);

  if (box.status !== "AVAILABLE") {
    return errorResponse("Only an available box can be marked as sent", 409);
  }

  const updated = await prisma.box.update({
    where: { id: box.id },
    data: { status: "SENT" },
  });

  return NextResponse.json({ box: updated });
}
