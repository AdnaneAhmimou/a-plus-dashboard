import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";

export const getCurrentUser = cache(async () => {
  const session = await getSessionFromCookies();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.sub },
    include: { box: true },
  });
});
