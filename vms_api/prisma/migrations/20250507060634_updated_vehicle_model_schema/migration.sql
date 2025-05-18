/*
  Warnings:

  - A unique constraint covering the columns `[brand]` on the table `vehicle_models` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "vehicle_models_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_models_brand_key" ON "vehicle_models"("brand");
