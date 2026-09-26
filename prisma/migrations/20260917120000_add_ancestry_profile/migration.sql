-- CreateTable
CREATE TABLE "ancestry_profiles" (
    "id" TEXT NOT NULL,
    "boxId" TEXT NOT NULL,
    "composition" JSONB NOT NULL,
    "maternalHaplogroup" TEXT,
    "maternalSubhaplogroup" TEXT,
    "maternalMigration" JSONB,
    "paternalHaplogroup" TEXT,
    "paternalSubhaplogroup" TEXT,
    "paternalMigration" JSONB,
    "neanderthalPercent" DOUBLE PRECISION,
    "neanderthalVariants" INTEGER,
    "neanderthalVsAverage" DOUBLE PRECISION,
    "neanderthalSections" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ancestry_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ancestry_profiles_boxId_key" ON "ancestry_profiles"("boxId");

-- AddForeignKey
ALTER TABLE "ancestry_profiles" ADD CONSTRAINT "ancestry_profiles_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "boxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

