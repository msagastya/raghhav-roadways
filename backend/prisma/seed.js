const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (optional - only for development)
  // await prisma.user.deleteMany();
  // await prisma.role.deleteMany();
  // await prisma.permission.deleteMany();

  // ============================================
  // 1. Create Roles
  // ============================================
  console.log('Creating roles...');
  
  const superAdminRole = await prisma.role.create({
    data: {
      roleName: 'Super Admin',
      description: 'Full system access including user management'
    }
  });

  const adminRole = await prisma.role.create({
    data: {
      roleName: 'Admin',
      description: 'All features except user management'
    }
  });

  const managerRole = await prisma.role.create({
    data: {
      roleName: 'Manager',
      description: 'View and edit consignments, limited reports'
    }
  });

  const viewerRole = await prisma.role.create({
    data: {
      roleName: 'Viewer',
      description: 'Read-only access to all data'
    }
  });

  console.log('✅ Roles created');

  // ============================================
  // 2. Create Permissions
  // ============================================
  console.log('Creating permissions...');

  const permissions = [
    // Consignment permissions
    { code: 'consignment.create', module: 'consignment', action: 'create', desc: 'Create new consignment' },
    { code: 'consignment.view', module: 'consignment', action: 'view', desc: 'View consignment details' },
    { code: 'consignment.edit', module: 'consignment', action: 'edit', desc: 'Edit consignment' },
    { code: 'consignment.delete', module: 'consignment', action: 'delete', desc: 'Delete consignment' },
    { code: 'consignment.status_update', module: 'consignment', action: 'status_update', desc: 'Update consignment status' },
    
    // Invoice permissions
    { code: 'invoice.create', module: 'invoice', action: 'create', desc: 'Generate invoice' },
    { code: 'invoice.view', module: 'invoice', action: 'view', desc: 'View invoice' },
    { code: 'invoice.edit', module: 'invoice', action: 'edit', desc: 'Edit invoice' },
    { code: 'invoice.delete', module: 'invoice', action: 'delete', desc: 'Delete invoice' },
    
    // Payment permissions
    { code: 'payment.create', module: 'payment', action: 'create', desc: 'Record payment' },
    { code: 'payment.view', module: 'payment', action: 'view', desc: 'View payments' },
    { code: 'payment.approve_amendment', module: 'payment', action: 'approve', desc: 'Approve payment amendments' },
    
    // Master data permissions
    { code: 'master.party.create', module: 'master', action: 'create', desc: 'Add new party' },
    { code: 'master.party.edit', module: 'master', action: 'edit', desc: 'Edit party details' },
    { code: 'master.party.delete', module: 'master', action: 'delete', desc: 'Delete party' },
    { code: 'master.vehicle.create', module: 'master', action: 'create', desc: 'Add new vehicle' },
    { code: 'master.vehicle.edit', module: 'master', action: 'edit', desc: 'Edit vehicle details' },
    { code: 'master.vehicle.delete', module: 'master', action: 'delete', desc: 'Delete vehicle' },
    
    // Report permissions
    { code: 'report.daily', module: 'report', action: 'view', desc: 'View daily reports' },
    { code: 'report.monthly', module: 'report', action: 'view', desc: 'View monthly reports' },
    { code: 'report.export', module: 'report', action: 'export', desc: 'Export reports' },
    
    // Settings permissions
    { code: 'settings.users', module: 'settings', action: 'manage', desc: 'Manage users' },
    { code: 'settings.roles', module: 'settings', action: 'manage', desc: 'Manage roles and permissions' },
    { code: 'settings.audit_logs', module: 'settings', action: 'view', desc: 'View audit logs' }
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.create({
      data: {
        permissionCode: perm.code,
        module: perm.module,
        action: perm.action,
        description: perm.desc
      }
    });
    createdPermissions.push(permission);
  }

  console.log('✅ Permissions created');

  // ============================================
  // 3. Assign Permissions to Roles
  // ============================================
  console.log('Assigning permissions to roles...');

  // Super Admin gets all permissions
  for (const permission of createdPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: superAdminRole.id,
        permissionId: permission.id
      }
    });
  }

  // Admin gets all except user/role management
  const adminPermissions = createdPermissions.filter(p => 
    !p.permissionCode.startsWith('settings.users') && 
    !p.permissionCode.startsWith('settings.roles')
  );
  for (const permission of adminPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id
      }
    });
  }

  // Manager gets create/edit/view but no delete
  const managerPermissions = createdPermissions.filter(p => 
    p.action !== 'delete' && 
    !p.permissionCode.startsWith('settings') &&
    !p.permissionCode.includes('approve')
  );
  for (const permission of managerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: managerRole.id,
        permissionId: permission.id
      }
    });
  }

  // Viewer gets only view permissions
  const viewerPermissions = createdPermissions.filter(p => 
    p.action === 'view'
  );
  for (const permission of viewerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: viewerRole.id,
        permissionId: permission.id
      }
    });
  }

  console.log('✅ Permissions assigned to roles');

  // ============================================
  // 4. Create Default Users
  // ============================================
  console.log('Creating default users...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin1 = await prisma.user.create({
    data: {
      username: 'admin1',
      email: 'admin1@raghhavroadways.com',
      passwordHash: hashedPassword,
      fullName: 'Admin User 1',
      mobile: '9727466477',
      roleId: superAdminRole.id,
      isActive: true
    }
  });

  const admin2 = await prisma.user.create({
    data: {
      username: 'admin2',
      email: 'admin2@raghhavroadways.com',
      passwordHash: hashedPassword,
      fullName: 'Admin User 2',
      mobile: '9727466478',
      roleId: adminRole.id,
      isActive: true
    }
  });

  console.log('✅ Users created');
  console.log('\n📧 Default Login Credentials:');
  console.log('Username: admin1 | Password: admin123');
  console.log('Username: admin2 | Password: admin123');

  // ============================================
  // 5. Create Sample Parties
  // ============================================
  console.log('\nCreating sample parties...');

  const party1 = await prisma.party.create({
    data: {
      partyCode: 'PARTY001',
      partyName: 'ABC Industries',
      partyType: 'both',
      gstin: '24AAAAA1234A1Z5',
      pan: 'AAAAA1234A',
      addressLine1: 'Plot 123, Industrial Area',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395006',
      contactPerson: 'Mr. Sharma',
      mobile: '9876543210',
      email: 'abc@industries.com',
      bankName: 'HDFC Bank',
      bankAccountNo: '50100123456789',
      bankIfsc: 'HDFC0001234',
      bankBranch: 'Surat Main',
      isActive: true,
      createdById: admin1.id,
      updatedById: admin1.id
    }
  });

  const party2 = await prisma.party.create({
    data: {
      partyCode: 'PARTY002',
      partyName: 'XYZ Corporation',
      partyType: 'both',
      gstin: '07BBBBB5678B1Z3',
      pan: 'BBBBB5678B',
      addressLine1: 'Building 5, Sector 18',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      contactPerson: 'Mr. Verma',
      mobile: '9876543211',
      email: 'xyz@corporation.com',
      isActive: true,
      createdById: admin1.id,
      updatedById: admin1.id
    }
  });

  const party3 = await prisma.party.create({
    data: {
      partyCode: 'PARTY003',
      partyName: 'PQR Logistics',
      partyType: 'consignee',
      gstin: '27CCCCC9012C1Z7',
      addressLine1: 'Warehouse Complex, Andheri',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      contactPerson: 'Mr. Patel',
      mobile: '9876543212',
      email: 'pqr@logistics.com',
      isActive: true,
      createdById: admin1.id,
      updatedById: admin1.id
    }
  });

  console.log('✅ Sample parties created');

  // ============================================
  // 6. Create Sample Vehicles
  // ============================================
  console.log('Creating sample vehicles...');

  const vehicle1 = await prisma.vehicle.create({
    data: {
      vehicleNo: 'GJ01AB1234',
      vehicleType: 'Truck - 10 MT',
      vehicleCapacity: 10.0,
      ownerType: 'owned',
      ownerName: 'Raghhav Roadways',
      ownerMobile: '9727466477',
      rcNumber: 'GJ01AB1234RC',
      rcExpiry: new Date('2026-12-31'),
      insuranceNumber: 'INS123456789',
      insuranceExpiry: new Date('2025-06-30'),
      fitnessExpiry: new Date('2025-12-31'),
      driverName: 'Ramesh Kumar',
      driverMobile: '9876543220',
      driverLicense: 'DL123456789',
      isActive: true,
      createdById: admin1.id,
      updatedById: admin1.id
    }
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      vehicleNo: 'GJ05XY9876',
      vehicleType: 'Trailer - 20 MT',
      vehicleCapacity: 20.0,
      ownerType: 'broker',
      ownerName: 'Ram Transport Services',
      ownerMobile: '9876543221',
      brokerId: party1.id,
      rcNumber: 'GJ05XY9876RC',
      rcExpiry: new Date('2026-08-15'),
      insuranceNumber: 'INS987654321',
      insuranceExpiry: new Date('2025-09-30'),
      driverName: 'Suresh Yadav',
      driverMobile: '9876543222',
      driverLicense: 'DL987654321',
      isActive: true,
      createdById: admin1.id,
      updatedById: admin1.id
    }
  });

  console.log('✅ Sample vehicles created');

  console.log('\n✨ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Roles: 4`);
  console.log(`- Permissions: ${permissions.length}`);
  console.log(`- Users: 2`);
  console.log(`- Parties: 3`);
  console.log(`- Vehicles: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
