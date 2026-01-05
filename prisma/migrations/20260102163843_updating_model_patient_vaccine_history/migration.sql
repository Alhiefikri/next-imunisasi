/*
  Warnings:

  - A unique constraint covering the columns `[patientId,vaccineId,doseNumber]` on the table `VaccineHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `immunizationRecordId` to the `VaccineHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "VaccineHistory_patientId_vaccineId_scheduleId_doseNumber_key";

-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VaccineHistory" ADD COLUMN     "immunizationRecordId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VaccineHistory_patientId_vaccineId_doseNumber_key" ON "VaccineHistory"("patientId", "vaccineId", "doseNumber");

-- AddForeignKey
ALTER TABLE "VaccineHistory" ADD CONSTRAINT "VaccineHistory_immunizationRecordId_fkey" FOREIGN KEY ("immunizationRecordId") REFERENCES "ImmunizationRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
