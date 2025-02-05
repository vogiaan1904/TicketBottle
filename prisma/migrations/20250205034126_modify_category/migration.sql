/*
  Warnings:

  - The primary key for the `EventCategories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `categoryId` on the `EventCategories` table. All the data in the column will be lost.
  - Added the required column `categoryType` to the `EventCategories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EventCategories" DROP CONSTRAINT "EventCategories_categoryId_fkey";

-- AlterTable
ALTER TABLE "EventCategories" DROP CONSTRAINT "EventCategories_pkey",
DROP COLUMN "categoryId",
ADD COLUMN     "categoryType" "CategoryType" NOT NULL,
ADD CONSTRAINT "EventCategories_pkey" PRIMARY KEY ("categoryType", "eventId");

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "description" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EventCategories" ADD CONSTRAINT "EventCategories_categoryType_fkey" FOREIGN KEY ("categoryType") REFERENCES "categories"("type") ON DELETE CASCADE ON UPDATE CASCADE;
