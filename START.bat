@echo off
title QuickCarRental - Startup
color 0A
echo.
echo  ============================================
echo   QuickCarRental - Project Launcher
echo  ============================================
echo.

:: ---- Set project paths ----
set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%BACKEND"
set "FRONTEND_DIR=%PROJECT_DIR%FRONTEND"
set "STATIC_DIR=%BACKEND_DIR%\src\main\resources\static"
set "JAR_FILE=%BACKEND_DIR%\target\quickcarrental-1.0.0.jar"

:: ---- Check that Java is available (just needs to be in PATH) ----
where java.exe >nul 2>&1
if %errorlevel% neq 0 goto :no_java
echo [OK] Java found in PATH.

:: ---- MySQL reminder ----
echo.
echo  [!] MySQL must be running. Default password: 1234
echo      If yours is different, edit before continuing:
echo      BACKEND\src\main\resources\application.properties
echo      (line: spring.datasource.password=1234)
echo.
echo  Press any key to continue, or close this window to cancel...
pause >nul
echo.

:: ---- Check if port 8080 is already in use ----
netstat -ano 2>nul | findstr ":8080 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [!] Port 8080 already in use. Opening the app...
    goto :open_browser
)

:: ---- Copy frontend into Spring Boot static resources ----
echo [1/3] Copying frontend files...
if exist "%STATIC_DIR%" rmdir /s /q "%STATIC_DIR%"
mkdir "%STATIC_DIR%"
xcopy "%FRONTEND_DIR%\*" "%STATIC_DIR%\" /s /e /q /y >nul
echo [OK] Frontend files copied.
echo.

:: ---- Check for pre-built JAR (included in the repository) ----
if exist "%JAR_FILE%" (
    echo [OK] Pre-built JAR found. Skipping build step.
    echo.
    goto :start_server
)

:: ---- JAR missing: need to build with Maven ----
echo [!] Pre-built JAR not found. Building from source...
echo     (This requires JAVA_HOME and downloads Maven dependencies)
echo     (May take several minutes on first run)
echo.

call :find_java_home
if "%JAVA_HOME%"=="" goto :java_home_fail

echo [OK] JAVA_HOME: %JAVA_HOME%
echo.
echo [2/3] Building backend...
cd /d "%BACKEND_DIR%"
call mvnw.cmd package -DskipTests -q
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Check the output above.
    pause
    exit /b 1
)
if not exist "%JAR_FILE%" (
    echo [ERROR] Build finished but JAR was not created.
    pause
    exit /b 1
)
echo [OK] Build complete.
echo.

:: ---- Start the backend server ----
:start_server
echo [2/3] Starting server on http://localhost:8080 ...
echo.
start "QuickCarRental Backend" "%PROJECT_DIR%_run_server.bat"

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

:: ---- Open browser ----
:open_browser
echo.
echo [3/3] Opening application in browser...
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
goto :eof

:: ================================================================
:: Error handlers
:: ================================================================

:no_java
echo.
echo [ERROR] Java not found in PATH!
echo.
echo  Please install Java 17+ from: https://adoptium.net/
echo  During installation, tick "Add to PATH".
echo  Then close and reopen this window, and run START.bat again.
echo.
pause
exit /b 1

:java_home_fail
echo.
echo [ERROR] Cannot set JAVA_HOME - needed to build from source.
echo.
echo  The pre-built JAR is missing from the BACKEND\target\ folder.
echo.
echo  To fix (choose one):
echo   A) Download the project again from GitHub - the JAR is included.
echo   B) Set JAVA_HOME manually, e.g.:
echo         set "JAVA_HOME=C:\Program Files\Java\jdk-17"
echo      then run START.bat again.
echo.
pause
exit /b 1

:: ================================================================
:: Subroutine: find and set JAVA_HOME without nested if-blocks
:: (nested if-blocks break when JAVA_HOME path has parentheses)
:: ================================================================
:find_java_home

:: Remove any embedded quotes from JAVA_HOME first
if defined JAVA_HOME set "JAVA_HOME=%JAVA_HOME:"=%"

:: If JAVA_HOME is already set, check it is valid
if not defined JAVA_HOME goto :fj_try_where
if not exist "%JAVA_HOME%\bin\java.exe" goto :fj_try_where
goto :eof

:fj_try_where
:: Get full path of java.exe from PATH
for /f "tokens=* delims=" %%i in ('where java.exe') do (
    set "_JAVA_EXE=%%i"
    goto :fj_got_path
)
goto :fj_not_found

:fj_got_path
:: Java always lives at <JAVA_HOME>\bin\java.exe — strip the suffix
set "JAVA_HOME=%_JAVA_EXE:\bin\java.exe=%"
if exist "%JAVA_HOME%\bin\java.exe" goto :eof

:fj_not_found
set "JAVA_HOME="
goto :eof
