@echo off
echo ============================================================
echo  e-SAKSHI 2.0 Sentinel - SIH 2026 PS 26102 - Setup Script
echo ============================================================
echo.

:: ── BACKEND SETUP ────────────────────────────────────────────
echo [1/4] Installing Python backend dependencies...
pip install -r backend\requirements.txt
if errorlevel 1 (
    echo ERROR: pip install failed. Ensure Python 3.10+ is installed.
    pause
    exit /b 1
)

echo.
echo [2/4] Generating synthetic seed dataset...
python backend\data\seed_dataset.py
if errorlevel 1 (
    echo ERROR: Seed dataset generation failed.
    pause
    exit /b 1
)

:: ── FRONTEND SETUP ───────────────────────────────────────────
echo.
echo [3/4] Installing Node.js frontend dependencies...
cd frontend
npm install
if errorlevel 1 (
    echo ERROR: npm install failed. Ensure Node.js 18+ is installed.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================================
echo  Setup complete!
echo ============================================================
echo.
echo  To start the system:
echo.
echo  TERMINAL 1 - Backend (FastAPI):
echo    cd backend
echo    uvicorn app.main:app --reload --port 8000
echo.
echo  TERMINAL 2 - Frontend (Next.js):
echo    cd frontend
echo    npm run dev
echo.
echo  Then open: http://localhost:3000
echo.
echo  API Docs:  http://localhost:8000/docs
echo ============================================================
pause
