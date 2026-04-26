#!/bin/bash

# RAGHHAV ROADWAYS - One Command Startup
# Installs deps, generates Prisma client, and starts both servers

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cleanup() {
  echo -e "\n${YELLOW}Shutting down services...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║       RAGHHAV ROADWAYS - UNIFIED STARTUP        ║"
echo "║     Frontend: Port 2025 | Backend: Port 2026    ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verify directories
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
  echo -e "${RED}Error: Run this from the project root directory${NC}"
  exit 1
fi

# ─── Install Dependencies ───
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend && npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate --schema=prisma/schema.prisma 2>&1 | tail -1
echo -e "${GREEN}✓ Prisma client generated${NC}"
cd ..

echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd frontend && npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

# ─── Check & Free Ports ───
free_port() {
  local PORT=$1
  local PIDS=$(lsof -ti :$PORT 2>/dev/null)
  if [ -n "$PIDS" ]; then
    echo -e "${YELLOW}Port $PORT in use — killing stale processes...${NC}"
    echo "$PIDS" | xargs kill -9 2>/dev/null
    sleep 1
    echo -e "${GREEN}✓ Port $PORT freed${NC}"
  fi
}

free_port 2025
free_port 2026

echo -e "${GREEN}✓ Ports 2025 and 2026 available${NC}"

# ─── Start Backend (port 2026) ───
echo -e "\n${BLUE}Starting Backend on port 2026...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

# ─── Start Frontend (port 2025) ───
echo -e "${BLUE}Starting Frontend on port 2025...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 2

# ─── Display URLs ───
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║            ALL SERVICES RUNNING                 ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                 ║"
echo "║  Frontend:  http://localhost:2025                ║"
echo "║  Backend:   http://localhost:2026/api/v1         ║"
echo "║  Health:    http://localhost:2026/api/v1/health  ║"
echo "║                                                 ║"
echo "║  Press Ctrl+C to stop all services              ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

wait $BACKEND_PID $FRONTEND_PID
