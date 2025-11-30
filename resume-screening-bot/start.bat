@echo off
REM Quick Start Script for Resume Screening Bot on Windows

echo ====================================
echo Resume Screening Bot - Quick Start
echo ====================================
echo.

echo Starting Backend Server...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3

echo Starting Frontend Server...
start cmd /k "cd frontend && npm start"

echo.
echo ====================================
echo Servers Starting Up...
echo ====================================
echo Backend API: http://localhost:8000
echo Backend Docs: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo Waiting for servers to initialize...
timeout /t 5

start http://localhost:3000

echo Setup complete!
