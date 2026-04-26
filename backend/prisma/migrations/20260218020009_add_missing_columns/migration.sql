/*
  Warnings:

  - Added the required column `updated_at` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now();

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now();

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "consignments_consignee_id_idx" ON "consignments"("consignee_id");

-- CreateIndex
CREATE INDEX "consignments_from_location_to_location_idx" ON "consignments"("from_location", "to_location");

-- CreateIndex
CREATE INDEX "parties_party_type_idx" ON "parties"("party_type");

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
