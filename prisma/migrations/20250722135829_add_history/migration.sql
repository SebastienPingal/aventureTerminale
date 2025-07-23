-- CreateEnum
CREATE TYPE "HistoryType" AS ENUM ('PROMPT', 'RESPONSE', 'SYSTEM', 'ERROR');

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "HistoryType" NOT NULL DEFAULT 'SYSTEM',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
