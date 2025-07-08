/*
  Warnings:

  - Added the required column `mapCharacter` to the `WorldCell` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorldCell" ADD COLUMN     "mapCharacter" CHAR(1) NOT NULL;
