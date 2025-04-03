/*
  Warnings:

  - A unique constraint covering the columns `[Username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Username` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Username" TEXT NOT NULL,
ADD COLUMN     "password" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_Username_key" ON "User"("Username");
