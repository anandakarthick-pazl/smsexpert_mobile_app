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

interface SendNewSMSScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

const SendNewSMSScreen: React.FC<SendNewSMSScreenProps> = ({navigation}) => {
  // Accordion State
  const [activeAccordion, setActiveAccordion] = useState<number>(1);
  
  // Form State
  const [paymentType, setPaymentType] = useState('wallet');
  const [messageType, setMessageType] = useState('sms');
  const [senderIdType, setSenderIdType] = useState('custom');
  const [customSenderId, setCustomSenderId] = useState('MYBRANDNAME');
  const [recipients, setRecipients] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sendDate, setSendDate] = useState('2025-12-07');
  const [sendHour, setSendHour] = useState('16');
  const [sendMinute, setSendMinute] = useState('00');
  const [listType, setListType] = useState('favourites');
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

  const getCharacterCount = () => messageContent.length;
  
  const getSMSParts = () => {
    const len = getCharacterCount();
    if (len <= 160) return 1;
    return Math.ceil(len / 153);
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleCalculateCost = () => {
    if (!recipients.trim()) {
      Alert.alert('Error', 'You must enter phone numbers in the To: box');
      return;
    }
    if (!messageContent.trim()) {
      Alert.alert('Error', 'Please enter a message to calculate cost');
      return;
    }
    Alert.alert(
      'Cost Calculation',
      `Message: ${getCharacterCount()} characters (${getSMSParts()} SMS parts)\nRecipients: ${recipients.split(',').length}\n\nEstimated Cost: £0.045`,
      [{text: 'OK'}]
    );
  };

  const handleSendNow = () => {
    if (!recipients.trim()) {
      Alert.alert('Error', 'Please enter recipient numbers');
      return;
    }
    if (!messageContent.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    Alert.alert('Success', 'Your SMS has been sent successfully!');
  };

  const handleSendLater = () => {
    if (!recipients.trim()) {
      Alert.alert('Error', 'Please enter recipient numbers');
      return;
    }
    if (!messageContent.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    Alert.alert('Scheduled', `Your SMS has been scheduled for ${sendDate} at ${sendHour}:${sendMinute}`);
  };

  const handleAddContacts = () => {
    Alert.alert('Add Contacts', 'Contact selection feature coming soon');
  };

  const handleLaunchCampaign = () => {
    Alert.alert('Campaign Manager', 'Launching Campaign Manager...');
  };

  const handleUploadBlacklist = () => {
    Alert.alert('Upload', 'File upload feature coming soon');
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      <Header
        title="Send New SMS"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
        walletBalance="£6859"
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Option 1: Quick Send SMS */}
          <View style={styles.accordionItem}>
            {renderAccordionHeader(1, '⚡', 'Option 1: Quickly Send SMS Messages')}
            
            {activeAccordion === 1 && (
              <View style={styles.accordionBody}>
                {/* Wallet Balance Card */}
                <View style={styles.walletCard}>
                  <Text style={styles.walletAmount}>£ 6859.83</Text>
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
                      <TouchableOpacity
                        style={[styles.radioOption, paymentType === 'wallet' && styles.radioOptionActive]}
                        onPress={() => setPaymentType('wallet')}>
                        <View style={[styles.radioCircle, paymentType === 'wallet' && styles.radioCircleActive]}>
                          {paymentType === 'wallet' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioLabel}>I will pay using my Wallet</Text>
                      </TouchableOpacity>
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
                      </View>
                    </View>

                    {/* Sender ID */}
                    <View style={styles.formGroup}>
                      <View style={styles.formLabelRow}>
                        <Text style={styles.formLabelIcon}>👤</Text>
                        <Text style={styles.formLabel}>From (Sender ID)</Text>
                        <Text style={styles.helpIcon}>❓</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.radioOption, senderIdType === 'default' && styles.radioOptionActive, {marginBottom: 10}]}
                        onPress={() => setSenderIdType('default')}>
                        <View style={[styles.radioCircle, senderIdType === 'default' && styles.radioCircleActive]}>
                          {senderIdType === 'default' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioLabel}>MYBRANDNAME</Text>
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
                        <Text style={styles.helpIcon}>❓</Text>
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
                      />
                      <Text style={styles.charCounter}>
                        {getCharacterCount()} characters / {getSMSParts()} SMS
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.calculateButton} onPress={handleCalculateCost}>
                        <Text style={styles.calculateButtonIcon}>🧮</Text>
                        <Text style={styles.calculateButtonText}>Calculate Cost</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.sendButton} onPress={handleSendNow}>
                        <Text style={styles.sendButtonIcon}>📤</Text>
                        <Text style={styles.sendButtonText}>Send Now</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Schedule Section */}
                    <View style={styles.scheduleSection}>
                      <View style={styles.formLabelRow}>
                        <Text style={styles.formLabelIcon}>⏰</Text>
                        <Text style={styles.formLabel}>Schedule Message</Text>
                      </View>
                      <View style={styles.scheduleRow}>
                        <TouchableOpacity style={styles.scheduleButton} onPress={handleSendLater}>
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
                        <Text style={styles.noContactsText}>No contacts available</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.addContactsButton} onPress={handleAddContacts}>
                      <Text style={styles.addContactsIcon}>➕</Text>
                      <Text style={styles.addContactsText}>Add Selected Contacts</Text>
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
                  <Text style={styles.uploadTitle}>Upload Blacklist File</Text>
                  <TouchableOpacity style={styles.uploadButton} onPress={handleUploadBlacklist}>
                    <Text style={styles.uploadButtonIcon}>📤</Text>
                    <Text style={styles.uploadButtonText}>Choose File</Text>
                  </TouchableOpacity>
                  <View style={styles.uploadRequirements}>
                    <Text style={styles.requirementsTitle}>File Requirements:</Text>
                    <Text style={styles.requirementItem}>• File must be plain text ending in .txt</Text>
                    <Text style={styles.requirementItem}>• One phone number per line</Text>
                    <Text style={styles.requirementItem}>• Contact support for instructions</Text>
                  </View>
                </View>
              </View>
            )}
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
  // Main Card
  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  // Accordion
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
  // Wallet Card
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
  // Form Group
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
  helpIcon: {
    fontSize: 16,
    marginLeft: 8,
    color: '#64748b',
  },
  // Radio Group
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
  // Input
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
  // Action Buttons
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
  // Schedule Section
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
  // Contact List
  contactList: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Campaign Section
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
  // Upload Section
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
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
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
  uploadRequirements: {
    alignSelf: 'stretch',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default SendNewSMSScreen;
