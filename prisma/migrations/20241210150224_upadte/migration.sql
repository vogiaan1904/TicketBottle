/*
  Warnings:

  - A unique constraint covering the columns `[name,eventId]` on the table `ticket_classes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ticket_classes_name_eventId_key" ON "ticket_classes"("name", "eventId");
