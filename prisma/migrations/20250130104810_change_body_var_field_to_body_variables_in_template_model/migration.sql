/*
  Warnings:

  - You are about to drop the column `body_var` on the `Template` table. All the data in the column will be lost.
  - Added the required column `body_variables` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Template" DROP COLUMN "body_var",
ADD COLUMN     "body_variables" JSONB NOT NULL;
