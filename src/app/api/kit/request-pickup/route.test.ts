import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const courierMocks = vi.hoisted(() => {
  class CourierApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  }
  class CourierNotConfiguredError extends Error {}
  return {
    isCourierConfigured: vi.fn(() => false),
    createConsignment: vi.fn(),
    createPickup: vi.fn(),
    CourierApiError,
    CourierNotConfiguredError,
  };
});
vi.mock("@/lib/courier/chrono-diali", () => ({
  isCourierConfigured: () => courierMocks.isCourierConfigured(),
  createConsignment: (input: unknown) => courierMocks.createConsignment(input),
  createPickup: (input: unknown) => courierMocks.createPickup(input),
  CourierApiError: courierMocks.CourierApiError,
  CourierNotConfiguredError: courierMocks.CourierNotConfiguredError,
}));

import { POST } from "@/app/api/kit/request-pickup/route";
import { signAccessToken } from "@/lib/auth/jwt";

async function makeRequest(body?: unknown) {
  const token = await signAccessToken({
    sub: "user_1",
    email: "patient@example.com",
    role: "PATIENT",
  });
  return new NextRequest("http://localhost/api/kit/request-pickup", {
    method: "POST",
    headers: {
      cookie: `access_token=${token}`,
      "Content-Type": "application/json",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

const patientBase = {
  id: "user_1",
  firstName: "Nadia",
  lastName: "Chraibi",
  phone: "+212600000000",
  addressLine1: null as string | null,
  city: null as string | null,
  country: "Morocco",
};

describe("POST /api/kit/request-pickup", () => {
  beforeEach(() => {
    resetPrismaMock();
    courierMocks.isCourierConfigured.mockReturnValue(false);
    courierMocks.createConsignment.mockReset();
    courierMocks.createPickup.mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    const req = new NextRequest("http://localhost/api/kit/request-pickup", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 404 when the account has no associated box", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1", box: null });

    const res = await POST(await makeRequest());
    expect(res.status).toBe(404);
  });

  it("requests a pickup and sets the box's kitStatus to PICKUP_REQUESTED", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      box: { id: "box_1", kitStatus: "NOT_REQUESTED" },
    });
    prismaMock.box.update.mockResolvedValue({
      kitStatus: "PICKUP_REQUESTED",
      pickupRequestedAt: new Date("2026-07-19T00:00:00Z"),
    });

    const res = await POST(await makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.kitStatus).toBe("PICKUP_REQUESTED");
    expect(prismaMock.box.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "box_1" },
        data: expect.objectContaining({ kitStatus: "PICKUP_REQUESTED" }),
      })
    );
    expect(prismaMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user_1" }),
      })
    );
    expect(courierMocks.createConsignment).not.toHaveBeenCalled();
  });

  it("rejects a duplicate pickup request with 409", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      box: { id: "box_1", kitStatus: "PICKED_UP" },
    });

    const res = await POST(await makeRequest());
    expect(res.status).toBe(409);
    expect(prismaMock.box.update).not.toHaveBeenCalled();
  });

  it("requires an address when the courier is configured and none is on file", async () => {
    courierMocks.isCourierConfigured.mockReturnValue(true);
    prismaMock.user.findUnique.mockResolvedValue({
      ...patientBase,
      box: { id: "box_1", kitStatus: "NOT_REQUESTED", number: "APL-1" },
    });

    const res = await POST(await makeRequest());
    expect(res.status).toBe(400);
    expect(courierMocks.createConsignment).not.toHaveBeenCalled();
    expect(prismaMock.box.update).not.toHaveBeenCalled();
  });

  it("creates a courier consignment + pickup and stores the reference number", async () => {
    courierMocks.isCourierConfigured.mockReturnValue(true);
    courierMocks.createConsignment.mockResolvedValue({ referenceNumber: "REF123" });
    courierMocks.createPickup.mockResolvedValue({ pickupId: "PICKUP123" });
    prismaMock.user.findUnique.mockResolvedValue({
      ...patientBase,
      box: { id: "box_1", kitStatus: "NOT_REQUESTED", number: "APL-1" },
    });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.box.update.mockResolvedValue({
      kitStatus: "PICKUP_REQUESTED",
      pickupRequestedAt: new Date("2026-07-19T00:00:00Z"),
      courierReferenceNumber: "REF123",
    });

    const res = await POST(
      await makeRequest({ addressLine1: "123 Main St", city: "Casablanca" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.courierReferenceNumber).toBe("REF123");
    expect(courierMocks.createConsignment).toHaveBeenCalledWith(
      expect.objectContaining({ addressLine1: "123 Main St", boxNumber: "APL-1" })
    );
    expect(courierMocks.createPickup).toHaveBeenCalled();
    expect(prismaMock.box.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          courierReferenceNumber: "REF123",
          courierPickupId: "PICKUP123",
        }),
      })
    );
  });

  it("surfaces a courier API failure as an error response without changing local state", async () => {
    courierMocks.isCourierConfigured.mockReturnValue(true);
    courierMocks.createConsignment.mockRejectedValue(
      new courierMocks.CourierApiError("Invalid Pickup Slot Start", 400)
    );
    prismaMock.user.findUnique.mockResolvedValue({
      ...patientBase,
      addressLine1: "123 Main St",
      city: "Casablanca",
      box: { id: "box_1", kitStatus: "NOT_REQUESTED", number: "APL-1" },
    });

    const res = await POST(await makeRequest());
    expect(res.status).toBe(400);
    expect(prismaMock.box.update).not.toHaveBeenCalled();
  });
});
