import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("clears auth cookies and revokes the refresh token", async () => {
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 1 });

    const req = new NextRequest("http://localhost/api/auth/logout", {
      method: "POST",
      headers: { cookie: "refresh_token=some-refresh-token" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(res.cookies.get("access_token")?.value).toBe("");
    expect(res.cookies.get("refresh_token")?.value).toBe("");
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledTimes(1);
  });

  it("clears cookies even when no refresh token cookie is present", async () => {
    const req = new NextRequest("http://localhost/api/auth/logout", {
      method: "POST",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prismaMock.refreshToken.updateMany).not.toHaveBeenCalled();
  });
});
