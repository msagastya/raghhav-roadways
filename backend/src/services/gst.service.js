const prisma = require('../config/database');
const { exportToExcel } = require('./export.service');
const logger = require('../utils/logger');

/**
 * Generate GSTR-1 report data (Outward Supplies)
 * For transport services, this includes invoices issued
 */
const generateGSTR1 = async (startDate, endDate) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        isDeleted: false
      },
      include: {
        party: true,
        items: {
          include: {
            consignment: true
          }
        }
      },
      orderBy: { invoiceDate: 'asc' }
    });

    // B2B Invoices (Business to Business - with GSTIN)
    const b2bInvoices = invoices.filter(inv => inv.partyGstin && inv.partyGstin.length === 15);

    // B2C Large Invoices (Business to Consumer - without GSTIN, amount > 2.5L)
    const b2cLarge = invoices.filter(inv =>
      (!inv.partyGstin || inv.partyGstin.length !== 15) &&
      Number(inv.totalAmount) > 250000
    );

    // B2C Small Invoices (Business to Consumer - without GSTIN, amount <= 2.5L)
    const b2cSmall = invoices.filter(inv =>
      (!inv.partyGstin || inv.partyGstin.length !== 15) &&
      Number(inv.totalAmount) <= 250000
    );

    // Format B2B data
    const b2bData = b2bInvoices.map(inv => ({
      'GSTIN/UIN of Recipient': inv.partyGstin,
      'Receiver Name': inv.partyName,
      'Invoice Number': inv.invoiceNumber,
      'Invoice Date': new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
      'Invoice Value': Number(inv.totalAmount).toFixed(2),
      'Place of Supply': extractStateFromGSTIN(inv.partyGstin),
      'Reverse Charge': 'N',
      'Invoice Type': 'Regular',
      'E-Commerce GSTIN': '',
      'Rate': '5', // SAC 996511 - Transport of goods by road
      'Taxable Value': Number(inv.subtotal).toFixed(2),
      'CGST Amount': (Number(inv.subtotal) * 0.025).toFixed(2),
      'SGST Amount': (Number(inv.subtotal) * 0.025).toFixed(2),
      'IGST Amount': '0.00',
      'Cess Amount': '0.00'
    }));

    // Format B2C Large data
    const b2cLargeData = b2cLarge.map(inv => ({
      'Invoice Number': inv.invoiceNumber,
      'Invoice Date': new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
      'Invoice Value': Number(inv.totalAmount).toFixed(2),
      'Place of Supply': inv.party?.state || 'Gujarat',
      'Rate': '5',
      'Taxable Value': Number(inv.subtotal).toFixed(2),
      'CGST Amount': (Number(inv.subtotal) * 0.025).toFixed(2),
      'SGST Amount': (Number(inv.subtotal) * 0.025).toFixed(2),
      'IGST Amount': '0.00',
      'E-Commerce GSTIN': ''
    }));

    // Summarize B2C Small by state and rate
    const b2cSmallSummary = b2cSmall.reduce((acc, inv) => {
      const state = inv.party?.state || 'Gujarat';
      const key = `${state}_5`;
      if (!acc[key]) {
        acc[key] = {
          'Place of Supply': state,
          'Rate': '5',
          'Taxable Value': 0,
          'CGST Amount': 0,
          'SGST Amount': 0,
          'IGST Amount': 0,
          'E-Commerce GSTIN': ''
        };
      }
      acc[key]['Taxable Value'] += Number(inv.subtotal);
      acc[key]['CGST Amount'] += Number(inv.subtotal) * 0.025;
      acc[key]['SGST Amount'] += Number(inv.subtotal) * 0.025;
      return acc;
    }, {});

    // Summary calculations
    const totalTaxableValue = invoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);
    const totalCGST = totalTaxableValue * 0.025;
    const totalSGST = totalTaxableValue * 0.025;
    const totalTax = totalCGST + totalSGST;

    return {
      period: { startDate, endDate },
      summary: {
        totalInvoices: invoices.length,
        b2bCount: b2bInvoices.length,
        b2cLargeCount: b2cLarge.length,
        b2cSmallCount: b2cSmall.length,
        totalTaxableValue: totalTaxableValue.toFixed(2),
        totalCGST: totalCGST.toFixed(2),
        totalSGST: totalSGST.toFixed(2),
        totalIGST: '0.00',
        totalTax: totalTax.toFixed(2)
      },
      b2b: b2bData,
      b2cLarge: b2cLargeData,
      b2cSmall: Object.values(b2cSmallSummary).map(item => ({
        ...item,
        'Taxable Value': item['Taxable Value'].toFixed(2),
        'CGST Amount': item['CGST Amount'].toFixed(2),
        'SGST Amount': item['SGST Amount'].toFixed(2),
        'IGST Amount': item['IGST Amount'].toFixed(2)
      }))
    };
  } catch (error) {
    logger.error(`GSTR-1 generation failed: ${error.message}`);
    throw error;
  }
};

/**
 * Generate GSTR-3B summary
 */
const generateGSTR3B = async (startDate, endDate) => {
  try {
    const gstr1Data = await generateGSTR1(startDate, endDate);

    return {
      period: { startDate, endDate },
      section31: {
        description: 'Outward taxable supplies (other than zero rated, nil rated and exempted)',
        totalTaxableValue: gstr1Data.summary.totalTaxableValue,
        integratedTax: '0.00',
        centralTax: gstr1Data.summary.totalCGST,
        stateTax: gstr1Data.summary.totalSGST,
        cess: '0.00'
      },
      section32: {
        description: 'Outward taxable supplies (zero rated)',
        totalTaxableValue: '0.00',
        integratedTax: '0.00'
      },
      section33: {
        description: 'Other outward supplies (nil rated, exempted)',
        totalTaxableValue: '0.00'
      },
      section34: {
        description: 'Inward supplies (liable to reverse charge)',
        totalTaxableValue: '0.00',
        integratedTax: '0.00',
        centralTax: '0.00',
        stateTax: '0.00',
        cess: '0.00'
      },
      section35: {
        description: 'Non-GST outward supplies',
        totalValue: '0.00'
      },
      taxLiability: {
        centralTax: gstr1Data.summary.totalCGST,
        stateTax: gstr1Data.summary.totalSGST,
        integratedTax: '0.00',
        cess: '0.00',
        total: gstr1Data.summary.totalTax
      }
    };
  } catch (error) {
    logger.error(`GSTR-3B generation failed: ${error.message}`);
    throw error;
  }
};

/**
 * Generate HSN Summary
 * SAC Code for Road Transport: 996511
 */
const generateHSNSummary = async (startDate, endDate) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        isDeleted: false
      }
    });

    const totalTaxableValue = invoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);
    const totalCGST = totalTaxableValue * 0.025;
    const totalSGST = totalTaxableValue * 0.025;

    return [{
      'HSN/SAC': '996511',
      'Description': 'Road transport services of goods including letters, parcels, live animals, household & office furniture, containers etc.',
      'UQC': 'NA',
      'Total Quantity': invoices.length,
      'Total Value': (totalTaxableValue + totalCGST + totalSGST).toFixed(2),
      'Taxable Value': totalTaxableValue.toFixed(2),
      'CGST': totalCGST.toFixed(2),
      'SGST': totalSGST.toFixed(2),
      'IGST': '0.00',
      'Cess': '0.00'
    }];
  } catch (error) {
    logger.error(`HSN Summary generation failed: ${error.message}`);
    throw error;
  }
};

/**
 * Export GSTR-1 to Excel
 */
const exportGSTR1ToExcel = async (startDate, endDate) => {
  const data = await generateGSTR1(startDate, endDate);

  const XLSX = require('xlsx');
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['GSTR-1 Summary Report'],
    ['Period:', `${startDate} to ${endDate}`],
    [''],
    ['Metric', 'Value'],
    ['Total Invoices', data.summary.totalInvoices],
    ['B2B Invoices', data.summary.b2bCount],
    ['B2C Large Invoices', data.summary.b2cLargeCount],
    ['B2C Small Invoices', data.summary.b2cSmallCount],
    ['Total Taxable Value', data.summary.totalTaxableValue],
    ['Total CGST', data.summary.totalCGST],
    ['Total SGST', data.summary.totalSGST],
    ['Total IGST', data.summary.totalIGST],
    ['Total Tax', data.summary.totalTax]
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // B2B sheet
  if (data.b2b.length > 0) {
    const b2bSheet = XLSX.utils.json_to_sheet(data.b2b);
    XLSX.utils.book_append_sheet(workbook, b2bSheet, 'B2B');
  }

  // B2C Large sheet
  if (data.b2cLarge.length > 0) {
    const b2cLargeSheet = XLSX.utils.json_to_sheet(data.b2cLarge);
    XLSX.utils.book_append_sheet(workbook, b2cLargeSheet, 'B2C Large');
  }

  // B2C Small sheet
  if (data.b2cSmall.length > 0) {
    const b2cSmallSheet = XLSX.utils.json_to_sheet(data.b2cSmall);
    XLSX.utils.book_append_sheet(workbook, b2cSmallSheet, 'B2C Small');
  }

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Extract state code from GSTIN
 */
function extractStateFromGSTIN(gstin) {
  if (!gstin || gstin.length < 2) return 'Unknown';

  const stateCodes = {
    '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
    '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
    '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
    '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
    '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
    '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
    '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
    '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
    '25': 'Daman & Diu', '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra',
    '28': 'Andhra Pradesh (Old)', '29': 'Karnataka', '30': 'Goa',
    '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
    '34': 'Puducherry', '35': 'Andaman & Nicobar', '36': 'Telangana',
    '37': 'Andhra Pradesh', '38': 'Ladakh'
  };

  const stateCode = gstin.substring(0, 2);
  return stateCodes[stateCode] || 'Unknown';
}

module.exports = {
  generateGSTR1,
  generateGSTR3B,
  generateHSNSummary,
  exportGSTR1ToExcel,
  extractStateFromGSTIN
};
