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
set "LOCAL_JDK=%PROJECT_DIR%.jdk"
set "QCR_DIR=%PROJECT_DIR%"

:: ================================================================
:: Find Java 17+
::   1) .jdk\ in project folder (previously downloaded)
::   2) System Java if it is version 17+
::   3) Auto-download portable Java 17 JRE into .jdk\
:: ================================================================

:: --- Option 1: local project JDK ---
if exist "%LOCAL_JDK%\bin\java.exe" (
    set "PATH=%LOCAL_JDK%\bin;%PATH%"
    echo [OK] Using local project Java.
    goto :java_ready
)

:: --- Option 2: system Java - check version ---
where java.exe >nul 2>&1
if %errorlevel%==0 (
    set "JAVA_MAJOR=0"
    call :get_java_major
    if %JAVA_MAJOR% GEQ 17 (
        echo [OK] System Java %JAVA_MAJOR% found.
        goto :java_ready
    )
    echo [!] Java %JAVA_MAJOR% is installed but Java 17+ is required.
) else (
    echo [!] Java not found in PATH.
)

:: --- Option 3: download portable Java 17 JRE ---
echo.
echo  Java 17 will now be downloaded for this project only (~85 MB^).
echo  It will NOT be installed system-wide - saved only in the project folder.
echo.
echo  Press any key to download, or Ctrl+C to cancel...
pause >nul
echo.

call :download_java17

if exist "%LOCAL_JDK%\bin\java.exe" (
    set "PATH=%LOCAL_JDK%\bin;%PATH%"
    echo [OK] Java 17 is ready.
    goto :java_ready
)

echo.
echo [ERROR] Java 17 download failed.
echo  Please install it manually from: https://adoptium.net/
echo.
pause
exit /b 1

:java_ready

:: ================================================================
:: Checks + setup
:: ================================================================

echo.
echo  [!] MySQL must be running.  Default password: 1234
echo      If yours is different, edit before continuing:
echo      BACKEND\src\main\resources\application.properties
echo.
echo  Press any key to continue, or close this window to cancel...
pause >nul
echo.

:: Check if port 8080 is already in use
netstat -ano 2>nul | findstr ":8080 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [!] Port 8080 already in use. Opening app...
    goto :open_browser
)

:: Copy frontend into Spring Boot static resources
echo [1/3] Copying frontend files...
if exist "%STATIC_DIR%" rmdir /s /q "%STATIC_DIR%"
mkdir "%STATIC_DIR%"
xcopy "%FRONTEND_DIR%\*" "%STATIC_DIR%\" /s /e /q /y >nul
echo [OK] Frontend files copied.
echo.

:: Check for pre-built JAR (included in the repository)
if exist "%JAR_FILE%" (
    echo [OK] Pre-built JAR found. Skipping build.
    echo.
    goto :start_server
)

:: JAR missing - build from source
echo [!] JAR not found. Building from source...
echo     (first run downloads Maven dependencies - may take several minutes)
echo.
call :find_java_home_for_maven
if "%JAVA_HOME%"=="" goto :java_home_fail
echo [OK] JAVA_HOME: %JAVA_HOME%
cd /d "%BACKEND_DIR%"
call mvnw.cmd package -DskipTests -q
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Check the output above.
    pause
    exit /b 1
)
if not exist "%JAR_FILE%" (
    echo [ERROR] Build finished but JAR not found.
    pause
    exit /b 1
)
echo [OK] Build complete.
echo.

:: ================================================================
:: Start server + open browser
:: ================================================================
:start_server
echo [2/3] Starting server on http://localhost:8080 ...
start "QuickCarRental Backend" "%PROJECT_DIR%_run_server.bat"

echo      Waiting for server to start (may take ~30 seconds)...
set /a ATTEMPTS=0
:wait_loop
set /a ATTEMPTS+=1
if %ATTEMPTS% gtr 60 (
    echo.
    echo [ERROR] Server did not start within 3 minutes.
    echo         Check the Backend window for error details.
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
:: Error labels
:: ================================================================
:java_home_fail
echo.
echo [ERROR] Cannot determine JAVA_HOME for the Maven build.
echo  Set JAVA_HOME manually and retry, e.g.:
echo    set "JAVA_HOME=C:\Program Files\Java\jdk-17"
echo.
pause
exit /b 1

:: ================================================================
:: Subroutine: parse major Java version into JAVA_MAJOR
:: ================================================================
:get_java_major
for /f "tokens=3 delims= " %%v in ('java -version 2^>^&1 ^| findstr version') do (
    set "_VER_STR=%%~v"
    goto :gjm_parse
)
goto :eof
:gjm_parse
for /f "tokens=1 delims=." %%m in ("%_VER_STR%") do set "JAVA_MAJOR=%%m"
:: Java 8 and older report "1.x.y" - major token is "1", treat as 8
if "%JAVA_MAJOR%"=="1" set "JAVA_MAJOR=8"
goto :eof

:: ================================================================
:: Subroutine: download Eclipse Temurin JRE 17 into .jdk\
:: ================================================================
:download_java17
:: Detect OS architecture (handle 32-bit cmd on 64-bit Windows)
set "_ARCH=x64"
if "%PROCESSOR_ARCHITECTURE%"=="x86" (
    if "%PROCESSOR_ARCHITEW6432%"=="" set "_ARCH=x32"
)
:: Run PowerShell download + extract (uses env vars to avoid path encoding issues)
powershell -NoProfile -ExecutionPolicy Bypass -Command "$d=$env:QCR_DIR; $arch=$env:_ARCH; $zip=[IO.Path]::Combine($d,'.jdk_dl.zip'); $ext=[IO.Path]::Combine($d,'.jdk_ext'); $dst=[IO.Path]::Combine($d,'.jdk'); $url='https://api.adoptium.net/v3/binary/latest/17/ga/windows/'+$arch+'/jre/hotspot/normal/eclipse'; try { Write-Host '  Connecting to adoptium.net...'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile($url,$zip); Write-Host '  Extracting...'; if(Test-Path $dst){Remove-Item $dst -Recurse -Force -EA 0}; Expand-Archive $zip $ext -Force; $src=(Get-ChildItem $ext -Directory | Select-Object -First 1).FullName; Move-Item $src $dst -Force; Remove-Item $zip -Force -EA 0; Remove-Item $ext -Recurse -Force -EA 0; Write-Host '  Done.' } catch { Write-Host ('  Download failed: '+$_.Exception.Message) }"
goto :eof

:: ================================================================
:: Subroutine: set JAVA_HOME for Maven (avoids nested if-blocks
:: which break when path contains parentheses like "(x86)")
:: ================================================================
:find_java_home_for_maven
if defined JAVA_HOME set "JAVA_HOME=%JAVA_HOME:"=%"
if not defined JAVA_HOME goto :fjhfm_where
if not exist "%JAVA_HOME%\bin\java.exe" goto :fjhfm_where
goto :eof
:fjhfm_where
for /f "tokens=* delims=" %%i in ('where java.exe') do (
    set "_JE=%%i"
    goto :fjhfm_got
)
goto :fjhfm_fail
:fjhfm_got
set "JAVA_HOME=%_JE:\bin\java.exe=%"
if exist "%JAVA_HOME%\bin\java.exe" goto :eof
:fjhfm_fail
set "JAVA_HOME="
goto :eof
