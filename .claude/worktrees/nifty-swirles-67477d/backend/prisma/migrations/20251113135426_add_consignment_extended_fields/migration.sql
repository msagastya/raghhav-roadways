-- AlterTable
ALTER TABLE "consignments" ADD COLUMN     "charged_weight" DECIMAL(10,3),
ADD COLUMN     "eway_bill_file_path" VARCHAR(500),
ADD COLUMN     "eway_bill_from_date" DATE,
ADD COLUMN     "eway_bill_no" VARCHAR(20),
ADD COLUMN     "eway_bill_valid_upto" DATE,
ADD COLUMN     "policy_amount" DECIMAL(15,2),
ADD COLUMN     "policy_no" VARCHAR(50),
ADD COLUMN     "shipment_value" DECIMAL(15,2),
ADD COLUMN     "vehicle_size" VARCHAR(50);
