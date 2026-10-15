import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) return errorResponse("Not authenticated", 401);

  const { id } = await params;
  const result = await prisma.analysisResult.findUnique({
    where: { id },
    include: { box: true },
  });
  if (!result) return errorResponse("Result not found", 404);

  const isAdmin = session.role === "ADMIN" || session.role === "SUPER_ADMIN";
  const isOwner = session.sub === result.box.userId;
  if (!isAdmin && !isOwner) {
    return errorResponse("Not authorized", 403);
  }

  return NextResponse.json({
    id: result.id,
    category: result.category,
    name: result.name,
    summary: result.summary,
    description: result.description,
    resultContext: result.resultContext,
    probabilities: result.probabilities,
    variantCount: result.variantCount,
    riskLociCount: result.riskLociCount,
    genesAnalyzed: result.genesAnalyzed,
    technicalNotes: result.technicalNotes,
    bibliography: result.bibliography,
    causesAndRiskFactors: result.causesAndRiskFactors,
    symptoms: result.symptoms,
    prevention: result.prevention,
    diseaseManagement: result.diseaseManagement,
    studyLimitations: result.studyLimitations,
  });
}
