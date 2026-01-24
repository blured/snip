-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "priceType" TEXT NOT NULL DEFAULT 'Fixed',
ADD COLUMN     "targetAudience" TEXT;
