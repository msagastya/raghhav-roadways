const XLSX = require('xlsx');
const csv = require('csv-parser');
const { Readable } = require('stream');
const logger = require('../utils/logger');
const prisma = require('../config/database');

/**
 * Parse Excel file buffer
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Parse options
 * @returns {Array} Parsed data
 */
const parseExcel = (buffer, options = {}) => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = options.sheetName || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
      ...options
    });

    logger.info(`Parsed Excel file: ${data.length} rows from sheet "${sheetName}"`);
    return data;
  } catch (error) {
    logger.error(`Excel parse error: ${error.message}`);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

/**
 * Parse CSV file buffer
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<Array>} Parsed data
 */
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        logger.info(`Parsed CSV file: ${results.length} rows`);
        resolve(results);
      })
      .on('error', (error) => {
        logger.error(`CSV parse error: ${error.message}`);
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      });
  });
};

/**
 * Validate and transform party data for import
 */
const validatePartyData = (data) => {
  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const rowNum = index + 2; // Excel rows start at 1, header is row 1

    // Required fields
    if (!row['Party Name'] && !row['partyName']) {
      errors.push({ row: rowNum, error: 'Party Name is required' });
      return;
    }

    if (!row['Party Type'] && !row['partyType']) {
      errors.push({ row: rowNum, error: 'Party Type is required' });
      return;
    }

    const partyType = (row['Party Type'] || row['partyType']).toLowerCase();
    if (!['receivable', 'payable'].includes(partyType)) {
      errors.push({ row: rowNum, error: 'Party Type must be "receivable" or "payable"' });
      return;
    }

    // GSTIN validation (if provided)
    const gstin = row['GSTIN'] || row['gstin'];
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
      errors.push({ row: rowNum, error: 'Invalid GSTIN format' });
      return;
    }

    validData.push({
      partyName: row['Party Name'] || row['partyName'],
      partyType: partyType,
      gstin: gstin || null,
      pan: row['PAN'] || row['pan'] || null,
      addressLine1: row['Address Line 1'] || row['addressLine1'] || null,
      addressLine2: row['Address Line 2'] || row['addressLine2'] || null,
      city: row['City'] || row['city'] || null,
      state: row['State'] || row['state'] || null,
      pincode: row['Pincode'] || row['pincode'] || null,
      contactPerson: row['Contact Person'] || row['contactPerson'] || null,
      mobile: row['Mobile'] || row['mobile'] || null,
      email: row['Email'] || row['email'] || null,
      creditLimit: parseFloat(row['Credit Limit'] || row['creditLimit']) || 0,
      creditDays: parseInt(row['Credit Days'] || row['creditDays']) || 0,
      isReceivable: partyType === 'receivable',
      isPayable: partyType === 'payable'
    });
  });

  return { validData, errors };
};

/**
 * Validate and transform consignor/consignee data for import
 */
const validateConsignorConsigneeData = (data) => {
  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const rowNum = index + 2;

    if (!row['Name'] && !row['name']) {
      errors.push({ row: rowNum, error: 'Name is required' });
      return;
    }

    if (!row['City'] && !row['city']) {
      errors.push({ row: rowNum, error: 'City is required' });
      return;
    }

    if (!row['State'] && !row['state']) {
      errors.push({ row: rowNum, error: 'State is required' });
      return;
    }

    validData.push({
      name: row['Name'] || row['name'],
      address: row['Address'] || row['address'] || null,
      cityName: row['City'] || row['city'],
      stateName: row['State'] || row['state'],
      pincode: row['Pincode'] || row['pincode'] || null,
      gstin: row['GSTIN'] || row['gstin'] || null,
      contact: row['Contact'] || row['contact'] || null,
      remarks: row['Remarks'] || row['remarks'] || null
    });
  });

  return { validData, errors };
};

/**
 * Validate and transform vehicle data for import
 */
const validateVehicleData = (data) => {
  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const rowNum = index + 2;

    const vehicleNo = row['Vehicle No'] || row['vehicleNo'];
    if (!vehicleNo) {
      errors.push({ row: rowNum, error: 'Vehicle No is required' });
      return;
    }

    // Basic vehicle number validation
    if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/.test(vehicleNo.replace(/\s/g, '').toUpperCase())) {
      errors.push({ row: rowNum, error: `Invalid vehicle number format: ${vehicleNo}` });
      return;
    }

    const ownerType = (row['Owner Type'] || row['ownerType'] || 'private').toLowerCase();
    if (!['private', 'broker'].includes(ownerType)) {
      errors.push({ row: rowNum, error: 'Owner Type must be "private" or "broker"' });
      return;
    }

    validData.push({
      vehicleNo: vehicleNo.replace(/\s/g, '').toUpperCase(),
      vehicleType: row['Vehicle Type'] || row['vehicleType'] || null,
      vehicleCapacity: parseFloat(row['Capacity'] || row['vehicleCapacity']) || null,
      ownerType: ownerType,
      ownerName: row['Owner Name'] || row['ownerName'] || null,
      ownerMobile: row['Owner Mobile'] || row['ownerMobile'] || null,
      driverName: row['Driver Name'] || row['driverName'] || null,
      driverMobile: row['Driver Mobile'] || row['driverMobile'] || null,
      driverLicense: row['Driver License'] || row['driverLicense'] || null,
      rcExpiry: row['RC Expiry'] || row['rcExpiry'] ? new Date(row['RC Expiry'] || row['rcExpiry']) : null,
      insuranceExpiry: row['Insurance Expiry'] || row['insuranceExpiry'] ? new Date(row['Insurance Expiry'] || row['insuranceExpiry']) : null,
      fitnessExpiry: row['Fitness Expiry'] || row['fitnessExpiry'] ? new Date(row['Fitness Expiry'] || row['fitnessExpiry']) : null,
      pollutionExpiry: row['Pollution Expiry'] || row['pollutionExpiry'] ? new Date(row['Pollution Expiry'] || row['pollutionExpiry']) : null,
      notes: row['Notes'] || row['notes'] || null
    });
  });

  return { validData, errors };
};

/**
 * Import parties from parsed data
 */
const importParties = async (data, userId) => {
  const { validData, errors } = validatePartyData(data);

  if (validData.length === 0) {
    return { success: false, imported: 0, errors };
  }

  let imported = 0;
  const importErrors = [...errors];

  for (const party of validData) {
    try {
      // Generate party code
      const lastParty = await prisma.party.findFirst({
        orderBy: { id: 'desc' },
        select: { partyCode: true }
      });

      let nextCode = 1;
      if (lastParty && lastParty.partyCode) {
        const match = lastParty.partyCode.match(/P(\d+)/);
        if (match) nextCode = parseInt(match[1]) + 1;
      }

      const partyCode = `P${String(nextCode).padStart(5, '0')}`;

      await prisma.party.create({
        data: {
          ...party,
          partyCode,
          createdById: userId,
          updatedById: userId
        }
      });

      imported++;
    } catch (error) {
      importErrors.push({ party: party.partyName, error: error.message });
    }
  }

  logger.info(`Party import completed: ${imported} imported, ${importErrors.length} errors`);
  return { success: true, imported, errors: importErrors };
};

/**
 * Import consignor/consignees from parsed data
 */
const importConsignorConsignees = async (data, userId) => {
  const { validData, errors } = validateConsignorConsigneeData(data);

  if (validData.length === 0) {
    return { success: false, imported: 0, errors };
  }

  let imported = 0;
  const importErrors = [...errors];

  for (const item of validData) {
    try {
      // Find state
      const state = await prisma.state.findFirst({
        where: { stateName: { contains: item.stateName, mode: 'insensitive' } }
      });

      if (!state) {
        importErrors.push({ name: item.name, error: `State not found: ${item.stateName}` });
        continue;
      }

      // Find or create city
      let city = await prisma.city.findFirst({
        where: {
          cityName: { contains: item.cityName, mode: 'insensitive' },
          stateId: state.id
        }
      });

      if (!city) {
        city = await prisma.city.create({
          data: {
            cityName: item.cityName,
            stateId: state.id
          }
        });
      }

      await prisma.consignorConsignee.create({
        data: {
          name: item.name,
          address: item.address,
          cityId: city.id,
          stateId: state.id,
          pincode: item.pincode,
          gstin: item.gstin,
          contact: item.contact,
          remarks: item.remarks
        }
      });

      imported++;
    } catch (error) {
      importErrors.push({ name: item.name, error: error.message });
    }
  }

  logger.info(`Consignor/Consignee import completed: ${imported} imported, ${importErrors.length} errors`);
  return { success: true, imported, errors: importErrors };
};

/**
 * Import vehicles from parsed data
 */
const importVehicles = async (data, userId) => {
  const { validData, errors } = validateVehicleData(data);

  if (validData.length === 0) {
    return { success: false, imported: 0, errors };
  }

  let imported = 0;
  const importErrors = [...errors];

  for (const vehicle of validData) {
    try {
      // Check if vehicle already exists
      const existing = await prisma.vehicle.findUnique({
        where: { vehicleNo: vehicle.vehicleNo }
      });

      if (existing) {
        importErrors.push({ vehicleNo: vehicle.vehicleNo, error: 'Vehicle already exists' });
        continue;
      }

      await prisma.vehicle.create({
        data: {
          ...vehicle,
          createdById: userId,
          updatedById: userId
        }
      });

      imported++;
    } catch (error) {
      importErrors.push({ vehicleNo: vehicle.vehicleNo, error: error.message });
    }
  }

  logger.info(`Vehicle import completed: ${imported} imported, ${importErrors.length} errors`);
  return { success: true, imported, errors: importErrors };
};

/**
 * Get import template columns for download
 */
const getImportTemplate = (type) => {
  const templates = {
    parties: [
      'Party Name', 'Party Type', 'GSTIN', 'PAN', 'Address Line 1', 'Address Line 2',
      'City', 'State', 'Pincode', 'Contact Person', 'Mobile', 'Email',
      'Credit Limit', 'Credit Days'
    ],
    consignorConsignees: [
      'Name', 'Address', 'City', 'State', 'Pincode', 'GSTIN', 'Contact', 'Remarks'
    ],
    vehicles: [
      'Vehicle No', 'Vehicle Type', 'Capacity', 'Owner Type', 'Owner Name', 'Owner Mobile',
      'Driver Name', 'Driver Mobile', 'Driver License',
      'RC Expiry', 'Insurance Expiry', 'Fitness Expiry', 'Pollution Expiry', 'Notes'
    ]
  };

  return templates[type] || [];
};

/**
 * Generate empty import template
 */
const generateImportTemplate = (type) => {
  const columns = getImportTemplate(type);

  if (columns.length === 0) {
    throw new Error(`Unknown import type: ${type}`);
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([columns]);

  // Set column widths
  worksheet['!cols'] = columns.map(() => ({ wch: 20 }));

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Template');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  parseExcel,
  parseCSV,
  validatePartyData,
  validateConsignorConsigneeData,
  validateVehicleData,
  importParties,
  importConsignorConsignees,
  importVehicles,
  getImportTemplate,
  generateImportTemplate
};
