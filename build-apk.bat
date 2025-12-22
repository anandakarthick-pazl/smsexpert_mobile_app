@echo off
echo ========================================
echo    SMS Expert - Build Release APK
echo ========================================
echo.

cd /d D:\cladue\smsexpert_mobile_app

REM Check if keystore exists
if not exist "android\app\smsexpert-release.keystore" (
    echo ERROR: Release keystore not found!
    echo Please run generate-keystore.bat first.
    pause
    exit /b 1
)

echo Select environment:
echo   1. Local
echo   2. Development  
echo   3. Production
echo.
set /p env_choice="Enter choice (1-3): "

if "%env_choice%"=="1" (
    echo.
    echo Switching to LOCAL environment...
    copy /Y .env.local .env >nul
    echo Environment: LOCAL
) else if "%env_choice%"=="2" (
    echo.
    echo Switching to DEVELOPMENT environment...
    copy /Y .env.development .env >nul
    echo Environment: DEVELOPMENT
) else if "%env_choice%"=="3" (
    echo.
    echo Switching to PRODUCTION environment...
    copy /Y .env.production .env >nul
    echo Environment: PRODUCTION
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Cleaning cache and building...
echo ========================================
echo.

REM Clean Metro cache to ensure new env is picked up
echo Cleaning Metro cache...
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q "%TEMP%\metro-*" 2>nul

echo.
echo Building Release APK...
echo.

cd android
call gradlew clean
call gradlew assembleRelease
cd ..

if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo.
    echo ========================================
    echo    BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo APK Location:
    echo   android\app\build\outputs\apk\release\app-release.apk
    echo.
    explorer "android\app\build\outputs\apk\release"
) else (
    echo.
    echo BUILD FAILED! Check the error messages above.
)

echo.
pause
