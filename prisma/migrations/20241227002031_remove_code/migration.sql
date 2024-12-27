/*
  Warnings:

  - You are about to drop the column `code` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `transactions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "orders_code_key";

-- DropIndex
DROP INDEX "transactions_code_key";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "code";
