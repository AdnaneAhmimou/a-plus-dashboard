import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { prismaMock, resetPrismaMock } = await vi.hoisted(async () => {
  const mod = await import("@/test/prisma-mock");
  return mod;
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const session = vi.hoisted(() => ({ value: { sub: "user-1" } as { sub: string } | null }));
vi.mock("@/lib/auth/session", () => ({
  getSessionFromRequest: vi.fn(async () => session.value),
}));

const password = vi.hoisted(() => ({ matches: true }));
vi.mock("@/lib/auth/password", () => ({
  verifyPassword: vi.fn(async () => password.matches),
}));

const { DELETE } = await import("./route");

function request(body: unknown = { password: "correct-horse" }) {
  return new NextRequest("http://localhost/api/account", {
    method: "DELETE",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const PATIENT = {
  id: "user-1",
  role: "PATIENT",
  passwordHash: "hash",
  box: { id: "box-1" },
};

beforeEach(() => {
  resetPrismaMock();
  session.value = { sub: "user-1" };
  password.matches = true;
  prismaMock.user.findUnique.mockResolvedValue(PATIENT);
});

describe("DELETE /api/account", () => {
  it("rejects an unauthenticated caller", async () => {
    session.value = null;
    const res = await DELETE(request());
    expect(res.status).toBe(401);
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it("requires a password", async () => {
    const res = await DELETE(request({}));
    expect(res.status).toBe(400);
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it("refuses a wrong password without touching any data", async () => {
    // Being signed in is not enough: an unattended laptop must not be
    // able to erase someone's genetic results.
    password.matches = false;
    const res = await DELETE(request());
    expect(res.status).toBe(400);
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
    expect(prismaMock.analysisResult.deleteMany).not.toHaveBeenCalled();
  });

  it("erases the box-owned genetic data, not just the user", async () => {
    // The regression this guards: every result hangs off Box, and
    // User -> Box is SetNull, so deleting the user alone would leave the
    // whole genetic profile in the database.
    const res = await DELETE(request());
    expect(res.status).toBe(200);

    expect(prismaMock.analysisResult.deleteMany).toHaveBeenCalledWith({
      where: { boxId: "box-1" },
    });
    expect(prismaMock.ancestryProfile.deleteMany).toHaveBeenCalledWith({
      where: { boxId: "box-1" },
    });
    expect(prismaMock.report.deleteMany).toHaveBeenCalledWith({
      where: { boxId: "box-1" },
    });
    expect(prismaMock.resultImport.deleteMany).toHaveBeenCalledWith({
      where: { boxId: "box-1" },
    });
    expect(prismaMock.courierEvent.deleteMany).toHaveBeenCalledWith({
      where: { boxId: "box-1" },
    });
    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
  });

  it("retires the box rather than freeing the number", async () => {
    // AVAILABLE would let anyone who knows the number register against a
    // kit that once held someone else's genetic data.
    await DELETE(request());

    const update = prismaMock.box.update.mock.calls[0][0];
    expect(update.where).toEqual({ id: "box-1" });
    expect(update.data.status).toBe("RETIRED");
    expect(update.data.userId).toBeNull();
    expect(update.data.kitStatus).toBe("NOT_REQUESTED");
    expect(update.data.courierReferenceNumber).toBeNull();
  });

  it("clears the session cookies", async () => {
    const res = await DELETE(request());
    expect(res.headers.get("set-cookie")).toContain("access_token=");
  });

  it("handles a user with no box", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...PATIENT, box: null });
    const res = await DELETE(request());
    expect(res.status).toBe(200);
    expect(prismaMock.box.update).not.toHaveBeenCalled();
    expect(prismaMock.user.delete).toHaveBeenCalled();
  });

  it("refuses to delete the last administrator", async () => {
    // Promoting an account is a manual database update, so an admin who
    // deletes themselves last would lock everyone out with no way back.
    prismaMock.user.findUnique.mockResolvedValue({
      ...PATIENT,
      role: "ADMIN",
      box: null,
    });
    prismaMock.user.count.mockResolvedValue(0);

    const res = await DELETE(request());
    expect(res.status).toBe(409);
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it("allows an admin to leave when another admin remains", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...PATIENT,
      role: "ADMIN",
      box: null,
    });
    prismaMock.user.count.mockResolvedValue(1);

    const res = await DELETE(request());
    expect(res.status).toBe(200);
    expect(prismaMock.user.delete).toHaveBeenCalled();
  });
});
