import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/auth/jwt";

export async function getSessionFromRequest(
  req: NextRequest
): Promise<AccessTokenPayload | null> {
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return verifyAccessTokenSafe(token);
}

export async function getSessionFromCookies(): Promise<AccessTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  return verifyAccessTokenSafe(token);
}

async function verifyAccessTokenSafe(
  token: string | undefined
): Promise<AccessTokenPayload | null> {
  if (!token) return null;
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}
