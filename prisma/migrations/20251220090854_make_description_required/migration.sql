/*
  Warnings:

  - Made the column `description` on table `workouts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "workouts" ALTER COLUMN "description" SET NOT NULL;
