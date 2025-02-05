-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('MUSIC', 'SPORT', 'THEATERS_AND_ART', 'OTHER');

-- CreateTable
CREATE TABLE "EventCategories" (
    "categoryId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventCategories_pkey" PRIMARY KEY ("categoryId","eventId")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" "CategoryType" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- AddForeignKey
ALTER TABLE "EventCategories" ADD CONSTRAINT "EventCategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCategories" ADD CONSTRAINT "EventCategories_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
