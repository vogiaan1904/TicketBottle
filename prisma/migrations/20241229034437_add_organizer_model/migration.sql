/*
  Warnings:

  - Added the required column `endDate` to the `event_infos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event_infos" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "organizerId" TEXT;

-- CreateTable
CREATE TABLE "organizers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "thumbnail" TEXT,

    CONSTRAINT "organizers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "organizers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
