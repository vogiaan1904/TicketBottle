/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `organizers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `organizers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "organizers_name_key" ON "organizers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organizers_email_key" ON "organizers"("email");
