@echo off
title QuickCarRental - Stop
color 0C
echo.
echo  ============================================
echo   QuickCarRental - Stopping server
echo  ============================================
echo.

:: Find and kill process on port 8080
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8080 " ^| findstr "LISTENING"') do (
    echo Stopping process PID: %%a on port 8080...
    taskkill /PID %%a /F >nul 2>&1
    echo [OK] Server stopped.
    goto :done
)

echo [!] No server found running on port 8080.

:done
echo.
pause
