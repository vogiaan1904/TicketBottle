/*
  Warnings:

  - You are about to drop the column `price` on the `order_details` table. All the data in the column will be lost.
  - Added the required column `amount` to the `order_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_details" DROP COLUMN "price",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL;
