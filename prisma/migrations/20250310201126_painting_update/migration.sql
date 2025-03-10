/*
  Warnings:

  - Added the required column `artist` to the `Painting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Painting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Painting" ADD COLUMN     "artist" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;
