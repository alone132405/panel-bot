-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('WHATSAPP', 'LINE', 'TELEGRAM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contactType" "ContactType",
ADD COLUMN     "contactValue" TEXT;
