/**
 * No Internet Screen
 * Displays when there's no internet connectivity
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Colors from '../theme/colors';

interface NoInternetScreenProps {
  onRetry: () => Promise<boolean>;
}

const NoInternetScreen: React.FC<NoInternetScreenProps> = ({onRetry}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for the icon
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  // Wave animation for decorative element
  useEffect(() => {
    const waveAnimation = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    waveAnimation.start();

    return () => waveAnimation.stop();
  }, [waveAnim]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const waveTranslateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      
      <View style={styles.content}>
        {/* Decorative Background Element */}
        <View style={styles.decorativeContainer}>
          <Animated.View
            style={[
              styles.decorativeCircle,
              styles.decorativeCircle1,
              {transform: [{translateX: waveTranslateX}]},
            ]}
          />
          <Animated.View
            style={[
              styles.decorativeCircle,
              styles.decorativeCircle2,
              {transform: [{translateX: Animated.multiply(waveTranslateX, -1)}]},
            ]}
          />
        </View>

        {/* Main Icon */}
        <Animated.View style={[styles.iconContainer, {transform: [{scale: pulseAnim}]}]}>
          <View style={styles.iconBackground}>
            <Text style={styles.icon}>📡</Text>
          </View>
          <View style={styles.crossIcon}>
            <Text style={styles.crossText}>✕</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>No Internet Connection</Text>

        {/* Description */}
        <Text style={styles.description}>
          Oops! It seems you're not connected to the internet.{'\n'}
          Please check your connection and try again.
        </Text>

        {/* Connection Status Indicators */}
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, styles.statusDotRed]} />
            <Text style={styles.statusText}>WiFi</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, styles.statusDotRed]} />
            <Text style={styles.statusText}>Mobile Data</Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Quick Tips:</Text>
          <Text style={styles.tipItem}>• Check if airplane mode is turned off</Text>
          <Text style={styles.tipItem}>• Verify your WiFi is connected</Text>
          <Text style={styles.tipItem}>• Try moving closer to your router</Text>
          <Text style={styles.tipItem}>• Check if mobile data is enabled</Text>
        </View>

        {/* Retry Button */}
        <TouchableOpacity
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
          onPress={handleRetry}
          activeOpacity={0.8}
          disabled={isRetrying}>
          {isRetrying ? (
            <>
              <ActivityIndicator color={Colors.textWhite} size="small" />
              <Text style={styles.retryButtonText}>Checking...</Text>
            </>
          ) : (
            <>
              <Text style={styles.retryIcon}>🔄</Text>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Brand Footer */}
      <View style={styles.footer}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandSMS}>SMS</Text>
          <Text style={styles.brandExpert}>Expert</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  decorativeContainer: {
    position: 'absolute',
    top: '10%',
    left: 0,
    right: 0,
    height: 200,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  decorativeCircle1: {
    width: 200,
    height: 200,
    backgroundColor: Colors.primary,
    top: -50,
    left: -50,
  },
  decorativeCircle2: {
    width: 150,
    height: 150,
    backgroundColor: Colors.primary,
    top: 0,
    right: -30,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  icon: {
    fontSize: 60,
  },
  crossIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.secondary,
  },
  crossText: {
    fontSize: 18,
    color: Colors.textWhite,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textWhite,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusDotRed: {
    backgroundColor: Colors.error,
  },
  statusDotGreen: {
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statusDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textWhite,
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonDisabled: {
    opacity: 0.7,
  },
  retryIcon: {
    fontSize: 18,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandSMS: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  brandExpert: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textWhite,
  },
});

export default NoInternetScreen;
