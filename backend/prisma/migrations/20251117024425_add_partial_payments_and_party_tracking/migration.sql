/*
  Warnings:

  - You are about to drop the column `amount` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `bank_account_no` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `bank_ifsc` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_mode` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_reference` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `payments` table. All the data in the column will be lost.
  - Added the required column `balance_amount` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parties" ADD COLUMN     "is_broker" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_payable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_receivable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_vehicle_owner" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "amount",
DROP COLUMN "bank_account_no",
DROP COLUMN "bank_ifsc",
DROP COLUMN "bank_name",
DROP COLUMN "payment_mode",
DROP COLUMN "payment_reference",
DROP COLUMN "remarks",
ADD COLUMN     "balance_amount" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "payment_status" VARCHAR(20) NOT NULL DEFAULT 'Pending',
ADD COLUMN     "total_amount" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" SERIAL NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "transaction_date" DATE NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "payment_mode" VARCHAR(50),
    "payment_reference" VARCHAR(100),
    "bank_name" VARCHAR(100),
    "bank_account_no" VARCHAR(50),
    "bank_ifsc" VARCHAR(15),
    "upi_id" VARCHAR(100),
    "receipt_file_path" VARCHAR(500),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_transactions_payment_id_idx" ON "payment_transactions"("payment_id");

-- CreateIndex
CREATE INDEX "payment_transactions_transaction_date_idx" ON "payment_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "payments_payment_status_idx" ON "payments"("payment_status");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
