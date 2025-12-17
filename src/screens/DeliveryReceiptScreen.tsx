import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getDeliveryReceiptSettings,
  updateDeliveryReceiptUrl,
  testDeliveryReceipt,
  DeliveryReceiptSettings,
  TestResult,
} from '../services/deliveryReceiptService';

interface DeliveryReceiptScreenProps {
  navigation: any;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

const DeliveryReceiptScreen: React.FC<DeliveryReceiptScreenProps> = ({navigation, onNotificationPress, notificationCount = 0}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showTestResultModal, setShowTestResultModal] = useState(false);
  
  // Settings data
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [connectionSettings, setConnectionSettings] = useState({
    attempts: 1,
    pause_minutes: 10,
  });
  
  // Test form data
  const [msisdn, setMsisdn] = useState('447777111111');
  const [submissionRef, setSubmissionRef] = useState('12345678901234567890123456789012');
  
  // Test result
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await getDeliveryReceiptSettings();
      if (response.success && response.data) {
        setDeliveryUrl(response.data.delivery_url || '');
        setConnectionSettings(response.data.connection_settings || {
          attempts: 1,
          pause_minutes: 10,
        });
        if (response.data.test_defaults) {
          setMsisdn(response.data.test_defaults.msisdn || '447777111111');
          setSubmissionRef(response.data.test_defaults.submission_reference || '12345678901234567890123456789012');
        }
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSettings();
  };

  const validateURL = (url: string): boolean => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return false;
    }
    
    // Basic URL validation
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return false;
    }
    
    return true;
  };

  const handleUpdateConfiguration = async () => {
    if (!validateURL(deliveryUrl)) {
      return;
    }
    
    setUpdating(true);
    try {
      const response = await updateDeliveryReceiptUrl(deliveryUrl);
      if (response.success) {
        Alert.alert(
          'Success',
          'Delivery receipt URL has been updated successfully.',
          [{text: 'OK'}]
        );
        if (response.data?.delivery_url) {
          setDeliveryUrl(response.data.delivery_url);
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to update configuration');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update configuration');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitTest = async () => {
    if (!deliveryUrl.trim()) {
      Alert.alert('No URL Configured', 'Please configure a delivery receipt URL first.');
      return;
    }
    
    setTesting(true);
    try {
      const response = await testDeliveryReceipt(msisdn, submissionRef);
      if (response.success && response.data) {
        setTestResult(response.data);
        setShowTestResultModal(true);
      } else {
        Alert.alert('Error', response.message || 'Failed to send test');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send test');
    } finally {
      setTesting(false);
    }
  };

  const getTestResultStatusColor = () => {
    if (!testResult) return '#64748b';
    if (testResult.success) return '#16a34a';
    if (testResult.error) return '#dc2626';
    return '#f59e0b';
  };

  const getTestResultIcon = () => {
    if (!testResult) return '❓';
    if (testResult.success) return '✅';
    if (testResult.error) return '❌';
    return '⚠️';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header 
          title="Delivery Receipt" 
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={onNotificationPress}
          notificationCount={notificationCount}
          walletBalance="£6,859.83"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
      <Header 
        title="Delivery Receipt" 
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
        
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>📋</Text>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Delivery Receipt</Text>
              <Text style={styles.headerSubtitle}>Configure webhook URL for delivery status</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfoSheet(true)}>
            <Text style={styles.infoButtonIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* URL Configuration Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>⚙️</Text>
            <Text style={styles.cardHeaderTitle}>URL for Delivery Receipt PUSH</Text>
          </View>
          
          <View style={styles.cardBody}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>🔗</Text>
                <Text style={styles.label}>Delivery Receipts are currently being posted to...</Text>
              </View>
              <TextInput
                style={styles.input}
                value={deliveryUrl}
                onChangeText={setDeliveryUrl}
                placeholder="Enter your URL (e.g., https://your-server.com/webhook)"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                editable={!updating}
              />
            </View>

            <TouchableOpacity 
              style={[styles.updateButton, updating && styles.disabledButton]}
              onPress={handleUpdateConfiguration}
              disabled={updating}>
              {updating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.updateButtonIcon}>🔄</Text>
                  <Text style={styles.updateButtonText}>Update Configuration</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Connection Settings Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>⚡ Connection Settings:</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>Number of connection attempts:</Text>
                <Text style={styles.infoHighlight}>{connectionSettings.attempts}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>Pause between retries:</Text>
                <Text style={styles.infoHighlight}>{connectionSettings.pause_minutes} minutes</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Test Mechanism Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>🐛</Text>
            <Text style={styles.cardHeaderTitle}>Test the Delivery Receipt Mechanism</Text>
          </View>
          
          <View style={styles.cardBody}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>📱</Text>
                <Text style={styles.label}>MSISDN</Text>
              </View>
              <TextInput
                style={[styles.input, styles.readonlyInput]}
                value={msisdn}
                editable={false}
                placeholder="Enter your MSISDN"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>🔑</Text>
                <Text style={styles.label}>Submission Reference</Text>
              </View>
              <TextInput
                style={[styles.input, styles.readonlyInput]}
                value={submissionRef}
                editable={false}
                placeholder="Enter your Submission Reference"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, testing && styles.disabledButton]}
              onPress={handleSubmitTest}
              disabled={testing}>
              {testing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.submitButtonIcon}>📤</Text>
                  <Text style={styles.submitButtonText}>Submit Test</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Test Info */}
            <View style={styles.testInfoCard}>
              <Text style={styles.testInfoIcon}>ℹ️</Text>
              <Text style={styles.testInfoText}>
                Click <Text style={styles.testInfoBold}>SUBMIT TEST</Text> to generate a fake 'success' delivery receipt call to your server and see the response.
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Test Result Modal */}
      <Modal
        visible={showTestResultModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTestResultModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.resultModalContainer}>
            {/* Modal Header */}
            <View style={[styles.resultModalHeader, {backgroundColor: getTestResultStatusColor()}]}>
              <View style={styles.resultModalTitleRow}>
                <Text style={styles.resultModalIcon}>{getTestResultIcon()}</Text>
                <Text style={styles.resultModalTitle}>Test Result</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowTestResultModal(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView style={styles.resultModalBody} showsVerticalScrollIndicator={false}>
              {testResult && (
                <>
                  {/* Status */}
                  <View style={styles.resultSection}>
                    <Text style={styles.resultSectionTitle}>Status</Text>
                    <View style={[styles.statusBadge, {backgroundColor: getTestResultStatusColor()}]}>
                      <Text style={styles.statusBadgeText}>
                        {testResult.success ? 'SUCCESS' : testResult.error ? 'FAILED' : 'WARNING'}
                      </Text>
                    </View>
                  </View>

                  {/* URL */}
                  <View style={styles.resultSection}>
                    <Text style={styles.resultSectionTitle}>Target URL</Text>
                    <Text style={styles.resultValue} numberOfLines={2}>{testResult.url}</Text>
                  </View>

                  {/* Response Status */}
                  {testResult.response_status && (
                    <View style={styles.resultSection}>
                      <Text style={styles.resultSectionTitle}>HTTP Status Code</Text>
                      <Text style={styles.resultValue}>{testResult.response_status}</Text>
                    </View>
                  )}

                  {/* Error Message */}
                  {testResult.error && (
                    <View style={styles.resultSection}>
                      <Text style={styles.resultSectionTitle}>Error</Text>
                      <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{testResult.error}</Text>
                      </View>
                    </View>
                  )}

                  {/* Response Body */}
                  {testResult.response_body && (
                    <View style={styles.resultSection}>
                      <Text style={styles.resultSectionTitle}>Response Body</Text>
                      <View style={styles.codeBox}>
                        <Text style={styles.codeText}>{testResult.response_body}</Text>
                      </View>
                    </View>
                  )}

                  {/* Payload Sent */}
                  <View style={styles.resultSection}>
                    <Text style={styles.resultSectionTitle}>Payload Sent</Text>
                    <View style={styles.codeBox}>
                      <Text style={styles.codeText}>
                        {JSON.stringify(testResult.payload_sent, null, 2)}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.resultModalFooter}>
              <TouchableOpacity
                style={styles.closeResultButton}
                onPress={() => setShowTestResultModal(false)}>
                <Text style={styles.closeResultButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Info Bottom Sheet Modal */}
      <Modal
        visible={showInfoSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInfoSheet(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            {/* Modal Header */}
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetTitleRow}>
                <Text style={styles.bottomSheetIcon}>📋</Text>
                <Text style={styles.bottomSheetTitle}>Delivery Receipt Info</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* What is Delivery Receipt */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>📋</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>What is Delivery Receipt?</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    Delivery receipts are notifications sent to your server when an SMS has been successfully delivered to the recipient's phone. This helps you track message delivery status in real-time.
                  </Text>
                </View>
              </View>

              {/* URL Configuration */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.greenBg]}>
                    <Text style={styles.infoSectionIcon}>⚙️</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>URL Configuration</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.greenBorder]}>
                  <Text style={styles.infoSectionText}>
                    Configure the URL where delivery receipts will be pushed. Your server should be ready to receive HTTP POST requests with delivery status information.
                  </Text>
                </View>
              </View>

              {/* Connection Settings */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.yellowBg]}>
                    <Text style={styles.infoSectionIcon}>🔄</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Connection Settings</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.yellowBorder]}>
                  <Text style={styles.infoSectionText}>
                    The system will attempt to deliver receipts with the configured retry settings. If delivery fails, it will retry after the specified pause interval.
                  </Text>
                </View>
              </View>

              {/* Testing */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.purpleBg]}>
                    <Text style={styles.infoSectionIcon}>🐛</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Testing</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.purpleBorder]}>
                  <Text style={styles.infoSectionText}>
                    Use the test mechanism to verify your server is correctly receiving and processing delivery receipts. This sends a simulated success response to your configured URL.
                  </Text>
                </View>
              </View>

              {/* Payload Format */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.orangeBg]}>
                    <Text style={styles.infoSectionIcon}>📦</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Payload Format</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.orangeBorder]}>
                  <Text style={styles.infoSectionText}>
                    The delivery receipt payload includes: msisdn, submission_reference, status, status_code, status_text, delivery_time, and timestamp.
                  </Text>
                </View>
              </View>

            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.bottomSheetFooter}>
              <TouchableOpacity
                style={styles.closeSheetButton}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.closeSheetButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
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
  // Header Card
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth: 3,
    borderTopColor: '#ea6118',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonIcon: {
    fontSize: 18,
  },
  // Card Styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderTopWidth: 3,
    borderTopColor: '#ea6118',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cardHeaderIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#293B50',
    flex: 1,
  },
  cardBody: {
    padding: 16,
  },
  // Input Styles
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#293B50',
  },
  readonlyInput: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  // Button Styles
  updateButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 50,
  },
  updateButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 50,
  },
  submitButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  // Info Card Styles
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ea6118',
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    marginRight: 6,
  },
  infoHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ea6118',
  },
  // Test Info Card
  testInfoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#0891b2',
  },
  testInfoIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  testInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#0891b2',
    lineHeight: 20,
  },
  testInfoBold: {
    fontWeight: '700',
  },
  // Test Result Modal
  resultModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  resultModalHeader: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultModalIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  resultModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  resultModalBody: {
    padding: 20,
    maxHeight: 400,
  },
  resultSection: {
    marginBottom: 16,
  },
  resultSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  resultValue: {
    fontSize: 14,
    color: '#293B50',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    lineHeight: 20,
  },
  codeBox: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  resultModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeResultButton: {
    backgroundColor: '#293B50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeResultButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  bottomSheetHeader: {
    backgroundColor: '#ea6118',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomSheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomSheetIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomSheetBody: {
    padding: 20,
  },
  bottomSheetFooter: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 50,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeSheetButton: {
    backgroundColor: '#ea6118',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeSheetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Info Section Styles
  infoSection: {
    marginBottom: 16,
  },
  infoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoSectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  blueBg: {
    backgroundColor: '#dbeafe',
  },
  greenBg: {
    backgroundColor: '#dcfce7',
  },
  yellowBg: {
    backgroundColor: '#fef3c7',
  },
  purpleBg: {
    backgroundColor: '#ede9fe',
  },
  orangeBg: {
    backgroundColor: '#ffedd5',
  },
  infoSectionIcon: {
    fontSize: 18,
  },
  infoSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#293B50',
    flex: 1,
  },
  infoSectionContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  blueBorder: {
    borderLeftColor: '#3b82f6',
  },
  greenBorder: {
    borderLeftColor: '#16a34a',
  },
  yellowBorder: {
    borderLeftColor: '#f59e0b',
  },
  purpleBorder: {
    borderLeftColor: '#8b5cf6',
  },
  orangeBorder: {
    borderLeftColor: '#ea6118',
  },
  infoSectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
});

export default DeliveryReceiptScreen;
