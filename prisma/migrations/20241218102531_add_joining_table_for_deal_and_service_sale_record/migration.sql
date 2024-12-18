/*
  Warnings:

  - You are about to drop the `_Deal_Record` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Deal_Record" DROP CONSTRAINT "_Deal_Record_A_fkey";

-- DropForeignKey
ALTER TABLE "_Deal_Record" DROP CONSTRAINT "_Deal_Record_B_fkey";

-- AlterTable
ALTER TABLE "Client_Transaction" ALTER COLUMN "mode_of_payment" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "quantity" DROP DEFAULT,
ALTER COLUMN "prod_price" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "_Deal_Record";

-- CreateTable
CREATE TABLE "Deal_ServiceSaleRecord_JT" (
    "deal_id" UUID NOT NULL,
    "record_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Deal_ServiceSaleRecord_JT_pkey" PRIMARY KEY ("deal_id","record_id")
);

-- AddForeignKey
ALTER TABLE "Deal_ServiceSaleRecord_JT" ADD CONSTRAINT "Deal_ServiceSaleRecord_JT_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "Deal"("deal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal_ServiceSaleRecord_JT" ADD CONSTRAINT "Deal_ServiceSaleRecord_JT_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "Service_Sale_Record"("service_record_id") ON DELETE RESTRICT ON UPDATE CASCADE;
