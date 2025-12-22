# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ==========================================
# React Native
# ==========================================
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# ==========================================
# Firebase
# ==========================================
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ==========================================
# OkHttp (used by React Native networking)
# ==========================================
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# ==========================================
# Keep native methods
# ==========================================
-keepclassmembers class * {
    native <methods>;
}

# ==========================================
# Hermes
# ==========================================
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# ==========================================
# Keep annotations
# ==========================================
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# ==========================================
# React Native Device Info
# ==========================================
-keep class com.learnium.RNDeviceInfo.** { *; }

# ==========================================
# AsyncStorage
# ==========================================
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ==========================================
# WebView
# ==========================================
-keep class com.reactnativecommunity.webview.** { *; }
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String);
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}

# ==========================================
# Vector Icons
# ==========================================
-keep class com.oblador.vectoricons.** { *; }

# ==========================================
# Document Picker
# ==========================================
-keep class com.reactnativedocumentpicker.** { *; }

# ==========================================
# Signature Canvas
# ==========================================
-keep class com.reactnativesignaturecanvas.** { *; }

# ==========================================
# Disable logging in release
# ==========================================
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
