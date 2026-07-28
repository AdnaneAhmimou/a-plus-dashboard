import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/admin/patients/[id]/reports/route";
import { signAccessToken } from "@/lib/auth/jwt";

function pdfFile(name = "report.pdf", body = "%PDF-1.4 fake pdf content") {
  return new File([body], name, { type: "application/pdf" });
}

async function makeRequest(
  file: File | null,
  role: "ADMIN" | "PATIENT" = "ADMIN"
) {
  const token = await signAccessToken({
    sub: "admin_1",
    email: "admin@example.com",
    role,
  });
  const formData = new FormData();
  if (file) formData.set("file", file);

  return new NextRequest(
    "http://localhost/api/admin/patients/patient_1/reports",
    {
      method: "POST",
      headers: { cookie: `access_token=${token}` },
      body: formData,
    }
  );
}

function makeParams(id = "patient_1") {
  return { params: Promise.resolve({ id }) };
}

const patientWithBox = {
  id: "patient_1",
  role: "PATIENT",
  box: { id: "box_1", kitStatus: "TESTING" },
};

describe("POST /api/admin/patients/[id]/reports", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns 403 for a non-admin session", async () => {
    const res = await POST(await makeRequest(pdfFile(), "PATIENT"), makeParams());
    expect(res.status).toBe(403);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the patient has no associated box", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
      box: null,
    });
    const res = await POST(await makeRequest(pdfFile()), makeParams());
    expect(res.status).toBe(404);
  });

  it("rejects a missing file with 400", async () => {
    prismaMock.user.findUnique.mockResolvedValue(patientWithBox);
    const res = await POST(await makeRequest(null), makeParams());
    expect(res.status).toBe(400);
  });

  it("rejects a non-PDF file with 400", async () => {
    prismaMock.user.findUnique.mockResolvedValue(patientWithBox);
    const notPdf = new File(["hello"], "notes.txt", { type: "text/plain" });
    const res = await POST(await makeRequest(notPdf), makeParams());
    expect(res.status).toBe(400);
  });

  it("rejects a file whose content isn't actually a PDF (magic bytes check)", async () => {
    prismaMock.user.findUnique.mockResolvedValue(patientWithBox);
    const fakePdf = new File(["not really a pdf"], "report.pdf", {
      type: "application/pdf",
    });
    const res = await POST(await makeRequest(fakePdf), makeParams());
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/not a valid PDF/i);
  });

  it("uploads a valid PDF as version 1 and marks the box RESULTS_READY", async () => {
    prismaMock.user.findUnique.mockResolvedValue(patientWithBox);
    prismaMock.report.findFirst.mockResolvedValue(null);
    prismaMock.report.create.mockResolvedValue({
      id: "report_1",
      version: 1,
      fileName: "report.pdf",
      fileSize: 24,
      createdAt: new Date("2026-07-19T00:00:00Z"),
    });
    prismaMock.box.update.mockResolvedValue({});

    const res = await POST(await makeRequest(pdfFile()), makeParams());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.report.version).toBe(1);
    expect(prismaMock.report.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ boxId: "box_1", version: 1 }),
      })
    );
    expect(prismaMock.box.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "box_1" },
        data: expect.objectContaining({ kitStatus: "RESULTS_READY" }),
      })
    );
    expect(prismaMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "patient_1" }),
      })
    );
  });

  it("increments the version when a report already exists and box is already ready", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient_1",
      role: "PATIENT",
      box: { id: "box_1", kitStatus: "RESULTS_READY" },
    });
    prismaMock.report.findFirst.mockResolvedValue({ version: 1 });
    prismaMock.report.create.mockResolvedValue({
      id: "report_2",
      version: 2,
      fileName: "report.pdf",
      fileSize: 24,
      createdAt: new Date("2026-07-19T00:00:00Z"),
    });

    const res = await POST(await makeRequest(pdfFile()), makeParams());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.report.version).toBe(2);
    expect(prismaMock.box.update).not.toHaveBeenCalled();
    expect(prismaMock.notification.create).not.toHaveBeenCalled();
  });
});
