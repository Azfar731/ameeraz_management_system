-- AlterTable
ALTER TABLE "Deal" ALTER COLUMN "activate_till" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "emp_status" BOOLEAN;
