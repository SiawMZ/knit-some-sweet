-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('bloom', 'filler', 'friend');

-- CreateEnum
CREATE TYPE "VesselKind" AS ENUM ('vase', 'wrap');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('page_view', 'item_added', 'bouquet_submitted');

-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "artworkKey" TEXT NOT NULL,
    "maxQuantity" INTEGER NOT NULL,
    "defaultHeight" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemColor" (
    "itemId" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ItemColor_pkey" PRIMARY KEY ("itemId","colorId")
);

-- CreateTable
CREATE TABLE "Vessel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "VesselKind" NOT NULL,
    "artworkKey" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vessel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VesselColor" (
    "vesselId" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "VesselColor_pkey" PRIMARY KEY ("vesselId","colorId")
);

-- CreateTable
CREATE TABLE "SavedBouquet" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bouquet" JSONB NOT NULL,
    "catalog" JSONB NOT NULL,
    "stemCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedBouquet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "path" TEXT,
    "itemId" TEXT,
    "colorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedBouquet_slug_key" ON "SavedBouquet"("slug");

-- CreateIndex
CREATE INDEX "SavedBouquet_createdAt_idx" ON "SavedBouquet"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "AnalyticsEvent"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "ItemColor" ADD CONSTRAINT "ItemColor_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemColor" ADD CONSTRAINT "ItemColor_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VesselColor" ADD CONSTRAINT "VesselColor_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VesselColor" ADD CONSTRAINT "VesselColor_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
