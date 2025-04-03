/*
  Warnings:

  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifyExpires" TIMESTAMP(3),
ADD COLUMN     "verifyToken" TEXT,
ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL;
