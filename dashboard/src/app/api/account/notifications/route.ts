import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse, zodErrorResponse } from "@/lib/api-response";
import { notificationPreferencesSchema } from "@/lib/auth/validation";

const preferenceSelect = {
  pushNotificationsEnabled: true,
  emailNotificationsEnabled: true,
} as const;

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return errorResponse("Not authenticated", 401);

  const preferences = await prisma.user.findUnique({
    where: { id: session.sub },
    select: preferenceSelect,
  });
  if (!preferences) return errorResponse("Not authenticated", 401);

  return NextResponse.json({ preferences });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return errorResponse("Not authenticated", 401);

  const parsed = notificationPreferencesSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const preferences = await prisma.user.update({
    where: { id: session.sub },
    data: parsed.data,
    select: preferenceSelect,
  });

  return NextResponse.json({ preferences });
}
