import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/admin/boxes/route";
import { signAccessToken } from "@/lib/auth/jwt";

async function makeRequest(body: unknown, role: "ADMIN" | "PATIENT" = "ADMIN") {
  const token = await signAccessToken({
    sub: "admin_1",
    email: "admin@example.com",
    role,
  });
  return new NextRequest("http://localhost/api/admin/boxes", {
    method: "POST",
    headers: {
      cookie: `access_token=${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/boxes", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns 403 for a non-admin session", async () => {
    const res = await POST(await makeRequest({ number: "APL-1" }, "PATIENT"));
    expect(res.status).toBe(403);
    expect(prismaMock.box.create).not.toHaveBeenCalled();
  });

  it("creates a new box in AVAILABLE status", async () => {
    prismaMock.box.findUnique.mockResolvedValue(null);
    prismaMock.box.create.mockResolvedValue({
      id: "box_1",
      number: "APL-999999",
      status: "AVAILABLE",
    });

    const res = await POST(await makeRequest({ number: "APL-999999" }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.box.number).toBe("APL-999999");
    expect(prismaMock.box.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { number: "APL-999999" } })
    );
  });

  it("rejects a duplicate box number with 409", async () => {
    prismaMock.box.findUnique.mockResolvedValue({
      id: "box_1",
      number: "APL-999999",
    });

    const res = await POST(await makeRequest({ number: "APL-999999" }));
    expect(res.status).toBe(409);
    expect(prismaMock.box.create).not.toHaveBeenCalled();
  });

  it("rejects an empty box number with 400", async () => {
    const res = await POST(await makeRequest({ number: "" }));
    expect(res.status).toBe(400);
    expect(prismaMock.box.findUnique).not.toHaveBeenCalled();
  });
});
