-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100),
    "mobile" VARCHAR(15),
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "permission_code" VARCHAR(50) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" SERIAL NOT NULL,
    "party_code" VARCHAR(20) NOT NULL,
    "party_name" VARCHAR(200) NOT NULL,
    "party_type" VARCHAR(20) NOT NULL,
    "gstin" VARCHAR(15),
    "pan" VARCHAR(10),
    "address_line1" VARCHAR(200),
    "address_line2" VARCHAR(200),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "pincode" VARCHAR(10),
    "country" VARCHAR(100) NOT NULL DEFAULT 'India',
    "contact_person" VARCHAR(100),
    "mobile" VARCHAR(15),
    "email" VARCHAR(100),
    "bank_name" VARCHAR(100),
    "bank_account_no" VARCHAR(50),
    "bank_ifsc" VARCHAR(15),
    "bank_branch" VARCHAR(100),
    "credit_limit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "credit_days" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "vehicle_no" VARCHAR(20) NOT NULL,
    "vehicle_type" VARCHAR(50),
    "vehicle_capacity" DECIMAL(10,2),
    "owner_type" VARCHAR(20) NOT NULL,
    "owner_name" VARCHAR(200),
    "owner_mobile" VARCHAR(15),
    "owner_address" TEXT,
    "broker_id" INTEGER,
    "rc_number" VARCHAR(50),
    "rc_expiry" DATE,
    "insurance_number" VARCHAR(50),
    "insurance_expiry" DATE,
    "fitness_expiry" DATE,
    "pollution_expiry" DATE,
    "driver_name" VARCHAR(100),
    "driver_mobile" VARCHAR(15),
    "driver_license" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consignments" (
    "id" SERIAL NOT NULL,
    "gr_number" VARCHAR(20) NOT NULL,
    "gr_date" DATE NOT NULL,
    "consignment_no" VARCHAR(50),
    "consignor_id" INTEGER NOT NULL,
    "consignee_id" INTEGER NOT NULL,
    "from_location" VARCHAR(100) NOT NULL,
    "to_location" VARCHAR(100) NOT NULL,
    "issuing_branch" VARCHAR(100) NOT NULL DEFAULT 'Surat',
    "delivery_office" VARCHAR(100),
    "vehicle_id" INTEGER NOT NULL,
    "vehicle_number" VARCHAR(20) NOT NULL,
    "no_of_packages" INTEGER,
    "description" TEXT,
    "vehicle_type" VARCHAR(50),
    "actual_weight" DECIMAL(10,3),
    "weight_unit" VARCHAR(10) NOT NULL DEFAULT 'MT',
    "freight_amount" DECIMAL(15,2) NOT NULL,
    "surcharge" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "other_charges" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "gr_charge" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "amount_in_words" VARCHAR(500),
    "rate_type" VARCHAR(20),
    "rate_calculation_text" TEXT,
    "at_risk" VARCHAR(50),
    "payment_mode" VARCHAR(20) NOT NULL DEFAULT 'To Pay',
    "status" VARCHAR(30) NOT NULL DEFAULT 'Booked',
    "booked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loaded_at" TIMESTAMP(3),
    "in_transit_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "settled_at" TIMESTAMP(3),
    "challan_uploaded" BOOLEAN NOT NULL DEFAULT false,
    "challan_file_path" VARCHAR(500),
    "pod_uploaded" BOOLEAN NOT NULL DEFAULT false,
    "pod_file_path" VARCHAR(500),
    "is_invoiced" BOOLEAN NOT NULL DEFAULT false,
    "invoice_id" INTEGER,
    "notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "consignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "invoice_number" VARCHAR(20) NOT NULL,
    "invoice_date" DATE NOT NULL,
    "branch" VARCHAR(100) NOT NULL DEFAULT 'Surat',
    "party_id" INTEGER NOT NULL,
    "party_name" VARCHAR(200) NOT NULL,
    "party_address" TEXT,
    "party_gstin" VARCHAR(15),
    "subtotal" DECIMAL(15,2) NOT NULL,
    "gr_charge" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "amount_in_words" VARCHAR(500),
    "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "balance_amount" DECIMAL(15,2) NOT NULL,
    "payment_status" VARCHAR(20) NOT NULL DEFAULT 'Pending',
    "due_date" DATE,
    "pdf_generated" BOOLEAN NOT NULL DEFAULT false,
    "pdf_file_path" VARCHAR(500),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "consignment_id" INTEGER NOT NULL,
    "gr_number" VARCHAR(20) NOT NULL,
    "gr_date" DATE NOT NULL,
    "vehicle_number" VARCHAR(20) NOT NULL,
    "from_location" VARCHAR(100) NOT NULL,
    "to_location" VARCHAR(100) NOT NULL,
    "contents" VARCHAR(500),
    "qty_in_mt" DECIMAL(10,3),
    "rate_mt" DECIMAL(10,2),
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "payment_number" VARCHAR(20) NOT NULL,
    "payment_date" DATE NOT NULL,
    "invoice_id" INTEGER,
    "party_id" INTEGER,
    "payment_mode" VARCHAR(50),
    "payment_reference" VARCHAR(100),
    "amount" DECIMAL(15,2) NOT NULL,
    "bank_name" VARCHAR(100),
    "bank_account_no" VARCHAR(50),
    "bank_ifsc" VARCHAR(15),
    "remarks" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_amendments" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER,
    "consignment_id" INTEGER,
    "amendment_type" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "payment_amendments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "table_name" VARCHAR(50) NOT NULL,
    "record_id" INTEGER NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "changed_by" INTEGER NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_history" (
    "id" SERIAL NOT NULL,
    "consignment_id" INTEGER NOT NULL,
    "from_status" VARCHAR(30),
    "to_status" VARCHAR(30) NOT NULL,
    "remarks" TEXT,
    "changed_by" INTEGER NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_summary" (
    "id" SERIAL NOT NULL,
    "summary_date" DATE NOT NULL,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_payments" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "pending_deliveries" INTEGER NOT NULL DEFAULT 0,
    "vehicles_deployed" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_code_key" ON "permissions"("permission_code");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "parties_party_code_key" ON "parties"("party_code");

-- CreateIndex
CREATE INDEX "parties_party_name_idx" ON "parties"("party_name");

-- CreateIndex
CREATE INDEX "parties_gstin_idx" ON "parties"("gstin");

-- CreateIndex
CREATE INDEX "parties_is_active_is_deleted_idx" ON "parties"("is_active", "is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicle_no_key" ON "vehicles"("vehicle_no");

-- CreateIndex
CREATE INDEX "vehicles_vehicle_no_idx" ON "vehicles"("vehicle_no");

-- CreateIndex
CREATE INDEX "vehicles_is_active_is_deleted_idx" ON "vehicles"("is_active", "is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "consignments_gr_number_key" ON "consignments"("gr_number");

-- CreateIndex
CREATE INDEX "consignments_gr_number_idx" ON "consignments"("gr_number");

-- CreateIndex
CREATE INDEX "consignments_gr_date_idx" ON "consignments"("gr_date");

-- CreateIndex
CREATE INDEX "consignments_status_idx" ON "consignments"("status");

-- CreateIndex
CREATE INDEX "consignments_consignor_id_idx" ON "consignments"("consignor_id");

-- CreateIndex
CREATE INDEX "consignments_vehicle_id_idx" ON "consignments"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_idx" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_invoice_date_idx" ON "invoices"("invoice_date");

-- CreateIndex
CREATE INDEX "invoices_party_id_idx" ON "invoices"("party_id");

-- CreateIndex
CREATE INDEX "invoices_payment_status_idx" ON "invoices"("payment_status");

-- CreateIndex
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_items_consignment_id_idx" ON "invoice_items"("consignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_number_key" ON "payments"("payment_number");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "payments_party_id_idx" ON "payments"("party_id");

-- CreateIndex
CREATE INDEX "payments_payment_date_idx" ON "payments"("payment_date");

-- CreateIndex
CREATE INDEX "audit_logs_table_name_record_id_idx" ON "audit_logs"("table_name", "record_id");

-- CreateIndex
CREATE INDEX "audit_logs_changed_by_idx" ON "audit_logs"("changed_by");

-- CreateIndex
CREATE INDEX "audit_logs_changed_at_idx" ON "audit_logs"("changed_at");

-- CreateIndex
CREATE INDEX "status_history_consignment_id_idx" ON "status_history"("consignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_summary_summary_date_key" ON "daily_summary"("summary_date");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignments" ADD CONSTRAINT "consignments_consignor_id_fkey" FOREIGN KEY ("consignor_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignments" ADD CONSTRAINT "consignments_consignee_id_fkey" FOREIGN KEY ("consignee_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignments" ADD CONSTRAINT "consignments_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignments" ADD CONSTRAINT "consignments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignments" ADD CONSTRAINT "consignments_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignments" ADD CONSTRAINT "consignments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_consignment_id_fkey" FOREIGN KEY ("consignment_id") REFERENCES "consignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_amendments" ADD CONSTRAINT "payment_amendments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_amendments" ADD CONSTRAINT "payment_amendments_consignment_id_fkey" FOREIGN KEY ("consignment_id") REFERENCES "consignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_amendments" ADD CONSTRAINT "payment_amendments_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_consignment_id_fkey" FOREIGN KEY ("consignment_id") REFERENCES "consignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
