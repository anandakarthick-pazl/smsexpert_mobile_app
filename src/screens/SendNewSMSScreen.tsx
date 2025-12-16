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
  Modal,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getSendSmsData,
  getContacts,
  calculateSmsCost,
  sendSms,
  scheduleSms,
  getCharacterCountInfo,
  SendSmsData,
  Contact,
  CalculateCostData,
} from '../services/smsService';

interface SendNewSMSScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

const SendNewSMSScreen: React.FC<SendNewSMSScreenProps> = ({navigation}) => {
  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Data States
  const [smsData, setSmsData] = useState<SendSmsData | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [costData, setCostData] = useState<CalculateCostData | null>(null);
  const [showCostModal, setShowCostModal] = useState(false);

  // Accordion State
  const [activeAccordion, setActiveAccordion] = useState<number>(1);

  // Form State
  const [messageType, setMessageType] = useState<'sms' | 'whatsapp'>('sms');
  const [senderIdType, setSenderIdType] = useState<'default' | 'custom'>('custom');
  const [customSenderId, setCustomSenderId] = useState('');
  const [recipients, setRecipients] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sendDate, setSendDate] = useState('');
  const [sendHour, setSendHour] = useState('');
  const [sendMinute, setSendMinute] = useState('');
  const [listType, setListType] = useState<'favourites' | 'groups'>('favourites');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Dropdown States
  const [showHourDropdown, setShowHourDropdown] = useState(false);
  const [showMinuteDropdown, setShowMinuteDropdown] = useState(false);
  const [showListTypeDropdown, setShowListTypeDropdown] = useState(false);

  const hourOptions = Array.from({length: 24}, (_, i) => ({
    value: String(i).padStart(2, '0'),
    label: `${String(i).padStart(2, '0')}:00`,
  }));

  const minuteOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => ({
    value: m,
    label: `:${m}`,
  }));

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const result = await getSendSmsData();
      if (result.success && result.data) {
        setSmsData(result.data);
        setCustomSenderId(result.data.sender_id.custom || result.data.sender_id.default);
        setSendDate(result.data.current_time.date);
        setSendHour(result.data.current_time.hour);
        setSendMinute(result.data.current_time.minute.padStart(2, '0'));
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load contacts
  const loadContacts = useCallback(async (type: 'favourites' | 'groups') => {
    setIsLoadingContacts(true);
    try {
      const result = await getContacts(type);
      if (result.success && result.data) {
        setContacts(result.data.contacts);
      } else {
        setContacts([]);
      }
    } catch (error) {
      setContacts([]);
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadContacts(listType);
  }, [listType, loadContacts]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
    loadContacts(listType);
  };

  const getCharacterInfo = () => {
    return getCharacterCountInfo(messageContent);
  };

  const handleCalculateCost = async () => {
    if (!recipients.trim()) {
      Alert.alert('Error', 'You must enter phone numbers in the To: box');
      return;
    }
    if (!messageContent.trim()) {
      Alert.alert('Error', 'Please enter a message to calculate cost');
      return;
    }

    setIsCalculating(true);
    try {
      const result = await calculateSmsCost(recipients, messageContent);
      if (result.success && result.data) {
        setCostData(result.data);
        setShowCostModal(true);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate cost');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSendNow = async () => {
    if (!recipients.trim()) {
      Alert.alert('Error', 'Please enter recipient numbers');
      return;
    }
    if (!messageContent.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    const senderId = senderIdType === 'default' && smsData
      ? smsData.sender_id.default
      : customSenderId;

    if (!senderId) {
      Alert.alert('Error', 'Please enter a sender ID');
      return;
    }

    Alert.alert(
      'Confirm Send',
      `Are you sure you want to send this SMS to ${recipients.split(',').length} recipient(s)?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Send',
          onPress: async () => {
            setIsSending(true);
            try {
              const result = await sendSms(recipients, messageContent, senderId, messageType);
              if (result.success) {
                Alert.alert('Success', result.message, [
                  {
                    text: 'OK',
                    onPress: () => {
                      setRecipients('');
                      setMessageContent('');
                      loadData(); // Refresh wallet balance
                    },
                  },
                ]);
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to send SMS');
            } finally {
              setIsSending(false);
            }
          },
        },
      ],
    );
  };

  const handleSendLater = async () => {
    if (!recipients.trim()) {
      Alert.alert('Error', 'Please enter recipient numbers');
      return;
    }
    if (!messageContent.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    const senderId = senderIdType === 'default' && smsData
      ? smsData.sender_id.default
      : customSenderId;

    if (!senderId) {
      Alert.alert('Error', 'Please enter a sender ID');
      return;
    }

    Alert.alert(
      'Confirm Schedule',
      `Schedule SMS for ${sendDate} at ${sendHour}:${sendMinute}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Schedule',
          onPress: async () => {
            setIsSending(true);
            try {
              const result = await scheduleSms(
                recipients,
                messageContent,
                senderId,
                sendDate,
                sendHour,
                sendMinute,
                messageType,
              );
              if (result.success) {
                Alert.alert('Success', result.message, [
                  {
                    text: 'OK',
                    onPress: () => {
                      setRecipients('');
                      setMessageContent('');
                    },
                  },
                ]);
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to schedule SMS');
            } finally {
              setIsSending(false);
            }
          },
        },
      ],
    );
  };

  const handleAddContacts = () => {
    if (selectedContacts.length === 0) {
      Alert.alert('Info', 'Please select contacts to add');
      return;
    }

    const newNumbers = selectedContacts.join(', ');
    setRecipients(prev => (prev ? `${prev}, ${newNumbers}` : newNumbers));
    setSelectedContacts([]);
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      }
      return [...prev, contactId];
    });
  };

  const handleLaunchCampaign = () => {
    navigation.navigate('CampaignHome');
  };

  const handleUploadBlacklist = () => {
    navigation.navigate('Blacklist');
  };

  const renderAccordionHeader = (
    index: number,
    icon: string,
    title: string,
  ) => (
    <TouchableOpacity
      style={[
        styles.accordionHeader,
        activeAccordion === index && styles.accordionHeaderActive,
      ]}
      onPress={() => setActiveAccordion(activeAccordion === index ? 0 : index)}>
      <View style={styles.accordionHeaderLeft}>
        <Text style={styles.accordionIcon}>{icon}</Text>
        <Text
          style={[
            styles.accordionTitle,
            activeAccordion === index && styles.accordionTitleActive,
          ]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.accordionArrow, activeAccordion === index && styles.accordionArrowActive]}>
        {activeAccordion === index ? '▲' : '▼'}
      </Text>
    </TouchableOpacity>
  );

  const renderCostModal = () => (
    <Modal
      visible={showCostModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCostModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💰 Cost Calculation</Text>
            <TouchableOpacity onPress={() => setShowCostModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {costData && (
            <ScrollView style={styles.modalBody}>
              {/* Message Info */}
              <View style={styles.costSection}>
                <Text style={styles.costSectionTitle}>📝 Message Details</Text>
                <Text style={styles.costText}>
                  Characters: {costData.message_info.length}
                </Text>
                <Text style={styles.costText}>
                  SMS Parts: {costData.message_info.sms_parts}
                </Text>
                <Text style={styles.costTextSmall}>
                  {costData.message_info.part_info}
                </Text>
              </View>

              {/* Recipients Info */}
              <View style={styles.costSection}>
                <Text style={styles.costSectionTitle}>👥 Recipients</Text>
                <Text style={styles.costText}>
                  Valid Numbers: {costData.recipients.total}
                </Text>
                {costData.recipients.invalid > 0 && (
                  <Text style={styles.costTextWarning}>
                    Invalid Numbers: {costData.recipients.invalid}
                  </Text>
                )}
              </View>

              {/* Cost Breakdown */}
              {costData.cost_breakdown.length > 0 && (
                <View style={styles.costSection}>
                  <Text style={styles.costSectionTitle}>📊 Cost Breakdown</Text>
                  {costData.cost_breakdown.map((item, index) => (
                    <View key={index} style={styles.costBreakdownItem}>
                      <Text style={styles.costText}>
                        {item.country} (+{item.dialcode}): {item.count} number(s)
                      </Text>
                      <Text style={styles.costTextSmall}>
                        Rate: £{item.rate_per_sms.toFixed(4)} × {costData.message_info.sms_parts} SMS = £{item.total_cost.toFixed(4)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Total Cost */}
              <View style={styles.costSection}>
                <Text style={styles.costSectionTitle}>💷 Total Cost</Text>
                <Text style={styles.costTotal}>{costData.total_cost.formatted}</Text>
              </View>

              {/* Wallet Balance */}
              <View style={[
                styles.costSection,
                !costData.wallet.sufficient_funds && styles.costSectionError,
              ]}>
                <Text style={styles.costText}>
                  Wallet Balance: {costData.wallet.formatted}
                </Text>
                {costData.wallet.sufficient_funds ? (
                  <Text style={styles.costTextSuccess}>
                    ✓ Sufficient funds available
                  </Text>
                ) : (
                  <Text style={styles.costTextError}>
                    ⚠ Insufficient funds! Need £{costData.wallet.shortage.toFixed(2)} more
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
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header
          title="Send New SMS"
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={() => {}}
          notificationCount={0}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const charInfo = getCharacterInfo();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />

      <Header
        title="Send New SMS"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={() => Alert.alert('Notifications', 'Coming soon')}
        notificationCount={0}
        walletBalance={smsData?.wallet.formatted}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>

        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Option 1: Quick Send SMS */}
          <View style={styles.accordionItem}>
            {renderAccordionHeader(1, '⚡', 'Option 1: Quickly Send SMS Messages')}

            {activeAccordion === 1 && (
              <View style={styles.accordionBody}>
                {/* Wallet Balance Card */}
                <View style={styles.walletCard}>
                  <Text style={styles.walletAmount}>
                    {smsData?.wallet.formatted || '£ 0.00'}
                  </Text>
                  <Text style={styles.walletLabel}>
                    Remaining in your Wallet
                  </Text>
                </View>

                {/* Compose Message Section */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionIcon}>✏️</Text>
                    <Text style={styles.sectionTitle}>Compose Message</Text>
                  </View>

                  <View style={styles.sectionContent}>
                    {/* Payment Type */}
                    <View style={styles.formGroup}>
                      <View style={styles.formLabelRow}>
                        <Text style={styles.formLabelIcon}>💳</Text>
                        <Text style={styles.formLabel}>Who is Paying?</Text>
                      </View>
                      <View style={[styles.radioOption, styles.radioOptionActive]}>
                        <View style={[styles.radioCircle, styles.radioCircleActive]}>
                          <View style={styles.radioInner} />
                        </View>
                        <Text style={styles.radioLabel}>I will pay using my Wallet</Text>
                      </View>
                    </View>

                    {/* Message Type */}
                    <View style={styles.formGroup}>
                      <View style={styles.formLabelRow}>
                        <Text style={styles.formLabelIcon}>💬</Text>
                        <Text style={styles.formLabel}>Select Message Type</Text>
                      </View>
                      <View style={styles.messageTypeBox}>
                        <TouchableOpacity
                          style={[styles.radioOption, messageType === 'sms' && styles.radioOptionActive]}
                          onPress={() => setMessageType('sms')}>
                          <View style={[styles.radioCircle, messageType === 'sms' && styles.radioCircleActive]}>
                            {messageType === 'sms' && <View style={styles.radioInner} />}
                          </View>
                          <Text style={styles.radioLabel}>📱 SMS</Text>
                        </TouchableOpacity>
                        {smsData?.whatsapp_enabled && (
                          <TouchableOpacity
                            style={[styles.radioOption, messageType === 'whatsapp' && styles.radioOptionActive, {marginTop: 10}]}
                            onPress={() => setMessageType('whatsapp')}>
                            <View style={[styles.radioCircle, messageType === 'whatsapp' && styles.radioCircleActive]}>
                              {messageType === 'whatsapp' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>💬 WhatsApp</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Sender ID */}
                    <View style={styles.formGroup}>
                      <View style={styles.formLabelRow}>
                        <Text style={styles.formLabelIcon}>👤</Text>
                        <Text style={styles.formLabel}>From (Sender ID)</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.radioOption, senderIdType === 'default' && styles.radioOptionActive, {marginBottom: 10}]}
                        onPress={() => setSenderIdType('default')}>
                        <View style={[styles.radioCircle, senderIdType === 'default' && styles.radioCircleActive]}>
                          {senderIdType === 'default' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioLabel}>
                          {smsData?.sender_id.default || 'MYBRANDNAME'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.radioOption, senderIdType === 'custom' && styles.radioOptionActive]}
                        onPress={() => setSenderIdType('custom')}>
                        <View style={[styles.radioCircle, senderIdType === 'custom' && styles.radioCircleActive]}>
                          {senderIdType === 'custom' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioLabel}>Custom:</Text>
                      </TouchableOpacity>
                      {senderIdType === 'custom' && (
                        <TextInput
                          style={[styles.textInput, {marginTop: 10}]}
                          value={customSenderId}
                          onChangeText={setCustomSenderId}
                          placeholder="Enter sender ID"
                          placeholderTextColor="#94a3b8"
                          maxLength={15}
                        />
                      )}
                    </View>

                    {/* Recipients */}
                    <View style={styles.formGroup}>
                      <View style={styles.formLabelRow}>
                        <Text style={styles.formLabelIcon}>👥</Text>
                        <Text style={styles.formLabel}>To (Recipients)</Text>
                      </View>
                      <TextInput
                        style={[styles.textInput, styles.textArea]}
                        value={recipients}
                        onChangeText={setRecipients}
                        placeholder="Enter mobile numbers separated by commas..."
                        placeholderTextColor="#94a3b8"
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    {/* Message Content */}
                    <View style={styles.formGroup}>
                      <View style={styles.formLabelRow}>
                        <Text style={styles.formLabelIcon}>📝</Text>
                        <Text style={styles.formLabel}>Message Content</Text>
                      </View>
                      <TextInput
                        style={[styles.textInput, styles.textArea]}
                        value={messageContent}
                        onChangeText={setMessageContent}
                        placeholder="Type your message here..."
                        placeholderTextColor="#94a3b8"
                        multiline
                        numberOfLines={4}
                        maxLength={1206}
                      />
                      <Text style={[
                        styles.charCounter,
                        charInfo.length > 918 && styles.charCounterWarning,
                        charInfo.length > 1071 && styles.charCounterError,
                      ]}>
                        {charInfo.length} characters / {charInfo.parts} SMS
                        {charInfo.isMultiPart && ' (multi-part)'}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.calculateButton, isCalculating && styles.buttonDisabled]}
                        onPress={handleCalculateCost}
                        disabled={isCalculating}>
                        {isCalculating ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Text style={styles.calculateButtonIcon}>🧮</Text>
                            <Text style={styles.calculateButtonText}>Calculate Cost</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.sendButton, isSending && styles.buttonDisabled]}
                        onPress={handleSendNow}
                        disabled={isSending}>
                        {isSending ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Text style={styles.sendButtonIcon}>📤</Text>
                            <Text style={styles.sendButtonText}>Send Now</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Schedule Section */}
                    <View style={styles.scheduleSection}>
                      <View style={styles.formLabelRow}>
                        <Text style={styles.formLabelIcon}>⏰</Text>
                        <Text style={styles.formLabel}>Schedule Message</Text>
                      </View>
                      <View style={styles.scheduleRow}>
                        <TouchableOpacity
                          style={[styles.scheduleButton, isSending && styles.buttonDisabled]}
                          onPress={handleSendLater}
                          disabled={isSending}>
                          <Text style={styles.scheduleButtonIcon}>📅</Text>
                          <Text style={styles.scheduleButtonText}>Send at</Text>
                        </TouchableOpacity>
                        <View style={styles.dateInput}>
                          <Text style={styles.dateText}>{sendDate}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.timeDropdown}
                          onPress={() => setShowHourDropdown(!showHourDropdown)}>
                          <Text style={styles.timeText}>{sendHour}:00</Text>
                          <Text style={styles.dropdownIcon}>▼</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.timeDropdown}
                          onPress={() => setShowMinuteDropdown(!showMinuteDropdown)}>
                          <Text style={styles.timeText}>:{sendMinute}</Text>
                          <Text style={styles.dropdownIcon}>▼</Text>
                        </TouchableOpacity>
                      </View>
                      {showHourDropdown && (
                        <View style={styles.dropdownList}>
                          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                            {hourOptions.map(option => (
                              <TouchableOpacity
                                key={option.value}
                                style={[styles.dropdownItem, sendHour === option.value && styles.dropdownItemActive]}
                                onPress={() => {
                                  setSendHour(option.value);
                                  setShowHourDropdown(false);
                                }}>
                                <Text style={[styles.dropdownItemText, sendHour === option.value && styles.dropdownItemTextActive]}>
                                  {option.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                      {showMinuteDropdown && (
                        <View style={styles.dropdownList}>
                          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                            {minuteOptions.map(option => (
                              <TouchableOpacity
                                key={option.value}
                                style={[styles.dropdownItem, sendMinute === option.value && styles.dropdownItemActive]}
                                onPress={() => {
                                  setSendMinute(option.value);
                                  setShowMinuteDropdown(false);
                                }}>
                                <Text style={[styles.dropdownItemText, sendMinute === option.value && styles.dropdownItemTextActive]}>
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

                {/* Contacts & Groups Section */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionIcon}>📇</Text>
                    <Text style={styles.sectionTitle}>Contacts & Groups</Text>
                  </View>

                  <View style={styles.sectionContent}>
                    <View style={styles.formGroup}>
                      <View style={styles.formLabelRow}>
                        <Text style={styles.formLabelIcon}>📋</Text>
                        <Text style={styles.formLabel}>Select List Type</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setShowListTypeDropdown(!showListTypeDropdown)}>
                        <Text style={styles.dropdownText}>
                          {listType === 'favourites' ? 'Favourites' : 'Groups'}
                        </Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                      </TouchableOpacity>
                      {showListTypeDropdown && (
                        <View style={styles.dropdownList}>
                          <TouchableOpacity
                            style={[styles.dropdownItem, listType === 'favourites' && styles.dropdownItemActive]}
                            onPress={() => {
                              setListType('favourites');
                              setShowListTypeDropdown(false);
                            }}>
                            <Text style={[styles.dropdownItemText, listType === 'favourites' && styles.dropdownItemTextActive]}>
                              Favourites
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.dropdownItem, listType === 'groups' && styles.dropdownItemActive]}
                            onPress={() => {
                              setListType('groups');
                              setShowListTypeDropdown(false);
                            }}>
                            <Text style={[styles.dropdownItemText, listType === 'groups' && styles.dropdownItemTextActive]}>
                              Groups
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    <View style={styles.formGroup}>
                      <View style={styles.formLabelRow}>
                        <Text style={styles.formLabelIcon}>👤</Text>
                        <Text style={styles.formLabel}>Available Contacts</Text>
                      </View>
                      <View style={styles.contactList}>
                        {isLoadingContacts ? (
                          <ActivityIndicator size="small" color="#ea6118" />
                        ) : contacts.length > 0 ? (
                          <ScrollView style={styles.contactScroll} nestedScrollEnabled>
                            {contacts.map(contact => (
                              <TouchableOpacity
                                key={contact.id}
                                style={[
                                  styles.contactItem,
                                  selectedContacts.includes(contact.number) && styles.contactItemSelected,
                                ]}
                                onPress={() => toggleContactSelection(contact.number)}>
                                <View style={[
                                  styles.contactCheckbox,
                                  selectedContacts.includes(contact.number) && styles.contactCheckboxSelected,
                                ]}>
                                  {selectedContacts.includes(contact.number) && (
                                    <Text style={styles.contactCheckmark}>✓</Text>
                                  )}
                                </View>
                                <View style={styles.contactInfo}>
                                  <Text style={styles.contactName}>{contact.name}</Text>
                                  <Text style={styles.contactNumber}>{contact.number}</Text>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        ) : (
                          <Text style={styles.noContactsText}>No contacts available</Text>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.addContactsButton, selectedContacts.length === 0 && styles.buttonDisabled]}
                      onPress={handleAddContacts}
                      disabled={selectedContacts.length === 0}>
                      <Text style={styles.addContactsIcon}>➕</Text>
                      <Text style={styles.addContactsText}>
                        Add Selected ({selectedContacts.length})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Option 2: Campaign Manager */}
          <View style={styles.accordionItem}>
            {renderAccordionHeader(2, '📢', 'Option 2: Campaign Manager')}

            {activeAccordion === 2 && (
              <View style={styles.accordionBody}>
                <View style={styles.campaignSection}>
                  <Text style={styles.campaignIcon}>📈</Text>
                  <Text style={styles.campaignTitle}>SMS Campaign Manager</Text>
                  <Text style={styles.campaignText}>
                    The Campaign Manager is perfect for sending very large SMS campaigns with advanced features and detailed analytics.
                  </Text>
                  <TouchableOpacity style={styles.launchButton} onPress={handleLaunchCampaign}>
                    <Text style={styles.launchButtonIcon}>🚀</Text>
                    <Text style={styles.launchButtonText}>Launch Campaign Manager</Text>
                  </TouchableOpacity>
                  <Text style={styles.campaignNote}>
                    SMS, delivery receipts, and replies sent from the Campaign Manager can also be viewed in this Dashboard.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Option 3: Upload Blacklisted Numbers */}
          <View style={styles.accordionItem}>
            {renderAccordionHeader(3, '🚫', 'Option 3: Upload Blacklisted Numbers')}

            {activeAccordion === 3 && (
              <View style={styles.accordionBody}>
                <View style={styles.uploadSection}>
                  <Text style={styles.uploadIcon}>☁️</Text>
                  <Text style={styles.uploadTitle}>Manage Blacklist</Text>
                  <Text style={styles.uploadDescription}>
                    View and manage your blacklisted numbers to prevent sending SMS to blocked contacts.
                  </Text>
                  <TouchableOpacity style={styles.uploadButton} onPress={handleUploadBlacklist}>
                    <Text style={styles.uploadButtonIcon}>📋</Text>
                    <Text style={styles.uploadButtonText}>View Blacklist</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Cost Modal */}
      {renderCostModal()}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  accordionHeaderActive: {
    backgroundColor: '#ea6118',
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
    flex: 1,
  },
  accordionTitleActive: {
    color: '#ffffff',
  },
  accordionArrow: {
    fontSize: 14,
    color: '#64748b',
  },
  accordionArrowActive: {
    color: '#ffffff',
  },
  accordionBody: {
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  walletCard: {
    backgroundColor: '#293B50',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  walletAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  walletLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
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
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  sectionContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  formLabelIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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
  messageTypeBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#293B50',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 8,
  },
  charCounterWarning: {
    color: '#f59e0b',
  },
  charCounterError: {
    color: '#dc2626',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  calculateButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  calculateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  sendButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  scheduleSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  scheduleButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scheduleButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  scheduleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  dateInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#293B50',
  },
  timeDropdown: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#293B50',
    marginRight: 6,
  },
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
  },
  dropdownText: {
    fontSize: 14,
    color: '#293B50',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#64748b',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#64748b',
  },
  dropdownList: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    marginTop: 8,
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
  contactList: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    minHeight: 150,
    maxHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactScroll: {
    width: '100%',
    padding: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  contactItemSelected: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ea6118',
  },
  contactCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactCheckboxSelected: {
    backgroundColor: '#ea6118',
    borderColor: '#ea6118',
  },
  contactCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
  },
  contactNumber: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  noContactsText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  addContactsButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  addContactsIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addContactsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  campaignSection: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ea6118',
  },
  campaignIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 10,
  },
  campaignText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  launchButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  launchButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  launchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  campaignNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  uploadSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 12,
    color: '#ea6118',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  uploadButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#293B50',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalClose: {
    fontSize: 24,
    color: '#ffffff',
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  costSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
  },
  costSectionError: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  costSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 8,
  },
  costText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  costTextSmall: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  costTextWarning: {
    fontSize: 14,
    color: '#f59e0b',
    marginBottom: 4,
  },
  costTextSuccess: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 4,
  },
  costTextError: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    marginTop: 4,
  },
  costBreakdownItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  costTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#293B50',
  },
  modalButton: {
    backgroundColor: '#ea6118',
    margin: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default SendNewSMSScreen;
