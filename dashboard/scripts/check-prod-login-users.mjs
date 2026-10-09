import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";

const EMAILS = ["admin@aplus-lab.local", "newclient@example.com"];
const PASSWORD = "TestPass123!";

function parseEnvFile(path) {
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/))
    .filter(Boolean)
    .map((match) => {
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return [match[1], value];
    });
}

function pickProdUrl(entries) {
  const directUrl = entries.find(
    ([key, value]) =>
      key === "DATABASE_POSTGRES_URL" && /^(postgres|postgresql):\/\//.test(value)
  )?.[1];
  if (!directUrl) throw new Error("Could not find DATABASE_POSTGRES_URL in .env.");
  const url = new URL(directUrl);
  url.searchParams.delete("schema");
  return url.toString();
}

const prisma = new PrismaClient({
  datasources: { db: { url: pickProdUrl(parseEnvFile(".env")) } },
});

try {
  for (const email of EMAILS) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        box: { select: { number: true, status: true, kitStatus: true } },
      },
    });
    if (!user) {
      console.log(`${email}: missing`);
      continue;
    }

    const passwordMatches = await bcrypt.compare(PASSWORD, user.passwordHash);
    console.log(
      `${email}: present, role=${user.role}, passwordMatches=${passwordMatches}, box=${
        user.box?.number ?? "none"
      }`
    );
  }
} finally {
  await prisma.$disconnect();
}
