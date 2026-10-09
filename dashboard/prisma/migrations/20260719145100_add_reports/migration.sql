-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "content" BYTEA NOT NULL,
    "boxId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_boxId_idx" ON "reports"("boxId");

-- CreateIndex
CREATE UNIQUE INDEX "reports_boxId_version_key" ON "reports"("boxId", "version");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "boxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
