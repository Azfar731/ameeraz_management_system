/*
  Warnings:

  - You are about to drop the column `status` on the `Product_Sale_Record` table. All the data in the column will be lost.
  - Added the required column `transaction_type` to the `Product_Sale_Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product_Sale_Record" DROP COLUMN "status",
ADD COLUMN     "transaction_type" "TransactionType" NOT NULL;
