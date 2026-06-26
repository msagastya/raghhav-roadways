require('dotenv').config();
const authService = require('./src/services/auth.service');
const prisma = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    const email = 'ms.rudra.agastya@gmail.com';
    const username = 'ms.rudra.agastya';
    const password = 'password123'; // or we can use the 13 chars the user typed? Let's just set it to 'password123' and tell the user. Wait, if I know they typed 13 dots, maybe 'raghhav123456'? Let's just set it to 'password123'.

    // Check if user already exists
    const existing = await prisma.user.findFirst({ where: { email } });
    
    if (existing) {
      console.log('User already exists, updating password and setting active...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash: hashedPassword,
          isActive: true,
          approvalStatus: 'approved'
        }
      });
      console.log('User updated successfully!');
    } else {
      console.log('Creating new user...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Get Admin role
      const adminRole = await prisma.role.findFirst({ where: { roleName: 'Admin' } });
      
      await prisma.user.create({
        data: {
          username,
          email,
          passwordHash: hashedPassword,
          fullName: 'Rudra Agastya',
          mobile: '9999999999',
          roleId: adminRole ? adminRole.id : 1, // Fallback to 1 if no admin role
          isActive: true,
          approvalStatus: 'approved'
        }
      });
      console.log('User created successfully!');
    }
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

createAdminUser();
