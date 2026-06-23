const xlsx = require('xlsx');
const prisma = require('../config/database');
const { generateCode } = require('../utils/helpers');
const { PAYMENT_STATUS } = require('../config/constants');
const { convertAmountToWords } = require('./numberToWords.service');

function excelDateToJSDate(serial) {
  if (!serial) return null;
  // Excel dates are number of days since 1899-12-30
  if (!isNaN(Number(serial))) {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
  }
  
  // If it's already a date string (e.g. DD-MM-YYYY)
  if (typeof serial === 'string') {
    const parts = serial.split('-');
    if (parts.length === 3) {
      if (parts[2].length === 4) { // DD-MM-YYYY
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`);
      }
    }
    return new Date(serial);
  }
  return null;
}

const syncExcel = async (filePath, userId) => {
  // Read workbook
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const sheetNames = workbook.SheetNames;
  
  if (sheetNames.length < 2) {
    throw new Error('Excel file must contain at least two sheets: Bills and Orders');
  }

  // Parse Sheet 1 (Bills)
  const billsSheet = workbook.Sheets[sheetNames[0]];
  const billsData = xlsx.utils.sheet_to_json(billsSheet, { header: "A", defval: "" });

  // Parse Sheet 2 (Orders)
  const ordersSheet = workbook.Sheets[sheetNames[1]];
  const ordersData = xlsx.utils.sheet_to_json(ordersSheet, { header: "A", defval: "" });

  const billsMap = new Map();

  // Process Bills
  for (let i = 1; i < billsData.length; i++) {
    const row = billsData[i];
    if (!row.A) continue;
    
    const billNo = String(row.A).trim();
    billsMap.set(billNo, {
      billNo: billNo,
      billDate: excelDateToJSDate(row.B) || new Date(),
      partyName: String(row.C).trim(),
      partyAddress: String(row.D).trim(),
      partyGst: String(row.E).trim(),
      rows: []
    });
  }

  // Process Orders
  for (let i = 1; i < ordersData.length; i++) {
    const row = ordersData[i];
    if (!row.A) continue;

    const billNo = String(row.A).trim();
    if (billsMap.has(billNo)) {
      billsMap.get(billNo).rows.push({
        grNumber: String(row.B || ''),
        orderDate: excelDateToJSDate(row.C) || new Date(),
        vehicleNumber: String(row.D || ''),
        fromLocation: String(row.E || ''),
        toLocation: String(row.F || ''),
        contents: String(row.G || ''),
        qty: String(row.H || 'FT L'),
        rate: String(row.I || 'FIXED'),
        amount: Number(row.J) || 0,
        extraCharges: Number(row.L) || 0,
        grCharge: Number(row.M) || 0
      });
    }
  }

  let importedCount = 0;
  let partyCount = 0;

  // Execute in transactions but sequentially to avoid deadlocks
  for (const [billNo, bill] of billsMap.entries()) {
    if (!bill.partyName || bill.partyName.toUpperCase().includes('UNKNOWN')) {
      continue;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Find or create party
      let party = await tx.party.findFirst({
        where: { partyName: bill.partyName, isDeleted: false }
      });

      if (!party) {
        // Create party
        const lastParty = await tx.party.findFirst({ orderBy: { partyCode: 'desc' } });
        const lastNumber = lastParty ? parseInt(lastParty.partyCode.replace('PARTY', '')) : 0;
        const partyCode = generateCode('PARTY', lastNumber, 3);
        
        party = await tx.party.create({
          data: {
            partyCode,
            partyName: bill.partyName,
            addressLine1: bill.partyAddress,
            gstin: bill.partyGst,
            partyType: 'CUSTOMER',
            createdById: userId,
            updatedById: userId
          }
        });
        partyCount++;
      }

      // 2. Check if invoice exists
      let invoice = await tx.invoice.findFirst({
        where: { invoiceNumber: bill.billNo, isDeleted: false }
      });

      // Calculate totals
      let subtotal = 0;
      let extraTotal = 0;
      let totalGrCharge = 0;

      for (const r of bill.rows) {
        subtotal += r.amount;
        extraTotal += r.extraCharges;
        totalGrCharge += r.grCharge;
      }
      
      const combinedSubtotal = subtotal + extraTotal;
      const totalAmount = combinedSubtotal + totalGrCharge;

      if (invoice) {
        // Update existing invoice
        await tx.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
        invoice = await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            partyId: party.id,
            partyName: party.partyName,
            invoiceDate: bill.billDate,
            subtotal: combinedSubtotal,
            grCharge: totalGrCharge,
            totalAmount: totalAmount,
            balanceAmount: totalAmount,
            amountInWords: convertAmountToWords(totalAmount),
            updatedById: userId
          }
        });
      } else {
        // Create new invoice
        invoice = await tx.invoice.create({
          data: {
            invoiceNumber: bill.billNo,
            invoiceDate: bill.billDate,
            branch: 'Surat',
            partyId: party.id,
            partyName: party.partyName,
            partyAddress: party.addressLine1,
            partyGstin: party.gstin,
            subtotal: combinedSubtotal,
            grCharge: totalGrCharge,
            totalAmount: totalAmount,
            balanceAmount: totalAmount,
            amountInWords: convertAmountToWords(totalAmount),
            paymentStatus: PAYMENT_STATUS.PENDING,
            createdById: userId,
            updatedById: userId
          }
        });
      }

      // 3. Create items
      for (const row of bill.rows) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            grNumber: row.grNumber,
            grDate: row.orderDate,
            vehicleNumber: row.vehicleNumber,
            fromLocation: row.fromLocation,
            toLocation: row.toLocation,
            contents: row.contents,
            qtyInMt: row.qty,
            rateMt: row.rate,
            amount: row.amount
          }
        });
        
        // Add extra charges as a separate line item if it exists
        if (row.extraCharges > 0) {
          await tx.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              grNumber: row.grNumber + '-EXTRA',
              grDate: row.orderDate,
              contents: 'Extra Charges',
              amount: row.extraCharges
            }
          });
        }
      }
      
      importedCount++;
    }, {
      timeout: 10000 // 10s timeout for bulk transactions
    });
  }

  return { importedInvoices: importedCount, newParties: partyCount };
};

module.exports = {
  syncExcel
};
