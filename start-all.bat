@echo off
REM RAGHHAV ROADWAYS - Unified Startup Script (Windows)
REM Starts both Backend (Port 2025) and Frontend (Port 2026)

setlocal enabledelayedexpansion

title RAGHHAV ROADWAYS - Unified Startup

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║         RAGHHAV ROADWAYS - UNIFIED STARTUP             ║
echo ║         Backend: Port 2025 ^| Frontend: Port 2026       ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if .env exists
if not exist .env (
  echo ✗ .env file not found
  pause
  exit /b 1
)

echo ✓ Environment configuration found

REM Check if directories exist
if not exist backend (
  echo ✗ Backend directory not found
  pause
  exit /b 1
)

if not exist frontend (
  echo ✗ Frontend directory not found
  pause
  exit /b 1
)

echo ✓ Project structure verified

REM Start Backend
echo.
echo Starting Backend on Port 2025...
cd backend
start "RAGHHAV Backend (Port 2025)" cmd /k npm run dev
cd ..

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start Frontend
echo Starting Frontend on Port 2026...
cd frontend
start "RAGHHAV Frontend (Port 2026)" cmd /k set PORT=2026 && npm run dev
cd ..

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║              SERVICES ARE RUNNING                      ║
echo ╠════════════════════════════════════════════════════════╣
echo ║ 🌐 Frontend (Next.js):  http://localhost:2026          ║
echo ║ 🔌 Backend (API):       http://localhost:2025          ║
echo ║ 📚 API Docs:            http://localhost:2025/api-docs ║
echo ╠════════════════════════════════════════════════════════╣
echo ║ Close this window and the service windows to stop      ║
echo ╚════════════════════════════════════════════════════════╝
echo.

pause
