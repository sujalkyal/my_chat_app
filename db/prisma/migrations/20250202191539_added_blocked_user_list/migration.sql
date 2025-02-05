-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blockedUsers" TEXT[] DEFAULT ARRAY[]::TEXT[];
