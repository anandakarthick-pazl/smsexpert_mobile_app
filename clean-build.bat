@echo off
echo ========================================
echo    SMS Expert - Clean Build Script
echo ========================================
echo.

cd /d D:\cladue\smsexpert_mobile_app

echo [1/6] Removing android build caches...
rmdir /s /q android\app\.cxx 2>nul
rmdir /s /q android\app\build 2>nul
rmdir /s /q android\build 2>nul
rmdir /s /q node_modules\react-native-document-picker\android\build 2>nul

echo [2/6] Stopping gradle daemon...
cd android
call gradlew --stop 2>nul
cd ..

echo [3/6] Clearing Metro bundler cache...
rmdir /s /q "%TEMP%\metro-*" 2>nul
rmdir /s /q "%TEMP%\haste-map-*" 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo [4/6] Clearing React Native cache...
rmdir /s /q "%TEMP%\react-*" 2>nul

echo [5/6] Clearing Babel cache (for env changes)...
rmdir /s /q node_modules\.cache\babel-loader 2>nul

echo [6/6] Clearing watchman watches...
watchman watch-del-all 2>nul

echo.
echo ========================================
echo    Clean Complete!
echo ========================================
echo.
echo Current environment settings:
type .env 2>nul || echo No .env file found. Copy from .env.example
echo.
echo ========================================
echo Next steps:
echo   1. To change environment: run switch-env.bat
echo   2. To start app: npm start -- --reset-cache
echo   3. To run android: npx react-native run-android
echo ========================================
echo.
pause
