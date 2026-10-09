import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/auth/register/route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  email: "new.patient@example.com",
  password: "GoodPass1",
  firstName: "Jane",
  lastName: "Doe",
  boxNumber: "APL-00482",
};

const availableBox = {
  id: "box_1",
  number: validPayload.boxNumber,
  userId: null,
  status: "AVAILABLE",
};

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("creates a user, associates the box, sets auth cookies, and returns 201", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.box.findUnique.mockResolvedValue(availableBox);
    prismaMock.user.create.mockResolvedValue({
      id: "user_1",
      email: validPayload.email,
      firstName: validPayload.firstName,
      lastName: validPayload.lastName,
      role: "PATIENT",
    });
    prismaMock.box.update.mockResolvedValue({});
    prismaMock.refreshToken.create.mockResolvedValue({});

    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.user.email).toBe(validPayload.email);
    expect(body.user.boxNumber).toBe(validPayload.boxNumber);

    expect(res.cookies.get("access_token")?.value).toBeTruthy();
    expect(res.cookies.get("refresh_token")?.value).toBeTruthy();
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.box.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "box_1" },
        data: expect.objectContaining({
          userId: "user_1",
          status: "ASSOCIATED",
        }),
      })
    );
  });

  it("rejects a missing box number with 400 before touching the database", async () => {
    const { boxNumber: _boxNumber, ...rest } = validPayload;
    void _boxNumber;
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects duplicate emails with 409 and does not create a user", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "existing_user" });

    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(409);
    expect(prismaMock.box.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("rejects an unrecognized box number with 404", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.box.findUnique.mockResolvedValue(null);

    const res = await POST(makeRequest(validPayload));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toMatch(/not recognized/i);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("rejects a box that is already associated with another account (409)", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.box.findUnique.mockResolvedValue({
      ...availableBox,
      userId: "someone_else",
    });

    const res = await POST(makeRequest(validPayload));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toMatch(/already registered/i);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("rejects a weak password with 400 before touching the database", async () => {
    const res = await POST(makeRequest({ ...validPayload, password: "weak" }));
    expect(res.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON with 400", async () => {
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("never returns the password hash in the response", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.box.findUnique.mockResolvedValue(availableBox);
    prismaMock.user.create.mockResolvedValue({
      id: "user_1",
      email: validPayload.email,
      firstName: validPayload.firstName,
      lastName: validPayload.lastName,
      role: "PATIENT",
      passwordHash: "$2b$12$shouldneverbeserialized",
    });
    prismaMock.box.update.mockResolvedValue({});
    prismaMock.refreshToken.create.mockResolvedValue({});

    const res = await POST(makeRequest(validPayload));
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain("passwordHash");
    expect(JSON.stringify(body)).not.toContain("shouldneverbeserialized");
  });
});
