-- CreateEnum
CREATE TYPE "ImportSource" AS ENUM ('TELLMEGEN_PORTAL', 'TELLMEGEN_API');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED');

-- AlterTable
ALTER TABLE "analysis_results" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- CreateTable
CREATE TABLE "result_imports" (
    "id" TEXT NOT NULL,
    "source" "ImportSource" NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'RUNNING',
    "barcode" TEXT NOT NULL,
    "itemsFound" INTEGER NOT NULL DEFAULT 0,
    "itemsImported" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "boxId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "result_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_captures" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_captures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "result_imports_boxId_idx" ON "result_imports"("boxId");

-- CreateIndex
CREATE INDEX "source_captures_importId_idx" ON "source_captures"("importId");

-- CreateIndex
CREATE UNIQUE INDEX "source_captures_importId_section_externalId_key" ON "source_captures"("importId", "section", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "analysis_results_boxId_externalId_key" ON "analysis_results"("boxId", "externalId");

-- AddForeignKey
ALTER TABLE "result_imports" ADD CONSTRAINT "result_imports_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "boxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_captures" ADD CONSTRAINT "source_captures_importId_fkey" FOREIGN KEY ("importId") REFERENCES "result_imports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

