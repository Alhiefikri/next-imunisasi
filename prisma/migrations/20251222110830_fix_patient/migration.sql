/*
  Warnings:

  - Added the required column `district` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentName` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `village` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "address" TEXT,
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "parentName" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "placeOfBirth" TEXT,
ADD COLUMN     "village" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Patient_name_idx" ON "Patient"("name");

-- CreateIndex
CREATE INDEX "Patient_parentName_idx" ON "Patient"("parentName");

-- CreateIndex
CREATE INDEX "Patient_phoneNumber_idx" ON "Patient"("phoneNumber");

-- CreateIndex
CREATE INDEX "Patient_district_village_idx" ON "Patient"("district", "village");
