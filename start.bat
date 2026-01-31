@echo off

echo =========================================
echo    Simple Pixel - Quick Start
echo =========================================
echo.

docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo [OK] Docker is installed and running
echo.

if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env >nul
    echo [OK] .env file created
) else (
    echo [OK] .env file already exists
)
echo.

echo Building Docker image...
docker compose build
if errorlevel 1 (
    echo Error: Build failed
    pause
    exit /b 1
)
echo [OK] Build complete
echo.

echo Starting Simple Pixel...
docker compose up -d
if errorlevel 1 (
    echo Error: Failed to start containers
    pause
    exit /b 1
)
echo [OK] Simple Pixel is running
echo.

echo Waiting for application to be ready...
timeout /t 5 /nobreak >nul

docker compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo Warning: Container may not be healthy
    echo Check logs with: docker compose logs
) else (
    echo [OK] Container is running
)

echo.
echo =========================================
echo    Simple Pixel is ready!
echo =========================================
echo.
echo Access the application at:
echo   http://localhost:3000
echo.
echo To create your first pixel, visit:
echo   http://localhost:3000/create-pixel
echo.
echo Useful commands:
echo   docker compose logs -f    # View logs
echo   docker compose stop       # Stop the application
echo   docker compose down       # Stop and remove containers
echo   docker compose restart    # Restart the application
echo.
pause
