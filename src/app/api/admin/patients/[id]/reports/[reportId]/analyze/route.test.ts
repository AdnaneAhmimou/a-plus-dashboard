import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { extractStructuredAnalysis, OpenRouterNotConfiguredError, AnalysisExtractionError } =
  vi.hoisted(() => {
    class OpenRouterNotConfiguredError extends Error {}
    class AnalysisExtractionError extends Error {}
    return {
      extractStructuredAnalysis: vi.fn(),
      OpenRouterNotConfiguredError,
      AnalysisExtractionError,
    };
  });

vi.mock("@/lib/ai/extract-analysis", () => ({
  extractStructuredAnalysis,
  OpenRouterNotConfiguredError,
  AnalysisExtractionError,
}));

import { POST } from "@/app/api/admin/patients/[id]/reports/[reportId]/analyze/route";
import { signAccessToken } from "@/lib/auth/jwt";

async function makeRequest(role: "ADMIN" | "PATIENT" = "ADMIN") {
  const token = await signAccessToken({
    sub: "admin_1",
    email: "admin@example.com",
    role,
  });
  return new NextRequest(
    "http://localhost/api/admin/patients/patient_1/reports/report_1/analyze",
    { method: "POST", headers: { cookie: `access_token=${token}` } }
  );
}

function makeParams(id = "patient_1", reportId = "report_1") {
  return { params: Promise.resolve({ id, reportId }) };
}

const patientWithBox = {
  id: "patient_1",
  role: "PATIENT",
  box: { id: "box_1", kitStatus: "RESULTS_READY" },
};

const report = { id: "report_1", boxId: "box_1", content: Buffer.from("%PDF-1.4") };

describe("POST /api/admin/patients/[id]/reports/[reportId]/analyze", () => {
  beforeEach(() => {
    resetPrismaMock();
    extractStructuredAnalysis.mockReset();
  });

  it("returns 403 for a non-admin session", async () => {
    const res = await POST(await makeRequest("PATIENT"), makeParams());
    expect(res.status).toBe(403);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
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

  it("returns 404 when the report doesn't belong to this patient's box", async () => {
    prismaMock.user.findUnique.mockResolvedValue(patientWithBox);
    prismaMock.report.findUnique.mockResolvedValue({
      id: "report_1",
      boxId: "some_other_box",
      content: Buffer.from("%PDF-1.4"),
    });
    const res = await POST(await makeRequest(), makeParams());
    expect(res.status).toBe(404);
  });

  it("returns 503 when the AI provider isn't configured", async () => {
    prismaMock.user.findUnique.mockResolvedValue(patientWithBox);
    prismaMock.report.findUnique.mockResolvedValue(report);
    extractStructuredAnalysis.mockRejectedValue(
      new OpenRouterNotConfiguredError("not configured")
    );
    const res = await POST(await makeRequest(), makeParams());
    expect(res.status).toBe(503);
  });

  it("returns 422 when the PDF has no usable content", async () => {
    prismaMock.user.findUnique.mockResolvedValue(patientWithBox);
    prismaMock.report.findUnique.mockResolvedValue(report);
    extractStructuredAnalysis.mockRejectedValue(
      new AnalysisExtractionError("no text")
    );
    const res = await POST(await makeRequest(), makeParams());
    expect(res.status).toBe(422);
  });

  it("replaces this report's analysis results (not the whole box's) and links them to the source report", async () => {
    prismaMock.user.findUnique.mockResolvedValue(patientWithBox);
    prismaMock.report.findUnique.mockResolvedValue(report);
    extractStructuredAnalysis.mockResolvedValue([
      { category: "TRAITS", name: "Acne vulgaris", summary: "Low probability" },
      { category: "WELLNESS", name: "Caffeine metabolism", summary: "Fast metabolizer" },
    ]);

    const res = await POST(await makeRequest(), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(2);
    expect(prismaMock.analysisResult.deleteMany).toHaveBeenCalledWith({
      where: { sourceReportId: "report_1" },
    });
    expect(prismaMock.analysisResult.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            boxId: "box_1",
            sourceReportId: "report_1",
            name: "Acne vulgaris",
          }),
          expect.objectContaining({
            boxId: "box_1",
            sourceReportId: "report_1",
            name: "Caffeine metabolism",
          }),
        ],
      })
    );
  });
});
