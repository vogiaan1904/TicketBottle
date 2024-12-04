/*
  Warnings:

  - You are about to drop the `staffs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[staffUsername]` on the table `events` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `staffPassword` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staffUsername` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "staffs" DROP CONSTRAINT "staffs_eventId_fkey";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "staffPassword" TEXT NOT NULL,
ADD COLUMN     "staffUsername" TEXT NOT NULL;

-- DropTable
DROP TABLE "staffs";

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "numberOfTickets" INTEGER NOT NULL,
    "totalCheckOut" DOUBLE PRECISION NOT NULL,
    "transactionData" JSONB NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDetail" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderDetail_ticketId_key" ON "OrderDetail"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "events_staffUsername_key" ON "events"("staffUsername");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
