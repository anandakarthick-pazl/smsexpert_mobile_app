# SMS Expert - Release Build Guide

## 📋 Prerequisites

1. Java JDK installed (JDK 17 recommended)
2. Android SDK installed
3. Node.js installed
4. All dependencies installed (`npm install`)

---

## 🔐 Step 1: Generate Release Keystore (One-time Setup)

### Option A: Run the batch file
```bash
generate-keystore.bat
```

### Option B: Manual command
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore android/app/smsexpert-release.keystore -alias smsexpert-key -keyalg RSA -keysize 2048 -validity 10000
```

You will be prompted for:
- **Keystore password**: Choose a strong password (remember this!)
- **Key password**: Can be same as keystore password
- **Your name**: Your name or company name
- **Organization**: Your company name
- **City, State, Country**: Your location

⚠️ **IMPORTANT**: 
- Store the keystore file and passwords securely!
- You need the SAME keystore to update your app on Play Store
- Backup `android/app/smsexpert-release.keystore` safely

---

## 🔧 Step 2: Configure Signing

The `gradle.properties` file has been updated with signing configuration.
Update the passwords if you used different ones:

```properties
MYAPP_UPLOAD_STORE_FILE=smsexpert-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=smsexpert-key
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

---

## 📱 Step 3: Build Release APK

### For Local/Development Testing:
```bash
# Switch to local environment first
switch-env.bat  (select 1)

# Build APK
npm run build:apk
```

### For Production:
```bash
# Switch to production environment
switch-env.bat  (select 3)

# Build APK
npm run build:apk:prod
```

### Output Location:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📦 Step 4: Build Release AAB (For Play Store)

### For Production Release:
```bash
# Switch to production environment
switch-env.bat  (select 3)

# Build AAB
npm run build:aab:prod
```

### Output Location:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🚀 Quick Build Commands

| Command | Description |
|---------|-------------|
| `npm run build:apk` | Build APK with current .env |
| `npm run build:apk:local` | Build APK for local environment |
| `npm run build:apk:dev` | Build APK for development |
| `npm run build:apk:prod` | Build APK for production |
| `npm run build:aab` | Build AAB with current .env |
| `npm run build:aab:prod` | Build AAB for production (Play Store) |

---

## 📍 Build Output Locations

| Build Type | Location |
|------------|----------|
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Release APK | `android/app/build/outputs/apk/release/app-release.apk` |
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` |

---

## 🔄 Version Management

Before building a new release, update version in `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2        // Increment for each release
    versionName "1.1"    // User-visible version
}
```

---

## ❓ Troubleshooting

### Build fails with signing error:
1. Check keystore file exists: `android/app/smsexpert-release.keystore`
2. Verify passwords in `android/gradle.properties`
3. Run `clean-build.bat` and try again

### Build fails with memory error:
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

### Environment not changing:
1. Run `clean-build.bat`
2. Switch environment with `switch-env.bat`
3. Build again

---

## 📝 Checklist Before Release

- [ ] Update `versionCode` and `versionName`
- [ ] Switch to production environment
- [ ] Test the app thoroughly
- [ ] Build release APK/AAB
- [ ] Test the release build on a real device
- [ ] Backup keystore file
