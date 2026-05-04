@echo off
cd /d "%~dp0app"

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js not found. Please install it from https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo Starting Anexo C Editor...
echo Open http://localhost:5173 in your browser.
echo Press Ctrl+C to stop.
npm run dev
