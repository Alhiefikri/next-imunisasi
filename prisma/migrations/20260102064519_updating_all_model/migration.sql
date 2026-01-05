/*
  Warnings:

  - You are about to drop the `_ImmunizationRecordToVaccine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ImmunizationRecordToVaccine" DROP CONSTRAINT "_ImmunizationRecordToVaccine_A_fkey";

-- DropForeignKey
ALTER TABLE "_ImmunizationRecordToVaccine" DROP CONSTRAINT "_ImmunizationRecordToVaccine_B_fkey";

-- AlterTable
ALTER TABLE "Vaccine" ADD COLUMN     "ageMonthMax" INTEGER,
ADD COLUMN     "ageMonthMin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "intervalDays" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDoses" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "_ImmunizationRecordToVaccine";

-- CreateTable
CREATE TABLE "VaccineHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "vaccineId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "givenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doseNumber" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccineHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VaccineHistory_patientId_idx" ON "VaccineHistory"("patientId");

-- CreateIndex
CREATE INDEX "VaccineHistory_scheduleId_idx" ON "VaccineHistory"("scheduleId");

-- CreateIndex
CREATE INDEX "VaccineHistory_vaccineId_idx" ON "VaccineHistory"("vaccineId");

-- CreateIndex
CREATE INDEX "VaccineHistory_isLocked_idx" ON "VaccineHistory"("isLocked");

-- CreateIndex
CREATE UNIQUE INDEX "VaccineHistory_patientId_vaccineId_scheduleId_doseNumber_key" ON "VaccineHistory"("patientId", "vaccineId", "scheduleId", "doseNumber");

-- CreateIndex
CREATE INDEX "Schedule_status_idx" ON "Schedule"("status");

-- CreateIndex
CREATE INDEX "Vaccine_order_idx" ON "Vaccine"("order");

-- CreateIndex
CREATE INDEX "Vaccine_isActive_idx" ON "Vaccine"("isActive");

-- AddForeignKey
ALTER TABLE "VaccineHistory" ADD CONSTRAINT "VaccineHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineHistory" ADD CONSTRAINT "VaccineHistory_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "Vaccine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineHistory" ADD CONSTRAINT "VaccineHistory_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
