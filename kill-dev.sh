#!/bin/bash

# --- Configuration (matches run-dev.sh) ---
BACKEND_PORT=5000
FRONTEND_PORT=8080

echo "🛑 Stopping development servers..."

# --- Kill backend (uvicorn on port 5000) ---
echo "Stopping FastAPI backend on port $BACKEND_PORT..."
lsof -ti:$BACKEND_PORT | xargs -r kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend stopped"
else
    echo "ℹ️  No backend process found on port $BACKEND_PORT"
fi

# --- Kill frontend (npm/node on port 8080) ---
echo "Stopping frontend on port $FRONTEND_PORT..."
lsof -ti:$FRONTEND_PORT | xargs -r kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend stopped"
else
    echo "ℹ️  No frontend process found on port $FRONTEND_PORT"
fi

echo ""
echo "✅ Server shutdown complete!"
