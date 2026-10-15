import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { GET } from "@/app/api/results/route";
import { signAccessToken } from "@/lib/auth/jwt";

describe("GET /api/results", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns 401 without an authenticated session", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/results"),
    );

    expect(response.status).toBe(401);
  });

  it("returns the authenticated patient's result summary", async () => {
    const token = await signAccessToken({
      sub: "user_1",
      email: "patient@example.com",
      role: "PATIENT",
    });

    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      box: { id: "box_1", number: "APL-001", kitStatus: "RESULTS_READY" },
    });
    prismaMock.analysisResult.findMany.mockResolvedValue([
      {
        id: "result_1",
        category: "HEALTH_CONDITIONS",
        name: "Vitamin D response",
        summary: "Typical response",
      },
    ]);
    prismaMock.ancestryProfile.findUnique.mockResolvedValue({ id: "ancestry_1" });
    prismaMock.report.findFirst.mockResolvedValue({ id: "report_1" });

    const response = await GET(
      new NextRequest("http://localhost/api/results", {
        headers: { cookie: `access_token=${token}` },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ready: true,
      boxNumber: "APL-001",
      totalAnalyses: 2,
      latestReportId: "report_1",
      categoryCounts: { HEALTH_CONDITIONS: 1, ANCESTRY: 1 },
    });
    expect(body.items).toEqual([
      {
        id: "result_1",
        category: "HEALTH_CONDITIONS",
        name: "Vitamin D response",
        summary: "Typical response",
      },
    ]);
  });

  it("returns 404 when the authenticated patient has no kit", async () => {
    const token = await signAccessToken({
      sub: "user_1",
      email: "patient@example.com",
      role: "PATIENT",
    });
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1", box: null });

    const response = await GET(
      new NextRequest("http://localhost/api/results", {
        headers: { cookie: `access_token=${token}` },
      }),
    );

    expect(response.status).toBe(404);
  });
});
