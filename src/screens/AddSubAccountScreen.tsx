import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  canAddSubAccount,
  createSubAccount,
} from '../services/accountsService';

interface AddSubAccountScreenProps {
  navigation: any;
}

const AddSubAccountScreen: React.FC<AddSubAccountScreenProps> = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [canAdd, setCanAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [contactName, setContactName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mobile, setMobile] = useState('');
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newAccountCredentials, setNewAccountCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const response = await canAddSubAccount();
      if (response.success && response.data) {
        setCanAdd(response.data.can_add);
        if (!response.data.can_add) {
          Alert.alert(
            'Permission Denied',
            response.data.message || 'You do not have permission to add sub-accounts',
            [{text: 'OK', onPress: () => navigation.goBack()}]
          );
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): string | null => {
    if (!contactName.trim()) {
      return 'Contact name is required';
    }
    if (!businessName.trim()) {
      return 'Business name is required';
    }
    if (!email.trim()) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    Alert.alert(
      'Confirm Creation',
      `Create a new sub-account for "${businessName}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Create',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const response = await createSubAccount({
                contact_name: contactName.trim(),
                business_name: businessName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                mobile: mobile.trim(),
              });

              if (response.success && response.data) {
                setNewAccountCredentials({
                  username: response.data.username,
                  password: response.data.password,
                });
                setShowSuccessModal(true);
                resetForm();
              } else {
                Alert.alert('Error', response.message || 'Failed to create sub-account');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to create sub-account');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setContactName('');
    setBusinessName('');
    setEmail('');
    setPhone('');
    setMobile('');
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setNewAccountCredentials(null);
    navigation.navigate('ViewAccounts');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header 
          title="New Sub-Account" 
          onMenuPress={() => navigation.openDrawer()}
          walletBalance="£6,859.83"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!canAdd) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header 
          title="New Sub-Account" 
          onMenuPress={() => navigation.openDrawer()}
          walletBalance="£6,859.83"
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorIcon}>🚫</Text>
          <Text style={styles.errorTitle}>Permission Denied</Text>
          <Text style={styles.errorText}>You do not have permission to add sub-accounts</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
      <Header 
        title="New Sub-Account" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance="£6,859.83"
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Page Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageHeaderTitle}>➕ Add New Sub-Account</Text>
            <Text style={styles.pageHeaderSubtitle}>
              Create a new sub-account to delegate campaign management
            </Text>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoTitle}>About Sub-Accounts</Text>
            </View>
            <Text style={styles.infoText}>
              Sub-accounts allow you to delegate SMS campaign management to team members 
              or departments. Each sub-account has its own login credentials and can have 
              funds transferred from the master account.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formCardHeader}>
              <Text style={styles.formCardIcon}>📝</Text>
              <Text style={styles.formCardTitle}>Account Details</Text>
            </View>
            
            <View style={styles.formCardBody}>
              {/* Contact Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Contact Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter contact name"
                  placeholderTextColor="#94a3b8"
                  value={contactName}
                  onChangeText={setContactName}
                  autoCapitalize="words"
                />
              </View>

              {/* Business Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Business Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter business name"
                  placeholderTextColor="#94a3b8"
                  value={businessName}
                  onChangeText={setBusinessName}
                  autoCapitalize="words"
                />
              </View>

              {/* Email */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Email Address <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter email address"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Phone */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter phone number (optional)"
                  placeholderTextColor="#94a3b8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Mobile */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter mobile number (optional)"
                  placeholderTextColor="#94a3b8"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Note */}
              <View style={styles.noteCard}>
                <Text style={styles.noteIcon}>💡</Text>
                <Text style={styles.noteText}>
                  Login credentials will be automatically generated and displayed after 
                  account creation. Make sure to save them securely.
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonIcon}>✓</Text>
                    <Text style={styles.submitButtonText}>Create Sub-Account</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={isSubmitting}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseSuccessModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✅</Text>
            </View>
            
            <Text style={styles.successTitle}>Account Created!</Text>
            <Text style={styles.successSubtitle}>
              The sub-account has been created successfully. Please save these credentials:
            </Text>

            {newAccountCredentials && (
              <View style={styles.credentialsCard}>
                <View style={styles.credentialRow}>
                  <Text style={styles.credentialLabel}>Username:</Text>
                  <View style={styles.credentialValueContainer}>
                    <Text style={styles.credentialValue}>{newAccountCredentials.username}</Text>
                  </View>
                </View>
                <View style={styles.credentialRow}>
                  <Text style={styles.credentialLabel}>Password:</Text>
                  <View style={styles.credentialValueContainer}>
                    <Text style={styles.credentialValue}>{newAccountCredentials.password}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                Please save these credentials now. They will not be shown again.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleCloseSuccessModal}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293B50',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#ea6118',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  // Page Header
  pageHeader: {
    backgroundColor: '#ea6118',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pageHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  pageHeaderSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  // Info Card
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  // Form Card
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  formCardIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  formCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  formCardBody: {
    padding: 16,
  },
  // Form Elements
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#293B50',
  },
  // Note Card
  noteCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  noteIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  // Buttons
  submitButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#f59e0b',
  },
  submitButtonIcon: {
    fontSize: 14,
    marginRight: 8,
    color: '#ffffff',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  // Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  credentialsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  credentialLabel: {
    fontSize: 13,
    color: '#64748b',
    width: 80,
  },
  credentialValueContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  credentialValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  doneButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    shadowColor: '#16a34a',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default AddSubAccountScreen;
