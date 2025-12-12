/**
 * Send SMS Screen
 * Allows users to compose and send SMS messages
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import {
  getSendSmsData,
  getContacts,
  calculateSmsCost,
  sendSms,
  scheduleSms,
  getCharacterCountInfo,
  parsePhoneNumbers,
  SendSmsData,
  Contact,
  CalculateCostData,
} from '../services/smsService';

interface Props {
  navigation: any;
}

const SendSmsScreen: React.FC<Props> = ({navigation}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [calculating, setCalculating] = useState(false);
  
  // Page data
  const [pageData, setPageData] = useState<SendSmsData | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactType, setContactType] = useState<'favourites' | 'groups'>('favourites');
  
  // Form fields
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [senderId, setSenderId] = useState('');
  const [useDefaultSender, setUseDefaultSender] = useState(false);
  const [messageType, setMessageType] = useState<'sms' | 'whatsapp'>('sms');
  
  // Schedule fields
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleHour, setScheduleHour] = useState('');
  const [scheduleMinute, setScheduleMinute] = useState('');
  
  // Cost calculation
  const [costData, setCostData] = useState<CalculateCostData | null>(null);
  const [showCostModal, setShowCostModal] = useState(false);
  
  // Contacts modal
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');

  const onMenuPress = () => navigation.openDrawer();

  // Load page data
  const loadPageData = useCallback(async () => {
    try {
      const result = await getSendSmsData();
      if (result.success && result.data) {
        setPageData(result.data);
        // Set default sender ID
        if (result.data.sender_id.custom) {
          setSenderId(result.data.sender_id.custom);
        } else {
          setSenderId(result.data.sender_id.default);
          setUseDefaultSender(true);
        }
        // Set default schedule time
        setScheduleDate(result.data.current_time.date);
        setScheduleHour(result.data.current_time.hour);
        setScheduleMinute(result.data.current_time.minute);
      } else {
        Alert.alert('Error', result.message || 'Failed to load data');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error');
    }
  }, []);

  // Load contacts
  const loadContacts = useCallback(async (type: 'favourites' | 'groups') => {
    try {
      const result = await getContacts(type);
      if (result.success && result.data) {
        setContacts(result.data.contacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadPageData();
      await loadContacts('favourites');
      setLoading(false);
    };
    init();
  }, [loadPageData, loadContacts]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPageData();
    await loadContacts(contactType);
    setRefreshing(false);
  }, [loadPageData, loadContacts, contactType]);

  // Character count info
  const charInfo = getCharacterCountInfo(message);

  // Handle calculate cost
  const handleCalculateCost = async () => {
    if (!recipients.trim()) {
      Alert.alert('Error', 'Please enter recipient numbers');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setCalculating(true);
    try {
      const result = await calculateSmsCost(recipients, message);
      if (result.success && result.data) {
        setCostData(result.data);
        setShowCostModal(true);
      } else {
        Alert.alert('Error', result.message || 'Failed to calculate cost');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error');
    } finally {
      setCalculating(false);
    }
  };

  // Handle send SMS
  const handleSendSms = async () => {
    if (!recipients.trim()) {
      Alert.alert('Error', 'Please enter recipient numbers');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    if (!senderId.trim()) {
      Alert.alert('Error', 'Please enter a sender ID');
      return;
    }

    // Validate numbers
    const {valid, invalid} = parsePhoneNumbers(recipients);
    if (valid.length === 0) {
      Alert.alert('Error', 'No valid phone numbers provided');
      return;
    }

    if (invalid.length > 0) {
      Alert.alert(
        'Invalid Numbers',
        `The following numbers are invalid and will be skipped:\n${invalid.join(', ')}\n\nContinue with ${valid.length} valid number(s)?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Continue', onPress: () => performSend()},
        ],
      );
    } else {
      Alert.alert(
        'Confirm Send',
        `Send ${messageType.toUpperCase()} to ${valid.length} recipient(s)?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Send', onPress: () => performSend()},
        ],
      );
    }
  };

  // Perform send
  const performSend = async () => {
    setSending(true);
    try {
      const result = await sendSms(recipients, message, senderId, messageType);
      if (result.success) {
        Alert.alert('Success', result.message, [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setRecipients('');
              setMessage('');
              setCostData(null);
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to send SMS');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error');
    } finally {
      setSending(false);
    }
  };

  // Handle schedule SMS
  const handleScheduleSms = async () => {
    if (!recipients.trim()) {
      Alert.alert('Error', 'Please enter recipient numbers');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    if (!scheduleDate || !scheduleHour || !scheduleMinute) {
      Alert.alert('Error', 'Please select schedule date and time');
      return;
    }

    setSending(true);
    try {
      const result = await scheduleSms(
        recipients,
        message,
        senderId,
        scheduleDate,
        scheduleHour,
        scheduleMinute,
        messageType,
      );
      if (result.success) {
        Alert.alert('Success', result.message, [
          {
            text: 'OK',
            onPress: () => {
              setRecipients('');
              setMessage('');
              setCostData(null);
              setShowSchedule(false);
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to schedule SMS');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error');
    } finally {
      setSending(false);
    }
  };

  // Add selected contacts to recipients
  const handleAddContacts = () => {
    if (selectedContacts.length === 0) {
      Alert.alert('Error', 'Please select at least one contact');
      return;
    }

    const currentRecipients = recipients.trim();
    const newRecipients = selectedContacts.join(', ');
    setRecipients(
      currentRecipients
        ? `${currentRecipients}, ${newRecipients}`
        : newRecipients,
    );
    setSelectedContacts([]);
    setShowContactsModal(false);
  };

  // Toggle contact selection
  const toggleContactSelection = (number: string) => {
    if (selectedContacts.includes(number)) {
      setSelectedContacts(selectedContacts.filter(n => n !== number));
    } else {
      setSelectedContacts([...selectedContacts, number]);
    }
  };

  // Filter contacts by search
  const filteredContacts = contacts.filter(
    contact =>
      contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      contact.number.includes(contactSearch),
  );

  // Get character count color
  const getCharCountColor = () => {
    if (charInfo.length > 1206) return '#dc2626';
    if (charInfo.length > 918) return '#ea6118';
    if (charInfo.length > 459) return '#f59e0b';
    return '#64748b';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ea6118" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send SMS</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.walletAmount}>
            {pageData?.wallet.formatted || '£0.00'}
          </Text>
        </View>

        {/* Message Type Selection */}
        {pageData?.whatsapp_enabled && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Message Type</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  messageType === 'sms' && styles.typeButtonActive,
                ]}
                onPress={() => setMessageType('sms')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    messageType === 'sms' && styles.typeButtonTextActive,
                  ]}>
                  SMS
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  messageType === 'whatsapp' && styles.typeButtonActive,
                ]}
                onPress={() => setMessageType('whatsapp')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    messageType === 'whatsapp' && styles.typeButtonTextActive,
                  ]}>
                  WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sender ID */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sender ID</Text>
          <View style={styles.senderRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                setUseDefaultSender(!useDefaultSender);
                if (!useDefaultSender) {
                  setSenderId(pageData?.sender_id.default || '');
                } else {
                  setSenderId(pageData?.sender_id.custom || '');
                }
              }}>
              <View
                style={[
                  styles.checkbox,
                  useDefaultSender && styles.checkboxChecked,
                ]}>
                {useDefaultSender && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                Use default ({pageData?.sender_id.default})
              </Text>
            </TouchableOpacity>
          </View>
          {!useDefaultSender && (
            <TextInput
              style={styles.input}
              value={senderId}
              onChangeText={setSenderId}
              placeholder="Enter sender ID (max 11 chars)"
              maxLength={15}
            />
          )}
        </View>

        {/* Recipients */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recipients</Text>
            <TouchableOpacity
              style={styles.addContactsButton}
              onPress={() => {
                setShowContactsModal(true);
                loadContacts(contactType);
              }}>
              <Text style={styles.addContactsText}>+ Add Contacts</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={recipients}
            onChangeText={setRecipients}
            placeholder="Enter phone numbers separated by commas"
            multiline
            numberOfLines={3}
          />
          <Text style={styles.hint}>
            Supports UK (07...), international (+44..., 91...)
          </Text>
        </View>

        {/* Message Content */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Message</Text>
          <TextInput
            style={[styles.input, styles.messageArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message here..."
            multiline
            numberOfLines={5}
            maxLength={1206}
          />
          <View style={styles.charCountRow}>
            <Text style={[styles.charCount, {color: getCharCountColor()}]}>
              {charInfo.length} characters / {charInfo.parts} SMS
              {charInfo.parts > 1 && ' (multi-part)'}
            </Text>
            {charInfo.length > 1206 && (
              <Text style={styles.charWarning}>⚠ Exceeds maximum</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={[styles.actionButton, styles.calculateButton]}
            onPress={handleCalculateCost}
            disabled={calculating}>
            {calculating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Calculate Cost</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.sendButton]}
            onPress={handleSendSms}
            disabled={sending}>
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Send Now</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Schedule Section */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.scheduleHeader}
            onPress={() => setShowSchedule(!showSchedule)}>
            <Text style={styles.cardTitle}>Schedule Message</Text>
            <Text style={styles.expandIcon}>{showSchedule ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showSchedule && (
            <View style={styles.scheduleContent}>
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleField}>
                  <Text style={styles.scheduleLabel}>Date</Text>
                  <TextInput
                    style={styles.scheduleInput}
                    value={scheduleDate}
                    onChangeText={setScheduleDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={styles.scheduleField}>
                  <Text style={styles.scheduleLabel}>Hour</Text>
                  <TextInput
                    style={styles.scheduleInput}
                    value={scheduleHour}
                    onChangeText={setScheduleHour}
                    placeholder="HH"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <View style={styles.scheduleField}>
                  <Text style={styles.scheduleLabel}>Min</Text>
                  <TextInput
                    style={styles.scheduleInput}
                    value={scheduleMinute}
                    onChangeText={setScheduleMinute}
                    placeholder="MM"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, styles.scheduleButton]}
                onPress={handleScheduleSms}
                disabled={sending}>
                {sending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Schedule Send</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Cost Modal */}
      <Modal
        visible={showCostModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCostModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cost Breakdown</Text>
              <TouchableOpacity onPress={() => setShowCostModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {costData && (
              <ScrollView style={styles.modalBody}>
                {/* Message Info */}
                <View style={styles.costSection}>
                  <Text style={styles.costSectionTitle}>Message Details</Text>
                  <Text style={styles.costItem}>
                    Characters: {costData.message_info.length}
                  </Text>
                  <Text style={styles.costItem}>
                    SMS Parts: {costData.message_info.sms_parts}
                  </Text>
                </View>

                {/* Recipients */}
                <View style={styles.costSection}>
                  <Text style={styles.costSectionTitle}>Recipients</Text>
                  <Text style={styles.costItem}>
                    Valid: {costData.recipients.total}
                  </Text>
                  {costData.recipients.invalid > 0 && (
                    <Text style={[styles.costItem, styles.invalidText]}>
                      Invalid: {costData.recipients.invalid}
                    </Text>
                  )}
                </View>

                {/* Cost Breakdown */}
                {costData.cost_breakdown.length > 0 && (
                  <View style={styles.costSection}>
                    <Text style={styles.costSectionTitle}>Cost by Country</Text>
                    {costData.cost_breakdown.map((item, index) => (
                      <View key={index} style={styles.costRow}>
                        <Text style={styles.costItem}>
                          {item.country} (+{item.dialcode})
                        </Text>
                        <Text style={styles.costItem}>
                          {item.count} × £{item.rate_per_sms.toFixed(4)} = £
                          {item.total_cost.toFixed(4)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Total */}
                <View style={styles.totalSection}>
                  <Text style={styles.totalLabel}>Total Cost</Text>
                  <Text style={styles.totalAmount}>
                    {costData.total_cost.formatted}
                  </Text>
                </View>

                {/* Wallet Status */}
                <View
                  style={[
                    styles.walletStatus,
                    costData.wallet.sufficient_funds
                      ? styles.walletOk
                      : styles.walletInsufficient,
                  ]}>
                  <Text style={styles.walletStatusText}>
                    Balance: {costData.wallet.formatted}
                  </Text>
                  {costData.wallet.sufficient_funds ? (
                    <Text style={styles.walletStatusSuccess}>
                      ✓ Sufficient funds
                    </Text>
                  ) : (
                    <Text style={styles.walletStatusError}>
                      ⚠ Insufficient funds (need £{costData.wallet.shortage} more)
                    </Text>
                  )}
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCostModal(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Contacts Modal */}
      <Modal
        visible={showContactsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContactsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Contacts</Text>
              <TouchableOpacity onPress={() => setShowContactsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Contact Type Tabs */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  contactType === 'favourites' && styles.tabActive,
                ]}
                onPress={() => {
                  setContactType('favourites');
                  loadContacts('favourites');
                }}>
                <Text
                  style={[
                    styles.tabText,
                    contactType === 'favourites' && styles.tabTextActive,
                  ]}>
                  Favourites
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  contactType === 'groups' && styles.tabActive,
                ]}
                onPress={() => {
                  setContactType('groups');
                  loadContacts('groups');
                }}>
                <Text
                  style={[
                    styles.tabText,
                    contactType === 'groups' && styles.tabTextActive,
                  ]}>
                  Groups
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              value={contactSearch}
              onChangeText={setContactSearch}
              placeholder="Search contacts..."
            />

            {/* Contacts List */}
            <ScrollView style={styles.contactsList}>
              {filteredContacts.length === 0 ? (
                <Text style={styles.noContacts}>No contacts found</Text>
              ) : (
                filteredContacts.map((contact, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.contactItem}
                    onPress={() => toggleContactSelection(contact.number)}>
                    <View
                      style={[
                        styles.contactCheckbox,
                        selectedContacts.includes(contact.number) &&
                          styles.contactCheckboxChecked,
                      ]}>
                      {selectedContacts.includes(contact.number) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactNumber}>{contact.number}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonOutline]}
                onPress={() => {
                  setSelectedContacts([]);
                  setShowContactsModal(false);
                }}>
                <Text style={styles.modalButtonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAddContacts}>
                <Text style={styles.modalButtonText}>
                  Add ({selectedContacts.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#293b50',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  walletCard: {
    backgroundColor: '#293b50',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  walletLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  walletAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#293b50',
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#ea6118',
    backgroundColor: '#ea6118',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  senderRow: {
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#ea6118',
    borderColor: '#ea6118',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#475569',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#293b50',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  messageArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  addContactsButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ea6118',
    borderRadius: 6,
  },
  addContactsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  charWarning: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  actionsCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  calculateButton: {
    backgroundColor: '#0891b2',
  },
  sendButton: {
    backgroundColor: '#16a34a',
  },
  scheduleButton: {
    backgroundColor: '#ea6118',
    marginTop: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandIcon: {
    fontSize: 12,
    color: '#64748b',
  },
  scheduleContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleField: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  scheduleInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 30,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293b50',
  },
  modalClose: {
    fontSize: 24,
    color: '#64748b',
    padding: 4,
  },
  modalBody: {
    maxHeight: 400,
  },
  costSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  costSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293b50',
    marginBottom: 8,
  },
  costItem: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  costRow: {
    marginBottom: 8,
  },
  invalidText: {
    color: '#dc2626',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293b50',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ea6118',
  },
  walletStatus: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  walletOk: {
    backgroundColor: '#dcfce7',
  },
  walletInsufficient: {
    backgroundColor: '#fee2e2',
  },
  walletStatusText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  walletStatusSuccess: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  walletStatusError: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  modalButton: {
    backgroundColor: '#ea6118',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  modalButtonOutlineText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  // Contacts Modal
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  tabActive: {
    borderBottomColor: '#ea6118',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ea6118',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  contactsList: {
    maxHeight: 300,
  },
  noContacts: {
    textAlign: 'center',
    color: '#94a3b8',
    paddingVertical: 40,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  contactCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactCheckboxChecked: {
    backgroundColor: '#ea6118',
    borderColor: '#ea6118',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293b50',
  },
  contactNumber: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});

export default SendSmsScreen;
