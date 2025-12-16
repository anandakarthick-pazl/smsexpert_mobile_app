import React from 'react';
import {View, StatusBar, StyleSheet, Platform} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  useBottomSafeArea?: boolean;
}

/**
 * ScreenWrapper Component
 * 
 * Wraps all screens with:
 * 1. Darker status bar color (so battery/charging percentage is visible)
 * 2. Safe area handling for top (status bar) and bottom (navigation buttons)
 * 
 * Usage:
 * <ScreenWrapper>
 *   <Header ... />
 *   <YourContent />
 * </ScreenWrapper>
 */
const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  backgroundColor = '#293B50',
  statusBarColor = '#1a252f', // Darker than header for visibility
  statusBarStyle = 'light-content',
  useBottomSafeArea = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor}
        translucent={false}
      />
      <SafeAreaView 
        style={[styles.safeArea, {backgroundColor}]} 
        edges={useBottomSafeArea ? ['top', 'bottom'] : ['top']}>
        {children}
      </SafeAreaView>
      {/* Extra padding for Android navigation bar if needed */}
      {Platform.OS === 'android' && useBottomSafeArea && (
        <View style={[styles.bottomPadding, {height: Math.max(insets.bottom, 0)}]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  bottomPadding: {
    backgroundColor: '#f8fafc',
  },
});

export default ScreenWrapper;
