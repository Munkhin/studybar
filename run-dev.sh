#!/bin/bash

# --- Configuration ---
BACKEND_DIR="studybar"
BACKEND_APP="studybar.api.main:app"
BACKEND_PORT=5000

FRONTEND_DIR="ui"
FRONTEND_PORT=8080

# --- Run backend ---
echo "🧠 Starting FastAPI backend on port $BACKEND_PORT..."
uvicorn $BACKEND_APP --host 0.0.0.0 --port $BACKEND_PORT --reload &
BACKEND_PID=$!

# --- Run frontend ---
cd "$FRONTEND_DIR"
echo "💻 Starting frontend on port $FRONTEND_PORT..."
npm run dev &
FRONTEND_PID=$!

# --- Wait for user to stop ---
echo ""
echo "✅ Both servers are running!"
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Backend:  http://127.0.0.1:$BACKEND_PORT"
echo ""
echo "Press [CTRL+C] to stop both."

# Trap CTRL+C to kill both processes
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT

wait
