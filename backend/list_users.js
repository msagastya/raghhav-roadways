require('dotenv').config();
const prisma = require('./src/config/database');

async function listUsers() {
  const users = await prisma.user.findMany({});
  console.log('Users:', users.map(u => ({ id: u.id, username: u.username, email: u.email })));
  process.exit(0);
}

listUsers();
