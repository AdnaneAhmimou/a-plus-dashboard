import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/auth/forgot-password/route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/forgot-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("creates a reset token when the email exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1" });
    prismaMock.passwordResetToken.create.mockResolvedValue({});

    const res = await POST(makeRequest({ email: "patient@example.com" }));
    expect(res.status).toBe(200);
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledTimes(1);
  });

  it("returns the same generic message whether or not the email exists", async () => {
    prismaMock.passwordResetToken.create.mockResolvedValue({});

    prismaMock.user.findUnique.mockResolvedValueOnce({ id: "user_1" });
    const resExisting = await POST(makeRequest({ email: "patient@example.com" }));

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const resMissing = await POST(makeRequest({ email: "nobody@example.com" }));

    const [bodyExisting, bodyMissing] = await Promise.all([
      resExisting.json(),
      resMissing.json(),
    ]);

    expect(bodyMissing.message).toBe(bodyExisting.message);
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledTimes(1);
  });

  it("rejects an invalid email with 400", async () => {
    const res = await POST(makeRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
  });
});
