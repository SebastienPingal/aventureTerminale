-- CreateEnum
CREATE TYPE "UserTraceType" AS ENUM ('FOOTPRINT', 'CAMPFIRE', 'BATTLE', 'LOOT', 'MESSAGE');

-- CreateTable
CREATE TABLE "UserTrace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "worldCellId" TEXT NOT NULL,
    "traceType" "UserTraceType" NOT NULL DEFAULT 'FOOTPRINT',
    "intensity" INTEGER NOT NULL DEFAULT 100,
    "volatility" INTEGER NOT NULL DEFAULT 5,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTrace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTrace_worldCellId_expiresAt_idx" ON "UserTrace"("worldCellId", "expiresAt");

-- CreateIndex
CREATE INDEX "UserTrace_userId_createdAt_idx" ON "UserTrace"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserTrace" ADD CONSTRAINT "UserTrace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTrace" ADD CONSTRAINT "UserTrace_worldCellId_fkey" FOREIGN KEY ("worldCellId") REFERENCES "WorldCell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
