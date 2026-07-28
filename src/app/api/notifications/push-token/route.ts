import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse, zodErrorResponse } from "@/lib/api-response";

const bodySchema = z.object({ token: z.string().min(1) });

// Called from the client once a device is granted notification permission
// and Firebase hands back an FCM token. Upserted on `token` (not
// userId+token) so a token that moved to a different account — e.g. a
// shared browser where someone logged out and a different patient logged
// in — is reassigned rather than duplicated.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return errorResponse("Not authenticated", 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  await prisma.pushToken.upsert({
    where: { token: parsed.data.token },
    update: { userId: session.sub },
    create: { token: parsed.data.token, userId: session.sub },
  });

  return NextResponse.json({ ok: true });
}
