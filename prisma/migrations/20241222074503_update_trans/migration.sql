/*
  Warnings:

  - You are about to drop the column `paymentType` on the `transactions` table. All the data in the column will be lost.
  - The `status` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `details` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gateway` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refCode` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionAction" AS ENUM ('BUY_TICKET');

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "paymentType",
ADD COLUMN     "action" "TransactionAction" NOT NULL DEFAULT 'BUY_TICKET',
ADD COLUMN     "details" JSONB NOT NULL,
ADD COLUMN     "gateway" TEXT NOT NULL,
ADD COLUMN     "refCode" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING';
