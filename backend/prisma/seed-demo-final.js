const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...');

  try {
    // Create an admin user for createdBy/updatedBy references
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@raghhav.local',
        passwordHash: 'hashed_password_placeholder',
        fullName: 'Admin User',
        mobile: '9876543210',
        roleId: 1,
        isActive: true,
        approvalStatus: 'approved',
      },
    });

    console.log('✅ Admin user created');

    // Clear existing data
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.consignment.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.party.deleteMany();

    // Create demo parties
    const party1 = await prisma.party.create({
      data: {
        partyCode: 'PARTY001',
        partyName: 'ABC Logistics',
        partyType: 'consignor',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        gstin: '27AABCT1234C1Z1',
        creditLimit: 500000,
        creditDays: 30,
        isActive: true,
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    const party2 = await prisma.party.create({
      data: {
        partyCode: 'PARTY002',
        partyName: 'XYZ Traders',
        partyType: 'consignee',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        gstin: '27AABCT1234C1Z2',
        creditLimit: 300000,
        creditDays: 15,
        isActive: true,
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    const party3 = await prisma.party.create({
      data: {
        partyCode: 'PARTY003',
        partyName: 'Global Shipping',
        partyType: 'consignor',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        gstin: '27AABCT1234C1Z3',
        creditLimit: 750000,
        creditDays: 45,
        isActive: true,
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    console.log('✅ Parties created');

    // Create demo vehicles
    const vehicle1 = await prisma.vehicle.create({
      data: {
        vehicleNo: 'DL-01-AB-1234',
        vehicleType: 'Truck',
        vehicleCapacity: 5000,
        ownerType: 'company',
        ownerName: 'Raghhav Roadways',
        ownerMobile: '9876543210',
        rcNumber: 'RC123456',
        rcExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        insuranceNumber: 'INS123456',
        insuranceExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        fitnessExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        driverName: 'Raj Kumar',
        driverMobile: '9876543211',
        driverLicense: 'DL1234567',
        isActive: true,
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    const vehicle2 = await prisma.vehicle.create({
      data: {
        vehicleNo: 'DL-01-AB-5678',
        vehicleType: 'Truck',
        vehicleCapacity: 3000,
        ownerType: 'company',
        ownerName: 'Raghhav Roadways',
        ownerMobile: '9876543210',
        rcNumber: 'RC123457',
        rcExpiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        insuranceNumber: 'INS123457',
        insuranceExpiry: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        fitnessExpiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        driverName: 'Amit Singh',
        driverMobile: '9876543212',
        driverLicense: 'DL1234568',
        isActive: true,
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    const vehicle3 = await prisma.vehicle.create({
      data: {
        vehicleNo: 'DL-01-AB-9999',
        vehicleType: 'Truck',
        vehicleCapacity: 8000,
        ownerType: 'company',
        ownerName: 'Raghhav Roadways',
        ownerMobile: '9876543210',
        rcNumber: 'RC123458',
        rcExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        insuranceNumber: 'INS123458',
        insuranceExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        fitnessExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        driverName: 'Pradeep Verma',
        driverMobile: '9876543213',
        driverLicense: 'DL1234569',
        isActive: true,
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    console.log('✅ Vehicles created');

    // Create demo consignments with ALL required fields
    const consignment1 = await prisma.consignment.create({
      data: {
        grNumber: 'GR-2024-001',
        grDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        consignorId: party1.id,
        consigneeId: party2.id,
        fromLocation: 'New Delhi',
        toLocation: 'Mumbai',
        issuingBranch: 'Delhi',
        vehicleId: vehicle1.id,
        vehicleNumber: vehicle1.vehicleNo,
        noOfPackages: 50,
        actualWeight: new Decimal('1500'),
        chargedWeight: new Decimal('1500'),
        shipmentValue: new Decimal('75000'),
        freightAmount: new Decimal('15000'),
        totalAmount: new Decimal('75000'),
        status: 'Delivered',
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    const consignment2 = await prisma.consignment.create({
      data: {
        grNumber: 'GR-2024-002',
        grDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        consignorId: party3.id,
        consigneeId: party2.id,
        fromLocation: 'Bangalore',
        toLocation: 'Mumbai',
        issuingBranch: 'Bangalore',
        vehicleId: vehicle2.id,
        vehicleNumber: vehicle2.vehicleNo,
        noOfPackages: 100,
        actualWeight: new Decimal('2000'),
        chargedWeight: new Decimal('2000'),
        shipmentValue: new Decimal('95000'),
        freightAmount: new Decimal('19000'),
        totalAmount: new Decimal('95000'),
        status: 'In Transit',
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    const consignment3 = await prisma.consignment.create({
      data: {
        grNumber: 'GR-2024-003',
        grDate: new Date(),
        consignorId: party1.id,
        consigneeId: party2.id,
        fromLocation: 'New Delhi',
        toLocation: 'Bangalore',
        issuingBranch: 'Delhi',
        vehicleId: vehicle1.id,
        vehicleNumber: vehicle1.vehicleNo,
        noOfPackages: 30,
        actualWeight: new Decimal('1000'),
        chargedWeight: new Decimal('1000'),
        shipmentValue: new Decimal('55000'),
        freightAmount: new Decimal('11000'),
        totalAmount: new Decimal('55000'),
        status: 'Booked',
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    console.log('✅ Consignments created');

    // Create demo invoices with ALL required fields
    const invoice1 = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-001',
        invoiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        partyId: party1.id,
        partyName: party1.partyName,
        subtotal: new Decimal('75000'),
        totalAmount: new Decimal('75000'),
        balanceAmount: new Decimal('0'),
        paidAmount: new Decimal('75000'),
        paymentStatus: 'Paid',
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    const invoice2 = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-002',
        invoiceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        partyId: party3.id,
        partyName: party3.partyName,
        subtotal: new Decimal('95000'),
        totalAmount: new Decimal('95000'),
        balanceAmount: new Decimal('95000'),
        paidAmount: new Decimal('0'),
        paymentStatus: 'Pending',
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    const invoice3 = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-003',
        invoiceDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        partyId: party2.id,
        partyName: party2.partyName,
        subtotal: new Decimal('55000'),
        totalAmount: new Decimal('55000'),
        balanceAmount: new Decimal('55000'),
        paidAmount: new Decimal('0'),
        paymentStatus: 'Overdue',
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    console.log('✅ Invoices created');

    // Create demo payments with ALL required fields
    const payment1 = await prisma.payment.create({
      data: {
        paymentNumber: 'PAY-2024-001',
        paymentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        invoiceId: invoice1.id,
        partyId: party1.id,
        totalAmount: new Decimal('75000'),
        paidAmount: new Decimal('75000'),
        balanceAmount: new Decimal('0'),
        paymentStatus: 'Received',
        createdById: adminUser.id,
      },
    });

    const payment2 = await prisma.payment.create({
      data: {
        paymentNumber: 'PAY-2024-002',
        paymentDate: new Date(),
        invoiceId: invoice2.id,
        partyId: party3.id,
        totalAmount: new Decimal('95000'),
        paidAmount: new Decimal('0'),
        balanceAmount: new Decimal('95000'),
        paymentStatus: 'Pending',
        createdById: adminUser.id,
      },
    });

    console.log('✅ Payments created');

    console.log(`
✅ Demo data seeded successfully!

📊 Seeded Data:
  - Parties: 3
  - Vehicles: 3  
  - Consignments: 3
  - Invoices: 3
  - Payments: 2

🚀 You can now login with any username/password!
    `);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
