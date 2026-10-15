import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { GET } from "@/app/api/results/[id]/route";
import { signAccessToken } from "@/lib/auth/jwt";

const result = {
  id: "result_1",
  category: "PHARMACOLOGY",
  name: "Medication response",
  summary: "Typical response",
  description: "Your result description",
  resultContext: "Medication context",
  probabilities: [{ label: "Typical", percent: 72 }],
  variantCount: "2 variants",
  riskLociCount: 3,
  genesAnalyzed: "CYP2C19, CYP2D6",
  technicalNotes: "Technical note",
  bibliography: [{ label: "Study", url: "https://example.com/study" }],
  causesAndRiskFactors: null,
  symptoms: null,
  prevention: null,
  diseaseManagement: "Discuss with your clinician",
  studyLimitations: "This is not a diagnosis",
  box: { userId: "user_1" },
};

describe("GET /api/results/[id]", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns 401 without an authenticated session", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/results/result_1"),
      { params: Promise.resolve({ id: "result_1" }) },
    );

    expect(response.status).toBe(401);
  });

  it("returns the full result for its patient owner", async () => {
    const token = await signAccessToken({
      sub: "user_1",
      email: "patient@example.com",
      role: "PATIENT",
    });
    prismaMock.analysisResult.findUnique.mockResolvedValue(result);

    const response = await GET(
      new NextRequest("http://localhost/api/results/result_1", {
        headers: { cookie: `access_token=${token}` },
      }),
      { params: Promise.resolve({ id: "result_1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: "result_1",
      category: "PHARMACOLOGY",
      genesAnalyzed: "CYP2C19, CYP2D6",
      diseaseManagement: "Discuss with your clinician",
    });
    expect(body.box).toBeUndefined();
  });

  it("returns 403 when another patient requests the result", async () => {
    const token = await signAccessToken({
      sub: "user_2",
      email: "other@example.com",
      role: "PATIENT",
    });
    prismaMock.analysisResult.findUnique.mockResolvedValue(result);

    const response = await GET(
      new NextRequest("http://localhost/api/results/result_1", {
        headers: { cookie: `access_token=${token}` },
      }),
      { params: Promise.resolve({ id: "result_1" }) },
    );

    expect(response.status).toBe(403);
  });
});
