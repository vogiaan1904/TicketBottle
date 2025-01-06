/*
  Warnings:

  - You are about to drop the column `isCheckedIn` on the `tickets` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "TicketStatus" ADD VALUE 'CHECKEDIN';

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "isCheckedIn";
