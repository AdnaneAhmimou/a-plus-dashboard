import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/auth/refresh/route";
import { signRefreshToken } from "@/lib/auth/jwt";
import { hashToken } from "@/lib/auth/tokens";

function makeRequest(cookie?: string) {
  return new NextRequest("http://localhost/api/auth/refresh", {
    method: "POST",
    headers: cookie ? { cookie } : {},
  });
}

describe("POST /api/auth/refresh", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns 401 when there is no refresh token cookie", async () => {
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  it("rotates a valid refresh token and issues new cookies", async () => {
    const refreshToken = await signRefreshToken({ sub: "user_1", jti: "jti_1" });
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: "rt_1",
      tokenHash: hashToken(refreshToken),
      userId: "user_1",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      user: { id: "user_1", email: "patient@example.com", role: "PATIENT" },
    });
    prismaMock.refreshToken.update.mockResolvedValue({});
    prismaMock.refreshToken.create.mockResolvedValue({});

    const res = await POST(makeRequest(`refresh_token=${refreshToken}`));
    expect(res.status).toBe(200);
    expect(res.cookies.get("access_token")?.value).toBeTruthy();
    expect(res.cookies.get("refresh_token")?.value).toBeTruthy();
    expect(res.cookies.get("refresh_token")?.value).not.toBe(refreshToken);
    expect(prismaMock.refreshToken.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "rt_1" },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      })
    );
  });

  it("rejects a revoked refresh token and clears cookies", async () => {
    const refreshToken = await signRefreshToken({ sub: "user_1", jti: "jti_1" });
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: "rt_1",
      tokenHash: hashToken(refreshToken),
      userId: "user_1",
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      user: { id: "user_1", email: "patient@example.com", role: "PATIENT" },
    });

    const res = await POST(makeRequest(`refresh_token=${refreshToken}`));
    expect(res.status).toBe(401);
    expect(res.cookies.get("access_token")?.value).toBe("");
  });

  it("rejects an expired refresh token", async () => {
    const refreshToken = await signRefreshToken({ sub: "user_1", jti: "jti_1" });
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: "rt_1",
      tokenHash: hashToken(refreshToken),
      userId: "user_1",
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1000),
      user: { id: "user_1", email: "patient@example.com", role: "PATIENT" },
    });

    const res = await POST(makeRequest(`refresh_token=${refreshToken}`));
    expect(res.status).toBe(401);
  });

  it("rejects a refresh token that is not in the database (reuse/forgery)", async () => {
    const refreshToken = await signRefreshToken({ sub: "user_1", jti: "jti_1" });
    prismaMock.refreshToken.findUnique.mockResolvedValue(null);

    const res = await POST(makeRequest(`refresh_token=${refreshToken}`));
    expect(res.status).toBe(401);
  });

  it("rejects a token with a bad signature", async () => {
    const res = await POST(makeRequest("refresh_token=not-a-valid-jwt"));
    expect(res.status).toBe(401);
  });
});
