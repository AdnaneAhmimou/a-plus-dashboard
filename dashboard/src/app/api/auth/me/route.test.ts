import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { GET } from "@/app/api/auth/me/route";
import { signAccessToken } from "@/lib/auth/jwt";

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns 401 when there is no access token cookie", async () => {
    const req = new NextRequest("http://localhost/api/auth/me");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 for a malformed access token", async () => {
    const req = new NextRequest("http://localhost/api/auth/me", {
      headers: { cookie: "access_token=garbage" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns the current user for a valid access token", async () => {
    const token = await signAccessToken({
      sub: "user_1",
      email: "patient@example.com",
      role: "PATIENT",
    });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "patient@example.com",
      firstName: "Jane",
      lastName: "Doe",
      phone: null,
      role: "PATIENT",
      emailVerified: false,
      createdAt: new Date(),
    });

    const req = new NextRequest("http://localhost/api/auth/me", {
      headers: { cookie: `access_token=${token}` },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user.email).toBe("patient@example.com");
  });

  it("returns 401 if the user was deleted after the token was issued", async () => {
    const token = await signAccessToken({
      sub: "deleted_user",
      email: "gone@example.com",
      role: "PATIENT",
    });
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/auth/me", {
      headers: { cookie: `access_token=${token}` },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
