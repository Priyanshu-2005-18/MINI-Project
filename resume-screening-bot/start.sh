#!/bin/bash
# Quick Start Script for Resume Screening Bot on macOS/Linux

echo "===================================="
echo "Resume Screening Bot - Quick Start"
echo "===================================="
echo ""

echo "Starting Backend Server..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 3

echo "Starting Frontend Server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "===================================="
echo "Servers Starting Up..."
echo "===================================="
echo "Backend API: http://localhost:8000"
echo "Backend Docs: http://localhost:8000/docs"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

wait
