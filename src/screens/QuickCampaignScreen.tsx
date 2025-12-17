import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getSenderIds,
  submitQuickCampaign,
  formatSenderIdsForDropdown,
  SenderId,
} from '../services/campaignService';

interface QuickCampaignScreenProps {
  navigation: any;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

const QuickCampaignScreen: React.FC<QuickCampaignScreenProps> = ({navigation, onNotificationPress, notificationCount = 0}) => {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [campaignName, setCampaignName] = useState('');
  const [routeLetter, setRouteLetter] = useState('');
  const [selectedSenderId, setSelectedSenderId] = useState('choose');
  const [otherSenderId, setOtherSenderId] = useState('');
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [showSenderIdPicker, setShowSenderIdPicker] = useState(false);

  // Sender IDs from API
  const [senderIds, setSenderIds] = useState<SenderId[]>([
    {label: 'Choose...', value: 'choose'},
    {label: "Use 'other sender id'", value: 'useotherbelow'},
  ]);
  const [senderIdCount, setSenderIdCount] = useState(0);

  const fetchSenderIds = useCallback(async () => {
    try {
      const response = await getSenderIds();
      if (response.success && response.data) {
        const formattedIds = formatSenderIdsForDropdown(response.data.sender_ids || []);
        setSenderIds(formattedIds);
        setSenderIdCount(response.data.count || 0);
      }
    } catch (error: any) {
      console.error('Error fetching sender IDs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSenderIds();
  }, [fetchSenderIds]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSenderIds();
  };

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

  const resetForm = () => {
    setCampaignName('');
    setRouteLetter('');
    setSelectedSenderId('choose');
    setOtherSenderId('');
    setRecipients('');
    setMessage('');
  };

  const handleSubmit = async () => {
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

    try {
      const response = await submitQuickCampaign({
        campaign_name: campaignName.trim(),
        sender_id: selectedSenderId,
        other_sender_id: selectedSenderId === 'useotherbelow' ? otherSenderId.trim() : undefined,
        recipients: recipients.trim(),
        message: message.trim(),
        route_letter: routeLetter.trim() || undefined,
      });

      if (response.success) {
        Alert.alert(
          'Campaign Submitted',
          response.message || 'Your SMS campaign has been submitted successfully.',
          [
            {
              text: 'View History',
              onPress: () => {
                resetForm();
                navigation.navigate('CampaignHistory');
              },
            },
            {
              text: 'New Campaign',
              onPress: () => resetForm(),
            },
          ]
        );
      } else {
        const errorMessage = response.errors 
          ? response.errors.join('\n') 
          : response.message || 'Failed to submit campaign';
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSenderIdLabel = () => {
    const sender = senderIds.find(s => s.value === selectedSenderId);
    return sender ? sender.label : 'Choose...';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header 
          title="Quick Campaign" 
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={onNotificationPress}
          notificationCount={notificationCount}
          walletBalance="£6,859.83"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
      <Header 
        title="Quick Campaign" 
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={onNotificationPress}
        notificationCount={notificationCount}
        walletBalance="£6,859.83"
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ea6118']}
            tintColor="#ea6118"
          />
        }>
        
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <View style={styles.pageHeaderText}>
              <Text style={styles.pageHeaderTitle}>📤 Submit New SMS Campaign</Text>
              <Text style={styles.pageHeaderSubtitle}>Quickly send SMS to a list of mobile numbers</Text>
            </View>
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => navigation.navigate('CampaignHistory')}>
              <Text style={styles.historyButtonIcon}>📋</Text>
              <Text style={styles.historyButtonText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.formCardHeader}>
            <Text style={styles.formCardHeaderIcon}>📝</Text>
            <Text style={styles.formCardHeaderTitle}>Campaign Details</Text>
          </View>

          <View style={styles.formCardBody}>
            {/* Campaign Name */}
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

            {/* Route Letter */}
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

            <View style={styles.divider} />

            {/* Sender ID Section */}
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
                <Text style={styles.selectArrow}>{showSenderIdPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {/* Dropdown Options */}
              {showSenderIdPicker && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
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
                  </ScrollView>
                </View>
              )}
              
              <Text style={styles.formHint}>This is who the SMS comes "from".</Text>
              
              {senderIdCount > 0 && (
                <View style={styles.senderIdCount}>
                  <Text style={styles.senderIdCountIcon}>✓</Text>
                  <Text style={styles.senderIdCountText}>
                    You have <Text style={styles.bold}>{senderIdCount}</Text> registered sender ID(s) available
                  </Text>
                </View>
              )}
            </View>

            {/* Other Sender ID */}
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
                <Text style={styles.warningItem}>• SMS will be submitted for sending <Text style={styles.bold}>immediately</Text>.</Text>
                <Text style={styles.warningItem}>• Large campaigns may take a few minutes to process.</Text>
                <Text style={styles.warningItem}>• Leave Route letter blank for your account's default route.</Text>
                <Text style={styles.warningItem}>• Check campaign history for status updates.</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonIcon}>📤</Text>
                    <Text style={styles.submitButtonText}>Submit Campaign</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={isSubmitting}>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
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
  // Page Header
  pageHeader: {
    backgroundColor: '#ea6118',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
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
    minHeight: 50,
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
