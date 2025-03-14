-- CreateEnum
CREATE TYPE "Log_Type" AS ENUM ('loggedIn', 'loggedOut', 'create', 'read', 'update', 'delete');

-- CreateTable
CREATE TABLE "Logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "log_type" "Log_Type" NOT NULL,
    "log_message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Logs" ADD CONSTRAINT "Logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
