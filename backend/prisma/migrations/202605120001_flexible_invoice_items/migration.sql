ALTER TABLE "invoice_items" ALTER COLUMN "consignment_id" DROP NOT NULL;
ALTER TABLE "invoice_items" ALTER COLUMN "gr_number" DROP NOT NULL;
ALTER TABLE "invoice_items" ALTER COLUMN "vehicle_number" DROP NOT NULL;
ALTER TABLE "invoice_items" ALTER COLUMN "from_location" DROP NOT NULL;
ALTER TABLE "invoice_items" ALTER COLUMN "to_location" DROP NOT NULL;
ALTER TABLE "invoice_items" ALTER COLUMN "qty_in_mt" TYPE VARCHAR(50) USING "qty_in_mt"::text;
ALTER TABLE "invoice_items" ALTER COLUMN "rate_mt" TYPE VARCHAR(50) USING "rate_mt"::text;
