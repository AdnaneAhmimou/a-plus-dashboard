import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) return errorResponse("Not authenticated", 401);

  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: { box: true },
  });
  if (!report) return errorResponse("Report not found", 404);

  const isAdmin = session.role === "ADMIN" || session.role === "SUPER_ADMIN";
  const isOwner = session.sub === report.box.userId;
  if (!isAdmin && !isOwner) {
    return errorResponse("Not authorized", 403);
  }

  return new NextResponse(new Uint8Array(report.content), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${report.fileName}"`,
      "Content-Length": String(report.fileSize),
      "Cache-Control": "private, no-store",
    },
  });
}
