import { describe, expect, it } from "vitest";
import { generateOpaqueToken, hashToken } from "@/lib/auth/tokens";

describe("opaque tokens", () => {
  it("generates a random 64-character hex token", () => {
    const token = generateOpaqueToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates distinct tokens on each call", () => {
    expect(generateOpaqueToken()).not.toBe(generateOpaqueToken());
  });
});

describe("hashToken", () => {
  it("is deterministic for the same input", () => {
    const token = generateOpaqueToken();
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("differs from the original token", () => {
    const token = generateOpaqueToken();
    expect(hashToken(token)).not.toBe(token);
  });

  it("produces different hashes for different tokens", () => {
    expect(hashToken(generateOpaqueToken())).not.toBe(
      hashToken(generateOpaqueToken())
    );
  });
});
