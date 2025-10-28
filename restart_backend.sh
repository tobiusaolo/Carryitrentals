#!/bin/bash

echo "🔄 Restarting Backend Server..."
echo ""

# Kill any processes on port 8000
echo "1️⃣ Stopping processes on port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
pkill -9 -f "uvicorn.*8000" 2>/dev/null
sleep 2

# Verify port is free
if lsof -i:8000 > /dev/null 2>&1; then
    echo "⚠️  Warning: Port 8000 still in use. Trying force kill..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Check if port is now free
if lsof -i:8000 > /dev/null 2>&1; then
    echo "❌ Error: Could not free port 8000"
    echo "   Please manually kill the process using:"
    echo "   lsof -ti:8000 | xargs kill -9"
    exit 1
else
    echo "✅ Port 8000 is free"
fi

echo ""
echo "2️⃣ Starting backend server..."
echo ""

# Navigate to backend directory and start server
cd "$(dirname "$0")/backend"

# Check if venv exists
if [ -d "venv" ]; then
    echo "📦 Using virtual environment..."
    source venv/bin/activate
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "📦 Using system Python..."
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
fi

