/*
  Warnings:

  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MUSIC', 'SPORT', 'THEATERS_AND_ART', 'OTHER');

-- DropForeignKey
ALTER TABLE "events_categories" DROP CONSTRAINT "events_categories_categoryType_fkey";

-- DropForeignKey
ALTER TABLE "events_categories" DROP CONSTRAINT "events_categories_eventId_fkey";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "categorie" "Category"[];

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "events_categories";

-- DropEnum
DROP TYPE "CategoryType";
