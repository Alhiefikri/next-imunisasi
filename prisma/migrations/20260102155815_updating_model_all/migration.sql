/*
  Warnings:

  - Added the required column `administeredBy` to the `VaccineHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Patient_nik_key";

-- DropIndex
DROP INDEX "Patient_nikfather_key";

-- DropIndex
DROP INDEX "Patient_nikmother_key";

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "VaccineHistory" ADD COLUMN     "administeredBy" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Patient_nik_idx" ON "Patient"("nik");

-- CreateIndex
CREATE INDEX "Patient_nikmother_idx" ON "Patient"("nikmother");

-- CreateIndex
CREATE INDEX "Patient_nikfather_idx" ON "Patient"("nikfather");
