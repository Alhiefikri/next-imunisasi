/*
  Warnings:

  - You are about to drop the column `parentName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `vaccineId` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `motherName` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_vaccineId_fkey";

-- DropIndex
DROP INDEX "Patient_parentName_idx";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "parentName",
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "motherName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "vaccineId",
ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "ImmunizationRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "vaccineId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImmunizationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImmunizationRecord_patientId_idx" ON "ImmunizationRecord"("patientId");

-- CreateIndex
CREATE INDEX "ImmunizationRecord_vaccineId_idx" ON "ImmunizationRecord"("vaccineId");

-- CreateIndex
CREATE INDEX "ImmunizationRecord_scheduleId_idx" ON "ImmunizationRecord"("scheduleId");

-- CreateIndex
CREATE INDEX "Patient_motherName_fatherName_idx" ON "Patient"("motherName", "fatherName");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImmunizationRecord" ADD CONSTRAINT "ImmunizationRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImmunizationRecord" ADD CONSTRAINT "ImmunizationRecord_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "Vaccine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImmunizationRecord" ADD CONSTRAINT "ImmunizationRecord_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
