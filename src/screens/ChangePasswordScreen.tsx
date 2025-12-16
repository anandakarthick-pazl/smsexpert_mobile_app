import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {changePassword} from '../services/authService';
import {toast} from '../context/ToastContext';

interface ChangePasswordScreenProps {
  navigation: any;
  walletBalance?: string;
}

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({navigation, walletBalance}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!currentPassword.trim()) {
      toast.warning('Please enter your current password');
      return false;
    }
    if (!newPassword.trim()) {
      toast.warning('Please enter a new password');
      return false;
    }
    if (newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters');
      return false;
    }
    if (!confirmPassword.trim()) {
      toast.warning('Please confirm your new password');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return false;
    }
    if (currentPassword === newPassword) {
      toast.warning('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (result.success) {
        toast.success(result.message || 'Password changed successfully');
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Navigate back after delay
        setTimeout(() => {
          navigation.navigate('Dashboard');
        }, 1500);
      }
      // Error toast is shown automatically by apiService
    } catch (error: any) {
      // Error toast is shown automatically by apiService
      console.error('Change password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
      <Header 
        title="Change Password" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance={walletBalance || '£0.00'}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🔐</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              <Text style={styles.infoTextBold}>Password Requirements: </Text>
              Your new password must be at least 6 characters long and different from your current password.
            </Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>🔑</Text>
            <Text style={styles.cardHeaderTitle}>Change Your Password</Text>
          </View>

          <View style={styles.cardBody}>
            {/* Current Password */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Current Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter current password"
                  placeholderTextColor="#94a3b8"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Text style={styles.passwordToggleIcon}>
                    {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                New Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#94a3b8"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Text style={styles.passwordToggleIcon}>
                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.formHint}>
                Minimum 6 characters
              </Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Confirm New Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm new password"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Text style={styles.passwordToggleIcon}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <Text style={styles.errorHint}>
                  Passwords do not match
                </Text>
              )}
              {confirmPassword.length > 0 && newPassword === confirmPassword && (
                <Text style={styles.successHint}>
                  ✓ Passwords match
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleChangePassword}
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.submitButtonText}>Changing...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.submitButtonIcon}>🔐</Text>
                    <Text style={styles.submitButtonText}>Change Password</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => navigation.navigate('Dashboard')}
                disabled={isLoading}>
                <Text style={styles.cancelButtonIcon}>✕</Text>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningText}>
              After changing your password, you will need to use the new password to login on all devices.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293B50',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  infoTextBold: {
    fontWeight: '700',
  },
  // Warning Box
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  warningIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
  // Form Card
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 97, 24, 0.1)',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(234, 97, 24, 0.2)',
  },
  cardHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  cardBody: {
    padding: 16,
  },
  // Form Elements
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    color: '#293B50',
  },
  passwordToggle: {
    padding: 14,
  },
  passwordToggleIcon: {
    fontSize: 18,
  },
  formHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  errorHint: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 6,
  },
  successHint: {
    fontSize: 12,
    color: '#16a34a',
    marginTop: 6,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#f9a875',
  },
  submitButtonIcon: {
    fontSize: 14,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonIcon: {
    fontSize: 12,
    marginRight: 6,
    color: '#64748b',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});

export default ChangePasswordScreen;
