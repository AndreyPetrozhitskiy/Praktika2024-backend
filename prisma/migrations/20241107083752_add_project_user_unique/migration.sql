/*
  Warnings:

  - A unique constraint covering the columns `[projectId,userId]` on the table `Project_user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_user_projectId_userId_key" ON "Project_user"("projectId", "userId");
