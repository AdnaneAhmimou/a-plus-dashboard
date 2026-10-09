import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/auth/login/route";
import { hashPassword } from "@/lib/auth/password";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("logs in with correct credentials and sets auth cookies", async () => {
    const passwordHash = await hashPassword("GoodPass1");
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "patient@example.com",
      passwordHash,
      firstName: "Jane",
      lastName: "Doe",
      role: "PATIENT",
    });
    prismaMock.refreshToken.create.mockResolvedValue({});

    const res = await POST(
      makeRequest({ email: "patient@example.com", password: "GoodPass1" })
    );

    expect(res.status).toBe(200);
    expect(res.cookies.get("access_token")?.value).toBeTruthy();
    expect(res.cookies.get("refresh_token")?.value).toBeTruthy();
  });

  it("returns a generic 401 for a nonexistent email (no account enumeration)", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await POST(
      makeRequest({ email: "nobody@example.com", password: "GoodPass1" })
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Invalid email or password");
  });

  it("returns the same generic 401 for a wrong password", async () => {
    const passwordHash = await hashPassword("GoodPass1");
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "patient@example.com",
      passwordHash,
      firstName: "Jane",
      lastName: "Doe",
      role: "PATIENT",
    });

    const res = await POST(
      makeRequest({ email: "patient@example.com", password: "WrongPass1" })
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Invalid email or password");
  });

  it("does not create a refresh token when login fails", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await POST(makeRequest({ email: "nobody@example.com", password: "x" }));
    expect(prismaMock.refreshToken.create).not.toHaveBeenCalled();
  });
});
