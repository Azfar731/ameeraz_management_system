/*
  Warnings:

  - You are about to drop the column `employee_mobile_num` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `employee_name` on the `Employee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[emp_mobile_num]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emp_mobile_num` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emp_name` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Employee_employee_mobile_num_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "employee_mobile_num",
DROP COLUMN "employee_name",
ADD COLUMN     "emp_mobile_num" TEXT NOT NULL,
ADD COLUMN     "emp_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_emp_mobile_num_key" ON "Employee"("emp_mobile_num");
