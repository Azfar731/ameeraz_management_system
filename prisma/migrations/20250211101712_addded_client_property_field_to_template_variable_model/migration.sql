-- CreateEnum
CREATE TYPE "Client_Property" AS ENUM ('client_fname', 'client_lname', 'client_area', 'client_mobile_num', 'points', 'none');

-- AlterTable
ALTER TABLE "Template_Variable" ADD COLUMN     "client_property" "Client_Property" NOT NULL DEFAULT 'none';
