/*
  Warnings:

  - Added the required column `numberOfTickets` to the `ticket_classes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ALTER COLUMN "numberOfTickets" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "ticket_classes" ADD COLUMN     "numberOfTickets" INTEGER NOT NULL;
