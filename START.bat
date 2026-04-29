@echo off
title QuickCarRental - Startup
color 0A
echo.
echo  ============================================
echo   QuickCarRental - Project Launcher
echo  ============================================
echo.

:: ---- Find Java and set JAVA_HOME ----

:: 1) Use existing JAVA_HOME if it is already valid
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\java.exe" (
        echo [OK] JAVA_HOME already set: %JAVA_HOME%
        goto :java_found
    )
)

:: 2) Look for java.exe anywhere in PATH
where java.exe >nul 2>&1
if %errorlevel% neq 0 goto :no_java

:: Get the path of the first java.exe found
for /f "tokens=* delims=" %%i in ('where java.exe') do (
    set "JAVA_EXE=%%i"
    goto :got_java
)

:got_java
:: Java always lives at  <JAVA_HOME>\bin\java.exe
:: Remove the \bin\java.exe suffix to get JAVA_HOME
set "JAVA_HOME=%JAVA_EXE:\bin\java.exe=%"

if exist "%JAVA_HOME%\bin\java.exe" (
    echo [OK] Java found:   %JAVA_EXE%
    echo [OK] JAVA_HOME set: %JAVA_HOME%
    goto :java_found
)

:no_java
echo.
echo [ERROR] Java not found!
echo.
echo  Please install Java 17+ from: https://adoptium.net/
echo  During installation tick "Add to PATH".
echo  Then close this window, open a NEW cmd window, and run START.bat again.
echo.
pause
exit /b 1

:java_found

:: ---- MySQL reminder ----
echo.
echo  [!] Make sure MySQL is running before continuing.
echo      Default DB password in this project: 1234
echo.
echo      If YOUR MySQL password is different, edit:
echo      BACKEND\src\main\resources\application.properties
echo      (change the line:  spring.datasource.password=1234)
echo.
echo  Press any key to continue, or close this window to cancel...
pause >nul
echo.

:: ---- Set project paths ----
set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%BACKEND"
set "FRONTEND_DIR=%PROJECT_DIR%FRONTEND"
set "STATIC_DIR=%BACKEND_DIR%\src\main\resources\static"

:: ---- Check if port 8080 is already in use ----
netstat -ano 2>nul | findstr ":8080 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [!] Port 8080 already in use. Opening the app...
    goto :open_browser
)

:: ---- Copy frontend into Spring Boot static resources ----
echo [1/4] Copying frontend files...
if exist "%STATIC_DIR%" rmdir /s /q "%STATIC_DIR%"
mkdir "%STATIC_DIR%"
xcopy "%FRONTEND_DIR%\*" "%STATIC_DIR%\" /s /e /q /y >nul
echo [OK] Frontend files copied.
echo.

:: ---- Build backend with Maven ----
echo [2/4] Building backend (first run downloads dependencies - may take a few minutes)...
echo.
cd /d "%BACKEND_DIR%"
call mvnw.cmd package -DskipTests -q
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Check the output above for errors.
    echo         Common causes:
    echo           - Wrong Java version ^(need Java 17+^)
    echo           - No internet connection on first run
    echo           - MySQL not running
    echo.
    pause
    exit /b 1
)
echo [OK] Build complete.
echo.

:: ---- Start backend in a new window ----
echo [3/4] Starting server on http://localhost:8080 ...
echo.
start "QuickCarRental Backend" "%PROJECT_DIR%_run_server.bat"

:: ---- Wait for backend to respond ----
echo      Waiting for server to start (may take ~30 seconds)...
set /a ATTEMPTS=0
:wait_loop
set /a ATTEMPTS+=1
if %ATTEMPTS% gtr 60 (
    echo.
    echo [ERROR] Server did not start within 3 minutes.
    echo         Check the Backend window for error messages.
    echo         Most likely cause: wrong MySQL password in application.properties
    echo.
    pause
    exit /b 1
)
timeout /t 3 /nobreak >nul
curl -s -o nul http://localhost:8080/api/cars >nul 2>&1
if %errorlevel% neq 0 (
    echo      Still starting... (%ATTEMPTS%/60^)
    goto :wait_loop
)
echo [OK] Server is running!

:open_browser
echo.
echo [4/4] Opening application in browser...
start "" "http://localhost:8080"

echo.
echo  ============================================
echo   QuickCarRental is running!
echo  ============================================
echo.
echo   Application:  http://localhost:8080
echo   Admin panel:  http://localhost:8080/admin.html
echo                  (password: admin123)
echo.
echo   To stop: close the "QuickCarRental Backend" window
echo            or run STOP.bat
echo  ============================================
echo.
pause
