/**
 * seed-real.js — Real production data seed for Raghhav Roadways TMS
 * Sources:
 *   • backend/prisma/bill-data.json  (parsed from Bill.xlsx – 173 invoices, 253 unique GRs)
 *   • Physical GR note photos        (GRs 236–363 – already included in bill-data.json)
 *
 * Run: npx prisma db seed   OR   node prisma/seed-real.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// ─── helpers ──────────────────────────────────────────────────────────────────

function normalizeVehicle(v) {
  if (!v) return null;
  return v.replace(/\s+/g, '').toUpperCase().replace(/`$/, '');
}

function parseDate(d) {
  if (!d) return new Date();
  // "2025-03-31T00:00:00" or "2025-03-31"
  return new Date(d);
}

// Simple number-to-words for amounts (Indian system)
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
               'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
               'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numToWords(n) {
  if (!n || isNaN(n)) return 'Zero';
  n = Math.round(n);
  if (n === 0) return 'Zero';
  if (n < 0) return 'Minus ' + numToWords(-n);
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
  if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
  if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
  return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
}

function amountWords(n) {
  const words = numToWords(Math.round(n));
  return 'Rs. ' + words + ' Only';
}

// Extract state/city from address string
function parseAddress(addr) {
  if (!addr) return { addressLine1: '', city: '', state: '', pincode: '' };
  // Try to extract pincode (6-digit)
  const pinMatch = addr.match(/\b(\d{6})\b/);
  const pincode = pinMatch ? pinMatch[1] : '';
  const clean = addr.replace(pincode, '').trim();
  const parts = clean.split(',').map(s => s.trim()).filter(Boolean);
  return {
    addressLine1: parts.slice(0, 2).join(', '),
    city: parts[parts.length - 2] || parts[0] || '',
    state: parts[parts.length - 1] || '',
    pincode,
  };
}

// ─── static party data ────────────────────────────────────────────────────────

const PARTY_DATA = {
  'BELECTRIQ MOBILITY PVT LTD': {
    gstin: '09AAMCP7228G1Z1', addressLine1: 'A-95, Sector 80, Phase-2',
    city: 'Noida', state: 'Uttar Pradesh', pincode: '201305',
  },
  'WATRANA RENTALS LIMITED': {
    gstin: '09AACCW5475C1Z7', addressLine1: 'H-9 Site-V, UPSIDC Industrial Area, Kasna',
    city: 'Greater Noida', state: 'Uttar Pradesh', pincode: '201306',
  },
  'P2 POWER SOLUTIONS PVT LTD': {
    gstin: '09AAECP0915G2ZK', addressLine1: 'A-95, Sector-80',
    city: 'Noida', state: 'Uttar Pradesh', pincode: '201301',
  },
  'WATRANA TRACTION COMPANY': {
    gstin: '09AABFW2154N1ZT', addressLine1: 'H-9 Site-V, UPSIDC Industrial Area, Kasna',
    city: 'Greater Noida', state: 'Uttar Pradesh', pincode: '201306',
  },
  'WATRANA TRACTION PVT. LTD.': {
    gstin: '09AAACW5134G1ZD', addressLine1: 'Ground Floor, Plot No. 25, Village Kotambi, Shah Ind. Park-4',
    city: 'Vadodara', state: 'Gujarat', pincode: '391510',
  },
  'GOLJIU EVENT': {
    gstin: '', addressLine1: '',
    city: 'Surat', state: 'Gujarat', pincode: '',
  },
  'CORRIT ON DEMAND SOLUTIONS PVT LTD': {
    gstin: '06AAGCC1825N1ZK', addressLine1: '',
    city: 'Gurugram', state: 'Haryana', pincode: '',
  },
  'INTERNATIONAL STEELS': {
    gstin: '27AGGPD4879C1ZF', addressLine1: '',
    city: 'Mumbai', state: 'Maharashtra', pincode: '',
  },
  'INTERNATIONAL STEELS & ALLOYS': {
    gstin: '27AAZHS4206H1ZN', addressLine1: '',
    city: 'Mumbai', state: 'Maharashtra', pincode: '',
  },
  'AQUA LEAD SYSTEMS': {
    gstin: '33ABBFA4935C1Z0', addressLine1: '',
    city: 'Chennai', state: 'Tamil Nadu', pincode: '',
  },
  'SACHIN PAPER MILLS PVT.LTD.': {
    gstin: '24AADCS3796F1Z8', addressLine1: 'Sachin GIDC, Surat',
    city: 'Sachin', state: 'Gujarat', pincode: '394230',
  },
  'VISHAL AGENCIES': {
    gstin: '24AACFV0562G1ZG', addressLine1: '',
    city: 'Surat', state: 'Gujarat', pincode: '',
  },
  'CORONET ENGINEERS PVT LTD': {
    gstin: '06AABCC5436C1Z5', addressLine1: '',
    city: 'Gurugram', state: 'Haryana', pincode: '',
  },
  'SWATI PACKAGING': {
    gstin: '24AOEPK9737J1ZL', addressLine1: '',
    city: 'Vapi', state: 'Gujarat', pincode: '',
  },
  'MAA ASHAPURA PAPER TUBE': {
    gstin: '24AAZFM8602P1ZE', addressLine1: '',
    city: 'Surat', state: 'Gujarat', pincode: '',
  },
};

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding Raghhav Roadways real production data...\n');

  // Load bill data
  const dataPath = path.join(__dirname, 'bill-data.json');
  const { bills, orders } = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`📦 Loaded ${bills.length} bills, ${orders.length} order rows from bill-data.json`);

  // ── 1. Roles ────────────────────────────────────────────────────────────────
  console.log('\n[1] Creating roles...');
  const superAdminRole = await prisma.role.upsert({
    where: { roleName: 'Super Admin' },
    update: {},
    create: { roleName: 'Super Admin', description: 'Full system access' },
  });
  const adminRole = await prisma.role.upsert({
    where: { roleName: 'Admin' },
    update: {},
    create: { roleName: 'Admin', description: 'All features except user management' },
  });
  await prisma.role.upsert({
    where: { roleName: 'Manager' },
    update: {},
    create: { roleName: 'Manager', description: 'View and edit consignments, limited reports' },
  });
  await prisma.role.upsert({
    where: { roleName: 'Viewer' },
    update: {},
    create: { roleName: 'Viewer', description: 'Read-only access' },
  });
  console.log('✅ Roles ready');

  // ── 2. Permissions ──────────────────────────────────────────────────────────
  console.log('[2] Creating permissions...');
  const permDefs = [
    { code: 'consignment.create', module: 'consignment', action: 'create', desc: 'Create consignment' },
    { code: 'consignment.view',   module: 'consignment', action: 'view',   desc: 'View consignment' },
    { code: 'consignment.edit',   module: 'consignment', action: 'edit',   desc: 'Edit consignment' },
    { code: 'consignment.delete', module: 'consignment', action: 'delete', desc: 'Delete consignment' },
    { code: 'consignment.status_update', module: 'consignment', action: 'status_update', desc: 'Update status' },
    { code: 'invoice.create', module: 'invoice', action: 'create', desc: 'Generate invoice' },
    { code: 'invoice.view',   module: 'invoice', action: 'view',   desc: 'View invoice' },
    { code: 'invoice.edit',   module: 'invoice', action: 'edit',   desc: 'Edit invoice' },
    { code: 'invoice.delete', module: 'invoice', action: 'delete', desc: 'Delete invoice' },
    { code: 'payment.create', module: 'payment', action: 'create', desc: 'Record payment' },
    { code: 'payment.view',   module: 'payment', action: 'view',   desc: 'View payments' },
    { code: 'payment.approve_amendment', module: 'payment', action: 'approve', desc: 'Approve amendments' },
    { code: 'master.party.view',   module: 'master', action: 'view',   desc: 'View parties' },
    { code: 'master.party.create', module: 'master', action: 'create', desc: 'Add party' },
    { code: 'master.party.edit',   module: 'master', action: 'edit',   desc: 'Edit party' },
    { code: 'master.party.delete', module: 'master', action: 'delete', desc: 'Delete party' },
    { code: 'master.vehicle.view',   module: 'master', action: 'view',   desc: 'View vehicles' },
    { code: 'master.vehicle.create', module: 'master', action: 'create', desc: 'Add vehicle' },
    { code: 'master.vehicle.edit',   module: 'master', action: 'edit',   desc: 'Edit vehicle' },
    { code: 'master.vehicle.delete', module: 'master', action: 'delete', desc: 'Delete vehicle' },
    { code: 'report.daily',   module: 'report', action: 'view',   desc: 'Daily reports' },
    { code: 'report.monthly', module: 'report', action: 'view',   desc: 'Monthly reports' },
    { code: 'report.export',  module: 'report', action: 'export', desc: 'Export reports' },
    { code: 'settings.users',      module: 'settings', action: 'manage', desc: 'Manage users' },
    { code: 'settings.roles',      module: 'settings', action: 'manage', desc: 'Manage roles' },
    { code: 'settings.audit_logs', module: 'settings', action: 'view',   desc: 'View audit logs' },
  ];

  const createdPerms = [];
  for (const p of permDefs) {
    const perm = await prisma.permission.upsert({
      where: { permissionCode: p.code },
      update: {},
      create: { permissionCode: p.code, module: p.module, action: p.action, description: p.desc },
    });
    createdPerms.push(perm);
  }

  // Assign all permissions to Super Admin
  for (const perm of createdPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }
  // Admin gets everything except user/role management
  for (const perm of createdPerms.filter(p => !p.permissionCode.startsWith('settings.users') && !p.permissionCode.startsWith('settings.roles'))) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }
  console.log('✅ Permissions ready');

  // ── 3. Users ────────────────────────────────────────────────────────────────
  console.log('[3] Creating users...');
  const hash = await bcrypt.hash('admin123', 10);
  const admin1 = await prisma.user.upsert({
    where: { username: 'admin1' },
    update: {},
    create: {
      username: 'admin1', email: 'admin1@raghhavroadways.com',
      passwordHash: hash, fullName: 'Raghhav Roadways Admin',
      mobile: '9727466477', roleId: superAdminRole.id, isActive: true,
    },
  });
  const admin2 = await prisma.user.upsert({
    where: { username: 'admin2' },
    update: {},
    create: {
      username: 'admin2', email: 'admin2@raghhavroadways.com',
      passwordHash: hash, fullName: 'Operations Manager',
      mobile: '9727466478', roleId: adminRole.id, isActive: true,
    },
  });
  console.log('✅ Users ready  (admin1/admin2 | password: admin123)');

  // ── 4. Parties ──────────────────────────────────────────────────────────────
  console.log('[4] Creating parties...');

  // Gather unique party names from bills
  const partyNamesFromBills = [...new Set(bills.map(b => b.partyName).filter(Boolean))];

  const partyMap = {}; // name → Party record

  let partyCodeIdx = 1;
  for (const name of partyNamesFromBills) {
    const info = PARTY_DATA[name] || {};
    const addrParsed = info.addressLine1
      ? { addressLine1: info.addressLine1, city: info.city, state: info.state, pincode: info.pincode }
      : parseAddress(bills.find(b => b.partyName === name)?.partyAddress || '');

    const code = `PARTY${String(partyCodeIdx++).padStart(3, '0')}`;

    const party = await prisma.party.upsert({
      where: { partyCode: code },
      update: { partyName: name, gstin: info.gstin || bills.find(b => b.partyName === name)?.partyGst || '' },
      create: {
        partyCode: code,
        partyName: name,
        partyType: 'both',
        gstin: info.gstin || bills.find(b => b.partyName === name)?.partyGst || null,
        addressLine1: addrParsed.addressLine1 || null,
        city: addrParsed.city || null,
        state: addrParsed.state || null,
        pincode: addrParsed.pincode || null,
        isActive: true,
        createdById: admin1.id,
        updatedById: admin1.id,
      },
    });
    partyMap[name] = party;
  }
  console.log(`✅ ${Object.keys(partyMap).length} parties created`);

  // ── 5. Vehicles ─────────────────────────────────────────────────────────────
  console.log('[5] Creating vehicles...');

  const rawVehicles = [...new Set(orders.map(o => normalizeVehicle(o.vehicleNo)).filter(Boolean))];
  const vehicleMap = {}; // normalized → Vehicle record

  for (const vNo of rawVehicles) {
    const vehicle = await prisma.vehicle.upsert({
      where: { vehicleNo: vNo },
      update: {},
      create: {
        vehicleNo: vNo,
        vehicleType: 'Truck',
        ownerType: 'market',
        isActive: true,
        createdById: admin1.id,
        updatedById: admin1.id,
      },
    });
    vehicleMap[vNo] = vehicle;
  }
  console.log(`✅ ${rawVehicles.length} vehicles created`);

  // ── 6. Build bill→orders map ─────────────────────────────────────────────────
  const billOrderMap = {}; // billNo → { grRows, extraRows, grCharge }
  for (const row of orders) {
    const bn = row.billNo;
    if (!billOrderMap[bn]) billOrderMap[bn] = { grRows: [], extraRows: [], grCharge: 0 };
    if (row.grNo) {
      billOrderMap[bn].grRows.push(row);
    } else if (row.grCharge) {
      billOrderMap[bn].grCharge = Number(row.grCharge);
    } else if (row.extraContent) {
      billOrderMap[bn].extraRows.push(row);
    }
  }

  // ── 7. Consignments ──────────────────────────────────────────────────────────
  console.log('[6] Creating consignments (GRs)...');

  const consignmentMap = {}; // grNo (int) → Consignment record
  let consignmentsCreated = 0;

  // Collect all unique GRs across all orders
  const uniqueGRs = {};
  for (const row of orders) {
    if (!row.grNo) continue;
    if (!uniqueGRs[row.grNo]) uniqueGRs[row.grNo] = row;
  }

  for (const [grNo, row] of Object.entries(uniqueGRs)) {
    const grNum = parseInt(grNo);
    const bill = bills.find(b => b.billNo === row.billNo);
    const partyName = bill?.partyName;
    const party = partyName ? partyMap[partyName] : null;
    const partyId = party?.id || admin1.id; // fallback (shouldn't happen)

    const vNoNorm = normalizeVehicle(row.vehicleNo);
    const vehicle = vNoNorm ? vehicleMap[vNoNorm] : null;

    // If no vehicle exists, create a placeholder
    let vehicleId;
    if (vehicle) {
      vehicleId = vehicle.id;
    } else {
      // create a placeholder vehicle
      const placeholderNo = `UNKNOWN${grNum}`;
      const placeholder = await prisma.vehicle.upsert({
        where: { vehicleNo: placeholderNo },
        update: {},
        create: {
          vehicleNo: placeholderNo, vehicleType: 'Truck', ownerType: 'market',
          isActive: true, createdById: admin1.id, updatedById: admin1.id,
        },
      });
      vehicleId = placeholder.id;
    }

    const freightAmt = row.amount ? Number(row.amount) : 0;
    const grDate = parseDate(row.date);

    // qty: if weight string like "11204KG", use as vehicleSize display
    const qtyStr = row.qty && row.qty !== 'None' ? row.qty : 'FT L';
    const isWeightBased = qtyStr !== 'FT L' && /\d/.test(qtyStr);
    let actualWeight = null;
    if (isWeightBased) {
      const match = qtyStr.replace(/,/g, '').match(/[\d.]+/);
      if (match) actualWeight = parseFloat(match[0]);
    }

    const grNumberStr = String(grNum);

    try {
      const consignment = await prisma.consignment.upsert({
        where: { grNumber: grNumberStr },
        update: {},
        create: {
          grNumber: grNumberStr,
          grDate: grDate,
          consignorId: partyId,
          consigneeId: partyId,
          fromLocation: row.loadFrom || '',
          toLocation: row.destination || '',
          issuingBranch: 'Surat',
          vehicleId: vehicleId,
          vehicleNumber: vNoNorm || row.vehicleNo || '',
          vehicleType: isWeightBased ? '' : 'Truck',
          vehicleSize: qtyStr,
          description: row.contents || '',
          actualWeight: actualWeight,
          weightUnit: isWeightBased ? 'KG' : 'MT',
          freightAmount: freightAmt,
          surcharge: 0,
          otherCharges: 0,
          grCharge: 0,
          totalAmount: freightAmt,
          amountInWords: amountWords(freightAmt),
          rateType: row.rate === 'FIXED' ? 'Fixed' : (row.rate || 'Fixed'),
          paymentMode: 'To Pay',
          status: 'Delivered',
          isInvoiced: true,
          createdById: admin1.id,
          updatedById: admin1.id,
        },
      });
      consignmentMap[grNum] = consignment;
      consignmentsCreated++;
    } catch (err) {
      console.warn(`  ⚠ GR ${grNum} skip: ${err.message.slice(0, 80)}`);
    }
  }
  console.log(`✅ ${consignmentsCreated} consignments created`);

  // ── 8. Invoices ──────────────────────────────────────────────────────────────
  console.log('[7] Creating invoices...');
  let invoicesCreated = 0;

  for (const bill of bills) {
    const billData = billOrderMap[bill.billNo] || { grRows: [], extraRows: [], grCharge: 0 };
    const party = partyMap[bill.partyName];
    if (!party) {
      console.warn(`  ⚠ Bill ${bill.billNo}: party "${bill.partyName}" not found, skipping`);
      continue;
    }

    const invoiceNumber = `INV${String(bill.billNo).padStart(4, '0')}`;

    // Calculate subtotal from GR amounts + extra charges
    let subtotal = 0;
    for (const row of billData.grRows) {
      if (row.amount) subtotal += Number(row.amount);
    }
    for (const row of billData.extraRows) {
      if (row.extraCharges) subtotal += Number(row.extraCharges);
    }
    const grCharge = billData.grCharge;
    const totalAmount = subtotal + grCharge;
    // Verify against bill total (use bill total as source of truth)
    const billTotal = Number(bill.totalAmount) || totalAmount;

    const invoiceDate = parseDate(bill.billDate);
    const partyAddr = PARTY_DATA[bill.partyName]
      ? `${PARTY_DATA[bill.partyName].addressLine1}, ${PARTY_DATA[bill.partyName].city}, ${PARTY_DATA[bill.partyName].state} - ${PARTY_DATA[bill.partyName].pincode}`
      : bill.partyAddress || '';

    let invoice;
    try {
      invoice = await prisma.invoice.upsert({
        where: { invoiceNumber },
        update: {},
        create: {
          invoiceNumber,
          invoiceDate,
          branch: 'Surat',
          partyId: party.id,
          partyName: bill.partyName,
          partyAddress: partyAddr,
          partyGstin: bill.partyGst || party.gstin || null,
          subtotal: subtotal,
          grCharge: grCharge,
          totalAmount: billTotal,
          amountInWords: amountWords(billTotal),
          paidAmount: 0,
          balanceAmount: billTotal,
          paymentStatus: 'Pending',
          isDeleted: false,
          createdById: admin1.id,
          updatedById: admin1.id,
        },
      });
    } catch (err) {
      console.warn(`  ⚠ Invoice ${invoiceNumber}: ${err.message.slice(0, 80)}`);
      continue;
    }

    // Create invoice items for each GR row
    for (const row of billData.grRows) {
      if (!row.grNo) continue;
      const consignment = consignmentMap[row.grNo];
      if (!consignment) {
        console.warn(`  ⚠ Invoice ${invoiceNumber}: GR ${row.grNo} consignment not found`);
        continue;
      }

      const qtyStr = row.qty && row.qty !== 'None' ? row.qty : 'FT L';
      const isWeightBased = qtyStr !== 'FT L' && /\d/.test(qtyStr);
      let qtyDecimal = null;
      if (isWeightBased) {
        const match = qtyStr.replace(/,/g, '').match(/[\d.]+/);
        if (match) qtyDecimal = parseFloat(match[0]);
      }

      try {
        const existingItem = await prisma.invoiceItem.findFirst({
          where: { invoiceId: invoice.id, consignmentId: consignment.id },
        });
        if (!existingItem) {
          await prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              consignmentId: consignment.id,
              grNumber: String(row.grNo),
              grDate: parseDate(row.date),
              vehicleNumber: normalizeVehicle(row.vehicleNo) || '',
              fromLocation: row.loadFrom || '',
              toLocation: row.destination || '',
              contents: row.contents || '',
              qtyInMt: qtyDecimal === null || qtyDecimal === undefined ? null : String(qtyDecimal),
              rateMt: null,
              amount: row.amount ? Number(row.amount) : 0,
            },
          });
        }
      } catch (err2) {
        console.warn(`  ⚠ InvoiceItem GR${row.grNo}: ${err2.message.slice(0, 60)}`);
      }
    }

    // Update consignments to mark as invoiced
    for (const row of billData.grRows) {
      if (!row.grNo || !consignmentMap[row.grNo]) continue;
      await prisma.consignment.update({
        where: { id: consignmentMap[row.grNo].id },
        data: { isInvoiced: true, invoiceId: invoice.id },
      });
    }

    invoicesCreated++;
  }

  console.log(`✅ ${invoicesCreated} invoices created`);

  // ── Summary ──────────────────────────────────────────────────────────────────
  const [partyCount, vehicleCount, consCount, invCount] = await Promise.all([
    prisma.party.count(),
    prisma.vehicle.count(),
    prisma.consignment.count(),
    prisma.invoice.count(),
  ]);

  console.log('\n✨ Seed complete!');
  console.log('─'.repeat(40));
  console.log(`  Parties:      ${partyCount}`);
  console.log(`  Vehicles:     ${vehicleCount}`);
  console.log(`  Consignments: ${consCount}`);
  console.log(`  Invoices:     ${invCount}`);
  console.log('─'.repeat(40));
  console.log('  Login: admin1 / admin123');
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
