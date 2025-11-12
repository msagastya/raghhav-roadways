# Raghhav Roadways - Backend API

Backend API for Raghhav Roadways Transport Management System built with Node.js, Express, and Prisma.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm or yarn

### Installation

1. **Clone the repository**
```bashcd backend

2. **Install dependencies**
```bashnpm install

3. **Set up environment variables**
```bashcp .env.example .env
Edit .env with your database credentials and secrets

4. **Set up database**
```bashGenerate Prisma Client
npm run prisma:generateRun migrations
npm run prisma:migrateSeed initial data
npm run prisma:seed

5. **Create storage directories**
```bashmkdir -p storage/consignments storage/invoices storage/challans logs

6. **Start development server**
```bashnpm run dev

Server will run on `http://localhost:5000`

---

## 📁 Project Structurebackend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.js                # Seed data script
│   └── migrations/            # Database migrations
├── src/
│   ├── config/                # Configuration files
│   ├── middleware/            # Express middlewares
│   ├── routes/                # API routes
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── validations/           # Input validation schemas
│   ├── templates/             # PDF templates
│   ├── utils/                 # Utility functions
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── storage/                   # File storage
├── logs/                      # Application logs
└── package.json

---

## 🔐 Default Credentials

After seeding the database:

**Super Admin:**
- Username: `admin1`
- Password: `admin123`

**Admin:**
- Username: `admin2`
- Password: `admin123`

⚠️ **IMPORTANT:** Change these passwords in production!

---

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token

### Consignments
- `GET /api/v1/consignments` - Get all consignments
- `GET /api/v1/consignments/:id` - Get consignment by ID
- `POST /api/v1/consignments` - Create new consignment
- `PATCH /api/v1/consignments/:id` - Update consignment
- `PATCH /api/v1/consignments/:id/status` - Update status
- `DELETE /api/v1/consignments/:id` - Delete consignment
- `POST /api/v1/consignments/:id/upload-challan` - Upload challan
- `GET /api/v1/consignments/:id/download-note` - Download consignment note PDF

### Invoices
- `GET /api/v1/invoices` - Get all invoices
- `GET /api/v1/invoices/:id` - Get invoice by ID
- `POST /api/v1/invoices` - Generate new invoice
- `PATCH /api/v1/invoices/:id` - Update invoice
- `DELETE /api/v1/invoices/:id` - Delete invoice
- `GET /api/v1/invoices/:id/download` - Download invoice PDF

### Payments
- `GET /api/v1/payments` - Get all payments
- `POST /api/v1/payments` - Record payment
- `POST /api/v1/payment-amendments` - Create amendment
- `PATCH /api/v1/payment-amendments/:id/approve` - Approve amendment

### Parties (Master Data)
- `GET /api/v1/parties` - Get all parties
- `GET /api/v1/parties/:id` - Get party by ID
- `POST /api/v1/parties` - Create party
- `PATCH /api/v1/parties/:id` - Update party
- `DELETE /api/v1/parties/:id` - Delete party

### Vehicles (Master Data)
- `GET /api/v1/vehicles` - Get all vehicles
- `GET /api/v1/vehicles/:id` - Get vehicle by ID
- `POST /api/v1/vehicles` - Create vehicle
- `PATCH /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Delete vehicle

### Reports
- `GET /api/v1/reports/dashboard` - Dashboard summary
- `GET /api/v1/reports/daily` - Daily report
- `GET /api/v1/reports/monthly-statement` - Monthly party statement
- `GET /api/v1/reports/vehicle-settlement` - Vehicle owner settlement

---

## 🛠️ Development Commands
```bashStart development server with auto-reload
npm run devStart production server
npm startGenerate Prisma Client after schema changes
npm run prisma:generateCreate and run new migration
npm run prisma:migrateSeed database with initial data
npm run prisma:seedOpen Prisma Studio (database GUI)
npm run prisma:studio

---

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Granular permission system
- Password hashing with bcrypt
- Request validation
- SQL injection prevention (Prisma)
- CORS configuration
- Audit logging
- Secure file uploads

---

## 📊 Database Schema

See `prisma/schema.prisma` for complete schema.

**Key Tables:**
- `users` - System users
- `roles` - User roles
- `permissions` - Granular permissions
- `parties` - Consignors/Consignees
- `vehicles` - Vehicle master data
- `consignments` - Shipment records
- `invoices` - Billing records
- `payments` - Payment transactions
- `audit_logs` - System audit trail

---

## 🧪 Testing
```bashRun tests (to be implemented)
npm testRun tests with coverage
npm run test:coverage

---

## 🐛 Debugging

Logs are stored in:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

Set `LOG_LEVEL` in `.env` to control logging:
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Info, warnings, and errors (default)
- `debug` - All logs including debug info

---

## 📦 Production Deployment

1. **Set environment to production**
```bashNODE_ENV=production

2. **Use strong JWT secrets**
```bashGenerate secure random strings for JWT secrets
openssl rand -base64 32

3. **Configure production database**
```bashDATABASE_URL="postgresql://user:pass@host:5432/raghhav_roadways"

4. **Run migrations**
```bashnpx prisma migrate deploy

5. **Start with PM2** (recommended)
```bashnpm install -g pm2
pm2 start src/server.js --name raghhav-api
pm2 save
pm2 startup

6. **Set up reverse proxy** (Nginx example)
```nginxserver {
listen 80;
server_name api.raghhavroadways.com;location / {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
}

---

## 🔧 Troubleshooting

### Database connection issues
```bashCheck PostgreSQL is running
sudo systemctl status postgresqlTest connection
psql -U postgres -d raghhav_roadways

### Prisma migration issues
```bashReset database (⚠️ deletes all data)
npx prisma migrate resetForce deploy migrations
npx prisma migrate deploy --force

### Port already in use
```bashFind process using port 5000
lsof -i :5000Kill process
kill -9 <PID>

---

## 📝 License

Private - Raghhav Roadways © 2025

---

## 🤝 Support

For support, contact: raghhavroadways@gmail.com# Backend
