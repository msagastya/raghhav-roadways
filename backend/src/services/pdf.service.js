const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const { buildFilePath } = require('../utils/helpers');
const { COMPANY } = require('../config/constants');

/**
 * Generate Consignment Note PDF
 */
const generateConsignmentNotePDF = async (consignment) => {
  try {
    // Read HTML template
    const templatePath = path.join(
      __dirname,
      '../templates/consignment-note.html'
    );
    const templateSource = await fs.readFile(templatePath, 'utf-8');

    // Compile template
    const template = handlebars.compile(templateSource);

    // Prepare data
    const data = {
      company: COMPANY,
      grNumber: consignment.grNumber,
      grDate: new Date(consignment.grDate).toLocaleDateString('en-IN'),
      consignmentNo: consignment.consignmentNo || '',
      consignor: {
        name: consignment.consignor.partyName,
        address: [
          consignment.consignor.addressLine1,
          consignment.consignor.addressLine2,
          consignment.consignor.city,
          consignment.consignor.state,
          consignment.consignor.pincode,
        ]
          .filter(Boolean)
          .join(', '),
        gstin: consignment.consignor.gstin || '',
        mobile: consignment.consignor.mobile || '',
      },
      consignee: {
        name: consignment.consignee.partyName,
        address: [
          consignment.consignee.addressLine1,
          consignment.consignee.addressLine2,
          consignment.consignee.city,
          consignment.consignee.state,
          consignment.consignee.pincode,
        ]
          .filter(Boolean)
          .join(', '),
        gstin: consignment.consignee.gstin || '',
        mobile: consignment.consignee.mobile || '',
      },
      fromLocation: consignment.fromLocation,
      toLocation: consignment.toLocation,
      issuingBranch: consignment.issuingBranch,
      deliveryOffice: consignment.deliveryOffice || '',
      vehicleNumber: consignment.vehicleNumber,
      vehicleType: consignment.vehicleType || '',
      noOfPackages: consignment.noOfPackages || '',
      description: consignment.description || '',
      actualWeight: consignment.actualWeight
        ? `${consignment.actualWeight} ${consignment.weightUnit}`
        : '',
      freightAmount: Number(consignment.freightAmount).toFixed(2),
      surcharge: Number(consignment.surcharge).toFixed(2),
      otherCharges: Number(consignment.otherCharges).toFixed(2),
      grCharge: Number(consignment.grCharge).toFixed(2),
      totalAmount: Number(consignment.totalAmount).toFixed(2),
      amountInWords: consignment.amountInWords,
      atRisk: consignment.atRisk || "Owner's Risk",
      paymentMode: consignment.paymentMode,
      rateType: consignment.rateType || '',
    };

    // Generate HTML
    const html = template(data);

    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    await browser.close();

    // Save PDF
    const fileName = `${consignment.grNumber}.pdf`;
    const filePath = buildFilePath('consignment', fileName);
    const fullPath = path.join(
      __dirname,
      '../../storage',
      filePath
    );

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, pdfBuffer);

    logger.info(`Consignment note PDF generated: ${filePath}`);

    return filePath;
  } catch (error) {
    logger.error('Error generating consignment note PDF:', error);
    throw error;
  }
};

/**
 * Generate Invoice PDF
 */
const generateInvoicePDF = async (invoice) => {
  try {
    // Read HTML template
    const templatePath = path.join(__dirname, '../templates/invoice.html');
    const templateSource = await fs.readFile(templatePath, 'utf-8');

    // Compile template
    const template = handlebars.compile(templateSource);

    // Prepare consignment items
    const consignments = invoice.items.map((item) => ({
      grNumber: item.grNumber,
      grDate: new Date(item.grDate).toLocaleDateString('en-IN'),
      vehicleNumber: item.vehicleNumber,
      fromLocation: item.fromLocation,
      toLocation: item.toLocation,
      contents: item.contents || '',
      qtyInMt: item.qtyInMt ? Number(item.qtyInMt).toFixed(3) : '',
      rateMt: item.rateMt ? Number(item.rateMt).toFixed(2) : '',
      amount: Number(item.amount).toFixed(2),
    }));

    // Determine watermark based on payment status
    let watermark = 'UNPAID';
    if (invoice.paymentStatus === 'Paid') {
      watermark = 'PAID';
    } else if (invoice.paymentStatus === 'Partial') {
      watermark = 'PARTIAL';
    }

    // Prepare data
    const data = {
      company: COMPANY,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('en-IN'),
      branch: invoice.branch || 'SURAT',
      party: {
        name: invoice.partyName,
        address: invoice.partyAddress || '',
        gstin: invoice.partyGstin || '',
      },
      consignments,
      grCharge: Number(invoice.grCharge).toFixed(2),
      totalAmount: Number(invoice.totalAmount).toFixed(2),
      amountInWords: invoice.amountInWords,
      watermark: watermark,
    };

    // Generate HTML
    const html = template(data);

    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    await browser.close();

    // Save PDF
    const fileName = `${invoice.invoiceNumber}.pdf`;
    const filePath = buildFilePath('invoice', fileName);
    const fullPath = path.join(__dirname, '../../storage', filePath);

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, pdfBuffer);

    logger.info(`Invoice PDF generated: ${filePath}`);

    return filePath;
  } catch (error) {
    logger.error('Error generating invoice PDF:', error);
    throw error;
  }
};

/**
 * Get PDF file
 */
const getPDFFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../storage', filePath);
    const fileBuffer = await fs.readFile(fullPath);
    return fileBuffer;
  } catch (error) {
    logger.error('Error reading PDF file:', error);
    throw new Error('PDF file not found');
  }
};

module.exports = {
  generateConsignmentNotePDF,
  generateInvoicePDF,
  getPDFFile,
};
