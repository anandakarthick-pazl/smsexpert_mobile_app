import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface CampaignAddAccountScreenProps {
  navigation: any;
}

const CampaignAddAccountScreen: React.FC<CampaignAddAccountScreenProps> = ({navigation}) => {
  const [contactName, setContactName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mobile, setMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    // Validation
    if (!contactName.trim()) {
      Alert.alert('Error', 'Please enter contact name');
      return;
    }
    if (!businessName.trim()) {
      Alert.alert('Error', 'Please enter business name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter email address');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    Alert.alert(
      'Confirm',
      'Are you sure you want to create this new sub-account?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Create',
          onPress: () => {
            setIsSubmitting(true);
            // Simulate API call
            setTimeout(() => {
              setIsSubmitting(false);
              Alert.alert(
                'Success',
                'Sub-account created successfully!\n\nUsername: ' + generateUsername() + '\nPassword: ********',
                [
                  {
                    text: 'View Accounts',
                    onPress: () => navigation.navigate('CampaignAccounts'),
                  },
                ]
              );
              // Reset form
              setContactName('');
              setBusinessName('');
              setEmail('');
              setPhone('');
              setMobile('');
            }, 1500);
          },
        },
      ]
    );
  };

  const generateUsername = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const handleCancel = () => {
    if (contactName || businessName || email || phone || mobile) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          {text: 'Keep Editing', style: 'cancel'},
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.navigate('CampaignHome'),
          },
        ]
      );
    } else {
      navigation.navigate('CampaignHome');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      <Header 
        title="New Sub-Account" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance="£6,859.83"
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              <Text style={styles.infoTextBold}>Important: </Text>
              Please only set the email to that of your client if you are happy for SMS Expert to contact them. Otherwise, set it to your own email address.
            </Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>🪪</Text>
            <Text style={styles.cardHeaderTitle}>Sub-Account Details</Text>
          </View>

          <View style={styles.cardBody}>
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
              />
              <Text style={styles.formHint}>
                The name of the person who will use this account.
              </Text>
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
              />
              <Text style={styles.formHint}>
                The company or business name for this account.
              </Text>
            </View>

            {/* Email Address */}
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
              />
              <Text style={styles.formHint}>
                Email address for account notifications and communications.
              </Text>
            </View>

            {/* Phone Number */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter phone number"
                placeholderTextColor="#94a3b8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Text style={styles.formHint}>
                Landline or office phone number.
              </Text>
            </View>

            {/* Mobile Number */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Mobile Number <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter mobile number"
                placeholderTextColor="#94a3b8"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
              />
              <Text style={styles.formHint}>
                Mobile phone number for SMS notifications.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}>
                <Text style={styles.submitButtonIcon}>➕</Text>
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Creating...' : 'Create Sub-Account'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}>
                <Text style={styles.cancelButtonIcon}>✕</Text>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22, 163, 74, 0.2)',
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
  optional: {
    color: '#94a3b8',
    fontWeight: '400',
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#293B50',
  },
  formHint: {
    fontSize: 12,
    color: '#64748b',
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
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#86efac',
  },
  submitButtonIcon: {
    fontSize: 14,
    marginRight: 8,
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

export default CampaignAddAccountScreen;
