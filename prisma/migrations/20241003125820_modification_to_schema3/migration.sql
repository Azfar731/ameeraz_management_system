-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_serv_category_fkey";

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "serv_category" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serv_category_fkey" FOREIGN KEY ("serv_category") REFERENCES "Category"("cat_name") ON DELETE RESTRICT ON UPDATE CASCADE;
