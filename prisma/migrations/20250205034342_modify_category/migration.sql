/*
  Warnings:

  - You are about to drop the `EventCategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventCategories" DROP CONSTRAINT "EventCategories_categoryType_fkey";

-- DropForeignKey
ALTER TABLE "EventCategories" DROP CONSTRAINT "EventCategories_eventId_fkey";

-- DropTable
DROP TABLE "EventCategories";

-- CreateTable
CREATE TABLE "events_categories" (
    "categoryType" "CategoryType" NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "events_categories_pkey" PRIMARY KEY ("categoryType","eventId")
);

-- AddForeignKey
ALTER TABLE "events_categories" ADD CONSTRAINT "events_categories_categoryType_fkey" FOREIGN KEY ("categoryType") REFERENCES "categories"("type") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_categories" ADD CONSTRAINT "events_categories_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
