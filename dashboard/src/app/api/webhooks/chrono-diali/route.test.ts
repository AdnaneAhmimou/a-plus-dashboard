import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/webhooks/chrono-diali/route";

function makeRequest(body: unknown, apikey?: string) {
  return new NextRequest("http://localhost/api/webhooks/chrono-diali", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apikey ? { apikey } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/webhooks/chrono-diali", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  afterEach(() => {
    delete process.env.CHRONO_DIALI_WEBHOOK_SECRET;
  });

  it("rejects requests with the wrong Apikey header when a secret is configured", async () => {
    process.env.CHRONO_DIALI_WEBHOOK_SECRET = "correct-secret";
    const res = await POST(
      makeRequest({ type: "delivered", reference_number: "REF1" }, "wrong")
    );
    expect(res.status).toBe(401);
    expect(prismaMock.box.findUnique).not.toHaveBeenCalled();
  });

  it("accepts requests when no secret is configured", async () => {
    prismaMock.box.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest({ type: "pickup_completed", reference_number: "REF1" }));
    expect(res.status).toBe(200);
  });

  it("accepts requests with the correct Apikey header when a secret is configured", async () => {
    process.env.CHRONO_DIALI_WEBHOOK_SECRET = "correct-secret";
    prismaMock.box.findUnique.mockResolvedValue(null);
    const res = await POST(
      makeRequest(
        { type: "pickup_completed", reference_number: "REF1" },
        "correct-secret"
      )
    );
    expect(res.status).toBe(200);
  });

  it("rejects a payload with no type", async () => {
    const res = await POST(makeRequest({ reference_number: "REF1" }));
    expect(res.status).toBe(400);
  });

  it("logs the event but takes no action for an unrecognized reference_number", async () => {
    prismaMock.box.findUnique.mockResolvedValue(null);
    const res = await POST(
      makeRequest({ type: "delivered", reference_number: "UNKNOWN" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.matched).toBe(false);
    expect(prismaMock.courierEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "delivered", boxId: undefined }),
      })
    );
    expect(prismaMock.box.update).not.toHaveBeenCalled();
  });

  it("advances kitStatus forward for a recognized event on a matched box", async () => {
    prismaMock.box.findUnique.mockResolvedValue({
      id: "box_1",
      kitStatus: "PICKED_UP",
      user: { id: "user_1" },
    });

    const res = await POST(
      makeRequest({ type: "reachedathub", reference_number: "REF1" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.statusChanged).toBe(true);
    expect(prismaMock.box.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "box_1" },
        data: expect.objectContaining({ kitStatus: "IN_TRANSIT" }),
      })
    );
    expect(prismaMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user_1" }) })
    );
  });

  it("never regresses kitStatus for an out-of-order/duplicate event", async () => {
    prismaMock.box.findUnique.mockResolvedValue({
      id: "box_1",
      kitStatus: "TESTING",
      user: { id: "user_1" },
    });

    const res = await POST(
      makeRequest({ type: "pickup_completed", reference_number: "REF1" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.statusChanged).toBe(false);
    expect(prismaMock.box.update).not.toHaveBeenCalled();
  });

  it("never sets RESULTS_READY from a courier event, even for 'delivered'", async () => {
    prismaMock.box.findUnique.mockResolvedValue({
      id: "box_1",
      kitStatus: "IN_TRANSIT",
      user: { id: "user_1" },
    });

    const res = await POST(
      makeRequest({ type: "delivered", reference_number: "REF1" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.statusChanged).toBe(true);
    expect(prismaMock.box.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ kitStatus: "TESTING" }) })
    );
  });

  it("takes no status action for an event with no KitStatus equivalent (e.g. on_hold)", async () => {
    prismaMock.box.findUnique.mockResolvedValue({
      id: "box_1",
      kitStatus: "IN_TRANSIT",
      user: { id: "user_1" },
    });

    const res = await POST(makeRequest({ type: "on_hold", reference_number: "REF1" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.statusChanged).toBe(false);
    expect(prismaMock.box.update).not.toHaveBeenCalled();
  });
});
