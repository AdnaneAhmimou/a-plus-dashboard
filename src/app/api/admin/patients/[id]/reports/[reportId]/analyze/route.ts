import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorResponse } from "@/lib/api-response";
import {
  extractStructuredAnalysis,
  AnalysisExtractionError,
  OpenRouterNotConfiguredError,
} from "@/lib/ai/extract-analysis";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reportId: string }> }
) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id, reportId } = await params;
  const patient = await prisma.user.findUnique({
    where: { id },
    include: { box: true },
  });
  if (!patient || patient.role !== "PATIENT") {
    return errorResponse("Patient not found", 404);
  }
  if (!patient.box) {
    return errorResponse("No box is associated with this patient", 404);
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report || report.boxId !== patient.box.id) {
    return errorResponse("Report not found", 404);
  }

  let results;
  try {
    results = await extractStructuredAnalysis(Buffer.from(report.content));
  } catch (err) {
    if (err instanceof OpenRouterNotConfiguredError) {
      return errorResponse(err.message, 503);
    }
    if (err instanceof AnalysisExtractionError) {
      return errorResponse(err.message, 422);
    }
    return errorResponse(
      err instanceof Error ? err.message : "AI analysis failed",
      502
    );
  }

  const boxId = patient.box.id;
  await prisma.$transaction(async (tx) => {
    await tx.analysisResult.deleteMany({ where: { boxId } });
    await tx.analysisResult.createMany({
      data: results.map((r) => ({
        boxId,
        sourceReportId: report.id,
        category: r.category,
        name: r.name,
        summary: r.summary,
        description: r.description,
        probabilities: r.probabilities,
        variantCount: r.variantCount,
        riskLociCount: r.riskLociCount,
        genesAnalyzed: r.genesAnalyzed,
        technicalNotes: r.technicalNotes,
        bibliography: r.bibliography,
      })),
    });
  });

  return NextResponse.json({ count: results.length }, { status: 200 });
}
