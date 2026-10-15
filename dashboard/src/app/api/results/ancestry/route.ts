import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/api-response";

/** Authenticated ancestry payload for the native client. */
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return errorResponse("Not authenticated", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { box: true },
  });
  if (!user) return errorResponse("Not authenticated", 401);
  if (!user.box) return errorResponse("No box is associated with your account", 404);

  const profile = await prisma.ancestryProfile.findUnique({
    where: { boxId: user.box.id },
    select: {
      composition: true,
      maternalHaplogroup: true,
      maternalSubhaplogroup: true,
      maternalMigration: true,
      paternalHaplogroup: true,
      paternalSubhaplogroup: true,
      paternalMigration: true,
      neanderthalPercent: true,
      neanderthalVariants: true,
      neanderthalVsAverage: true,
      neanderthalSections: true,
    },
  });

  if (!profile) return errorResponse("Ancestry profile not found", 404);
  return NextResponse.json(profile);
}
