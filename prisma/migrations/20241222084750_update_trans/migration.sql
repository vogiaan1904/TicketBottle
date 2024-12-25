/*
  Warnings:

  - A unique constraint covering the columns `[refCode]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "transactions_refCode_key" ON "transactions"("refCode");
