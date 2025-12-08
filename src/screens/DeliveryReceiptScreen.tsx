import React, {useState} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface DeliveryReceiptScreenProps {
  navigation: any;
}

const DeliveryReceiptScreen: React.FC<DeliveryReceiptScreenProps> = ({navigation}) => {
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  
  // URL Configuration
  const [deliveryUrl, setDeliveryUrl] = useState('https://ptsv3.com/storacall');
  
  // Test form data (readonly)
  const [msisdn] = useState('447777111111');
  const [submissionRef] = useState('12345678901234567890123456789012');

  // Connection settings
  const connectionSettings = {
    attempts: 1,
    pauseMinutes: 10,
  };

  const handleUpdateConfiguration = () => {
    if (!deliveryUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }
    
    // URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlPattern.test(deliveryUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid URL.');
      return;
    }
    
    Alert.alert(
      'Configuration Updated',
      'Delivery receipt URL has been updated successfully.',
      [{text: 'OK'}]
    );
  };

  const handleSubmitTest = () => {
    Alert.alert(
      'Test Submitted',
      'A fake "success" delivery receipt call has been sent to your server. Check your server logs for the response.',
      [{text: 'OK'}]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      <Header 
        title="Delivery Receipt" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance="£6,859.83"
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>📋</Text>
            <Text style={styles.headerTitle}>Delivery Receipt</Text>
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
                placeholder="Enter your URL"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>

            <TouchableOpacity 
              style={styles.updateButton}
              onPress={handleUpdateConfiguration}>
              <Text style={styles.updateButtonIcon}>🔄</Text>
              <Text style={styles.updateButtonText}>Update Configuration</Text>
            </TouchableOpacity>

            {/* Connection Settings Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Connection Settings:</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>Number of connection attempts:</Text>
                <Text style={styles.infoHighlight}>{connectionSettings.attempts}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>Pause between retries:</Text>
                <Text style={styles.infoHighlight}>{connectionSettings.pauseMinutes} minutes</Text>
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
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
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
              style={styles.submitButton}
              onPress={handleSubmitTest}>
              <Text style={styles.submitButtonIcon}>📤</Text>
              <Text style={styles.submitButtonText}>Submit Test</Text>
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

            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.bottomSheetFooter}>
              <TouchableOpacity
                style={styles.closeSheetButton}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.closeSheetButtonIcon}>✕</Text>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
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
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
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
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeSheetButton: {
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  closeSheetButtonIcon: {
    fontSize: 14,
    marginRight: 8,
    color: '#64748b',
  },
  closeSheetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
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
  infoSectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
});

export default DeliveryReceiptScreen;
