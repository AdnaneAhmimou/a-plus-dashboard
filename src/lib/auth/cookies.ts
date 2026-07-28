import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const baseCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export function setAccessTokenCookie(res: NextResponse, token: string) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: 15 * 60,
  });
}

export function setRefreshTokenCookie(res: NextResponse, token: string) {
  res.cookies.set(REFRESH_TOKEN_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60,
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...baseCookieOptions, maxAge: 0 });
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...baseCookieOptions, maxAge: 0 });
}
