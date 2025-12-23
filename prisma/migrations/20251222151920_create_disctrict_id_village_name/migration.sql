/*
  Warnings:

  - You are about to drop the column `address` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `village` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `districtId` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `districtName` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `villageId` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `villageName` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Patient_district_village_idx";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "address",
DROP COLUMN "district",
DROP COLUMN "village",
ADD COLUMN     "districtId" TEXT NOT NULL,
ADD COLUMN     "districtName" TEXT NOT NULL,
ADD COLUMN     "villageId" TEXT NOT NULL,
ADD COLUMN     "villageName" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Patient_districtId_villageId_idx" ON "Patient"("districtId", "villageId");
