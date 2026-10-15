import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
const session = vi.hoisted(() => ({ value: { sub: "user-1" } as { sub: string } | null }));
const password = vi.hoisted(() => ({ matches: true }));
vi.mock("@/lib/auth/session", () => ({
  getSessionFromRequest: vi.fn(async () => session.value),
}));
vi.mock("@/lib/auth/password", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/password")>("@/lib/auth/password");
  return { ...actual, verifyPassword: vi.fn(async () => password.matches), hashPassword: vi.fn(async () => "new-hash") };
});

import { POST } from "@/app/api/account/password/route";

function request(body: unknown) {
  return new NextRequest("http://localhost/api/account/password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/account/password", () => {
  beforeEach(() => {
    resetPrismaMock();
    session.value = { sub: "user-1" };
    password.matches = true;
    prismaMock.user.findUnique.mockResolvedValue({ id: "user-1", passwordHash: "old-hash" });
  });

  it("rejects an unauthenticated request", async () => {
    session.value = null;
    expect((await POST(request({ currentPassword: "OldPass1", newPassword: "NewPass1A" }))).status).toBe(401);
  });

  it("rejects the wrong current password without changing data", async () => {
    password.matches = false;
    const response = await POST(request({ currentPassword: "WrongPass1", newPassword: "NewPass1A" }));
    expect(response.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("updates the password, revokes sessions, and clears cookies", async () => {
    const response = await POST(request({ currentPassword: "OldPass1", newPassword: "NewPass1A" }));
    expect(response.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { passwordHash: "new-hash" },
    });
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toContain("access_token=");
  });
});
