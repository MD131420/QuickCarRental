@echo off
title QuickCarRental Backend
color 0B
echo.
echo  ============================================
echo   QuickCarRental Backend Server
echo  ============================================
echo.
echo  Server starting... (first load may take ~20 seconds)
echo  Press Ctrl+C to stop the server.
echo.

cd /d "%~dp0BACKEND"
java -jar "target\quickcarrental-1.0.0.jar"

echo.
echo  Server stopped.
echo  Press any key to close this window.
pause >nul
