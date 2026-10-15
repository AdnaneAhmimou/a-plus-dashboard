import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
const session = vi.hoisted(() => ({ value: { sub: "user-1" } as { sub: string } | null }));
vi.mock("@/lib/auth/session", () => ({
  getSessionFromRequest: vi.fn(async () => session.value),
}));

import { GET, PATCH } from "@/app/api/account/notifications/route";

function request(method: "GET" | "PATCH", body?: unknown) {
  return new NextRequest("http://localhost/api/account/notifications", {
    method,
    headers: { "content-type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

describe("/api/account/notifications", () => {
  beforeEach(() => {
    resetPrismaMock();
    session.value = { sub: "user-1" };
  });

  it("reads preferences for the authenticated user", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      pushNotificationsEnabled: true,
      emailNotificationsEnabled: false,
    });
    const response = await GET(request("GET"));
    expect(response.status).toBe(200);
    expect((await response.json()).preferences.emailNotificationsEnabled).toBe(false);
  });

  it("updates both preference flags", async () => {
    prismaMock.user.update.mockResolvedValue({
      pushNotificationsEnabled: false,
      emailNotificationsEnabled: true,
    });
    const response = await PATCH(
      request("PATCH", { pushNotificationsEnabled: false, emailNotificationsEnabled: true }),
    );
    expect(response.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: { pushNotificationsEnabled: false, emailNotificationsEnabled: true },
      }),
    );
  });
});
