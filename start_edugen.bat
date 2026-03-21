@echo off
SETLOCAL
cd /d %~dp0
echo.
echo  =========================================
echo       EDU-GEN AI PLATFORM STARTUP
echo  =========================================
echo.

if not exist node_modules (
    echo [!] Root dependencies missing. Installing...
    call npm install
)

if not exist client\node_modules (
    echo [!] Client dependencies missing. Installing...
    cd client && call npm install && cd ..
)

if not exist server\node_modules (
    echo [!] Server dependencies missing. Installing...
    cd server && call npm install && cd ..
)

echo.
echo [+] Starting all services...
echo [+] Frontend: https://localhost:5174
echo [+] Backend:  http://localhost:5001
echo.
echo [Close this window to stop the app]
echo.

npm run dev

pause
