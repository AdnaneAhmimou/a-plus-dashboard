-- AlterTable
ALTER TABLE "boxes" ADD COLUMN     "courierPickupId" TEXT,
ADD COLUMN     "courierReferenceNumber" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'Morocco';

-- CreateTable
CREATE TABLE "courier_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "boxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courier_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courier_events_boxId_idx" ON "courier_events"("boxId");

-- CreateIndex
CREATE UNIQUE INDEX "boxes_courierReferenceNumber_key" ON "boxes"("courierReferenceNumber");

-- AddForeignKey
ALTER TABLE "courier_events" ADD CONSTRAINT "courier_events_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "boxes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

