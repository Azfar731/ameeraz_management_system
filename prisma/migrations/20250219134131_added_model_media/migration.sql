-- CreateEnum
CREATE TYPE "Media_Type" AS ENUM ('img', 'vid');

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "Media_Type" NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_name_key" ON "Media"("name");
