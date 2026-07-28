import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { PATCH } from "@/app/api/admin/patients/[id]/route";
import { signAccessToken } from "@/lib/auth/jwt";

async function makeRequest(body: unknown, role: "ADMIN" | "PATIENT" = "ADMIN") {
  const token = await signAccessToken({
    sub: "admin_1",
    email: "admin@example.com",
    role,
  });
  return new NextRequest("http://localhost/api/admin/patients/patient_1", {
    method: "PATCH",
    headers: {
      cookie: `access_token=${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function makeParams(id = "patient_1") {
  return { params: Promise.resolve({ id }) };
}

const validPayload = { firstName: "Jane", lastName: "Doe", phone: "0600000000" };

describe("PATCH /api/admin/patients/[id]", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns 403 for a non-admin session", async () => {
    const res = await PATCH(await makeRequest(validPayload, "PATIENT"), makeParams());
    expect(res.status).toBe(403);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the patient does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await PATCH(await makeRequest(validPayload), makeParams());
    expect(res.status).toBe(404);
  });

  it("updates the patient's contact info", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
    });
    prismaMock.user.update.mockResolvedValue({
      id: "patient_1",
      firstName: "Jane",
      lastName: "Doe",
      phone: "0600000000",
    });

    const res = await PATCH(await makeRequest(validPayload), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.patient.firstName).toBe("Jane");
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "patient_1" },
        data: { firstName: "Jane", lastName: "Doe", phone: "0600000000" },
      })
    );
  });

  it("clears the phone number when given an empty string", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
    });
    prismaMock.user.update.mockResolvedValue({
      id: "patient_1",
      firstName: "Jane",
      lastName: "Doe",
      phone: null,
    });

    await PATCH(
      await makeRequest({ ...validPayload, phone: "" }),
      makeParams()
    );

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ phone: null }) })
    );
  });

  it("rejects a missing first name with 400", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
    });
    const res = await PATCH(
      await makeRequest({ ...validPayload, firstName: "" }),
      makeParams()
    );
    expect(res.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("does not allow editing email through this route", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
    });
    prismaMock.user.update.mockResolvedValue({
      id: "patient_1",
      firstName: "Jane",
      lastName: "Doe",
      phone: null,
    });

    await PATCH(
      await makeRequest({ ...validPayload, email: "new@example.com" }),
      makeParams()
    );

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ email: expect.anything() }),
      })
    );
  });
});
