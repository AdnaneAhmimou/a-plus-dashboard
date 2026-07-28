-- CreateEnum
CREATE TYPE "AnalysisCategory" AS ENUM ('HEALTH_CONDITIONS', 'HEREDITARY_CONDITIONS', 'PHARMACOLOGY', 'TRAITS', 'WELLNESS', 'ANCESTRY');

-- CreateTable
CREATE TABLE "analysis_results" (
    "id" TEXT NOT NULL,
    "category" "AnalysisCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "probabilities" JSONB,
    "variantCount" TEXT,
    "riskLociCount" INTEGER,
    "genesAnalyzed" TEXT,
    "technicalNotes" TEXT,
    "bibliography" JSONB,
    "boxId" TEXT NOT NULL,
    "sourceReportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analysis_results_boxId_idx" ON "analysis_results"("boxId");

-- CreateIndex
CREATE INDEX "analysis_results_boxId_category_idx" ON "analysis_results"("boxId", "category");

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "boxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_sourceReportId_fkey" FOREIGN KEY ("sourceReportId") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
