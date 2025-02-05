/*
  Warnings:

  - You are about to drop the column `name` on the `categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[type]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "categories_name_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "name",
ADD COLUMN     "type" "CategoryType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categories_type_key" ON "categories"("type");
