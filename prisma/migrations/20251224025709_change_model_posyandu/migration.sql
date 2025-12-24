-- AlterTable
ALTER TABLE "Posyandu" ADD COLUMN     "districtName" TEXT,
ALTER COLUMN "districtId" DROP NOT NULL,
ALTER COLUMN "villageId" DROP NOT NULL;
