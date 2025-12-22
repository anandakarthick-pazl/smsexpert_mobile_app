@echo off
echo ========================================
echo    SMS Expert - Generate Release Keystore
echo ========================================
echo.
echo This will generate a new keystore for signing release builds.
echo.
echo IMPORTANT: 
echo   - Remember the passwords you enter!
echo   - Store the keystore file safely!
echo   - You need the SAME keystore to update your app on Play Store!
echo.
pause

cd /d D:\cladue\smsexpert_mobile_app\android\app

echo.
echo Generating keystore...
echo.

keytool -genkeypair -v -storetype PKCS12 -keystore smsexpert-release.keystore -alias smsexpert-key -keyalg RSA -keysize 2048 -validity 10000

if exist smsexpert-release.keystore (
    echo.
    echo ========================================
    echo    Keystore generated successfully!
    echo ========================================
    echo.
    echo Location: android\app\smsexpert-release.keystore
    echo.
    echo NEXT STEPS:
    echo   1. Update passwords in android\gradle.properties
    echo   2. Run: npm run build:apk
    echo.
    echo REMEMBER:
    echo   - Backup the keystore file safely
    echo   - Never share your keystore passwords
    echo.
) else (
    echo.
    echo ERROR: Failed to generate keystore!
    echo.
)

pause
