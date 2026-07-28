import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";

const encoder = new TextEncoder();

describe("access tokens", () => {
  it("round-trips the payload through sign and verify", async () => {
    const token = await signAccessToken({
      sub: "user_1",
      email: "patient@example.com",
      role: "PATIENT",
    });
    const payload = await verifyAccessToken(token);
    expect(payload.sub).toBe("user_1");
    expect(payload.email).toBe("patient@example.com");
    expect(payload.role).toBe("PATIENT");
  });

  it("rejects a token signed with a different secret", async () => {
    const forged = await new SignJWT({
      sub: "user_1",
      email: "patient@example.com",
      role: "PATIENT",
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(encoder.encode("wrong-secret-wrong-secret-wrong-secret"));
    await expect(verifyAccessToken(forged)).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    const expired = await new SignJWT({
      sub: "user_1",
      email: "patient@example.com",
      role: "PATIENT",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 100)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
      .sign(encoder.encode(process.env.JWT_ACCESS_SECRET!));
    await expect(verifyAccessToken(expired)).rejects.toThrow(/exp/i);
  });

  it("rejects a malformed token", async () => {
    await expect(verifyAccessToken("not-a-real-token")).rejects.toThrow();
  });
});

describe("refresh tokens", () => {
  it("round-trips the payload through sign and verify", async () => {
    const token = await signRefreshToken({ sub: "user_1", jti: "jti_1" });
    const payload = await verifyRefreshToken(token);
    expect(payload.sub).toBe("user_1");
    expect(payload.jti).toBe("jti_1");
  });

  it("is signed with a different secret than access tokens", async () => {
    const refreshToken = await signRefreshToken({ sub: "user_1", jti: "jti_1" });
    await expect(verifyAccessToken(refreshToken)).rejects.toThrow();
  });
});
