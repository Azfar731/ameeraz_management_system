/*
  Warnings:

  - The values [inactive] on the enum `Account_Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Account_Status_new" AS ENUM ('active', 'inActive');
ALTER TABLE "User" ALTER COLUMN "account_status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "account_status" TYPE "Account_Status_new" USING ("account_status"::text::"Account_Status_new");
ALTER TYPE "Account_Status" RENAME TO "Account_Status_old";
ALTER TYPE "Account_Status_new" RENAME TO "Account_Status";
DROP TYPE "Account_Status_old";
ALTER TABLE "User" ALTER COLUMN "account_status" SET DEFAULT 'active';
COMMIT;
