/*
  Warnings:

  - You are about to drop the column `staffPassword` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `staffUsername` on the `events` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'STAFF');

-- AlterTable
ALTER TABLE "events" DROP COLUMN "staffPassword",
DROP COLUMN "staffUsername";

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'STAFF',

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
