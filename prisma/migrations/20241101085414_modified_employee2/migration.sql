/*
  Warnings:

  - Made the column `emp_status` on table `Employee` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "emp_status" SET NOT NULL,
ALTER COLUMN "emp_status" SET DEFAULT true;
