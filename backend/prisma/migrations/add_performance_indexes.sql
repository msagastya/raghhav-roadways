-- Performance Indexes for Raghhav Roadways Database

-- Consignments Table Indexes
CREATE INDEX IF NOT EXISTS idx_consignments_gr_number ON consignments(gr_number);
CREATE INDEX IF NOT EXISTS idx_consignments_status ON consignments(status);
CREATE INDEX IF NOT EXISTS idx_consignments_gr_date ON consignments(gr_date DESC);
CREATE INDEX IF NOT EXISTS idx_consignments_consignor_id ON consignments(consignor_id);
CREATE INDEX IF NOT EXISTS idx_consignments_consignee_id ON consignments(consignee_id);
CREATE INDEX IF NOT EXISTS idx_consignments_vehicle_id ON consignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_consignments_is_invoiced ON consignments(is_invoiced);
CREATE INDEX IF NOT EXISTS idx_consignments_is_deleted ON consignments(is_deleted);

-- Invoices Table Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_party_id ON invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_is_deleted ON invoices(is_deleted);

-- Payments Table Indexes
CREATE INDEX IF NOT EXISTS idx_payments_payment_number ON payments(payment_number);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_party_id ON payments(party_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Parties Table Indexes
CREATE INDEX IF NOT EXISTS idx_parties_party_code ON parties(party_code);
CREATE INDEX IF NOT EXISTS idx_parties_party_name ON parties(party_name);
CREATE INDEX IF NOT EXISTS idx_parties_party_type ON parties(party_type);
CREATE INDEX IF NOT EXISTS idx_parties_is_active ON parties(is_active);
CREATE INDEX IF NOT EXISTS idx_parties_is_deleted ON parties(is_deleted);

-- Vehicles Table Indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_no ON vehicles(vehicle_no);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles(is_active);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_deleted ON vehicles(is_deleted);
CREATE INDEX IF NOT EXISTS idx_vehicles_rc_expiry ON vehicles(rc_expiry);
CREATE INDEX IF NOT EXISTS idx_vehicles_insurance_expiry ON vehicles(insurance_expiry);

-- Users Table Indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);

-- Audit Logs Table Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Status History Table Indexes
CREATE INDEX IF NOT EXISTS idx_status_history_consignment_id ON status_history(consignment_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON status_history(changed_at DESC);

-- Payment Transactions Table Indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON payment_transactions(transaction_date DESC);

-- Composite Indexes for Common Queries
CREATE INDEX IF NOT EXISTS idx_consignments_status_date ON consignments(status, gr_date DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_invoices_party_status ON invoices(party_id, payment_status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_consignments_invoicing ON consignments(consignor_id, is_invoiced, is_deleted);
