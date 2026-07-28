import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("hashes a password to a bcrypt hash distinct from the plaintext", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(hash).not.toBe("Sup3rSecret!");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    await expect(verifyPassword("Sup3rSecret!", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    await expect(verifyPassword("WrongPassword1", hash)).resolves.toBe(false);
  });

  it("produces different hashes for the same password (unique salt)", async () => {
    const [hashA, hashB] = await Promise.all([
      hashPassword("Sup3rSecret!"),
      hashPassword("Sup3rSecret!"),
    ]);
    expect(hashA).not.toBe(hashB);
  });
});
