/**
 * Maintenance Screen
 * Displayed when the app or user is in maintenance mode
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as notificationApiService from '../services/notificationApiService';

interface MaintenanceScreenProps {
  message?: string;
  endTime?: string | null;
  onRetry: () => void;
  onLogout: () => void;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  message,
  endTime,
  onRetry,
  onLogout,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (endTime) {
      const updateCountdown = () => {
        const end = new Date(endTime);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) {
          setCountdown(null);
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m remaining`);
        } else if (minutes > 0) {
          setCountdown(`${minutes}m ${seconds}s remaining`);
        } else {
          setCountdown(`${seconds}s remaining`);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);

      return () => clearInterval(interval);
    }
  }, [endTime]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoSMS}>SMS</Text>
          <Text style={styles.logoExpert}>Expert</Text>
        </View>

        {/* Maintenance Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔧</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Under Maintenance</Text>

        {/* Message */}
        <Text style={styles.message}>
          {message || 'The site is currently under maintenance. Please try again later.'}
        </Text>

        {/* Countdown */}
        {countdown && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>Estimated time:</Text>
            <Text style={styles.countdownValue}>{countdown}</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={handleRetry}
            disabled={isRetrying}
            activeOpacity={0.8}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Try Again</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.logoutButtonText]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <Text style={styles.infoText}>
          We apologize for any inconvenience. Our team is working to restore service as quickly as possible.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293B50',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 40,
  },
  logoSMS: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ea6118',
  },
  logoExpert: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  countdownContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 32,
  },
  countdownLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 4,
  },
  countdownValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ea6118',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 32,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  retryButton: {
    backgroundColor: '#ea6118',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  logoutButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MaintenanceScreen;
