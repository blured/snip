-- CreateEnum
CREATE TYPE "CareerStage" AS ENUM ('ENTRY_LEVEL', 'EARLY_PRO', 'MID_LEVEL', 'ADVANCED', 'LEADERSHIP', 'OWNERSHIP');

-- AlterTable
ALTER TABLE "Stylist" ADD COLUMN     "jobTitleId" TEXT,
ADD COLUMN     "photo" TEXT;

-- CreateTable
CREATE TABLE "JobTitle" (
    "id" TEXT NOT NULL,
    "careerStage" "CareerStage" NOT NULL,
    "title" TEXT NOT NULL,
    "primaryFocus" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobTitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobTitle_title_key" ON "JobTitle"("title");

-- CreateIndex
CREATE INDEX "JobTitle_careerStage_idx" ON "JobTitle"("careerStage");

-- CreateIndex
CREATE INDEX "JobTitle_active_idx" ON "JobTitle"("active");

-- CreateIndex
CREATE INDEX "Stylist_jobTitleId_idx" ON "Stylist"("jobTitleId");

-- AddForeignKey
ALTER TABLE "Stylist" ADD CONSTRAINT "Stylist_jobTitleId_fkey" FOREIGN KEY ("jobTitleId") REFERENCES "JobTitle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
