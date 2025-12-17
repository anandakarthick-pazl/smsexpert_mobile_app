@echo off
echo Cleaning build directories...

cd /d D:\cladue\smsexpert_mobile_app

echo Removing android build caches...
rmdir /s /q android\app\.cxx 2>nul
rmdir /s /q android\app\build 2>nul
rmdir /s /q android\build 2>nul
rmdir /s /q node_modules\react-native-document-picker\android\build 2>nul

echo Cleaning gradle caches...
cd android
call gradlew --stop
cd ..

echo Done! Now run: npx react-native run-android
pause
