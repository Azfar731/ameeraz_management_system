-- CreateEnum
CREATE TYPE "Payment" AS ENUM ('Cash', 'Bank_Transfer', 'Card');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SOLD', 'BOUGHT', 'RETURNED');

-- CreateTable
CREATE TABLE "Client" (
    "client_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_name" TEXT NOT NULL,
    "client_mobile_num" TEXT NOT NULL,
    "client_area" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "employee_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employee_name" TEXT NOT NULL,
    "employee_mobile_num" TEXT NOT NULL,
    "base_salary" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "Service" (
    "service_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_name" TEXT NOT NULL,
    "service_price" INTEGER NOT NULL,
    "service_category" UUID NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "Category" (
    "category_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "deal_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deal_name" TEXT NOT NULL,
    "deal_price" INTEGER NOT NULL,
    "activate_from" TIMESTAMP(3) NOT NULL,
    "activate_till" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "auto_generated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("deal_id")
);

-- CreateTable
CREATE TABLE "Product" (
    "product_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "vendor_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_name" TEXT NOT NULL,
    "vendor_mobile_num" TEXT NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("vendor_id")
);

-- CreateTable
CREATE TABLE "Service_Sale_Record" (
    "service_record_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "total_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "payment_cleared" BOOLEAN NOT NULL,
    "client_id" UUID NOT NULL,

    CONSTRAINT "Service_Sale_Record_pkey" PRIMARY KEY ("service_record_id")
);

-- CreateTable
CREATE TABLE "Employee_Record_JT" (
    "record_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "work_share" INTEGER NOT NULL,

    CONSTRAINT "Employee_Record_JT_pkey" PRIMARY KEY ("employee_id","record_id")
);

-- CreateTable
CREATE TABLE "Client_Transaction" (
    "client_transaction_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "record_id" UUID NOT NULL,
    "amount_paid" INTEGER NOT NULL,
    "mode_of_payment" "Payment" NOT NULL DEFAULT 'Cash',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_Transaction_pkey" PRIMARY KEY ("client_transaction_id")
);

-- CreateTable
CREATE TABLE "Product_Sale_Record" (
    "product_record_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID,
    "vendor_id" UUID,
    "status" "TransactionType" NOT NULL,
    "payment_cleared" BOOLEAN NOT NULL,
    "total_amount" INTEGER NOT NULL,

    CONSTRAINT "Product_Sale_Record_pkey" PRIMARY KEY ("product_record_id")
);

-- CreateTable
CREATE TABLE "Product_Record_JT" (
    "record_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Product_Record_JT_pkey" PRIMARY KEY ("record_id","product_id")
);

-- CreateTable
CREATE TABLE "Product_Transaction" (
    "product_trans_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "record_id" UUID NOT NULL,
    "amount_paid" INTEGER NOT NULL,
    "mode_of_payment" "Payment" NOT NULL,

    CONSTRAINT "Product_Transaction_pkey" PRIMARY KEY ("product_trans_id")
);

-- CreateTable
CREATE TABLE "Operational_Expenses" (
    "expense_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "amount_paid" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operational_Expenses_pkey" PRIMARY KEY ("expense_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_client_mobile_num_key" ON "Client"("client_mobile_num");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employee_mobile_num_key" ON "Employee"("employee_mobile_num");

-- CreateIndex
CREATE UNIQUE INDEX "Category_category_name_key" ON "Category"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_deal_name_key" ON "Deal"("deal_name");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_vendor_mobile_num_key" ON "Vendor"("vendor_mobile_num");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_service_category_fkey" FOREIGN KEY ("service_category") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service_Sale_Record" ADD CONSTRAINT "Service_Sale_Record_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee_Record_JT" ADD CONSTRAINT "Employee_Record_JT_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "Service_Sale_Record"("service_record_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee_Record_JT" ADD CONSTRAINT "Employee_Record_JT_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client_Transaction" ADD CONSTRAINT "Client_Transaction_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "Service_Sale_Record"("service_record_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_Sale_Record" ADD CONSTRAINT "Product_Sale_Record_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("client_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_Sale_Record" ADD CONSTRAINT "Product_Sale_Record_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendor"("vendor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_Record_JT" ADD CONSTRAINT "Product_Record_JT_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "Product_Sale_Record"("product_record_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_Record_JT" ADD CONSTRAINT "Product_Record_JT_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_Transaction" ADD CONSTRAINT "Product_Transaction_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "Product_Sale_Record"("product_record_id") ON DELETE RESTRICT ON UPDATE CASCADE;
