/*
  Warnings:

  - A unique constraint covering the columns `[patientId,scheduleId]` on the table `ImmunizationRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ImmunizationRecord_patientId_scheduleId_key" ON "ImmunizationRecord"("patientId", "scheduleId");
