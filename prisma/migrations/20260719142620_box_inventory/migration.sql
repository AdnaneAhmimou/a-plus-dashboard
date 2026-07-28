-- CreateEnum
CREATE TYPE "BoxStatus" AS ENUM ('AVAILABLE', 'SENT', 'ASSOCIATED');

-- CreateTable
CREATE TABLE "boxes" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "BoxStatus" NOT NULL DEFAULT 'AVAILABLE',
    "kitStatus" "KitStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
    "pickupRequestedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "inTransitAt" TIMESTAMP(3),
    "testingAt" TIMESTAMP(3),
    "resultsReadyAt" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boxes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "boxes_number_key" ON "boxes"("number");

-- CreateIndex
CREATE UNIQUE INDEX "boxes_userId_key" ON "boxes"("userId");

-- AddForeignKey
ALTER TABLE "boxes" ADD CONSTRAINT "boxes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DataMigration: carry existing per-user box/kit-status data over to the
-- new boxes table before the source columns are dropped from "users".
INSERT INTO "boxes" ("id", "number", "status", "kitStatus", "pickupRequestedAt", "pickedUpAt", "inTransitAt", "testingAt", "resultsReadyAt", "userId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  "boxNumber",
  'ASSOCIATED',
  "kitStatus",
  "pickupRequestedAt",
  "pickedUpAt",
  "inTransitAt",
  "testingAt",
  "resultsReadyAt",
  "id",
  "createdAt",
  now()
FROM "users"
WHERE "boxNumber" IS NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "boxNumber",
DROP COLUMN "inTransitAt",
DROP COLUMN "kitStatus",
DROP COLUMN "pickedUpAt",
DROP COLUMN "pickupRequestedAt",
DROP COLUMN "resultsReadyAt",
DROP COLUMN "testingAt";
