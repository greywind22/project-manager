-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('LINK', 'DOCUMENT', 'PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "VideoPlatform" AS ENUM ('YOUTUBE', 'VIMEO', 'OTHER');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'DATE');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "bookedDate" TIMESTAMP(3),
    "bookingId" TEXT,
    "customerRef" TEXT,
    "address" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetLink" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "AssetLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetFile" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER,

    CONSTRAINT "AssetFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetVideo" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "externalUrl" TEXT NOT NULL,
    "platform" "VideoPlatform" NOT NULL DEFAULT 'YOUTUBE',

    CONSTRAINT "AssetVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomField" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "valueType" "CustomFieldType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetLink_assetId_key" ON "AssetLink"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetFile_assetId_key" ON "AssetFile"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetVideo_assetId_key" ON "AssetVideo"("assetId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLink" ADD CONSTRAINT "AssetLink_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetFile" ADD CONSTRAINT "AssetFile_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetVideo" ADD CONSTRAINT "AssetVideo_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomField" ADD CONSTRAINT "CustomField_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
