/*
  Warnings:

  - You are about to drop the `Balance_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Balance_transactions" DROP CONSTRAINT "Balance_transactions_userId_fkey";

-- DropTable
DROP TABLE "Balance_transactions";

-- CreateTable
CREATE TABLE "Balance_Transaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "type" "Balance_Transaction_Type" NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Balance_Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Balance_Transaction" ADD CONSTRAINT "Balance_Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
