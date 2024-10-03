/*
  Warnings:

  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category_id` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `category_name` on the `Category` table. All the data in the column will be lost.
  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `employee_id` on the `Employee` table. All the data in the column will be lost.
  - The primary key for the `Employee_Record_JT` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `employee_id` on the `Employee_Record_JT` table. All the data in the column will be lost.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `product_id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `product_name` on the `Product` table. All the data in the column will be lost.
  - The primary key for the `Product_Record_JT` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `product_id` on the `Product_Record_JT` table. All the data in the column will be lost.
  - The primary key for the `Service` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `service_category` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `service_id` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `service_name` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `service_price` on the `Service` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cat_name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cat_name` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emp_id` to the `Employee_Record_JT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prod_name` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prod_id` to the `Product_Record_JT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serv_category` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serv_name` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serv_price` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Employee_Record_JT" DROP CONSTRAINT "Employee_Record_JT_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "Product_Record_JT" DROP CONSTRAINT "Product_Record_JT_product_id_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_service_category_fkey";

-- DropIndex
DROP INDEX "Category_category_name_key";

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "category_id",
DROP COLUMN "category_name",
ADD COLUMN     "cat_id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "cat_name" TEXT NOT NULL,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("cat_id");

-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey",
DROP COLUMN "employee_id",
ADD COLUMN     "emp_id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("emp_id");

-- AlterTable
ALTER TABLE "Employee_Record_JT" DROP CONSTRAINT "Employee_Record_JT_pkey",
DROP COLUMN "employee_id",
ADD COLUMN     "emp_id" UUID NOT NULL,
ADD CONSTRAINT "Employee_Record_JT_pkey" PRIMARY KEY ("emp_id", "record_id");

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "product_id",
DROP COLUMN "product_name",
ADD COLUMN     "prod_id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "prod_name" TEXT NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("prod_id");

-- AlterTable
ALTER TABLE "Product_Record_JT" DROP CONSTRAINT "Product_Record_JT_pkey",
DROP COLUMN "product_id",
ADD COLUMN     "prod_id" UUID NOT NULL,
ADD CONSTRAINT "Product_Record_JT_pkey" PRIMARY KEY ("record_id", "prod_id");

-- AlterTable
ALTER TABLE "Service" DROP CONSTRAINT "Service_pkey",
DROP COLUMN "service_category",
DROP COLUMN "service_id",
DROP COLUMN "service_name",
DROP COLUMN "service_price",
ADD COLUMN     "serv_category" UUID NOT NULL,
ADD COLUMN     "serv_id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "serv_name" TEXT NOT NULL,
ADD COLUMN     "serv_price" INTEGER NOT NULL,
ADD CONSTRAINT "Service_pkey" PRIMARY KEY ("serv_id");

-- CreateTable
CREATE TABLE "_Services_In_Deals" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_Deal_Record" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Services_In_Deals_AB_unique" ON "_Services_In_Deals"("A", "B");

-- CreateIndex
CREATE INDEX "_Services_In_Deals_B_index" ON "_Services_In_Deals"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Deal_Record_AB_unique" ON "_Deal_Record"("A", "B");

-- CreateIndex
CREATE INDEX "_Deal_Record_B_index" ON "_Deal_Record"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Category_cat_name_key" ON "Category"("cat_name");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serv_category_fkey" FOREIGN KEY ("serv_category") REFERENCES "Category"("cat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee_Record_JT" ADD CONSTRAINT "Employee_Record_JT_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "Employee"("emp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_Record_JT" ADD CONSTRAINT "Product_Record_JT_prod_id_fkey" FOREIGN KEY ("prod_id") REFERENCES "Product"("prod_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Services_In_Deals" ADD CONSTRAINT "_Services_In_Deals_A_fkey" FOREIGN KEY ("A") REFERENCES "Deal"("deal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Services_In_Deals" ADD CONSTRAINT "_Services_In_Deals_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("serv_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Deal_Record" ADD CONSTRAINT "_Deal_Record_A_fkey" FOREIGN KEY ("A") REFERENCES "Deal"("deal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Deal_Record" ADD CONSTRAINT "_Deal_Record_B_fkey" FOREIGN KEY ("B") REFERENCES "Service_Sale_Record"("service_record_id") ON DELETE CASCADE ON UPDATE CASCADE;
