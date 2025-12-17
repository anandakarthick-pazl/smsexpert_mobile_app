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
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getStopCommandSettings,
  updateStopCommandSettings,
} from '../services/stopCommandService';

interface StopCommandsScreenProps {
  navigation: any;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

const StopCommandsScreen: React.FC<StopCommandsScreenProps> = ({navigation, onNotificationPress, notificationCount = 0}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  
  // Form data
  const [stopUrl, setStopUrl] = useState('');
  const [stopEmail, setStopEmail] = useState('');
  const [stopName, setStopName] = useState('');
  
  // Validation errors
  const [urlError, setUrlError] = useState('');
  const [emailError, setEmailError] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      const response = await getStopCommandSettings();
      if (response.success && response.data) {
        setStopUrl(response.data.stop_url || '');
        setStopEmail(response.data.stop_email || '');
        setStopName(response.data.stop_name || '');
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

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError('');
      return true; // URL is optional
    }
    
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      setUrlError('URL should start with http:// or https://');
      return false;
    }
    
    setUrlError('');
    return true;
  };

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('');
      return true; // Email is optional
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleSaveConfiguration = async () => {
    // Validate inputs
    const isUrlValid = validateUrl(stopUrl);
    const isEmailValid = validateEmail(stopEmail);
    
    if (!isUrlValid || !isEmailValid) {
      return;
    }
    
    setSaving(true);
    try {
      const response = await updateStopCommandSettings(stopUrl, stopEmail, stopName);
      if (response.success) {
        Alert.alert(
          'Success',
          'STOP command settings have been saved successfully.',
          [{text: 'OK'}]
        );
        if (response.data) {
          setStopUrl(response.data.stop_url || '');
          setStopEmail(response.data.stop_email || '');
          setStopName(response.data.stop_name || '');
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to save configuration');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:care@smsexpert.co.uk');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header 
          title="STOPs/Optouts" 
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
        title="STOPs/Optouts" 
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
            <Text style={styles.headerIcon}>🛑</Text>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>STOP Commands</Text>
              <Text style={styles.headerSubtitle}>Manage opt-out notifications</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfoSheet(true)}>
            <Text style={styles.infoButtonIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Configuration Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>⚙️</Text>
            <Text style={styles.cardHeaderTitle}>STOP Command Configuration</Text>
          </View>
          
          <View style={styles.cardBody}>
            {/* URL Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>🔗</Text>
                <Text style={styles.label}>STOP Command URL</Text>
              </View>
              <TextInput
                style={[styles.input, urlError ? styles.inputError : null]}
                value={stopUrl}
                onChangeText={(text) => {
                  setStopUrl(text);
                  if (urlError) validateUrl(text);
                }}
                onBlur={() => validateUrl(stopUrl)}
                placeholder="Enter webhook URL for STOP commands"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                maxLength={200}
                editable={!saving}
              />
              {urlError ? (
                <Text style={styles.errorText}>{urlError}</Text>
              ) : (
                <Text style={styles.helperText}>URL to receive STOP command notifications</Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>✉️</Text>
                <Text style={styles.label}>STOP Command E-mail</Text>
              </View>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                value={stopEmail}
                onChangeText={(text) => {
                  setStopEmail(text);
                  if (emailError) validateEmail(text);
                }}
                onBlur={() => validateEmail(stopEmail)}
                placeholder="notifications@example.com"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                maxLength={50}
                editable={!saving}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : (
                <Text style={styles.helperText}>Email address for STOP notifications</Text>
              )}
            </View>

            {/* Contact Name Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>👤</Text>
                <Text style={styles.label}>STOP Command Contact Name</Text>
              </View>
              <TextInput
                style={styles.input}
                value={stopName}
                onChangeText={setStopName}
                placeholder="Contact person name"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                maxLength={50}
                editable={!saving}
              />
              <Text style={styles.helperText}>Primary contact for STOP command management</Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={handleSaveConfiguration}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.saveButtonIcon}>💾</Text>
                  <Text style={styles.saveButtonText}>Save Configuration</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Blacklisting Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>🔒</Text>
            <Text style={styles.cardHeaderTitle}>Blacklisting Technology</Text>
          </View>
          
          <View style={styles.cardBody}>
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardIcon}>🛡️</Text>
                <Text style={styles.infoCardTitle}>Automatic STOP Command Protection</Text>
              </View>
              <Text style={styles.infoCardText}>
                The SMS Expert Blacklisting System automatically prevents your account from sending SMS messages to users after they have texted a STOP command to you. This ensures compliance with regulations and respects user preferences.
              </Text>
              
              <View style={styles.divider} />
              
              <Text style={styles.infoCardText}>
                <Text style={styles.boldText}>Need to disable this feature?</Text> Contact our support team or reach out to your account manager.
              </Text>
              
              <TouchableOpacity 
                style={styles.supportButton}
                onPress={handleContactSupport}>
                <Text style={styles.supportButtonIcon}>📧</Text>
                <Text style={styles.supportButtonText}>care@smsexpert.co.uk</Text>
              </TouchableOpacity>
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
                <Text style={styles.bottomSheetIcon}>🛑</Text>
                <Text style={styles.bottomSheetTitle}>STOP Commands Info</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* What are STOP Commands */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.redBg]}>
                    <Text style={styles.infoSectionIcon}>🛑</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>What are STOP Commands?</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.redBorder]}>
                  <Text style={styles.infoSectionText}>
                    STOP commands allow recipients to opt-out of receiving SMS messages from your account. When someone texts "STOP" to your number, they are automatically added to your blacklist.
                  </Text>
                </View>
              </View>

              {/* URL Configuration */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>🔗</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Webhook URL</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    Configure a webhook URL to receive real-time notifications when someone sends a STOP command. Your server will receive HTTP POST requests with opt-out details.
                  </Text>
                </View>
              </View>

              {/* Email Notifications */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.greenBg]}>
                    <Text style={styles.infoSectionIcon}>✉️</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Email Notifications</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.greenBorder]}>
                  <Text style={styles.infoSectionText}>
                    Set an email address to receive notifications when STOP commands are received. This helps you stay informed about opt-outs.
                  </Text>
                </View>
              </View>

              {/* Compliance */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.purpleBg]}>
                    <Text style={styles.infoSectionIcon}>⚖️</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Regulatory Compliance</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.purpleBorder]}>
                  <Text style={styles.infoSectionText}>
                    STOP command handling is required by SMS regulations in many countries. The automatic blacklisting ensures your account stays compliant with GDPR, TCPA, and other regulations.
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
    marginBottom: 20,
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
  inputError: {
    borderColor: '#dc2626',
  },
  helperText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 6,
  },
  errorText: {
    fontSize: 11,
    color: '#dc2626',
    marginTop: 6,
  },
  // Button Styles
  saveButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 50,
  },
  saveButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  saveButtonText: {
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
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
    flex: 1,
  },
  infoCardText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
    color: '#293B50',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 14,
  },
  supportButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#ea6118',
  },
  supportButtonIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  supportButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ea6118',
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
  redBg: {
    backgroundColor: '#fee2e2',
  },
  blueBg: {
    backgroundColor: '#dbeafe',
  },
  greenBg: {
    backgroundColor: '#dcfce7',
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
  redBorder: {
    borderLeftColor: '#dc2626',
  },
  blueBorder: {
    borderLeftColor: '#3b82f6',
  },
  greenBorder: {
    borderLeftColor: '#16a34a',
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

export default StopCommandsScreen;
