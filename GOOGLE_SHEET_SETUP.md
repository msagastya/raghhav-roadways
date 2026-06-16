# Google Sheets Database Setup Guide

Follow these steps to set up your Google Sheet as the database for Raghhav Roadways.

---

### Step 1: Create a Google Sheet
1. Create a new Google Sheet named **Raghhav Roadways Database**.
2. Create worksheets inside the Google Sheet for the following tables (by clicking the `+` icon at the bottom left):
   * **users**
   * **parties**
   * **vehicles**
   * **consignments**
   * **invoices**
   * **payments**

3. In each worksheet, add the header row (row 1) with the following exact column names:
   * **users**: `id`, `username`, `email`, `passwordHash`, `fullName`, `mobile`, `roleId`, `isActive`, `approvalStatus`
   * **parties**: `id`, `partyCode`, `partyName`, `partyType`, `gstin`, `pan`, `city`, `state`, `isActive`
   * **vehicles**: `id`, `vehicleNo`, `vehicleType`, `ownerType`, `ownerName`, `driverName`, `driverMobile`, `isActive`
   * **consignments**: `id`, `grNumber`, `grDate`, `consignorId`, `consigneeId`, `fromLocation`, `toLocation`, `vehicleNumber`, `freightAmount`, `totalAmount`, `status`
   * **invoices**: `id`, `invoiceNo`, `invoiceDate`, `partyId`, `totalAmount`, `status`
   * **payments**: `id`, `receiptNo`, `paymentDate`, `partyId`, `amount`, `paymentMode`

4. Add a default admin user in the **users** sheet (Row 2):
   * `id`: `1`
   * `username`: `admin1`
   * `email`: `admin@raghhav.local`
   * `passwordHash`: `$2a$10$W2o9l3F0Kwq5L4zQO5tJxe9d7b4M1oO2v6sVd8gY9qXwZ2pA1h2sW` *(which is the hash for `admin123`)*
   * `fullName`: `Admin User`
   * `mobile`: `1234567890`
   * `roleId`: `1`
   * `isActive`: `TRUE`
   * `approvalStatus`: `approved`

---

### Step 2: Open Google Apps Script
1. Inside your Google Sheet, click **Extensions** → **Apps Script**.
2. Delete any code in the editor and paste the code below:

```javascript
const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const sheetName = request.sheet;
    const data = request.data;
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Sheet not found: " + sheetName })).setMimeType(ContentService.MimeType.JSON);
    }
    
    let result = null;
    
    if (action === "readAll") {
      result = readAllRows(sheet);
    } else if (action === "insert") {
      result = insertRow(sheet, data);
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

function insertRow(sheet, data) {
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

3. Click the **Save** icon.

---

### Step 3: Deploy as Web App
1. Click the **Deploy** button at the top right → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in details:
   * **Description**: `Raghhav Roadways Database API`
   * **Execute as**: `Me (your-email@gmail.com)`
   * **Who has access**: `Anyone` *(Crucial so that your Render server can query it without OAuth authentication)*
4. Click **Deploy**.
5. Copy the **Web App URL** (it ends with `/exec`).

---

### Step 4: Configure Backend
Add the Web App URL to your backend's environment variable:
```
GOOGLE_SHEET_API_URL=https://script.google.com/macros/s/.../exec
```
