import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/auth/reset-password/route";
import { hashToken, generateOpaqueToken } from "@/lib/auth/tokens";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/reset-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("resets the password for a valid, unused, unexpired token", async () => {
    const rawToken = generateOpaqueToken();
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: "reset_1",
      tokenHash: hashToken(rawToken),
      userId: "user_1",
      usedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.passwordResetToken.update.mockResolvedValue({});
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });

    const res = await POST(makeRequest({ token: rawToken, password: "NewGoodPass1" }));
    expect(res.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user_1" } })
    );
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user_1", revokedAt: null },
      })
    );
  });

  it("rejects an unknown token with 400", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(null);
    const res = await POST(
      makeRequest({ token: "unknown-token", password: "NewGoodPass1" })
    );
    expect(res.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rejects an already-used token", async () => {
    const rawToken = generateOpaqueToken();
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: "reset_1",
      tokenHash: hashToken(rawToken),
      userId: "user_1",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    });

    const res = await POST(makeRequest({ token: rawToken, password: "NewGoodPass1" }));
    expect(res.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rejects an expired token", async () => {
    const rawToken = generateOpaqueToken();
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: "reset_1",
      tokenHash: hashToken(rawToken),
      userId: "user_1",
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    });

    const res = await POST(makeRequest({ token: rawToken, password: "NewGoodPass1" }));
    expect(res.status).toBe(400);
  });

  it("rejects a weak new password with 400", async () => {
    const res = await POST(makeRequest({ token: "abc", password: "weak" }));
    expect(res.status).toBe(400);
    expect(prismaMock.passwordResetToken.findUnique).not.toHaveBeenCalled();
  });
});
