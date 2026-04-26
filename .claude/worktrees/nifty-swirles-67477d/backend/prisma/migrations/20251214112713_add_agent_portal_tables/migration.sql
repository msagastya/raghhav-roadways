-- CreateTable
CREATE TABLE "agents" (
    "id" SERIAL NOT NULL,
    "agent_code" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "mobile" VARCHAR(15) NOT NULL,
    "address" TEXT,
    "city_id" INTEGER,
    "state_id" INTEGER,
    "pincode" VARCHAR(10),
    "profile_photo" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "approval_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_vehicles" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "vehicle_no" VARCHAR(20) NOT NULL,
    "vehicle_type" VARCHAR(50),
    "vehicle_capacity" DECIMAL(10,2),
    "rc_number" VARCHAR(50),
    "rc_expiry" DATE,
    "rc_file_path" VARCHAR(500),
    "insurance_number" VARCHAR(50),
    "insurance_expiry" DATE,
    "insurance_file_path" VARCHAR(500),
    "fitness_expiry" DATE,
    "fitness_file_path" VARCHAR(500),
    "pollution_expiry" DATE,
    "pollution_file_path" VARCHAR(500),
    "vehicle_photo" VARCHAR(500),
    "driver_name" VARCHAR(100),
    "driver_mobile" VARCHAR(15),
    "driver_license" VARCHAR(50),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_availability" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "start_time" VARCHAR(10),
    "end_time" VARCHAR(10),
    "preferred_routes" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_agent_code_key" ON "agents"("agent_code");

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");

-- CreateIndex
CREATE INDEX "agents_email_idx" ON "agents"("email");

-- CreateIndex
CREATE INDEX "agents_mobile_idx" ON "agents"("mobile");

-- CreateIndex
CREATE INDEX "agents_approval_status_idx" ON "agents"("approval_status");

-- CreateIndex
CREATE UNIQUE INDEX "agent_vehicles_vehicle_no_key" ON "agent_vehicles"("vehicle_no");

-- CreateIndex
CREATE INDEX "agent_vehicles_agent_id_idx" ON "agent_vehicles"("agent_id");

-- CreateIndex
CREATE INDEX "agent_vehicles_vehicle_no_idx" ON "agent_vehicles"("vehicle_no");

-- CreateIndex
CREATE INDEX "agent_vehicles_is_active_idx" ON "agent_vehicles"("is_active");

-- CreateIndex
CREATE INDEX "agent_availability_agent_id_idx" ON "agent_availability"("agent_id");

-- CreateIndex
CREATE INDEX "agent_availability_date_idx" ON "agent_availability"("date");

-- CreateIndex
CREATE INDEX "agent_availability_is_available_idx" ON "agent_availability"("is_available");

-- CreateIndex
CREATE UNIQUE INDEX "agent_availability_vehicle_id_date_key" ON "agent_availability"("vehicle_id", "date");

-- AddForeignKey
ALTER TABLE "agent_vehicles" ADD CONSTRAINT "agent_vehicles_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_availability" ADD CONSTRAINT "agent_availability_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_availability" ADD CONSTRAINT "agent_availability_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "agent_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
