/*
  Warnings:

  - You are about to drop the column `staffId` on the `events` table. All the data in the column will be lost.
  - Added the required column `thumbnail` to the `event_infos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event_infos" ADD COLUMN     "thumbnail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "staffId",
ADD COLUMN     "numberOfSoldTickets" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';
