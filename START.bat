@echo off
title QuickCarRental - Startup
color 0A
echo.
echo  ============================================
echo   QuickCarRental - Project Launcher
echo  ============================================
echo.

:: ---- Find Java ----
if not "%JAVA_HOME%"=="" (
    if exist "%JAVA_HOME%\bin\java.exe" (
        echo [OK] JAVA_HOME = %JAVA_HOME%
        goto :java_found
    )
)

:: Auto-detect Java from PATH
where java.exe >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('where java.exe') do (
        set "JAVA_EXE=%%i"
        goto :got_java_exe
    )
)
goto :no_java

:got_java_exe
for %%A in ("%JAVA_EXE%") do set "JAVA_BIN=%%~dpA"
set "JAVA_BIN=%JAVA_BIN:~0,-1%"
for %%A in ("%JAVA_BIN%") do set "JAVA_HOME=%%~dpA"
set "JAVA_HOME=%JAVA_HOME:~0,-1%"

if exist "%JAVA_HOME%\bin\java.exe" (
    echo [OK] Auto-detected JAVA_HOME = %JAVA_HOME%
    goto :java_found
)

:no_java
echo [ERROR] Java not found! Install Java 17+ and add it to PATH.
echo         Download: https://adoptium.net/
pause
exit /b 1

:java_found

:: ---- Set project paths ----
set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%BACKEND"
set "FRONTEND_DIR=%PROJECT_DIR%FRONTEND"
set "STATIC_DIR=%BACKEND_DIR%\src\main\resources\static"

:: ---- Check if backend is already running ----
netstat -ano 2>nul | findstr ":8080 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo.
    echo [!] Port 8080 is already in use. Backend may already be running.
    echo     Opening frontend at http://localhost:8080
    goto :start_frontend
)

:: ---- Copy frontend to Spring Boot static resources ----
echo [1/4] Copying frontend files to backend static resources...
if exist "%STATIC_DIR%" rmdir /s /q "%STATIC_DIR%"
mkdir "%STATIC_DIR%"
xcopy "%FRONTEND_DIR%\*" "%STATIC_DIR%\" /s /e /q /y >nul
echo [OK] Frontend files copied.
echo.

:: ---- Build backend ----
echo [2/4] Building backend (first run downloads dependencies - may take a few minutes)...
echo.

cd /d "%BACKEND_DIR%"

call mvnw.cmd package -DskipTests -q
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend build failed! Check the output above for errors.
    pause
    exit /b 1
)

echo [OK] Backend built successfully.
echo.
echo [3/4] Starting Spring Boot server on http://localhost:8080 ...
echo.

:: Start backend in a new window using the built jar directly
start "QuickCarRental Backend" cmd /k "cd /d %BACKEND_DIR% && title QuickCarRental Backend && color 0B && echo Starting server... && "%JAVA_HOME%\bin\java.exe" -jar target\quickcarrental-1.0.0.jar"

:: Wait for backend to be ready
echo      Waiting for backend to start...
set /a ATTEMPTS=0
:wait_loop
set /a ATTEMPTS+=1
if %ATTEMPTS% gtr 60 (
    echo [ERROR] Backend did not start within 60 seconds.
    pause
    exit /b 1
)
timeout /t 3 /nobreak >nul
curl -s -o nul -w "" http://localhost:8080/api/cars >nul 2>&1
if %errorlevel% neq 0 (
    echo      Still starting... %ATTEMPTS%/60
    goto :wait_loop
)

echo [OK] Backend is running!

:start_frontend
echo.
echo [4/4] Opening application in browser...
echo.

:: Open via localhost (served by Spring Boot)
start "" "http://localhost:8080"

echo  ============================================
echo   QuickCarRental is running!
echo  ============================================
echo.
echo   Application:  http://localhost:8080
echo   API:          http://localhost:8080/api
echo   Admin panel:  http://localhost:8080/admin.html
echo                  (password: admin123)
echo.
echo   To stop: close the "QuickCarRental Backend"
echo   window or run STOP.bat
echo  ============================================
echo.
pause
