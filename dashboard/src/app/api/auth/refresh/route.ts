import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { hashToken } from "@/lib/auth/tokens";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/cookies";
import { errorResponse } from "@/lib/api-response";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return errorResponse("Not authenticated", 401);
  }

  let payload;
  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch {
    const res = errorResponse("Session expired, please log in again", 401);
    clearAuthCookies(res);
    return res;
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (
    !stored ||
    stored.revokedAt ||
    stored.expiresAt < new Date() ||
    stored.userId !== payload.sub
  ) {
    const res = errorResponse("Session expired, please log in again", 401);
    clearAuthCookies(res);
    return res;
  }

  // Rotate: revoke the used refresh token and issue a new one.
  const newJti = randomUUID();
  const newRefreshToken = await signRefreshToken({ sub: stored.userId, jti: newJti });

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefreshToken),
        userId: stored.userId,
        expiresAt: new Date(
          Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
        ),
      },
    }),
  ]);

  const accessToken = await signAccessToken({
    sub: stored.user.id,
    email: stored.user.email,
    role: stored.user.role,
  });

  const res = NextResponse.json({ success: true });
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, newRefreshToken);
  return res;
}
