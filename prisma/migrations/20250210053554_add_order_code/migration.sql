/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");
