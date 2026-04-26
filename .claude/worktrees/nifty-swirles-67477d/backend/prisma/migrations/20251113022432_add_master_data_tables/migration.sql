-- CreateTable
CREATE TABLE "states" (
    "id" SERIAL NOT NULL,
    "state_name" VARCHAR(100) NOT NULL,
    "state_code" VARCHAR(10),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "city_name" VARCHAR(100) NOT NULL,
    "state_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consignor_consignees" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "city_id" INTEGER NOT NULL,
    "state_id" INTEGER NOT NULL,
    "pincode" VARCHAR(10),
    "gstin" VARCHAR(15),
    "contact" VARCHAR(15),
    "remarks" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consignor_consignees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_parties" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "city_id" INTEGER NOT NULL,
    "state_id" INTEGER NOT NULL,
    "pincode" VARCHAR(10),
    "gstin" VARCHAR(15),
    "contact" VARCHAR(15),
    "remarks" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_owner_brokers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "city_id" INTEGER NOT NULL,
    "state_id" INTEGER NOT NULL,
    "pincode" VARCHAR(10),
    "contact" VARCHAR(15),
    "remarks" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_owner_brokers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_vehicles" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "vehicle_no" VARCHAR(20) NOT NULL,
    "vehicle_size" VARCHAR(50),
    "vehicle_type" VARCHAR(50),
    "remarks" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "states_state_name_key" ON "states"("state_name");

-- CreateIndex
CREATE INDEX "cities_state_id_idx" ON "cities"("state_id");

-- CreateIndex
CREATE UNIQUE INDEX "cities_city_name_state_id_key" ON "cities"("city_name", "state_id");

-- CreateIndex
CREATE INDEX "consignor_consignees_name_idx" ON "consignor_consignees"("name");

-- CreateIndex
CREATE INDEX "consignor_consignees_gstin_idx" ON "consignor_consignees"("gstin");

-- CreateIndex
CREATE INDEX "consignor_consignees_city_id_idx" ON "consignor_consignees"("city_id");

-- CreateIndex
CREATE INDEX "consignor_consignees_state_id_idx" ON "consignor_consignees"("state_id");

-- CreateIndex
CREATE INDEX "invoice_parties_name_idx" ON "invoice_parties"("name");

-- CreateIndex
CREATE INDEX "invoice_parties_gstin_idx" ON "invoice_parties"("gstin");

-- CreateIndex
CREATE INDEX "invoice_parties_city_id_idx" ON "invoice_parties"("city_id");

-- CreateIndex
CREATE INDEX "invoice_parties_state_id_idx" ON "invoice_parties"("state_id");

-- CreateIndex
CREATE INDEX "vehicle_owner_brokers_name_idx" ON "vehicle_owner_brokers"("name");

-- CreateIndex
CREATE INDEX "vehicle_owner_brokers_city_id_idx" ON "vehicle_owner_brokers"("city_id");

-- CreateIndex
CREATE INDEX "vehicle_owner_brokers_state_id_idx" ON "vehicle_owner_brokers"("state_id");

-- CreateIndex
CREATE INDEX "owner_vehicles_owner_id_idx" ON "owner_vehicles"("owner_id");

-- CreateIndex
CREATE INDEX "owner_vehicles_vehicle_no_idx" ON "owner_vehicles"("vehicle_no");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignor_consignees" ADD CONSTRAINT "consignor_consignees_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignor_consignees" ADD CONSTRAINT "consignor_consignees_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_parties" ADD CONSTRAINT "invoice_parties_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_parties" ADD CONSTRAINT "invoice_parties_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_owner_brokers" ADD CONSTRAINT "vehicle_owner_brokers_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_owner_brokers" ADD CONSTRAINT "vehicle_owner_brokers_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_vehicles" ADD CONSTRAINT "owner_vehicles_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "vehicle_owner_brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
