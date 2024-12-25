/*
  Warnings:

  - You are about to drop the column `email` on the `staffs` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "staffs_email_key";

-- AlterTable
ALTER TABLE "staffs" DROP COLUMN "email";
