/*
  Warnings:

  - You are about to drop the column `checkedInAt` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `tickets` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TicketClassStatus" AS ENUM ('AVAILABLE', 'SOLD_OUT');

-- AlterTable
ALTER TABLE "ticket_classes" ADD COLUMN     "status" "TicketClassStatus" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "checkedInAt",
DROP COLUMN "status",
ADD COLUMN     "checkInAt" TIMESTAMP(3),
ADD COLUMN     "isCheckIn" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "TicketStatus";
