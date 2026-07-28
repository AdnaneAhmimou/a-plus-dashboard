import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { hashToken } from "@/lib/auth/tokens";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth/cookies";
import { registerSchema } from "@/lib/auth/validation";
import { errorResponse, zodErrorResponse } from "@/lib/api-response";
import { env } from "@/lib/env";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return errorResponse("Invalid JSON body", 400);

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { email, password, firstName, lastName, boxNumber, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return errorResponse("An account with this email already exists", 409);
  }

  const box = await prisma.box.findUnique({ where: { number: boxNumber } });
  if (!box) {
    return errorResponse(
      "Box number not recognized. Please check the number on your kit and try again.",
      404
    );
  }
  if (box.userId) {
    return errorResponse(
      "This box is already registered to another account.",
      409
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, passwordHash, firstName, lastName, phone },
    });
    await tx.box.update({
      where: { id: box.id },
      data: { userId: created.id, status: "ASSOCIATED" },
    });
    return created;
  });

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

  const res = NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        boxNumber: box.number,
        role: user.role,
      },
    },
    { status: 201 }
  );
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
  return res;
}
