-- CreateEnum
CREATE TYPE "DrawingStatus" AS ENUM ('waiting', 'drawn', 'dismissed');

-- CreateTable
CREATE TABLE "DrawingRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "notes" TEXT,
    "photo" BYTEA NOT NULL,
    "photoType" TEXT NOT NULL,
    "status" "DrawingStatus" NOT NULL DEFAULT 'waiting',
    "artworkKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrawingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DrawingRequest_status_createdAt_idx" ON "DrawingRequest"("status", "createdAt");
