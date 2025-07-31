/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `UserTrace` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserTrace_worldCellId_expiresAt_idx";

-- AlterTable
ALTER TABLE "UserTrace" DROP COLUMN "expiresAt";

-- AlterTable
ALTER TABLE "WorldCell" ADD COLUMN     "weather" TEXT NOT NULL DEFAULT 'neutral';
