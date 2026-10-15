import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
const session = vi.hoisted(() => ({ value: { sub: "user-1" } as { sub: string } | null }));
vi.mock("@/lib/auth/session", () => ({
  getSessionFromRequest: vi.fn(async () => session.value),
}));

import { PATCH } from "@/app/api/account/route";

function request(body: unknown) {
  return new NextRequest("http://localhost/api/account", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/account", () => {
  beforeEach(() => {
    resetPrismaMock();
    session.value = { sub: "user-1" };
  });

  it("requires authentication", async () => {
    session.value = null;
    const response = await PATCH(request({ firstName: "Jane" }));
    expect(response.status).toBe(401);
  });

  it("validates and updates only account fields", async () => {
    prismaMock.user.update.mockResolvedValue({ id: "user-1", firstName: "Jane" });
    const response = await PATCH(
      request({ firstName: " Jane ", city: "Casablanca" }),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: { firstName: "Jane", city: "Casablanca" },
      }),
    );
  });
});
