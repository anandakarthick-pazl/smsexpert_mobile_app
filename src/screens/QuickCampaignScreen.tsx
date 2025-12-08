import React, {useState, useEffect} from 'react';
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

interface QuickCampaignScreenProps {
  navigation: any;
}

const QuickCampaignScreen: React.FC<QuickCampaignScreenProps> = ({navigation}) => {
  // Form states
  const [campaignName, setCampaignName] = useState('');
  const [routeLetter, setRouteLetter] = useState('');
  const [selectedSenderId, setSelectedSenderId] = useState('choose');
  const [otherSenderId, setOtherSenderId] = useState('');
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSenderIdPicker, setShowSenderIdPicker] = useState(false);

  // Available sender IDs
  const senderIds = [
    {label: 'Choose...', value: 'choose'},
    {label: "Use 'other sender id'", value: 'useotherbelow'},
    {label: '447418318903', value: '447418318903'},
  ];

  // Calculate recipient count
  const getRecipientCount = () => {
    if (!recipients.trim()) return 0;
    const numbers = recipients.trim().split(/[\n\r,\s]+/).filter(num => num.trim() !== '');
    return numbers.length;
  };

  // Calculate character and SMS count
  const getCharCount = () => message.length;
  
  const getSmsCount = () => {
    const length = message.length;
    if (length <= 160) return 1;
    if (length <= 306) return 2;
    if (length <= 459) return 3;
    return Math.ceil(length / 153);
  };

  const handleSenderIdSelect = (value: string) => {
    setSelectedSenderId(value);
    setShowSenderIdPicker(false);
    if (value !== 'useotherbelow') {
      setOtherSenderId('');
    }
  };

  const handleSubmit = () => {
    // Validation
    const errors: string[] = [];

    if (!campaignName.trim()) {
      errors.push('Campaign name is required.');
    }
    if (selectedSenderId === 'choose') {
      errors.push('Please select a sender ID.');
    } else if (selectedSenderId === 'useotherbelow' && !otherSenderId.trim()) {
      errors.push('Please enter a custom sender ID or select one from the dropdown.');
    }
    if (!recipients.trim()) {
      errors.push('At least one recipient is required.');
    }
    if (!message.trim()) {
      errors.push('SMS message cannot be empty.');
    }

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Campaign Submitted',
        'Your SMS campaign has been submitted successfully. Check the Campaigns History for status.',
        [
          {
            text: 'View History',
            onPress: () => navigation.navigate('CampaignHistory'),
          },
          {text: 'OK'},
        ]
      );
    }, 2000);
  };

  const getSenderIdLabel = () => {
    const sender = senderIds.find(s => s.value === selectedSenderId);
    return sender ? sender.label : 'Choose...';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      <Header 
        title="Quick Campaign" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance="£6,859.83"
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.formCardHeader}>
            <Text style={styles.formCardHeaderIcon}>📝</Text>
            <Text style={styles.formCardHeaderTitle}>Campaign Details</Text>
          </View>

          <View style={styles.formCardBody}>
            {/* Campaign Name & Route Letter Row */}
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Campaign Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter a name to identify this campaign"
                  placeholderTextColor="#94a3b8"
                  value={campaignName}
                  onChangeText={setCampaignName}
                />
                <Text style={styles.formHint}>A simple description to help you identify the campaign in future.</Text>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Route Letter</Text>
                <TextInput
                  style={[styles.formInput, styles.routeInput]}
                  placeholder="e.g., d, p, e"
                  placeholderTextColor="#94a3b8"
                  value={routeLetter}
                  onChangeText={(text) => setRouteLetter(text.toLowerCase().slice(0, 1))}
                  maxLength={1}
                  autoCapitalize="none"
                />
                <Text style={styles.formHint}>Single letter (d, p, e) for SMS delivery route. Leave blank for default.</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Sender ID Section */}
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Sender ID (Originator) <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={styles.selectInput}
                  onPress={() => setShowSenderIdPicker(!showSenderIdPicker)}>
                  <Text style={[
                    styles.selectInputText,
                    selectedSenderId === 'choose' && styles.selectPlaceholder
                  ]}>
                    {getSenderIdLabel()}
                  </Text>
                  <Text style={styles.selectArrow}>▼</Text>
                </TouchableOpacity>
                
                {/* Dropdown Options */}
                {showSenderIdPicker && (
                  <View style={styles.dropdownContainer}>
                    {senderIds.map((sender) => (
                      <TouchableOpacity
                        key={sender.value}
                        style={[
                          styles.dropdownItem,
                          selectedSenderId === sender.value && styles.dropdownItemActive
                        ]}
                        onPress={() => handleSenderIdSelect(sender.value)}>
                        <Text style={[
                          styles.dropdownItemText,
                          selectedSenderId === sender.value && styles.dropdownItemTextActive
                        ]}>
                          {sender.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                <Text style={styles.formHint}>This is who the SMS comes "from".</Text>
                
                <View style={styles.senderIdCount}>
                  <Text style={styles.senderIdCountIcon}>✓</Text>
                  <Text style={styles.senderIdCountText}>
                    You have <Text style={styles.bold}>1</Text> registered sender ID(s) available
                  </Text>
                </View>
              </View>
            </View>

            {/* Other Sender ID */}
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Other Sender ID</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    selectedSenderId !== 'useotherbelow' && styles.inputDisabled
                  ]}
                  placeholder="Enter custom sender ID (max 11 chars)"
                  placeholderTextColor="#94a3b8"
                  value={otherSenderId}
                  onChangeText={setOtherSenderId}
                  maxLength={11}
                  editable={selectedSenderId === 'useotherbelow'}
                />
                <Text style={styles.formHint}>If using custom sender ID, words must be 11 characters or less.</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Recipients */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Recipient Mobile Numbers <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder={"Enter mobile numbers (one per line)\n\nExample:\n447123456789\n447987654321\n07555555555"}
                placeholderTextColor="#94a3b8"
                value={recipients}
                onChangeText={setRecipients}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <View style={styles.inputFooter}>
                <View style={styles.hintRow}>
                  <Text style={styles.hintIcon}>ℹ️</Text>
                  <Text style={styles.formHintSmall}>UK numbers must begin with 447, 07 or 7. Only use digits.</Text>
                </View>
                <View style={styles.counterBox}>
                  <Text style={styles.counterText}>
                    <Text style={styles.bold}>{getRecipientCount()}</Text> recipient(s)
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* SMS Message */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                SMS Message <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.formInput, styles.textAreaSmall]}
                placeholder="Type your SMS message here..."
                placeholderTextColor="#94a3b8"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.inputFooter}>
                <View style={styles.hintRow}>
                  <Text style={styles.hintIcon}>ℹ️</Text>
                  <Text style={styles.formHintSmall}>Messages over 160 characters will cost extra.</Text>
                </View>
                <View style={[styles.counterBox, getCharCount() > 160 && styles.counterBoxWarning]}>
                  <Text style={[styles.counterText, getCharCount() > 160 && styles.counterTextWarning]}>
                    <Text style={styles.bold}>{getCharCount()}</Text> / 160 chars | <Text style={styles.bold}>{getSmsCount()}</Text> SMS
                  </Text>
                </View>
              </View>
            </View>

            {/* Warning Box */}
            <View style={styles.warningBox}>
              <View style={styles.warningHeader}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningTitle}>Important Notes:</Text>
              </View>
              <View style={styles.warningContent}>
                <Text style={styles.warningItem}>• SMS will be submitted for sending <Text style={styles.bold}>immediately</Text>. Large campaigns may take a few minutes to upload.</Text>
                <Text style={styles.warningItem}>• <Text style={styles.bold}>Do not refresh the page</Text> after clicking submit.</Text>
                <Text style={styles.warningItem}>• Leave Route letter blank to use your account's default route.</Text>
                <Text style={styles.warningItem}>• Some validation occurs after submission - check the previous campaigns page for status.</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}>
                <Text style={styles.submitButtonIcon}>{isSubmitting ? '⏳' : '📤'}</Text>
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Submitting Campaign...' : 'Submit Campaign'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => navigation.navigate('CampaignHome')}>
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
  // Page Header
  pageHeader: {
    backgroundColor: '#ea6118',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
  },
  pageHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageHeaderText: {
    flex: 1,
  },
  pageHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  pageHeaderSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  historyButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  historyButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  historyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ea6118',
  },
  // Form Card
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  formCardHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  formCardHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  formCardBody: {
    padding: 20,
  },
  // Form Elements
  formRow: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 8,
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
    padding: 12,
    fontSize: 14,
    color: '#293B50',
  },
  routeInput: {
    width: 100,
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  textArea: {
    height: 140,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    height: 100,
    textAlignVertical: 'top',
  },
  formHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  formHintSmall: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
  },
  // Select Input
  selectInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectInputText: {
    fontSize: 14,
    color: '#293B50',
  },
  selectPlaceholder: {
    color: '#94a3b8',
  },
  selectArrow: {
    fontSize: 10,
    color: '#64748b',
  },
  // Dropdown
  dropdownContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 12,
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
  // Sender ID Count
  senderIdCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  senderIdCountIcon: {
    fontSize: 14,
    marginRight: 8,
    color: '#16a34a',
  },
  senderIdCountText: {
    fontSize: 13,
    color: '#64748b',
  },
  bold: {
    fontWeight: '700',
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  // Input Footer
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hintIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  counterBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  counterBoxWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  counterText: {
    fontSize: 12,
    color: '#64748b',
  },
  counterTextWarning: {
    color: '#d97706',
  },
  // Warning Box
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  warningContent: {},
  warningItem: {
    fontSize: 13,
    color: '#92400e',
    marginBottom: 6,
    lineHeight: 20,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#64748b',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});

export default QuickCampaignScreen;
