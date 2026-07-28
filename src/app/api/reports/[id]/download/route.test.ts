import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { GET } from "@/app/api/reports/[id]/download/route";
import { signAccessToken } from "@/lib/auth/jwt";

async function makeRequest(role: "ADMIN" | "PATIENT", sub = "user_1") {
  const token = await signAccessToken({
    sub,
    email: "someone@example.com",
    role,
  });
  return new NextRequest("http://localhost/api/reports/report_1/download", {
    headers: { cookie: `access_token=${token}` },
  });
}

function makeParams(id = "report_1") {
  return { params: Promise.resolve({ id }) };
}

const reportRow = {
  id: "report_1",
  fileName: "results.pdf",
  fileSize: 4,
  content: Buffer.from("%PDF"),
  box: { id: "box_1", userId: "patient_owner" },
};

describe("GET /api/reports/[id]/download", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns 401 when not authenticated", async () => {
    const req = new NextRequest("http://localhost/api/reports/report_1/download");
    const res = await GET(req, makeParams());
    expect(res.status).toBe(401);
  });

  it("returns 404 when the report does not exist", async () => {
    prismaMock.report.findUnique.mockResolvedValue(null);
    const res = await GET(await makeRequest("ADMIN"), makeParams());
    expect(res.status).toBe(404);
  });

  it("allows the owning patient to download", async () => {
    prismaMock.report.findUnique.mockResolvedValue(reportRow);
    const res = await GET(
      await makeRequest("PATIENT", "patient_owner"),
      makeParams()
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain("results.pdf");
  });

  it("allows an admin to download regardless of ownership", async () => {
    prismaMock.report.findUnique.mockResolvedValue(reportRow);
    const res = await GET(
      await makeRequest("ADMIN", "some_admin"),
      makeParams()
    );
    expect(res.status).toBe(200);
  });

  it("rejects a different patient (not the owner) with 403", async () => {
    prismaMock.report.findUnique.mockResolvedValue(reportRow);
    const res = await GET(
      await makeRequest("PATIENT", "someone_else"),
      makeParams()
    );
    expect(res.status).toBe(403);
  });
});
