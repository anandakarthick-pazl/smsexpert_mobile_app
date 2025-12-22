@echo off
echo ========================================
echo    SMS Expert - Release Build
echo ========================================
echo.

cd /d D:\cladue\smsexpert_mobile_app

REM Check if keystore exists
if not exist "android\app\smsexpert-release.keystore" (
    echo ERROR: Release keystore not found!
    echo.
    echo Please run generate-keystore.bat first.
    echo.
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
    echo Switching to LOCAL environment...
    copy /Y .env.local .env
) else if "%env_choice%"=="2" (
    echo Switching to DEVELOPMENT environment...
    copy /Y .env.development .env
) else if "%env_choice%"=="3" (
    echo Switching to PRODUCTION environment...
    copy /Y .env.production .env
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

echo.
echo Select build type:
echo   1. APK (for testing/direct install)
echo   2. AAB (for Play Store)
echo.
set /p build_choice="Enter choice (1-2): "

echo.
echo ========================================
echo    Building Release...
echo ========================================
echo.

cd android

if "%build_choice%"=="1" (
    echo Building APK...
    call gradlew assembleRelease
    
    if exist "app\build\outputs\apk\release\app-release.apk" (
        echo.
        echo ========================================
        echo    BUILD SUCCESSFUL!
        echo ========================================
        echo.
        echo APK Location:
        echo   android\app\build\outputs\apk\release\app-release.apk
        echo.
        
        REM Open folder
        explorer "app\build\outputs\apk\release"
    ) else (
        echo.
        echo BUILD FAILED! Check the error messages above.
    )
) else if "%build_choice%"=="2" (
    echo Building AAB...
    call gradlew bundleRelease
    
    if exist "app\build\outputs\bundle\release\app-release.aab" (
        echo.
        echo ========================================
        echo    BUILD SUCCESSFUL!
        echo ========================================
        echo.
        echo AAB Location:
        echo   android\app\build\outputs\bundle\release\app-release.aab
        echo.
        
        REM Open folder
        explorer "app\build\outputs\bundle\release"
    ) else (
        echo.
        echo BUILD FAILED! Check the error messages above.
    )
) else (
    echo Invalid choice!
)

cd ..
echo.
pause
