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

interface SMSWalletScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

const SMSWalletScreen: React.FC<SMSWalletScreenProps> = ({navigation}) => {
  // Form State
  const [emailReminder, setEmailReminder] = useState(false);
  const [minimumBalance, setMinimumBalance] = useState('10.00');
  const [reminderPeriod, setReminderPeriod] = useState('1');
  const [immediateAlert, setImmediateAlert] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('test@nedholdings.com');
  const [showReminderDropdown, setShowReminderDropdown] = useState(false);

  const reminderOptions = Array.from({length: 14}, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} day${i > 0 ? 's' : ''}`,
  }));

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleSaveSettings = () => {
    Alert.alert(
      'Settings Saved',
      'Your SMS Wallet notification settings have been updated successfully.',
      [{text: 'OK'}]
    );
  };

  const handleResetForm = () => {
    setEmailReminder(false);
    setMinimumBalance('10.00');
    setReminderPeriod('1');
    setImmediateAlert(true);
    setNotificationEmail('test@nedholdings.com');
    Alert.alert('Form Reset', 'All settings have been reset to default values.');
  };

  const handleBuySMS = () => {
    Alert.alert('Buy SMS', 'Redirecting to purchase page...');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      {/* Header */}
      <Header
        title="SMS Wallet"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
        walletBalance="£6859"
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletHeaderLeft}>
              <Text style={styles.welcomeText}>Welcome, Customer!</Text>
              <Text style={styles.balanceLabel}>Current SMS Wallet Balance</Text>
              <Text style={styles.walletBalance}>£ 6859.83</Text>
              <Text style={styles.balanceSubtext}>
                Available for pre-purchased SMS text messages
              </Text>
            </View>
            <TouchableOpacity style={styles.buyButton} onPress={handleBuySMS}>
              <Text style={styles.buyButtonIcon}>🛒</Text>
              <Text style={styles.buyButtonText}>Buy More SMS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Purchase Info */}
        <View style={styles.quickPurchaseCard}>
          <Text style={styles.quickPurchaseIcon}>ℹ️</Text>
          <Text style={styles.quickPurchaseTitle}>How to Pre-Purchase More SMS</Text>
          <Text style={styles.quickPurchaseText}>
            To pre-purchase more SMS messages, you can{' '}
            <Text style={styles.linkText} onPress={handleBuySMS}>
              buy online
            </Text>{' '}
            or contact our support team for assistance.
          </Text>
        </View>

        {/* Daily Email Notifications Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconOrange}>
              <Text style={styles.sectionIconText}>🔔</Text>
            </View>
            <Text style={styles.sectionTitle}>Daily Email Notifications</Text>
          </View>

          <View style={styles.sectionContent}>
            {/* Email Reminder Toggle */}
            <View style={styles.formGroup}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabelIcon}>📧</Text>
                <Text style={styles.formLabel}>Email Reminder Preferences</Text>
              </View>
              <Text style={styles.formText}>
                Do you wish to be reminded by email when you are running low on pre-purchased SMS?
              </Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioOption, emailReminder && styles.radioOptionActive]}
                  onPress={() => setEmailReminder(true)}>
                  <View style={[styles.radioCircle, emailReminder && styles.radioCircleActive]}>
                    {emailReminder && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Yes, notify me</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioOption, !emailReminder && styles.radioOptionActive]}
                  onPress={() => setEmailReminder(false)}>
                  <View style={[styles.radioCircle, !emailReminder && styles.radioCircleActive]}>
                    {!emailReminder && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>No, don't notify</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Minimum Balance Threshold */}
            <View style={styles.formGroup}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabelIcon}>💷</Text>
                <Text style={styles.formLabel}>Minimum Balance Threshold</Text>
              </View>
              <Text style={styles.formText}>
                What monetary amount (in £) do you want set as minimum to trigger reminder?
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>£</Text>
                <TextInput
                  style={styles.currencyInput}
                  value={minimumBalance}
                  onChangeText={setMinimumBalance}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Reminder Period */}
            <View style={styles.formGroup}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabelIcon}>⏰</Text>
                <Text style={styles.formLabel}>Follow-up Reminder Frequency</Text>
              </View>
              <Text style={styles.formText}>
                How many days between follow-up reminders?
              </Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowReminderDropdown(!showReminderDropdown)}>
                <Text style={styles.dropdownText}>
                  {reminderOptions.find(o => o.value === reminderPeriod)?.label || '1 day'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
              {showReminderDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {reminderOptions.map(option => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.dropdownItem,
                          reminderPeriod === option.value && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setReminderPeriod(option.value);
                          setShowReminderDropdown(false);
                        }}>
                        <Text
                          style={[
                            styles.dropdownItemText,
                            reminderPeriod === option.value && styles.dropdownItemTextActive,
                          ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Immediate Notifications Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconRed}>
              <Text style={styles.sectionIconText}>⚠️</Text>
            </View>
            <Text style={styles.sectionTitle}>Immediate Notifications</Text>
          </View>

          <View style={styles.sectionContent}>
            {/* Immediate Email Toggle */}
            <View style={styles.formGroup}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabelIcon}>🚨</Text>
                <Text style={styles.formLabel}>Insufficient Funds Alert</Text>
              </View>
              <Text style={styles.formText}>
                Get notified immediately when SMS send fails due to insufficient funds?
              </Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioOption, immediateAlert && styles.radioOptionActive]}
                  onPress={() => setImmediateAlert(true)}>
                  <View style={[styles.radioCircle, immediateAlert && styles.radioCircleActive]}>
                    {immediateAlert && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Yes, alert me</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioOption, !immediateAlert && styles.radioOptionActive]}
                  onPress={() => setImmediateAlert(false)}>
                  <View style={[styles.radioCircle, !immediateAlert && styles.radioCircleActive]}>
                    {!immediateAlert && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>No, don't alert</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.formGroup}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabelIcon}>📧</Text>
                <Text style={styles.formLabel}>Notification Email Address</Text>
              </View>
              <Text style={styles.formText}>
                Email address where immediate notifications will be sent
              </Text>
              <TextInput
                style={styles.textInput}
                value={notificationEmail}
                onChangeText={setNotificationEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="your.email@example.com"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Important Notice */}
            <View style={styles.warningAlert}>
              <Text style={styles.warningIcon}>ℹ️</Text>
              <Text style={styles.warningText}>
                <Text style={styles.warningBold}>Important: </Text>
                Immediate notifications sent max once per hour for ongoing failures.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionCard}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
              <Text style={styles.saveButtonIcon}>💾</Text>
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleResetForm}>
              <Text style={styles.resetButtonIcon}>🔄</Text>
              <Text style={styles.resetButtonText}>Reset Form</Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  // Wallet Card
  walletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  walletHeader: {
    backgroundColor: '#293B50',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletHeaderLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  buyButton: {
    backgroundColor: '#ea6118',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Quick Purchase Card
  quickPurchaseCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ea6118',
    alignItems: 'center',
  },
  quickPurchaseIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickPurchaseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 8,
    textAlign: 'center',
  },
  quickPurchaseText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: '#ea6118',
    fontWeight: '600',
  },
  // Section Card
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    backgroundColor: '#f8fafc',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionIconOrange: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionIconRed: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  sectionContent: {
    padding: 16,
  },
  // Form Group
  formGroup: {
    marginBottom: 20,
  },
  formLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  formLabelIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  formText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  // Radio Group
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  radioOptionActive: {
    borderColor: '#ea6118',
    backgroundColor: '#fff7ed',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#ea6118',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ea6118',
  },
  radioLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    maxWidth: 150,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 6,
  },
  currencyInput: {
    flex: 1,
    fontSize: 16,
    color: '#293B50',
    paddingVertical: 12,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#293B50',
  },
  // Dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: 150,
  },
  dropdownText: {
    fontSize: 15,
    color: '#293B50',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#64748b',
  },
  dropdownList: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    marginTop: 8,
    maxWidth: 150,
    maxHeight: 180,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemActive: {
    backgroundColor: '#fff7ed',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#293B50',
  },
  dropdownItemTextActive: {
    color: '#ea6118',
    fontWeight: '600',
  },
  // Warning Alert
  warningAlert: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 14,
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  warningBold: {
    fontWeight: '700',
  },
  // Action Buttons
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  saveButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ea6118',
  },
  resetButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ea6118',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default SMSWalletScreen;
