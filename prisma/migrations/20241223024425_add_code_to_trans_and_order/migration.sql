/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "code" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_code_key" ON "transactions"("code");
