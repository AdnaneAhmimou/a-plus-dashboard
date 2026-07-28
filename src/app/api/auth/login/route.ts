import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { hashToken } from "@/lib/auth/tokens";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth/cookies";
import { loginSchema } from "@/lib/auth/validation";
import { errorResponse, zodErrorResponse } from "@/lib/api-response";
import { env } from "@/lib/env";

const GENERIC_INVALID_CREDENTIALS = "Invalid email or password";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return errorResponse("Invalid JSON body", 400);

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return errorResponse(GENERIC_INVALID_CREDENTIALS, 401);
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return errorResponse(GENERIC_INVALID_CREDENTIALS, 401);
  }

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const jti = randomUUID();
  const refreshToken = await signRefreshToken({ sub: user.id, jti });

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(
        Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
  return res;
}
