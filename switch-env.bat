@echo off
REM ================================================
REM SMS Expert - Environment Switcher for Windows
REM ================================================

echo.
echo ========================================
echo    SMS Expert - Environment Switcher
echo ========================================
echo.
echo Select environment:
echo   1. Local (local development server)
echo   2. Development (dev server)
echo   3. Production (production server)
echo.

set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Switching to LOCAL environment...
    copy /Y .env.local .env
    echo Done! Using LOCAL environment.
    echo API URL: Check .env.local for details
) else if "%choice%"=="2" (
    echo.
    echo Switching to DEVELOPMENT environment...
    copy /Y .env.development .env
    echo Done! Using DEVELOPMENT environment.
    echo API URL: Check .env.development for details
) else if "%choice%"=="3" (
    echo.
    echo Switching to PRODUCTION environment...
    copy /Y .env.production .env
    echo Done! Using PRODUCTION environment.
    echo API URL: Check .env.production for details
) else (
    echo.
    echo Invalid choice. Please run again and select 1, 2, or 3.
)

echo.
echo ========================================
echo IMPORTANT: After switching environment:
echo   1. Stop Metro bundler if running
echo   2. Clear cache: npm run clean
echo   3. Restart: npm start -- --reset-cache
echo ========================================
echo.
pause
