/*
  Warnings:

  - You are about to drop the `_ObjectToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ObjectToUser" DROP CONSTRAINT "_ObjectToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ObjectToUser" DROP CONSTRAINT "_ObjectToUser_B_fkey";

-- AlterTable
ALTER TABLE "Loot" RENAME CONSTRAINT "Object_pkey" TO "Loot_pkey";

-- DropTable
DROP TABLE "_ObjectToUser";

-- CreateTable
CREATE TABLE "_LootToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LootToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LootToUser_B_index" ON "_LootToUser"("B");

-- AddForeignKey
ALTER TABLE "_LootToUser" ADD CONSTRAINT "_LootToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Loot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LootToUser" ADD CONSTRAINT "_LootToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
