-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_worldCellId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "worldCellId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_worldCellId_fkey" FOREIGN KEY ("worldCellId") REFERENCES "WorldCell"("id") ON DELETE SET NULL ON UPDATE CASCADE;
