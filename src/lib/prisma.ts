import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// One client for the whole app, extended for Accelerate only when the
// connection string calls for it.
//
// Prisma Postgres (and Accelerate generally) hands out a URL in Prisma's
// own `prisma+postgres://` scheme, which the plain client cannot open —
// it needs the Accelerate extension. A self-hosted or Neon database
// hands out an ordinary `postgresql://` URL, which must NOT be extended.
// Deciding from the URL rather than from a separate flag keeps local
// development and production on one code path, so moving between
// providers is a change of environment variable and nothing else.
const usesAccelerate = (process.env.DATABASE_URL ?? "").startsWith(
  "prisma+postgres://"
);

function createClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // The extended client is a structural superset of PrismaClient, but its
  // type is a different one, and letting that type leak turns every
  // query result in the app into `any` (the union defeats inference).
  // The app uses no Accelerate-only API — no `cacheStrategy` anywhere —
  // so it is typed as a plain PrismaClient and the cast stays in this
  // one place.
  return usesAccelerate
    ? (client.$extends(withAccelerate()) as unknown as PrismaClient)
    : client;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
