@echo off
setlocal EnableDelayedExpansion

echo ======================================================
echo   🌿 Organic Arusuvai (OA) - Startup & Setup
echo   Drive: %~d0 (Target: F:)
echo ======================================================
echo.

:: 1. Check for Administrative Privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] This script NEEDS Administrator privileges to:
    echo     1. Update the 'hosts' file for organicarusuvai.local
    echo     2. Ensure Docker runs correctly
    echo.
    echo Please right-click run.bat and select 'Run as administrator'.
    pause
    exit /b
)

:: 2. Setup Local Domain (organicarusuvai.local)
echo [1/3] Setting up local domain: organicarusuvai.local...
set "HOSTS_FILE=%SystemRoot%\System32\drivers\etc\hosts"
set "DOMAIN=127.0.0.1 organicarusuvai.local"

findstr /L /C:"!DOMAIN!" "%HOSTS_FILE%" >nul
if %errorLevel% neq 0 (
    echo     Adding domain to hosts file...
    echo. >> "%HOSTS_FILE%"
    echo !DOMAIN! >> "%HOSTS_FILE%"
    echo [OK] Domain added successfully.
) else (
    echo [OK] Domain already exists in hosts file.
)

:: 3. Check for Docker
echo.
echo [2/3] Checking for Docker...
where docker >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Docker found.
    echo.
    echo [3/3] Starting Docker containers...
    docker-compose up -d --build
    if %errorLevel% == 0 (
        echo [OK] Site is starting up!
        echo.
        echo Opening http://organicarusuvai.local in your browser...
        start http://organicarusuvai.local
    ) else (
        echo [!] Error: docker-compose failed. Make sure Docker Desktop is RUNNING.
    )
) else (
    echo [!] Docker not found. 
    echo     Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    echo.
    echo Opening standalone preview.html instead...
    start "" "preview.html"
)

echo.
echo ======================================================
echo   🤖 ANTIGRAVITY HANDOVER
echo ======================================================
echo To continue development from here:
echo 1. Open your Antigravity Agent.
echo 2. Click "Open Folder" or "Add Project".
echo 3. Select this folder: %~dp0
echo 4. Say: "I've migrated this project to F: drive. Read MIGRATION_GUIDE.md first."
echo ======================================================
echo.
echo Setup Complete. Press any key to exit.
pause >nul
