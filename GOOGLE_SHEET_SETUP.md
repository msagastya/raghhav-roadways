# Google Sheets Database Setup Guide

Follow these steps to set up your Google Sheet as the database for Raghhav Roadways.

---

### Step 1: Create a Google Sheet
1. Create a new Google Sheet named **Raghhav Roadways Database**.
2. Keep the Sheet ID handy. The Sheet ID is the long string in your spreadsheet's URL:
   `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`

---

### Step 2: Open Google Apps Script
1. Inside your Google Sheet, click **Extensions** → **Apps Script**.
2. Delete any code in the editor and paste the complete sync engine code below:

```javascript
const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// Automatic schema definitions for all database tables
const SCHEMAS = {
  users: ['id', 'username', 'email', 'password_hash', 'full_name', 'mobile', 'role_id', 'is_active', 'approval_status', 'last_login', 'created_at', 'updated_at'],
  roles: ['id', 'role_name', 'description', 'created_at'],
  permissions: ['id', 'permission_code', 'module', 'action', 'description'],
  role_permissions: ['id', 'role_id', 'permission_id'],
  parties: ['id', 'party_code', 'party_name', 'party_type', 'gstin', 'pan', 'address_line1', 'address_line2', 'city', 'state', 'pincode', 'country', 'contact_person', 'mobile', 'email', 'bank_name', 'bank_account_no', 'bank_ifsc', 'bank_branch', 'credit_limit', 'credit_days', 'is_vehicle_owner', 'is_broker', 'is_receivable', 'is_payable', 'is_active', 'is_deleted', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  vehicles: ['id', 'vehicle_no', 'vehicle_type', 'vehicle_capacity', 'owner_type', 'owner_name', 'owner_mobile', 'owner_address', 'broker_id', 'rc_number', 'rc_expiry', 'insurance_number', 'insurance_expiry', 'fitness_expiry', 'pollution_expiry', 'driver_name', 'driver_mobile', 'driver_license', 'is_active', 'is_deleted', 'notes', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  consignments: ['id', 'gr_number', 'gr_date', 'consignment_no', 'consignor_id', 'consignee_id', 'from_location', 'to_location', 'issuing_branch', 'delivery_office', 'vehicle_id', 'vehicle_number', 'vehicle_size', 'no_of_packages', 'description', 'vehicle_type', 'actual_weight', 'charged_weight', 'weight_unit', 'shipment_value', 'freight_amount', 'surcharge', 'other_charges', 'gr_charge', 'total_amount', 'amount_in_words', 'rate_type', 'rate_calculation_text', 'at_risk', 'payment_mode', 'status', 'booked_at', 'loaded_at', 'in_transit_at', 'delivered_at', 'settled_at', 'challan_uploaded', 'challan_file_path', 'eway_bill_no', 'eway_bill_from_date', 'eway_bill_valid_upto', 'eway_bill_file_path', 'policy_no', 'policy_amount', 'pod_uploaded', 'pod_file_path', 'is_invoiced', 'invoice_id', 'notes', 'is_deleted', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  invoices: ['id', 'invoice_number', 'invoice_date', 'branch', 'party_id', 'party_name', 'party_address', 'party_gstin', 'subtotal', 'gr_charge', 'total_amount', 'amount_in_words', 'paid_amount', 'balance_amount', 'payment_status', 'due_date', 'pdf_generated', 'pdf_file_path', 'is_deleted', 'created_at', 'updated_at', 'created_by', 'updated_by'],
  invoice_items: ['id', 'invoice_id', 'consignment_id', 'gr_number', 'gr_date', 'vehicle_number', 'from_location', 'to_location', 'contents', 'qty_in_mt', 'rate_mt', 'amount', 'created_at'],
  payments: ['id', 'payment_number', 'payment_date', 'invoice_id', 'party_id', 'description', 'total_amount', 'paid_amount', 'balance_amount', 'payment_status', 'is_deleted', 'created_at', 'updated_at', 'created_by'],
  payment_transactions: ['id', 'payment_id', 'transaction_date', 'amount', 'payment_mode', 'payment_reference', 'bank_name', 'bank_account_no', 'bank_ifsc', 'upi_id', 'receipt_file_path', 'remarks', 'created_at', 'created_by'],
  payment_amendments: ['id', 'invoice_id', 'consignment_id', 'amendment_type', 'amount', 'reason', 'approved_by', 'approved_at', 'created_at', 'created_by'],
  audit_logs: ['id', 'table_name', 'record_id', 'action', 'old_values', 'new_values', 'changed_by', 'changed_at', 'ip_address', 'user_agent'],
  status_history: ['id', 'consignment_id', 'from_status', 'to_status', 'remarks', 'changed_by', 'changed_at'],
  daily_summary: ['id', 'summary_date', 'total_bookings', 'total_amount', 'total_payments', 'pending_deliveries', 'vehicles_deployed', 'created_at'],
  states: ['id', 'state_name', 'state_code', 'is_active', 'created_at'],
  cities: ['id', 'city_name', 'state_id', 'is_active', 'created_at'],
  consignor_consignees: ['id', 'name', 'address', 'city_id', 'state_id', 'pincode', 'gstin', 'contact', 'remarks', 'is_active', 'is_deleted', 'created_at', 'updated_at'],
  invoice_parties: ['id', 'name', 'address', 'city_id', 'state_id', 'pincode', 'gstin', 'contact', 'remarks', 'is_active', 'is_deleted', 'created_at', 'updated_at'],
  vehicle_owner_brokers: ['id', 'name', 'type', 'address', 'city_id', 'state_id', 'pincode', 'contact', 'remarks', 'is_active', 'is_deleted', 'created_at', 'updated_at'],
  owner_vehicles: ['id', 'owner_id', 'vehicle_no', 'vehicle_size', 'vehicle_type', 'no_of_trips', 'remarks', 'is_active', 'created_at', 'updated_at'],
  agents: ['id', 'agent_code', 'email', 'password_hash', 'full_name', 'mobile', 'address', 'city_id', 'state_id', 'pincode', 'profile_photo', 'is_active', 'approval_status', 'last_login', 'created_at', 'updated_at'],
  agent_vehicles: ['id', 'agent_id', 'vehicle_no', 'vehicle_type', 'vehicle_capacity', 'rc_number', 'rc_expiry', 'rc_file_path', 'insurance_number', 'insurance_expiry', 'insurance_file_path', 'fitness_expiry', 'fitness_file_path', 'pollution_expiry', 'pollution_file_path', 'vehicle_photo', 'driver_name', 'driver_mobile', 'driver_license', 'is_verified', 'is_active', 'notes', 'created_at', 'updated_at'],
  agent_availability: ['id', 'agent_id', 'vehicle_id', 'date', 'is_available', 'start_time', 'end_time', 'preferred_routes', 'notes', 'created_at', 'updated_at']
};

/**
 * Get or create worksheet with header schema
 */
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = SCHEMAS[sheetName];
    if (headers) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }
  }
  return sheet;
}

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const sheetName = request.sheet;
    const data = request.data;
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = getOrCreateSheet(ss, sheetName);
    
    let result = null;
    
    if (action === "readAll") {
      result = readAllRows(sheet);
    } else if (action === "insert") {
      result = insertRow(sheet, data, sheetName);
    } else if (action === "update") {
      result = updateRow(sheet, request.idKey, request.idValue, data);
    } else if (action === "delete") {
      result = deleteRow(sheet, request.idKey, request.idValue);
    } else {
      throw new Error("Unknown action: " + action);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Raghhav Roadways Apps Script DB Engine is running. Send POST requests for database queries.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function readAllRows(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0];
  const rows = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    rows.push(row);
  }
  return rows;
}

function insertRow(sheet, data, sheetName) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Auto increment ID if not provided
  if (!data.id) {
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      data.id = 1;
    } else {
      const ids = values.slice(1).map(r => parseInt(r[0])).filter(id => !isNaN(id));
      data.id = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }
  }
  
  const newRow = headers.map(h => data[h] !== undefined ? data[h] : "");
  sheet.appendRow(newRow);
  return data;
}

function updateRow(sheet, idKey, idValue, data) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf(idKey);
  
  if (idIndex === -1) throw new Error("ID Key not found in headers: " + idKey);
  
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(idValue)) {
      for (const key in data) {
        const colIndex = headers.indexOf(key);
        if (colIndex !== -1) {
          sheet.getRange(i + 1, colIndex + 1).setValue(data[key]);
        }
      }
      return { success: true };
    }
  }
  throw new Error("Record not found for ID: " + idValue);
}

function deleteRow(sheet, idKey, idValue) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf(idKey);
  
  if (idIndex === -1) throw new Error("ID Key not found in headers: " + idKey);
  
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(idValue)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  throw new Error("Record not found for ID: " + idValue);
}
```

3. Click the **Save** (disk icon) button.

---

### Step 3: Deploy as Web App
1. Click the **Deploy** button at the top right → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in details:
   * **Description**: `Raghhav Roadways Database API`
   * **Execute as**: `Me (your-email@gmail.com)`
   * **Who has access**: `Anyone` *(This allows the backend server to make POST requests without complex OAuth)*
4. Click **Deploy**.
5. Copy the **Web App URL** (ends with `/exec`).

---

### Step 4: Import CSV Data (Optional, but highly recommended)
To load your existing data, import the CSV files generated in your project directory (`users.csv`, `roles.csv`, `permissions.csv`, `role_permissions.csv`, `parties.csv`, `vehicles.csv`):
1. In Google Sheets, click **File** → **Import**.
2. Upload the CSV file.
3. Select **Replace current sheet** or **Insert new sheet(s)**. Ensure the worksheet name matches the CSV filename exactly (e.g. `users`, `parties`).
4. Ensure the first row of each sheet has headers matching the exact CSV headers!

---

### Step 5: Configure Environment Variable
Add the copied Web App URL to your environment variables on Render (or local `.env` file):
```env
GOOGLE_SHEET_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYED_URL_KEY/exec
```
