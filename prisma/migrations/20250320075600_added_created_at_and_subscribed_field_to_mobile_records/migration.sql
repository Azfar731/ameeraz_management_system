-- AlterTable
ALTER TABLE "Mobile_number_record" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "subscribed" "Boolean_Strings" NOT NULL DEFAULT 'true';
