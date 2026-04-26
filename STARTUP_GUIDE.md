# 🚀 RAGHHAV ROADWAYS - STARTUP GUIDE

## Quick Start (Recommended)

### Start Both Services with One Command

#### macOS / Linux:
```bash
npm start
# or
bash start-all.sh
```

#### Windows:
```bash
start-all.bat
# or double-click start-all.bat in File Explorer
```

This will automatically start:
- **Backend API** on Port **2025**
- **Frontend (Next.js)** on Port **2026**

---

## URLs After Startup

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:2026 | Main application (local machine) |
| Backend API | http://localhost:2025 | REST API endpoints (local machine) |
| API Documentation | http://localhost:2025/api-docs | Swagger/OpenAPI docs |
| Health Check | http://localhost:2025/api/v1/health | API status |

---

## Network Access (From Other Devices)

To access the application from other devices on your local network:

### 1. Find Your Machine's IP Address

**macOS/Linux:**
```bash
# Get your local IP address
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for something like: 192.168.x.x or 10.0.x.x
```

**Windows (PowerShell):**
```powershell
ipconfig
# Look for "IPv4 Address" under your active network connection
```

### 2. Update Configuration

Edit `.env` file and update the API URL:
```env
# Replace YOUR_MACHINE_IP with actual IP (e.g., 192.168.1.100)
NEXT_PUBLIC_API_URL=http://YOUR_MACHINE_IP:2025/api/v1
CORS_ORIGIN=http://YOUR_MACHINE_IP:2026
```

### 3. Access from Other Device

On any device on the same network, open:
```
http://YOUR_MACHINE_IP:2026
```

**Example:**
- Machine IP: `192.168.1.100`
- Frontend: `http://192.168.1.100:2026`
- Backend API: `http://192.168.1.100:2025`

### 4. Restart Services

After changing the `.env` file:
```bash
npm start
```

---

## Individual Service Startup

If you prefer to start services separately:

### Start Only Backend:
```bash
npm run start:backend
# or
cd backend && npm run dev
```
Backend will run on **Port 2025**

### Start Only Frontend:
```bash
npm run start:frontend
# or
cd frontend && PORT=2026 npm run dev
```
Frontend will run on **Port 2026**

---

## Initial Setup

### First Time Installation (All Dependencies):
```bash
npm run install:all
```

This installs dependencies for:
- Root project
- Backend (`/backend`)
- Frontend (`/frontend`)

---

## Configuration

### Port Settings
Ports are configured in `.env` file (root directory):

```env
# Backend
PORT=2025

# Frontend
FRONTEND_PORT=2026

# API Connection
NEXT_PUBLIC_API_URL=http://localhost:2025/api/v1
```

### To Change Ports:
1. Edit `.env` in the root directory
2. Change `PORT` (backend) and `FRONTEND_PORT` (frontend)
3. Restart services

---

## Database Setup

### Initialize Database:
```bash
npm run migrate
```

### Seed Database with Sample Data:
```bash
npm run seed
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start both backend and frontend |
| `npm run start:backend` | Start only backend |
| `npm run start:frontend` | Start only frontend |
| `npm run build` | Build both services for production |
| `npm run build:backend` | Build backend only |
| `npm run build:frontend` | Build frontend only |
| `npm run install:all` | Install all dependencies |
| `npm test` | Run backend tests |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed database with sample data |

---

## Troubleshooting

### Ports Already in Use

If you get "Port already in use" errors:

**macOS/Linux:**
```bash
# Kill process on port 2025
lsof -ti:2025 | xargs kill -9

# Kill process on port 2026
lsof -ti:2026 | xargs kill -9
```

**Windows (PowerShell):**
```powershell
# Kill process on port 2025
taskkill /PID $(netstat -ano | findstr :2025 | awk '{print $5}') /F

# Or use netstat to find PID first
netstat -ano | findstr :2025
taskkill /PID <PID> /F
```

### Frontend Can't Connect to Backend

1. Check that backend is running on port 2025:
   ```bash
   curl http://localhost:2025/api/v1/health
   ```

2. Verify `.env` file has correct `NEXT_PUBLIC_API_URL`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:2025/api/v1
   ```

3. Restart both services:
   ```bash
   npm start
   ```

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `.env` or backend `.env`
3. Run migrations:
   ```bash
   npm run migrate
   ```

---

## Environment Variables Reference

### Root `.env` file:
```env
# Backend Configuration
PORT=2025
NODE_ENV=development

# Frontend
FRONTEND_PORT=2026

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/raghhav_roadways

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:2026

# API URLs
BACKEND_URL=http://localhost:2025
NEXT_PUBLIC_API_URL=http://localhost:2025/api/v1
```

---

## Project Structure

```
raghhav-roadways/
├── backend/              # Express.js API Server
│   ├── src/
│   ├── package.json
│   └── .env
├── frontend/             # Next.js Web Application
│   ├── src/
│   ├── package.json
│   └── .env.local
├── start-all.sh          # macOS/Linux startup script
├── start-all.bat         # Windows startup script
├── .env                  # Root configuration
├── package.json          # Root scripts
└── STARTUP_GUIDE.md      # This file
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser: http://localhost:2026 (Next.js Frontend)  │
├─────────────────────────────────────────────────────┤
│                    HTTP/REST                         │
├─────────────────────────────────────────────────────┤
│  Backend API: http://localhost:2025 (Express.js)    │
├─────────────────────────────────────────────────────┤
│              Database (PostgreSQL)                   │
└─────────────────────────────────────────────────────┘
```

---

## Monitoring & Logs

### View Backend Logs:
```bash
cd backend
npm run dev
# Logs will display in terminal
```

### View Frontend Logs:
```bash
cd frontend
npm run dev
# Logs will display in terminal
```

Both services output logs to console when started with development commands.

---

## Production Deployment

### Build for Production:
```bash
npm run build
```

This creates:
- Backend: Optimized Node.js application
- Frontend: Next.js production build

### Start Production Services:
```bash
cd backend
npm start

# In another terminal:
cd frontend
npm start
```

---

## Security Notes

⚠️ **Important for Production:**

1. Change `JWT_SECRET` in `.env`
2. Set `NODE_ENV=production`
3. Use environment-specific `.env` files
4. Enable HTTPS in production
5. Update `CORS_ORIGIN` to your production domain
6. Store sensitive keys in secure secret management

---

## Support & Help

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review `.env` configuration
3. Check that ports 2025 and 2026 are available
4. Ensure all dependencies are installed (`npm run install:all`)
5. Verify database connection and migrations

---

**Startup Guide Version:** 1.0
**Last Updated:** 2026-02-12
**Status:** ✅ Production Ready
