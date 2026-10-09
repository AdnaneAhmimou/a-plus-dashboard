import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import { errorResponse } from "@/lib/api-response";

export async function requireAdmin(
  req: NextRequest
): Promise<{ session: AccessTokenPayload; error?: never } | { session?: never; error: NextResponse }> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return { error: errorResponse("Not authenticated", 401) };
  }
  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    return { error: errorResponse("Not authorized", 403) };
  }
  return { session };
}
