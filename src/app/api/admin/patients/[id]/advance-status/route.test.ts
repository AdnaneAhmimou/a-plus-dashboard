import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/admin/patients/[id]/advance-status/route";
import { signAccessToken } from "@/lib/auth/jwt";

async function makeRequest(role: "ADMIN" | "SUPER_ADMIN" | "PATIENT" = "ADMIN") {
  const token = await signAccessToken({
    sub: "admin_1",
    email: "admin@example.com",
    role,
  });
  return new NextRequest(
    "http://localhost/api/admin/patients/patient_1/advance-status",
    { method: "POST", headers: { cookie: `access_token=${token}` } }
  );
}

function makeParams(id = "patient_1") {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/admin/patients/[id]/advance-status", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns 401 when not authenticated", async () => {
    const req = new NextRequest(
      "http://localhost/api/admin/patients/patient_1/advance-status",
      { method: "POST" }
    );
    const res = await POST(req, makeParams());
    expect(res.status).toBe(401);
  });

  it("returns 403 for a patient session (not an admin)", async () => {
    const res = await POST(await makeRequest("PATIENT"), makeParams());
    expect(res.status).toBe(403);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the target user is not found or not a patient", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await POST(await makeRequest(), makeParams());
    expect(res.status).toBe(404);
  });

  it("returns 404 when the patient has no associated box", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
      box: null,
    });
    const res = await POST(await makeRequest(), makeParams());
    expect(res.status).toBe(404);
  });

  it("advances PICKUP_REQUESTED to PICKED_UP and sets pickedUpAt", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
      box: { id: "box_1", kitStatus: "PICKUP_REQUESTED" },
    });
    prismaMock.box.update.mockResolvedValue({ kitStatus: "PICKED_UP" });

    const res = await POST(await makeRequest(), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.kitStatus).toBe("PICKED_UP");
    expect(prismaMock.box.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "box_1" },
        data: expect.objectContaining({
          kitStatus: "PICKED_UP",
          pickedUpAt: expect.any(Date),
        }),
      })
    );
    expect(prismaMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "patient_1" }),
      })
    );
  });

  it("rejects advancing a box with no pickup requested yet (409)", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
      box: { id: "box_1", kitStatus: "NOT_REQUESTED" },
    });

    const res = await POST(await makeRequest(), makeParams());
    expect(res.status).toBe(409);
    expect(prismaMock.box.update).not.toHaveBeenCalled();
  });

  it("rejects advancing a box that already has results ready (409, terminal)", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
      box: { id: "box_1", kitStatus: "RESULTS_READY" },
    });

    const res = await POST(await makeRequest(), makeParams());
    expect(res.status).toBe(409);
    expect(prismaMock.box.update).not.toHaveBeenCalled();
  });

  it("rejects advancing past TESTING — RESULTS_READY only happens via report upload", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
      box: { id: "box_1", kitStatus: "TESTING" },
    });

    const res = await POST(await makeRequest(), makeParams());
    expect(res.status).toBe(409);
    expect(prismaMock.box.update).not.toHaveBeenCalled();
  });

  it("allows a SUPER_ADMIN session too", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
      box: { id: "box_1", kitStatus: "IN_TRANSIT" },
    });
    prismaMock.box.update.mockResolvedValue({ kitStatus: "TESTING" });

    const res = await POST(await makeRequest("SUPER_ADMIN"), makeParams());
    expect(res.status).toBe(200);
  });
});
