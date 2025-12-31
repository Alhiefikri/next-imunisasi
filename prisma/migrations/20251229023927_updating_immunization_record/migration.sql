-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'SERVED', 'SKIPPED', 'ABSENT');

-- DropIndex
DROP INDEX "ImmunizationRecord_patientId_idx";

-- DropIndex
DROP INDEX "ImmunizationRecord_scheduleId_idx";

-- AlterTable
ALTER TABLE "ImmunizationRecord" ADD COLUMN     "headCircumference" DOUBLE PRECISION,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "weight" DOUBLE PRECISION,
ALTER COLUMN "vaccineId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ImmunizationRecord_patientId_scheduleId_idx" ON "ImmunizationRecord"("patientId", "scheduleId");

-- CreateIndex
CREATE INDEX "ImmunizationRecord_status_idx" ON "ImmunizationRecord"("status");
