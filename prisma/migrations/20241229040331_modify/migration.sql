/*
  Warnings:

  - You are about to drop the column `organizerId` on the `events` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_organizerId_fkey";

-- AlterTable
ALTER TABLE "event_infos" ADD COLUMN     "organizerId" TEXT;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "organizerId";

-- AddForeignKey
ALTER TABLE "event_infos" ADD CONSTRAINT "event_infos_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "organizers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
