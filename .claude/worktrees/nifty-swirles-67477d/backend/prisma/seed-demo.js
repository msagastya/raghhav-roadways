const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...');
  try {
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@raghhav.local',
        passwordHash: 'hash',
        fullName: 'Admin',
        roleId: 1,
        isActive: true,
        approvalStatus: 'approved',
      },
    });

    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.consignment.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.party.deleteMany();

    const party1 = await prisma.party.create({
      data: { partyCode: 'PARTY001', partyName: 'ABC Logistics', partyType: 'consignor', city: 'New Delhi', state: 'Delhi', gstin: '27AABCT1234C1Z1', creditLimit: 500000, creditDays: 30, isActive: true, createdById: adminUser.id, updatedById: adminUser.id },
    });
    const party2 = await prisma.party.create({
      data: { partyCode: 'PARTY002', partyName: 'XYZ Traders', partyType: 'consignee', city: 'Mumbai', state: 'Maharashtra', gstin: '27AABCT1234C1Z2', creditLimit: 300000, creditDays: 15, isActive: true, createdById: adminUser.id, updatedById: adminUser.id },
    });
    const party3 = await prisma.party.create({
      data: { partyCode: 'PARTY003', partyName: 'Global Shipping', partyType: 'consignor', city: 'Bangalore', state: 'Karnataka', gstin: '27AABCT1234C1Z3', creditLimit: 750000, creditDays: 45, isActive: true, createdById: adminUser.id, updatedById: adminUser.id },
    });

    const vehicle1 = await prisma.vehicle.create({
      data: { vehicleNo: 'DL-01-AB-1234', vehicleType: 'Truck', vehicleCapacity: 5000, ownerType: 'company', ownerName: 'Raghhav', rcExpiry: new Date(Date.now() + 180*24*60*60*1000), insuranceExpiry: new Date(Date.now() + 90*24*60*60*1000), fitnessExpiry: new Date(Date.now() + 180*24*60*60*1000), driverName: 'Raj', isActive: true, createdById: adminUser.id, updatedById: adminUser.id },
    });
    const vehicle2 = await prisma.vehicle.create({
      data: { vehicleNo: 'DL-01-AB-5678', vehicleType: 'Truck', vehicleCapacity: 3000, ownerType: 'company', ownerName: 'Raghhav', rcExpiry: new Date(Date.now() + 300*24*60*60*1000), insuranceExpiry: new Date(Date.now() + 150*24*60*60*1000), fitnessExpiry: new Date(Date.now() + 300*24*60*60*1000), driverName: 'Amit', isActive: true, createdById: adminUser.id, updatedById: adminUser.id },
    });
    const vehicle3 = await prisma.vehicle.create({
      data: { vehicleNo: 'DL-01-AB-9999', vehicleType: 'Truck', vehicleCapacity: 8000, ownerType: 'company', ownerName: 'Raghhav', rcExpiry: new Date(Date.now() + 30*24*60*60*1000), insuranceExpiry: new Date(Date.now() + 60*24*60*60*1000), fitnessExpiry: new Date(Date.now() + 30*24*60*60*1000), driverName: 'Pradeep', isActive: true, createdById: adminUser.id, updatedById: adminUser.id },
    });

    await prisma.consignment.create({ data: { grNumber: 'GR-2024-001', grDate: new Date(Date.now() - 30*24*60*60*1000), consignorId: party1.id, consigneeId: party2.id, fromLocation: 'New Delhi', toLocation: 'Mumbai', vehicleId: vehicle1.id, vehicleNumber: vehicle1.vehicleNo, freightAmount: 15000, totalAmount: 75000, status: 'Delivered', createdById: adminUser.id, updatedById: adminUser.id } });
    await prisma.consignment.create({ data: { grNumber: 'GR-2024-002', grDate: new Date(Date.now() - 5*24*60*60*1000), consignorId: party3.id, consigneeId: party2.id, fromLocation: 'Bangalore', toLocation: 'Mumbai', vehicleId: vehicle2.id, vehicleNumber: vehicle2.vehicleNo, freightAmount: 19000, totalAmount: 95000, status: 'In Transit', createdById: adminUser.id, updatedById: adminUser.id } });
    await prisma.consignment.create({ data: { grNumber: 'GR-2024-003', grDate: new Date(), consignorId: party1.id, consigneeId: party2.id, fromLocation: 'New Delhi', toLocation: 'Bangalore', vehicleId: vehicle1.id, vehicleNumber: vehicle1.vehicleNo, freightAmount: 11000, totalAmount: 55000, status: 'Booked', createdById: adminUser.id, updatedById: adminUser.id } });

    const inv1 = await prisma.invoice.create({ data: { invoiceNumber: 'INV-2024-001', invoiceDate: new Date(Date.now() - 30*24*60*60*1000), dueDate: new Date(Date.now() - 10*24*60*60*1000), partyId: party1.id, partyName: party1.partyName, subtotal: 75000, totalAmount: 75000, balanceAmount: 0, paidAmount: 75000, paymentStatus: 'Paid', createdById: adminUser.id, updatedById: adminUser.id } });
    const inv2 = await prisma.invoice.create({ data: { invoiceNumber: 'INV-2024-002', invoiceDate: new Date(Date.now() - 10*24*60*60*1000), dueDate: new Date(Date.now() + 10*24*60*60*1000), partyId: party3.id, partyName: party3.partyName, subtotal: 95000, totalAmount: 95000, balanceAmount: 95000, paidAmount: 0, paymentStatus: 'Pending', createdById: adminUser.id, updatedById: adminUser.id } });
    const inv3 = await prisma.invoice.create({ data: { invoiceNumber: 'INV-2024-003', invoiceDate: new Date(Date.now() - 60*24*60*60*1000), dueDate: new Date(Date.now() - 20*24*60*60*1000), partyId: party2.id, partyName: party2.partyName, subtotal: 55000, totalAmount: 55000, balanceAmount: 55000, paidAmount: 0, paymentStatus: 'Overdue', createdById: adminUser.id, updatedById: adminUser.id } });

    await prisma.payment.create({ data: { paymentNumber: 'PAY-2024-001', paymentDate: new Date(Date.now() - 25*24*60*60*1000), invoiceId: inv1.id, partyId: party1.id, totalAmount: 75000, paidAmount: 75000, balanceAmount: 0, paymentStatus: 'Received', createdById: adminUser.id } });
    await prisma.payment.create({ data: { paymentNumber: 'PAY-2024-002', paymentDate: new Date(), invoiceId: inv2.id, partyId: party3.id, totalAmount: 95000, paidAmount: 0, balanceAmount: 95000, paymentStatus: 'Pending', createdById: adminUser.id } });

    console.log('✅ Demo data seeded successfully!');
    console.log('📊 3 Parties, 3 Vehicles, 3 Consignments, 3 Invoices, 2 Payments');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
