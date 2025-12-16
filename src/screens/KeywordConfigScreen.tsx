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
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Switch,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getKeywordDetails,
  updateSmsResponder,
  updateEmailForwarder,
  toggleModule,
  getSubkeywords,
  addSubkeyword,
  deleteSubkeyword,
  KeywordDetail,
  SmsShortcode,
  Subkeyword,
} from '../services/keywordsService';

interface KeywordConfigScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
  route: {
    params?: {
      keywordId: number;
      keywordName?: string;
    };
  };
}

// Module definitions with icons, colors, and descriptions
const MODULE_INFO: Record<string, {
  title: string;
  icon: string;
  color: string;
  description: string;
}> = {
  smsResponder: {
    title: 'SMS Auto-Responder',
    icon: '💬',
    color: '#16a34a',
    description: 'Allows you to send an automatic SMS response to your users.',
  },
  Forwarder: {
    title: 'SMS to Email Forwarder',
    icon: '📧',
    color: '#0891b2',
    description: 'Forward incoming SMS to an email address or API/URL endpoint.',
  },
  SMSForwarder: {
    title: 'SMS Forwarder',
    icon: '📱',
    color: '#ea6118',
    description: 'Forward incoming SMS requests to a mobile number.',
  },
  BusinessCard: {
    title: 'Business Card',
    icon: '💼',
    color: '#7c3aed',
    description: 'Send a Business Card (vCard) to your users.',
  },
  Subscription: {
    title: 'Subscription',
    icon: '📋',
    color: '#f59e0b',
    description: 'Run a Subscription service. Users can subscribe/unsubscribe using START and STOP.',
  },
  WAPPushResponder: {
    title: 'WAP Push Responder',
    icon: '🌐',
    color: '#06b6d4',
    description: 'Return a WAP Push message containing a URL (hyperlink) to the user.',
  },
  Voting: {
    title: 'Voting',
    icon: '🗳️',
    color: '#dc2626',
    description: 'Offer a live SMS Voting system for your users.',
  },
  EmailForwarder: {
    title: 'Email Forwarder',
    icon: '✉️',
    color: '#0891b2',
    description: 'Forward incoming messages to an email address.',
  },
};

const KeywordConfigScreen: React.FC<KeywordConfigScreenProps> = ({navigation, route}) => {
  const keywordId = route.params?.keywordId;
  const keywordNameParam = route.params?.keywordName || '';

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [keyword, setKeyword] = useState<KeywordDetail | null>(null);
  const [smsShortcodes, setSmsShortcodes] = useState<SmsShortcode[]>([]);
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({});
  const [subkeywords, setSubkeywords] = useState<Subkeyword[]>([]);
  const [isStarKeyword, setIsStarKeyword] = useState(false);
  const [showSubkeywordManagement, setShowSubkeywordManagement] = useState(false);
  const [togglingModule, setTogglingModule] = useState<string | null>(null);
  
  // Subkeyword form
  const [newSubkeyword, setNewSubkeyword] = useState('');
  const [addingSubkeyword, setAddingSubkeyword] = useState(false);
  
  // Configuration modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configModuleType, setConfigModuleType] = useState<'sms' | 'email' | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  
  // Selected subkeyword for configuration
  const [selectedSubkeyword, setSelectedSubkeyword] = useState<string>('');
  
  // SMS Responder form
  const [smsForm, setSmsForm] = useState({
    sender_id: '',
    response_text: '',
    response_route: 0,
    allowed_update_numbers: '',
    allow_subkeys: '0' as '0' | '1',
    advertise: '0' as '0' | '1',
  });
  
  // Email Forwarder form
  const [emailForm, setEmailForm] = useState({
    email_address: '',
    url_address: '',
  });

  // Fetch keyword details
  const fetchKeywordDetails = useCallback(async () => {
    if (!keywordId) {
      Alert.alert('Error', 'No keyword ID provided');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      const response = await getKeywordDetails(keywordId);
      
      if (response.success) {
        const kw = response.data.keyword;
        setKeyword(kw);
        setSmsShortcodes(response.data.sms_shortcodes);
        setEnabledModules(response.data.enabled_modules);
        setActiveModules(response.data.active_modules);
        setSubkeywords(response.data.subkeywords || []);
        setIsStarKeyword(response.data.is_star_keyword);
        setShowSubkeywordManagement(response.data.show_subkeyword_management);
        
        // Initialize forms
        setSmsForm({
          sender_id: kw.response_sender_id || '',
          response_text: kw.response_content || '',
          response_route: kw.response_smsshortcodes_id || 0,
          allowed_update_numbers: kw.allowed_mobile_update_numbers || '',
          allow_subkeys: (kw.allow_mobile_update_across_subkeys || '0') as '0' | '1',
          advertise: (kw.advertise || '0') as '0' | '1',
        });
        
        setEmailForm({
          email_address: kw.forwarding_email || '',
          url_address: kw.forwarding_url || '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching keyword details:', error);
      Alert.alert('Error', error.message || 'Failed to fetch keyword details');
    } finally {
      setLoading(false);
    }
  }, [keywordId, navigation]);

  useEffect(() => {
    fetchKeywordDetails();
  }, [fetchKeywordDetails]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchKeywordDetails();
    setRefreshing(false);
  }, [fetchKeywordDetails]);

  const handleToggleModule = async (moduleName: string) => {
    if (!keyword || togglingModule) return;
    
    const currentState = activeModules[moduleName] || false;
    
    // Show confirmation for certain modules when switching off
    if (currentState) {
      let confirmMsg = '';
      if (moduleName === 'Voting') {
        confirmMsg = "Switching off the Voting module will delete all of its campaign statistics. Are you sure?";
      } else if (moduleName === 'Subscription') {
        confirmMsg = "Switching off the Subscription module will delete its associated Subscription Group. Are you sure?";
      }
      
      if (confirmMsg) {
        Alert.alert(
          'Confirm Action',
          confirmMsg,
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Continue',
              style: 'destructive',
              onPress: () => performToggle(moduleName, currentState),
            },
          ],
        );
        return;
      }
    }
    
    performToggle(moduleName, currentState);
  };

  const performToggle = async (moduleName: string, currentState: boolean) => {
    if (!keyword) return;
    
    try {
      setTogglingModule(moduleName);
      
      const response = await toggleModule(keyword.id, {
        module: moduleName,
        action: currentState ? 'off' : 'on',
        subkeyword: selectedSubkeyword,
      });
      
      if (response.success) {
        setActiveModules(prev => ({
          ...prev,
          [moduleName]: !currentState,
        }));
      } else {
        Alert.alert('Error', response.message || 'Failed to toggle module');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to toggle module');
    } finally {
      setTogglingModule(null);
    }
  };

  const handleConfigureModule = (moduleName: string) => {
    const params = {
      keywordId: keyword?.id,
      keywordName: isStarKeyword ? 'Dedicated Number' : keyword?.keyword,
    };

    switch (moduleName) {
      case 'smsResponder':
        navigation.navigate('SmsResponder', params);
        break;
      case 'Forwarder':
      case 'EmailForwarder':
        navigation.navigate('EmailForwarder', params);
        break;
      case 'SMSForwarder':
        navigation.navigate('SmsForwarder', params);
        break;
      case 'Subscription':
        navigation.navigate('Subscription', params);
        break;
      case 'WAPPushResponder':
        navigation.navigate('WapPushResponder', params);
        break;
      case 'BusinessCard':
        navigation.navigate('BusinessCard', params);
        break;
      case 'Voting':
        navigation.navigate('Voting', params);
        break;
      default:
        Alert.alert(
          'Coming Soon',
          `Configuration for ${MODULE_INFO[moduleName]?.title || moduleName} will be available soon.`,
        );
    }
  };

  const handleSaveSmsResponder = async () => {
    if (!keyword) return;
    
    if (!smsForm.sender_id.trim()) {
      Alert.alert('Error', 'Sender ID is required');
      return;
    }
    if (!smsForm.response_text.trim()) {
      Alert.alert('Error', 'Response text is required');
      return;
    }
    if (!smsForm.response_route) {
      Alert.alert('Error', 'Response route is required');
      return;
    }
    
    try {
      setSavingConfig(true);
      const response = await updateSmsResponder(keyword.id, {
        sender_id: smsForm.sender_id,
        response_text: smsForm.response_text,
        response_route: smsForm.response_route,
        allowed_update_numbers: smsForm.allowed_update_numbers,
        allow_subkeys: smsForm.allow_subkeys,
        subkeyword: selectedSubkeyword,
        advertise: smsForm.advertise,
      });
      
      if (response.success) {
        Alert.alert('Success', 'SMS Responder settings saved successfully');
        setShowConfigModal(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save SMS Responder settings');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveEmailForwarder = async () => {
    if (!keyword) return;
    
    try {
      setSavingConfig(true);
      const response = await updateEmailForwarder(keyword.id, {
        email_address: emailForm.email_address,
        url_address: emailForm.url_address,
        subkeyword: selectedSubkeyword,
      });
      
      if (response.success) {
        Alert.alert('Success', 'Email Forwarder settings saved successfully');
        setShowConfigModal(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save Email Forwarder settings');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAddSubkeyword = async () => {
    if (!keyword || !newSubkeyword.trim()) {
      Alert.alert('Error', 'Please enter a subkeyword');
      return;
    }
    
    const subkeywordValue = newSubkeyword.trim().toUpperCase();
    
    // Validate format
    if (!/^[A-Za-z0-9\-]+$/.test(subkeywordValue)) {
      Alert.alert('Error', 'Subkeyword must contain only letters, numbers, and hyphens');
      return;
    }
    
    if (subkeywordValue.startsWith('-')) {
      Alert.alert('Error', 'Subkeyword cannot start with a hyphen');
      return;
    }
    
    if (subkeywordValue === 'START' || subkeywordValue === 'STOP') {
      Alert.alert('Error', 'START and STOP are reserved keywords');
      return;
    }
    
    try {
      setAddingSubkeyword(true);
      const response = await addSubkeyword(keyword.id, subkeywordValue);
      
      if (response.success) {
        Alert.alert('Success', response.message);
        setNewSubkeyword('');
        
        // Refresh subkeywords
        const subkeysResponse = await getSubkeywords(keyword.id);
        if (subkeysResponse.success) {
          setSubkeywords(subkeysResponse.data.subkeywords);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add subkeyword');
    } finally {
      setAddingSubkeyword(false);
    }
  };

  const handleDeleteSubkeyword = async (subkeywordName: string) => {
    if (!keyword) return;
    
    Alert.alert(
      'Delete Subkeyword',
      `Are you sure you want to delete "${subkeywordName}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteSubkeyword(keyword.id, subkeywordName);
              if (response.success) {
                Alert.alert('Success', response.message);
                setSubkeywords(prev => prev.filter(sk => sk.keyword !== subkeywordName));
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete subkeyword');
            }
          },
        },
      ],
    );
  };

  const handleConfigureSubkeyword = (subkeywordName: string) => {
    setSelectedSubkeyword(subkeywordName);
    
    // Find subkeyword data
    const subkeyData = subkeywords.find(sk => sk.keyword === subkeywordName);
    if (subkeyData) {
      setSmsForm(prev => ({
        ...prev,
        sender_id: subkeyData.response_sender_id || '',
        response_text: subkeyData.response_content || '',
        response_route: subkeyData.response_smsshortcodes_id || 0,
      }));
      setEmailForm({
        email_address: subkeyData.forwarding_email || '',
        url_address: subkeyData.forwarding_url || '',
      });
    }
    
    // Show module selection
    Alert.alert(
      `Configure ${subkeywordName}`,
      'Select what you want to configure:',
      [
        {
          text: 'SMS Responder',
          onPress: () => {
            setConfigModuleType('sms');
            setShowConfigModal(true);
          },
        },
        {
          text: 'Email Forwarder',
          onPress: () => {
            setConfigModuleType('email');
            setShowConfigModal(true);
          },
        },
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  };

  const resetToMainKeyword = () => {
    setSelectedSubkeyword('');
    if (keyword) {
      setSmsForm({
        sender_id: keyword.response_sender_id || '',
        response_text: keyword.response_content || '',
        response_route: keyword.response_smsshortcodes_id || 0,
        allowed_update_numbers: keyword.allowed_mobile_update_numbers || '',
        allow_subkeys: (keyword.allow_mobile_update_across_subkeys || '0') as '0' | '1',
        advertise: (keyword.advertise || '0') as '0' | '1',
      });
      setEmailForm({
        email_address: keyword.forwarding_email || '',
        url_address: keyword.forwarding_url || '',
      });
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'expiring_soon':
        return styles.statusExpiring;
      case 'expired':
        return styles.statusExpired;
      default:
        return styles.statusActive;
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#16a34a';
      case 'expiring_soon':
        return '#d97706';
      case 'expired':
        return '#dc2626';
      default:
        return '#16a34a';
    }
  };

  // Render SMS Responder Configuration
  const renderSmsConfig = () => (
    <ScrollView style={styles.configContent} showsVerticalScrollIndicator={false}>
      {selectedSubkeyword ? (
        <View style={styles.subkeywordIndicator}>
          <Text style={styles.subkeywordIndicatorText}>
            Configuring subkeyword: <Text style={styles.subkeywordName}>{selectedSubkeyword}</Text>
          </Text>
          <TouchableOpacity onPress={resetToMainKeyword}>
            <Text style={styles.switchToMain}>Switch to main keyword</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Sender ID (max 11 chars)</Text>
        <TextInput
          style={styles.formInput}
          value={smsForm.sender_id}
          onChangeText={(text) => setSmsForm(prev => ({...prev, sender_id: text.substring(0, 11)}))}
          placeholder="e.g., MyCompany"
          maxLength={11}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Response Text</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea]}
          value={smsForm.response_text}
          onChangeText={(text) => setSmsForm(prev => ({...prev, response_text: text}))}
          placeholder="Enter auto-response message"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Response Route</Text>
        <View style={styles.routeSelector}>
          {smsShortcodes.map((sc) => (
            <TouchableOpacity
              key={sc.id}
              style={[
                styles.routeOption,
                smsForm.response_route === sc.id && styles.routeOptionSelected,
              ]}
              onPress={() => setSmsForm(prev => ({...prev, response_route: sc.id}))}>
              <Text style={[
                styles.routeOptionText,
                smsForm.response_route === sc.id && styles.routeOptionTextSelected,
              ]}>{sc.number}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {!selectedSubkeyword && (
        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.formLabel}>Allow mobile updates across subkeys</Text>
            <Switch
              value={smsForm.allow_subkeys === '1'}
              onValueChange={(val) => setSmsForm(prev => ({...prev, allow_subkeys: val ? '1' : '0'}))}
              trackColor={{false: '#d1d5db', true: '#fdba74'}}
              thumbColor={smsForm.allow_subkeys === '1' ? '#ea6118' : '#9ca3af'}
            />
          </View>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.saveButton, savingConfig && styles.saveButtonDisabled]}
        onPress={handleSaveSmsResponder}
        disabled={savingConfig}>
        {savingConfig ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Text style={styles.saveButtonIcon}>💾</Text>
            <Text style={styles.saveButtonText}>Save SMS Responder</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // Render Email Forwarder Configuration
  const renderEmailConfig = () => (
    <ScrollView style={styles.configContent} showsVerticalScrollIndicator={false}>
      {selectedSubkeyword ? (
        <View style={styles.subkeywordIndicator}>
          <Text style={styles.subkeywordIndicatorText}>
            Configuring subkeyword: <Text style={styles.subkeywordName}>{selectedSubkeyword}</Text>
          </Text>
          <TouchableOpacity onPress={resetToMainKeyword}>
            <Text style={styles.switchToMain}>Switch to main keyword</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Email Address(es)</Text>
        <TextInput
          style={styles.formInput}
          value={emailForm.email_address}
          onChangeText={(text) => setEmailForm(prev => ({...prev, email_address: text}))}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.formHint}>Separate multiple emails with commas</Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Forwarding URL (Developer API)</Text>
        <TextInput
          style={styles.formInput}
          value={emailForm.url_address}
          onChangeText={(text) => setEmailForm(prev => ({...prev, url_address: text}))}
          placeholder="https://yourwebsite.com/webhook"
          keyboardType="url"
          autoCapitalize="none"
        />
        <Text style={styles.formHint}>URL to forward incoming messages</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.saveButton, savingConfig && styles.saveButtonDisabled]}
        onPress={handleSaveEmailForwarder}
        disabled={savingConfig}>
        {savingConfig ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Text style={styles.saveButtonIcon}>💾</Text>
            <Text style={styles.saveButtonText}>Save Email Forwarder</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#293B50" />
        <Header
          title="Keyword Configuration"
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={() => {}}
          notificationCount={0}
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading configuration...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!keyword) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#293B50" />
        <Header
          title="Keyword Configuration"
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={() => {}}
          notificationCount={0}
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Keyword not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      <Header
        title="Keyword Configuration"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={() => {}}
        notificationCount={0}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ea6118']} />
        }>

        {/* Keyword Info Card */}
        <View style={styles.keywordInfoCard}>
          <View style={styles.keywordInfoHeader}>
            <View style={styles.keywordTitleRow}>
              <Text style={styles.keywordIcon}>🔑</Text>
              <View style={styles.keywordTitleContainer}>
                <Text style={styles.keywordTitle}>
                  {isStarKeyword ? 'Dedicated Number' : keyword.keyword}
                </Text>
                <Text style={styles.keywordSubtitle}>on {keyword.virtual_number}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, getStatusStyle(keyword.status)]}>
              <Text style={[styles.statusText, {color: getStatusTextColor(keyword.status)}]}>
                {keyword.status === 'active' ? 'Active' : keyword.status === 'expiring_soon' ? 'Expiring' : 'Expired'}
              </Text>
            </View>
          </View>
          <View style={styles.keywordDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{keyword.description}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Expires:</Text>
              <Text style={styles.detailValue}>{keyword.expiry_formatted}</Text>
            </View>
          </View>
        </View>

        {/* Subkeyword Management */}
        {showSubkeywordManagement && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🏷️</Text>
              <Text style={styles.sectionTitle}>Subkeyword Management</Text>
            </View>
            
            {/* Add Subkeyword Form */}
            <View style={styles.addSubkeywordForm}>
              <TextInput
                style={styles.addSubkeywordInput}
                value={newSubkeyword}
                onChangeText={setNewSubkeyword}
                placeholder="Enter new subkeyword (e.g., INFO, HELP)"
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[styles.addSubkeywordButton, addingSubkeyword && styles.buttonDisabled]}
                onPress={handleAddSubkeyword}
                disabled={addingSubkeyword}>
                {addingSubkeyword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.addSubkeywordButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.subkeywordHint}>
              Must be 1-16 characters: A-Z, 0-9, - (cannot start with -)
            </Text>
            
            {/* Subkeywords List */}
            {subkeywords.length === 0 ? (
              <View style={styles.emptySubkeywords}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>No subkeywords configured yet</Text>
              </View>
            ) : (
              <View style={styles.subkeywordsList}>
                {subkeywords.map((sk) => (
                  <View key={sk.keyword} style={styles.subkeywordItem}>
                    <View style={styles.subkeywordInfo}>
                      <Text style={styles.subkeywordItemName}>{sk.keyword}</Text>
                      {sk.response_sender_id && (
                        <Text style={styles.subkeywordDetail}>
                          Sender: {sk.response_sender_id}
                        </Text>
                      )}
                      {sk.forwarding_email && (
                        <Text style={styles.subkeywordDetail}>
                          Email: {sk.forwarding_email}
                        </Text>
                      )}
                    </View>
                    <View style={styles.subkeywordActions}>
                      <TouchableOpacity
                        style={styles.configSubkeyButton}
                        onPress={() => handleConfigureSubkeyword(sk.keyword)}>
                        <Text style={styles.configSubkeyIcon}>⚙️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteSubkeyButton}
                        onPress={() => handleDeleteSubkeyword(sk.keyword)}>
                        <Text style={styles.deleteSubkeyIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Modules Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⚙️</Text>
            <Text style={styles.sectionTitle}>
              {isStarKeyword ? 'Dedicated Number Configuration' : 'Modules to handle inbound SMS'}
            </Text>
          </View>
          
          <Text style={styles.sectionDescription}>
            {isStarKeyword
              ? 'Configure the email/URL forwarding for your dedicated number.'
              : 'Use the switches to enable/disable modules, then tap Configure to set up each module.'}
          </Text>
          
          {/* Module Cards */}
          <View style={styles.modulesList}>
            {Object.entries(enabledModules).map(([moduleName, isAvailable]) => {
              if (!isAvailable) return null;
              
              const moduleInfo = MODULE_INFO[moduleName];
              if (!moduleInfo) return null;
              
              const isActive = activeModules[moduleName] || false;
              const isToggling = togglingModule === moduleName;
              
              return (
                <View
                  key={moduleName}
                  style={[
                    styles.moduleCard,
                    isActive ? styles.moduleCardActive : styles.moduleCardInactive,
                  ]}>
                  <View style={styles.moduleHeader}>
                    <View style={[styles.moduleIconBox, {backgroundColor: moduleInfo.color}]}>
                      <Text style={styles.moduleIcon}>{moduleInfo.icon}</Text>
                    </View>
                    <View style={styles.moduleTitleContainer}>
                      <Text style={styles.moduleTitle}>{moduleInfo.title}</Text>
                      {isToggling && (
                        <Text style={styles.moduleStatus}>Updating...</Text>
                      )}
                    </View>
                    <View style={styles.moduleToggleContainer}>
                      <Text style={[styles.moduleBadge, isActive ? styles.badgeOn : styles.badgeOff]}>
                        {isActive ? 'ON' : 'OFF'}
                      </Text>
                      <Switch
                        value={isActive}
                        onValueChange={() => handleToggleModule(moduleName)}
                        trackColor={{false: '#d1d5db', true: '#fdba74'}}
                        thumbColor={isActive ? '#ea6118' : '#9ca3af'}
                        disabled={isToggling}
                      />
                    </View>
                  </View>
                  
                  <Text style={styles.moduleDescription}>{moduleInfo.description}</Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.configureButton,
                      !isActive && styles.configureButtonDisabled,
                    ]}
                    onPress={() => handleConfigureModule(moduleName)}
                    disabled={!isActive}>
                    <Text style={styles.configureButtonIcon}>⚙️</Text>
                    <Text style={styles.configureButtonText}>Configure</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* Configuration Modal */}
      <Modal
        visible={showConfigModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfigModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalIcon}>
                  {configModuleType === 'sms' ? '💬' : '📧'}
                </Text>
                <Text style={styles.modalTitle}>
                  {configModuleType === 'sms' ? 'SMS Responder' : 'Email Forwarder'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  setShowConfigModal(false);
                  resetToMainKeyword();
                }}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {configModuleType === 'sms' ? renderSmsConfig() : renderEmailConfig()}
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
    fontSize: 14,
    color: '#64748b',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#ea6118',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Keyword Info Card
  keywordInfoCard: {
    backgroundColor: '#293B50',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
  },
  keywordInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  keywordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  keywordIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  keywordTitleContainer: {
    flex: 1,
  },
  keywordTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  keywordSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusExpiring: {
    backgroundColor: '#fef3c7',
  },
  statusExpired: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  keywordDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginRight: 6,
  },
  detailValue: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
  },

  // Section Card
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
    flex: 1,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },

  // Add Subkeyword Form
  addSubkeywordForm: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  addSubkeywordInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginRight: 10,
  },
  addSubkeywordButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  addSubkeywordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  subkeywordHint: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 16,
  },

  // Subkeywords List
  emptySubkeywords: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  subkeywordsList: {
    gap: 10,
  },
  subkeywordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subkeywordInfo: {
    flex: 1,
  },
  subkeywordItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
  },
  subkeywordDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  subkeywordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  configSubkeyButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
  },
  configSubkeyIcon: {
    fontSize: 16,
  },
  deleteSubkeyButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteSubkeyIcon: {
    fontSize: 16,
  },

  // Modules List
  modulesList: {
    gap: 16,
  },
  moduleCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  moduleCardActive: {
    backgroundColor: '#ffffff',
    borderColor: '#16a34a',
    borderLeftWidth: 4,
  },
  moduleCardInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#94a3b8',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moduleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleIcon: {
    fontSize: 20,
  },
  moduleTitleContainer: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
  },
  moduleStatus: {
    fontSize: 11,
    color: '#ea6118',
    fontStyle: 'italic',
  },
  moduleToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moduleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: '600',
    overflow: 'hidden',
  },
  badgeOn: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  badgeOff: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  moduleDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  configureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea6118',
    paddingVertical: 10,
    borderRadius: 8,
  },
  configureButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  configureButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  configureButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    backgroundColor: '#ea6118',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  configContent: {
    padding: 16,
    maxHeight: 450,
  },

  // Subkeyword Indicator
  subkeywordIndicator: {
    backgroundColor: '#ede9fe',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  subkeywordIndicatorText: {
    fontSize: 13,
    color: '#6b21a8',
  },
  subkeywordName: {
    fontWeight: '700',
  },
  switchToMain: {
    fontSize: 12,
    color: '#7c3aed',
    marginTop: 6,
    textDecorationLine: 'underline',
  },

  // Form Styles
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#293B50',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formHint: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  routeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  routeOptionSelected: {
    backgroundColor: '#fff7ed',
    borderColor: '#ea6118',
  },
  routeOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  routeOptionTextSelected: {
    color: '#ea6118',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea6118',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default KeywordConfigScreen;
