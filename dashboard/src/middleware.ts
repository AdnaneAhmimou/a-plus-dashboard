import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/auth/jwt";

const AUTH_PATHS = ["/login", "/register"];

async function getSession(req: NextRequest): Promise<AccessTokenPayload | null> {
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

function homeFor(role: AccessTokenPayload["role"]): string {
  return role === "ADMIN" || role === "SUPER_ADMIN" ? "/admin" : "/dashboard";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSession(req);

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role === "ADMIN" || session.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && session) {
    return NextResponse.redirect(new URL(homeFor(session.role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
