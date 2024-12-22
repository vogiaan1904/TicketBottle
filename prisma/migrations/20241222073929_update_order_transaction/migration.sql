/*
  Warnings:

  - You are about to drop the column `transactionData` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transctionId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "transactionData",
ADD COLUMN     "transctionId" TEXT;

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_transctionId_key" ON "orders"("transctionId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_transctionId_fkey" FOREIGN KEY ("transctionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
