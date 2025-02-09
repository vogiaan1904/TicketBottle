/*
  Warnings:

  - You are about to drop the column `status` on the `events` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_details" DROP CONSTRAINT "order_details_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_details" DROP CONSTRAINT "order_details_ticketId_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "status",
ADD COLUMN     "configStatus" "EventStatus" NOT NULL DEFAULT 'DRAFT';

-- AddForeignKey
ALTER TABLE "order_details" ADD CONSTRAINT "order_details_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_details" ADD CONSTRAINT "order_details_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
