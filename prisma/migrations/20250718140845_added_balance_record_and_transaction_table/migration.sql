-- CreateEnum
CREATE TYPE "Balance_Transaction_Type" AS ENUM ('added', 'subtracted');

-- CreateTable
CREATE TABLE "Balance_record" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" TIMESTAMP(3) NOT NULL,
    "ending_balance" INTEGER NOT NULL,

    CONSTRAINT "Balance_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "Type" "Balance_Transaction_Type" NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Balance_transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Balance_transactions" ADD CONSTRAINT "Balance_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
