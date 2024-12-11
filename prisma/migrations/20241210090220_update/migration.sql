/*
  Warnings:

  - You are about to drop the column `numberOfTickets` on the `ticket_classes` table. All the data in the column will be lost.
  - Added the required column `remainingQuantity` to the `ticket_classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuantity` to the `ticket_classes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ticket_classes" DROP COLUMN "numberOfTickets",
ADD COLUMN     "remainingQuantity" INTEGER NOT NULL,
ADD COLUMN     "totalQuantity" INTEGER NOT NULL;
