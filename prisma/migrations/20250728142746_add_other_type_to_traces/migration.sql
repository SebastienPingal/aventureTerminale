/*
  Warnings:

  - The values [CAMPFIRE,BATTLE] on the enum `UserTraceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserTraceType_new" AS ENUM ('FOOTPRINT', 'LOOT', 'OTHER', 'MESSAGE');
ALTER TABLE "UserTrace" ALTER COLUMN "traceType" DROP DEFAULT;
ALTER TABLE "UserTrace" ALTER COLUMN "traceType" TYPE "UserTraceType_new" USING ("traceType"::text::"UserTraceType_new");
ALTER TYPE "UserTraceType" RENAME TO "UserTraceType_old";
ALTER TYPE "UserTraceType_new" RENAME TO "UserTraceType";
DROP TYPE "UserTraceType_old";
ALTER TABLE "UserTrace" ALTER COLUMN "traceType" SET DEFAULT 'FOOTPRINT';
COMMIT;
