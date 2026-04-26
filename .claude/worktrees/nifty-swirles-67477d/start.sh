#!/bin/bash

echo "🚀 Starting Raghhav Roadways Application..."
echo ""

# Kill any existing processes on ports 3000 and 5000
echo "📋 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
sleep 2

# Start backend
echo "🔧 Starting Backend Server on port 5000..."
cd backend && npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend started with PID: $BACKEND_PID"

# Wait for backend to start
sleep 5

# Start frontend
echo "🎨 Starting Frontend Server on port 3000..."
cd ../frontend && npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend started with PID: $FRONTEND_PID"

echo ""
echo "✅ Application is starting up..."
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "📝 Logs are available at:"
echo "   Backend:  logs/backend.log"
echo "   Frontend: logs/frontend.log"
echo ""
echo "⏸️  Press Ctrl+C to stop all servers"
echo ""

# Wait for user to press Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Keep script running
tail -f logs/frontend.log
