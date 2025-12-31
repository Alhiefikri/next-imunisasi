/*
  Warnings:

  - A unique constraint covering the columns `[nikmother]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nikfather]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "nikfather" TEXT,
ADD COLUMN     "nikmother" TEXT,
ALTER COLUMN "motherName" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_nikmother_key" ON "Patient"("nikmother");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_nikfather_key" ON "Patient"("nikfather");
