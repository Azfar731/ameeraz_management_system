/*
  Warnings:

  - The `input_required` column on the `Template_Variable` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Boolean_Strings" AS ENUM ('true', 'false');

-- AlterTable
ALTER TABLE "Template_Variable" DROP COLUMN "input_required",
ADD COLUMN     "input_required" "Boolean_Strings" NOT NULL DEFAULT 'false';
