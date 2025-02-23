/*
  Warnings:

  - You are about to drop the column `body_variables` on the `Template` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WP_Variable_Type" AS ENUM ('text', 'currency', 'date_time');

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "body_variables";

-- CreateTable
CREATE TABLE "Template_Variable" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" "WP_Variable_Type" NOT NULL,
    "template_id" UUID NOT NULL,

    CONSTRAINT "Template_Variable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Template_Variable" ADD CONSTRAINT "Template_Variable_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
