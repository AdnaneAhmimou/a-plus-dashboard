import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/admin/boxes/[id]/mark-sent/route";
import { signAccessToken } from "@/lib/auth/jwt";

async function makeRequest(role: "ADMIN" | "PATIENT" = "ADMIN") {
  const token = await signAccessToken({
    sub: "admin_1",
    email: "admin@example.com",
    role,
  });
  return new NextRequest("http://localhost/api/admin/boxes/box_1/mark-sent", {
    method: "POST",
    headers: { cookie: `access_token=${token}` },
  });
}

function makeParams(id = "box_1") {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/admin/boxes/[id]/mark-sent", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns 403 for a non-admin session", async () => {
    const res = await POST(await makeRequest("PATIENT"), makeParams());
    expect(res.status).toBe(403);
    expect(prismaMock.box.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the box does not exist", async () => {
    prismaMock.box.findUnique.mockResolvedValue(null);
    const res = await POST(await makeRequest(), makeParams());
    expect(res.status).toBe(404);
  });

  it("marks an available box as sent", async () => {
    prismaMock.box.findUnique.mockResolvedValue({
      id: "box_1",
      status: "AVAILABLE",
    });
    prismaMock.box.update.mockResolvedValue({ id: "box_1", status: "SENT" });

    const res = await POST(await makeRequest(), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.box.status).toBe("SENT");
    expect(prismaMock.box.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "box_1" },
        data: { status: "SENT" },
      })
    );
  });

  it("rejects marking a non-available box as sent (409)", async () => {
    prismaMock.box.findUnique.mockResolvedValue({
      id: "box_1",
      status: "ASSOCIATED",
    });

    const res = await POST(await makeRequest(), makeParams());
    expect(res.status).toBe(409);
    expect(prismaMock.box.update).not.toHaveBeenCalled();
  });
});
