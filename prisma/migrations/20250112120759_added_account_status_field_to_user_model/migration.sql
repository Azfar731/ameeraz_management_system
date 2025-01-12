-- CreateEnum
CREATE TYPE "Account_Status" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "account_status" "Account_Status" NOT NULL DEFAULT 'active';
