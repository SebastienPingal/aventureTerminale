/*
  Warnings:

  - A unique constraint covering the columns `[x,y]` on the table `WorldCell` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WorldCell_x_y_key" ON "WorldCell"("x", "y");
