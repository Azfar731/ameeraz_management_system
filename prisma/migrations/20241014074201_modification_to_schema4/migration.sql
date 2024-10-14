/*
  Warnings:

  - The values [Cash,Bank_Transfer,Card] on the enum `Payment` will be removed. If these variants are still used in the database, this will fail.
  - The values [SOLD,BOUGHT,RETURNED] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `client_name` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `emp_name` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `vendor_name` on the `Vendor` table. All the data in the column will be lost.
  - Added the required column `client_fname` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_lname` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emp_fname` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emp_lname` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `serv_category` on the `Service` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `vendor_fname` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendor_lname` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Payment_new" AS ENUM ('cash', 'bank_transfer', 'card');
ALTER TABLE "Client_Transaction" ALTER COLUMN "mode_of_payment" DROP DEFAULT;
ALTER TABLE "Client_Transaction" ALTER COLUMN "mode_of_payment" TYPE "Payment_new" USING ("mode_of_payment"::text::"Payment_new");
ALTER TABLE "Product_Transaction" ALTER COLUMN "mode_of_payment" TYPE "Payment_new" USING ("mode_of_payment"::text::"Payment_new");
ALTER TYPE "Payment" RENAME TO "Payment_old";
ALTER TYPE "Payment_new" RENAME TO "Payment";
DROP TYPE "Payment_old";
ALTER TABLE "Client_Transaction" ALTER COLUMN "mode_of_payment" SET DEFAULT 'cash';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('sold', 'bought', 'returned');
ALTER TABLE "Product_Sale_Record" ALTER COLUMN "status" TYPE "TransactionType_new" USING ("status"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_serv_category_fkey";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "client_name",
ADD COLUMN     "client_fname" TEXT NOT NULL,
ADD COLUMN     "client_lname" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Client_Transaction" ALTER COLUMN "mode_of_payment" SET DEFAULT 'cash';

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "emp_name",
ADD COLUMN     "emp_fname" TEXT NOT NULL,
ADD COLUMN     "emp_lname" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "serv_category",
ADD COLUMN     "serv_category" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "vendor_name",
ADD COLUMN     "vendor_fname" TEXT NOT NULL,
ADD COLUMN     "vendor_lname" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serv_category_fkey" FOREIGN KEY ("serv_category") REFERENCES "Category"("cat_id") ON DELETE RESTRICT ON UPDATE CASCADE;
