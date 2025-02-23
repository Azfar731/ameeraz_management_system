-- CreateEnum
CREATE TYPE "Header_type" AS ENUM ('none', 'image', 'text', 'video');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "subscribed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Template" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "header_type" "Header_type" NOT NULL,
    "header_var_name" TEXT NOT NULL,
    "body_var" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);
