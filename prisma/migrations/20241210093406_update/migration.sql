-- DropForeignKey
ALTER TABLE "event_infos" DROP CONSTRAINT "event_infos_eventId_fkey";

-- AddForeignKey
ALTER TABLE "event_infos" ADD CONSTRAINT "event_infos_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
