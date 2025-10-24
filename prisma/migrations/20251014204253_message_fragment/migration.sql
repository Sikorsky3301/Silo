/*
  Warnings:

  - You are about to drop the column `contnet` on the `Message` table. All the data in the column will be lost.
  - Added the required column `content` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "contnet",
ADD COLUMN     "content" TEXT NOT NULL;
