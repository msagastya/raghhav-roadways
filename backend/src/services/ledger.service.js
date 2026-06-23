const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const firebaseStorage = require('./firebaseStorage.service');
const { COMPANY } = require('../config/constants');

let browserInstance = null;
const getBrowserInstance = async () => {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ],
    });
    const closeBrowser = async () => {
      if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
      }
    };
    process.on('exit', closeBrowser);
    process.on('SIGINT', closeBrowser);
    process.on('SIGTERM', closeBrowser);
  }
  return browserInstance;
};

const getPartyLedgerData = async (partyId, startDate, endDate) => {
  const party = await prisma.party.findUnique({
    where: { id: parseInt(partyId) }
  });

  if (!party || party.isDeleted) {
    throw new ApiError(404, 'Party not found');
  }

  // Build date filters
  const dateFilter = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  // Fetch all invoices for this party
  const invoices = await prisma.invoice.findMany({
    where: {
      partyName: party.partyName,
      isDeleted: false,
      ...(Object.keys(dateFilter).length > 0 && { invoiceDate: dateFilter })
    },
    select: {
      id: true,
      invoiceNumber: true,
      invoiceDate: true,
      totalAmount: true
    },
    orderBy: { invoiceDate: 'asc' }
  });

  // Fetch all payments for this party
  // We match payments by partyId
  const payments = await prisma.payment.findMany({
    where: {
      partyId: parseInt(partyId),
      isDeleted: false,
      ...(Object.keys(dateFilter).length > 0 && { paymentDate: dateFilter })
    },
    select: {
      id: true,
      paymentNumber: true,
      paymentDate: true,
      paymentMode: true,
      amount: true,
      referenceNo: true
    },
    orderBy: { paymentDate: 'asc' }
  });

  // Combine and sort by date
  let transactions = [];

  invoices.forEach(inv => {
    transactions.push({
      type: 'INVOICE',
      date: inv.invoiceDate,
      particulars: `Invoice ${inv.invoiceNumber}`,
      debit: Number(inv.totalAmount),
      credit: 0
    });
  });

  payments.forEach(pay => {
    transactions.push({
      type: 'PAYMENT',
      date: pay.paymentDate,
      particulars: `Payment Recd - ${pay.paymentMode} ${pay.referenceNo || ''}`,
      debit: 0,
      credit: Number(pay.amount)
    });
  });

  // Sort by date ascending
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate running balance
  let runningBalance = 0;
  let totalDebit = 0;
  let totalCredit = 0;

  transactions = transactions.map(t => {
    runningBalance += (t.debit - t.credit);
    totalDebit += t.debit;
    totalCredit += t.credit;
    return {
      ...t,
      date: new Date(t.date).toLocaleDateString('en-IN'),
      debitStr: t.debit > 0 ? `₹${t.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '',
      creditStr: t.credit > 0 ? `₹${t.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '',
      balanceStr: `₹${Math.abs(runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${runningBalance >= 0 ? 'Dr' : 'Cr'}`
    };
  });

  return {
    party,
    transactions,
    totals: {
      debit: `₹${totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      credit: `₹${totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      closingBalance: `₹${Math.abs(runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${runningBalance >= 0 ? 'Dr' : 'Cr'}`
    }
  };
};

const generateLedgerPDF = async (partyId, startDate, endDate) => {
  try {
    const data = await getPartyLedgerData(partyId, startDate, endDate);

    // Provide a default fallback HTML template for ledger
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Party Ledger - ${data.party.partyName}</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 11px; color: #333; margin: 0; padding: 20px; }
            h1 { text-align: center; font-size: 18px; color: #111; margin-bottom: 5px; }
            h2 { text-align: center; font-size: 14px; margin-bottom: 20px; font-weight: normal; }
            .party-info { margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background: #f9f9f9; border-radius: 5px; }
            .party-info p { margin: 3px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; border: 1px solid #ddd; }
            th { background-color: #f5f5f5; text-align: left; font-weight: bold; }
            .text-right { text-align: right; }
            .totals { font-weight: bold; background: #f9f9f9; }
        </style>
    </head>
    <body>
        <h1>${COMPANY.NAME}</h1>
        <h2>Party Ledger Statement</h2>
        <div class="party-info">
            <p><strong>Party Name:</strong> ${data.party.partyName}</p>
            <p><strong>GSTIN:</strong> ${data.party.gstin || 'N/A'}</p>
            <p><strong>Address:</strong> ${[data.party.addressLine1, data.party.city, data.party.state].filter(Boolean).join(', ')}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Particulars</th>
                    <th class="text-right">Debit (Dr)</th>
                    <th class="text-right">Credit (Cr)</th>
                    <th class="text-right">Balance</th>
                </tr>
            </thead>
            <tbody>
                ${data.transactions.map(t => `
                <tr>
                    <td>${t.date}</td>
                    <td>${t.particulars}</td>
                    <td class="text-right">${t.debitStr}</td>
                    <td class="text-right">${t.creditStr}</td>
                    <td class="text-right">${t.balanceStr}</td>
                </tr>
                `).join('')}
                <tr class="totals">
                    <td colspan="2" class="text-right"><strong>Totals</strong></td>
                    <td class="text-right">${data.totals.debit}</td>
                    <td class="text-right">${data.totals.credit}</td>
                    <td class="text-right">${data.totals.closingBalance}</td>
                </tr>
            </tbody>
        </table>
    </body>
    </html>
    `;

    const browser = await getBrowserInstance();
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      });

      const fileName = `Ledger_${data.party.partyName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
      const destinationPath = `ledger/${fileName}`;
      const uploadUrl = await firebaseStorage.uploadBuffer(pdfBuffer, destinationPath, 'application/pdf');

      logger.info(`Ledger PDF generated and uploaded: ${uploadUrl}`);
      return uploadUrl;
    } finally {
      await page.close();
    }
  } catch (error) {
    logger.error('Error generating ledger PDF:', error);
    throw error;
  }
};

module.exports = {
  getPartyLedgerData,
  generateLedgerPDF
};
