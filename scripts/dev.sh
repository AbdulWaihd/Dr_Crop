#!/usr/bin/env bash
# Start both frontend and backend for local development.
# Usage: ./scripts/dev.sh

set -e

echo "🌿 Starting Dr. Crop dev environment..."

# Backend
echo "→ Starting backend on :8000"
(cd backend && uvicorn app.main:app --reload --port 8000) &
BACKEND_PID=$!

# Frontend
echo "→ Starting frontend on :3000"
(cd frontend && npm run dev) &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
