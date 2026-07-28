import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";
import type { Role } from "@prisma/client";

const encoder = new TextEncoder();

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_TTL)
    .sign(encoder.encode(env.JWT_ACCESS_SECRET));
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, encoder.encode(env.JWT_ACCESS_SECRET));
  return payload as unknown as AccessTokenPayload;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export async function signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_REFRESH_TTL_DAYS}d`)
    .sign(encoder.encode(env.JWT_REFRESH_SECRET));
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, encoder.encode(env.JWT_REFRESH_SECRET));
  return payload as unknown as RefreshTokenPayload;
}
