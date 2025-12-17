package com.smsexpertapp

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    
    // Create notification channels for Android 8.0 (API 26) and higher
    createNotificationChannels()
  }
  
  private fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val notificationManager = getSystemService(NotificationManager::class.java)
      
      // Default notification channel
      val defaultChannel = NotificationChannel(
        "smsexpert_default",
        "SMS Expert Notifications",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Default notifications from SMS Expert"
        enableVibration(true)
        enableLights(true)
        setShowBadge(true)
      }
      notificationManager.createNotificationChannel(defaultChannel)
      
      // High priority notification channel for alerts
      val alertChannel = NotificationChannel(
        "sms_expert_notifications",
        "SMS Expert Alerts",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Important alerts like low balance, delivery updates"
        enableVibration(true)
        enableLights(true)
        setShowBadge(true)
      }
      notificationManager.createNotificationChannel(alertChannel)
      
      // Admin notifications channel
      val adminChannel = NotificationChannel(
        "smsexpert_admin",
        "Admin Notifications",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Notifications from SMS Expert administration"
        enableVibration(true)
        enableLights(true)
        setShowBadge(true)
      }
      notificationManager.createNotificationChannel(adminChannel)
    }
  }
}
