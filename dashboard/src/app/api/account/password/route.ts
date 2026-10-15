import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { changePasswordSchema } from "@/lib/auth/validation";
import { errorResponse, zodErrorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return errorResponse("Not authenticated", 401);

  const parsed = changePasswordSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, passwordHash: true },
  });
  if (!user) return errorResponse("Not authenticated", 401);

  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return errorResponse("That password is not correct", 400);
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
