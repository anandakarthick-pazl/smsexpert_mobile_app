import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Colors from '../theme/colors';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    reset: (config: {index: number; routes: {name: string}[]}) => void;
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [buttonText, setButtonText] = useState('Sign In');

  const passwordRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    setError('');

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setButtonText('Signing In...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setButtonText('Success! Redirecting...');
      setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 500);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      setButtonText('Sign In');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Navigate to forgot password');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}],
              },
            ]}>
            {/* Branding Section */}
            <View style={styles.brandSection}>
              <View style={styles.brandLogoContainer}>
                <View style={styles.brandLogoText}>
                  <Text style={styles.smsText}>SMS</Text>
                  <Text style={styles.expertText}>Expert</Text>
                </View>
                <View style={styles.brandUnderline} />
              </View>

              <Text style={styles.brandSubtitle}>
                Professional SMS Marketing Platform for Modern Businesses
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Welcome Back</Text>
                <Text style={styles.formSubtitle}>
                  Sign in to access your SMS Expert dashboard
                </Text>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={styles.alertError}>
                  <Text style={styles.alertIcon}>⚠️</Text>
                  <Text style={styles.alertText}>{error}</Text>
                </View>
              ) : null}

              {/* Username Field */}
              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.labelIcon}>👤</Text>
                  <Text style={styles.label}>Username</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor={Colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!isLoading}
                />
              </View>

              {/* Password Field */}
              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.labelIcon}>🔐</Text>
                  <Text style={styles.label}>Password</Text>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={passwordRef}
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}>
                    <Text style={styles.passwordToggleIcon}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <View style={styles.formExtras}>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <ActivityIndicator color={Colors.textWhite} size="small" />
                    <Text style={styles.loginButtonText}>{buttonText}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.loginButtonIcon}>🚀</Text>
                    <Text style={styles.loginButtonText}>{buttonText}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  brandSection: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 50,
    alignItems: 'center',
  },
  brandLogoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLogoText: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  smsText: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -1,
  },
  expertText: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: -1,
  },
  brandUnderline: {
    width: 80,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginTop: 10,
  },
  brandSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  alertError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  alertIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: Colors.errorDark,
    fontWeight: '500',
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{translateY: -12}],
    padding: 6,
  },
  passwordToggleIcon: {
    fontSize: 20,
  },
  formExtras: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 28,
  },
  forgotLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonIcon: {
    fontSize: 18,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textWhite,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default LoginScreen;
