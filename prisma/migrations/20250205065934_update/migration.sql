/*
  Warnings:

  - You are about to drop the column `categorie` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "categorie",
ADD COLUMN     "categories" "Category"[];
