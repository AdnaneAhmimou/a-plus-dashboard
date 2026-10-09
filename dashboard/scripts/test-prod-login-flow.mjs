import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

const EMAIL = "newclient@example.com";
const PASSWORD = "TestPass123!";

function parseEnvFile(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

function prodUrl(env) {
  const value = env.DATABASE_POSTGRES_URL ?? env.DATABASE_URL;
  if (!value) throw new Error("Missing production database URL.");
  const url = new URL(value);
  url.searchParams.delete("schema");
  return url.toString();
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

const env = parseEnvFile(".env");
const prisma = new PrismaClient({ datasources: { db: { url: prodUrl(env) } } });
const encoder = new TextEncoder();

try {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error("User not found.");

  const passwordMatches = await bcrypt.compare(PASSWORD, user.passwordHash);
  console.log(`passwordMatches=${passwordMatches}`);
  if (!passwordMatches) process.exit(1);

  await new SignJWT({ sub: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_TTL ?? "15m")
    .sign(encoder.encode(env.JWT_ACCESS_SECRET));

  const refreshToken = await new SignJWT({ sub: user.id, jti: randomUUID() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${Number(env.JWT_REFRESH_TTL_DAYS ?? 30)}d`)
    .sign(encoder.encode(env.JWT_REFRESH_SECRET));

  const row = await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(
        Date.now() + Number(env.JWT_REFRESH_TTL_DAYS ?? 30) * 24 * 60 * 60 * 1000
      ),
    },
    select: { id: true },
  });
  await prisma.refreshToken.delete({ where: { id: row.id } });
  console.log("sessionCreateAndCleanup=ok");
} finally {
  await prisma.$disconnect();
}
