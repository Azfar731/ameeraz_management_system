/*
  Warnings:

  - Added the required column `modified_at` to the `Product_Sale_Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modified_at` to the `Product_Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product_Sale_Record" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modified_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Product_Transaction" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modified_at" TIMESTAMP(3) NOT NULL;
