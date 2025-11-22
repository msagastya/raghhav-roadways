const XLSX = require('xlsx');
const logger = require('../utils/logger');

/**
 * Export data to Excel format
 * @param {Array} data - Array of objects to export
 * @param {Object} options - Export options
 * @param {string} options.sheetName - Name of the sheet
 * @param {Array} options.columns - Column configuration [{header: 'Name', key: 'name', width: 20}]
 * @param {string} options.fileName - File name without extension
 * @returns {Buffer} Excel file buffer
 */
const exportToExcel = (data, options = {}) => {
  try {
    const {
      sheetName = 'Sheet1',
      columns = null,
      fileName = 'export'
    } = options;

    // If columns are specified, transform data
    let exportData = data;
    let headers = [];

    if (columns && columns.length > 0) {
      headers = columns.map(col => col.header);
      exportData = data.map(item => {
        const row = {};
        columns.forEach(col => {
          let value = item[col.key];

          // Apply formatter if provided
          if (col.formatter && typeof col.formatter === 'function') {
            value = col.formatter(value, item);
          }

          // Handle nested properties
          if (col.key.includes('.')) {
            value = col.key.split('.').reduce((obj, key) => obj?.[key], item);
          }

          row[col.header] = value ?? '';
        });
        return row;
      });
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths if provided
    if (columns && columns.length > 0) {
      worksheet['!cols'] = columns.map(col => ({ wch: col.width || 15 }));
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    logger.info(`Excel export generated: ${fileName}.xlsx with ${data.length} rows`);
    return buffer;
  } catch (error) {
    logger.error(`Excel export failed: ${error.message}`);
    throw error;
  }
};

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Object} options - Export options
 * @returns {string} CSV string
 */
const exportToCSV = (data, options = {}) => {
  try {
    const { columns = null, fileName = 'export' } = options;

    let exportData = data;

    if (columns && columns.length > 0) {
      exportData = data.map(item => {
        const row = {};
        columns.forEach(col => {
          let value = item[col.key];

          if (col.formatter && typeof col.formatter === 'function') {
            value = col.formatter(value, item);
          }

          if (col.key.includes('.')) {
            value = col.key.split('.').reduce((obj, key) => obj?.[key], item);
          }

          row[col.header] = value ?? '';
        });
        return row;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    logger.info(`CSV export generated: ${fileName}.csv with ${data.length} rows`);
    return csv;
  } catch (error) {
    logger.error(`CSV export failed: ${error.message}`);
    throw error;
  }
};

// Pre-defined column configurations for common exports

const CONSIGNMENT_COLUMNS = [
  { header: 'GR Number', key: 'grNumber', width: 15 },
  { header: 'GR Date', key: 'grDate', width: 12, formatter: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Consignor', key: 'consignor.partyName', width: 25 },
  { header: 'Consignee', key: 'consignee.partyName', width: 25 },
  { header: 'From', key: 'fromLocation', width: 15 },
  { header: 'To', key: 'toLocation', width: 15 },
  { header: 'Vehicle No', key: 'vehicleNumber', width: 15 },
  { header: 'Packages', key: 'noOfPackages', width: 10 },
  { header: 'Weight (MT)', key: 'chargedWeight', width: 12 },
  { header: 'Freight Amount', key: 'freightAmount', width: 15, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'Total Amount', key: 'totalAmount', width: 15, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'Payment Mode', key: 'paymentMode', width: 12 },
  { header: 'E-Way Bill', key: 'ewayBillNo', width: 15 }
];

const INVOICE_COLUMNS = [
  { header: 'Invoice Number', key: 'invoiceNumber', width: 15 },
  { header: 'Invoice Date', key: 'invoiceDate', width: 12, formatter: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' },
  { header: 'Party Name', key: 'partyName', width: 30 },
  { header: 'Party GSTIN', key: 'partyGstin', width: 18 },
  { header: 'Subtotal', key: 'subtotal', width: 15, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'GR Charge', key: 'grCharge', width: 12, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'Total Amount', key: 'totalAmount', width: 15, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'Paid Amount', key: 'paidAmount', width: 15, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'Balance', key: 'balanceAmount', width: 15, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'Payment Status', key: 'paymentStatus', width: 15 },
  { header: 'Due Date', key: 'dueDate', width: 12, formatter: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' }
];

const PAYMENT_COLUMNS = [
  { header: 'Payment Number', key: 'paymentNumber', width: 15 },
  { header: 'Payment Date', key: 'paymentDate', width: 12, formatter: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' },
  { header: 'Invoice Number', key: 'invoice.invoiceNumber', width: 15 },
  { header: 'Party Name', key: 'party.partyName', width: 30 },
  { header: 'Total Amount', key: 'totalAmount', width: 15, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'Paid Amount', key: 'paidAmount', width: 15, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'Balance', key: 'balanceAmount', width: 15, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'Status', key: 'paymentStatus', width: 12 }
];

const PARTY_COLUMNS = [
  { header: 'Party Code', key: 'partyCode', width: 12 },
  { header: 'Party Name', key: 'partyName', width: 30 },
  { header: 'Party Type', key: 'partyType', width: 12 },
  { header: 'GSTIN', key: 'gstin', width: 18 },
  { header: 'PAN', key: 'pan', width: 12 },
  { header: 'Contact Person', key: 'contactPerson', width: 20 },
  { header: 'Mobile', key: 'mobile', width: 15 },
  { header: 'Email', key: 'email', width: 25 },
  { header: 'City', key: 'city', width: 15 },
  { header: 'State', key: 'state', width: 15 },
  { header: 'Credit Limit', key: 'creditLimit', width: 15, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'Credit Days', key: 'creditDays', width: 12 },
  { header: 'Status', key: 'isActive', width: 10, formatter: (v) => v ? 'Active' : 'Inactive' }
];

const VEHICLE_COLUMNS = [
  { header: 'Vehicle No', key: 'vehicleNo', width: 15 },
  { header: 'Vehicle Type', key: 'vehicleType', width: 15 },
  { header: 'Capacity', key: 'vehicleCapacity', width: 12 },
  { header: 'Owner Type', key: 'ownerType', width: 12 },
  { header: 'Owner Name', key: 'ownerName', width: 25 },
  { header: 'Owner Mobile', key: 'ownerMobile', width: 15 },
  { header: 'Driver Name', key: 'driverName', width: 20 },
  { header: 'Driver Mobile', key: 'driverMobile', width: 15 },
  { header: 'RC Expiry', key: 'rcExpiry', width: 12, formatter: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' },
  { header: 'Insurance Expiry', key: 'insuranceExpiry', width: 15, formatter: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' },
  { header: 'Fitness Expiry', key: 'fitnessExpiry', width: 15, formatter: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' },
  { header: 'Pollution Expiry', key: 'pollutionExpiry', width: 15, formatter: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' },
  { header: 'Status', key: 'isActive', width: 10, formatter: (v) => v ? 'Active' : 'Inactive' }
];

const DAILY_REPORT_COLUMNS = [
  { header: 'GR Number', key: 'grNumber', width: 15 },
  { header: 'Date', key: 'grDate', width: 12, formatter: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' },
  { header: 'Consignor', key: 'consignor.partyName', width: 25 },
  { header: 'Consignee', key: 'consignee.partyName', width: 25 },
  { header: 'From', key: 'fromLocation', width: 15 },
  { header: 'To', key: 'toLocation', width: 15 },
  { header: 'Vehicle', key: 'vehicleNumber', width: 15 },
  { header: 'Weight', key: 'chargedWeight', width: 12 },
  { header: 'Amount', key: 'totalAmount', width: 15, formatter: (v) => Number(v || 0).toFixed(2) },
  { header: 'Status', key: 'status', width: 12 }
];

module.exports = {
  exportToExcel,
  exportToCSV,
  CONSIGNMENT_COLUMNS,
  INVOICE_COLUMNS,
  PAYMENT_COLUMNS,
  PARTY_COLUMNS,
  VEHICLE_COLUMNS,
  DAILY_REPORT_COLUMNS
};
