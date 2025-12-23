/*
  Warnings:

  - Added the required column `updatedAt` to the `Posyandu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Vaccine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Posyandu" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Vaccine" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
