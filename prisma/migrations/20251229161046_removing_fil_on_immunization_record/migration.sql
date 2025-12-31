/*
  Warnings:

  - The values [PENDING,SKIPPED,ABSENT] on the enum `AttendanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `headCircumference` on the `ImmunizationRecord` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `ImmunizationRecord` table. All the data in the column will be lost.
  - You are about to drop the column `vaccineId` on the `ImmunizationRecord` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `ImmunizationRecord` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceStatus_new" AS ENUM ('WAITING', 'SERVED', 'CANCELLED');
ALTER TABLE "public"."ImmunizationRecord" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ImmunizationRecord" ALTER COLUMN "status" TYPE "AttendanceStatus_new" USING ("status"::text::"AttendanceStatus_new");
ALTER TYPE "AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "public"."AttendanceStatus_old";
ALTER TABLE "ImmunizationRecord" ALTER COLUMN "status" SET DEFAULT 'WAITING';
COMMIT;

-- DropForeignKey
ALTER TABLE "ImmunizationRecord" DROP CONSTRAINT "ImmunizationRecord_vaccineId_fkey";

-- DropIndex
DROP INDEX "ImmunizationRecord_vaccineId_idx";

-- AlterTable
ALTER TABLE "ImmunizationRecord" DROP COLUMN "headCircumference",
DROP COLUMN "height",
DROP COLUMN "vaccineId",
DROP COLUMN "weight",
ALTER COLUMN "status" SET DEFAULT 'WAITING';

-- CreateTable
CREATE TABLE "_ImmunizationRecordToVaccine" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ImmunizationRecordToVaccine_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ImmunizationRecordToVaccine_B_index" ON "_ImmunizationRecordToVaccine"("B");

-- AddForeignKey
ALTER TABLE "_ImmunizationRecordToVaccine" ADD CONSTRAINT "_ImmunizationRecordToVaccine_A_fkey" FOREIGN KEY ("A") REFERENCES "ImmunizationRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImmunizationRecordToVaccine" ADD CONSTRAINT "_ImmunizationRecordToVaccine_B_fkey" FOREIGN KEY ("B") REFERENCES "Vaccine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
