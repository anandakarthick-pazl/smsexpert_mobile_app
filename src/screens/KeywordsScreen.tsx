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
  getKeywords,
  getKeywordDetails,
  updateSmsResponder,
  updateEmailForwarder,
  toggleModule,
  getSubkeywords,
  addSubkeyword,
  deleteSubkeyword,
  Keyword,
  KeywordDetail,
  SmsShortcode,
  Subkeyword,
} from '../services/keywordsService';

interface KeywordsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

const KeywordsScreen: React.FC<KeywordsScreenProps> = ({navigation}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [keywordsLeft, setKeywordsLeft] = useState(0);
  const [hasPlatinumAccess, setHasPlatinumAccess] = useState(false);
  const [shortcode, setShortcode] = useState('60300');
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordDetail | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [smsShortcodes, setSmsShortcodes] = useState<SmsShortcode[]>([]);
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({});
  const [subkeywords, setSubkeywords] = useState<Subkeyword[]>([]);
  const [isStarKeyword, setIsStarKeyword] = useState(false);
  const [showSubkeywordManagement, setShowSubkeywordManagement] = useState(false);
  
  // SMS Responder form state
  const [smsResponderForm, setSmsResponderForm] = useState({
    sender_id: '',
    response_text: '',
    response_route: 0,
    allowed_update_numbers: '',
    allow_subkeys: '0' as '0' | '1',
    advertise: '0' as '0' | '1',
  });
  
  // Email Forwarder form state
  const [emailForwarderForm, setEmailForwarderForm] = useState({
    email_address: '',
    url_address: '',
  });
  
  // Config tab state
  const [activeConfigTab, setActiveConfigTab] = useState<'sms' | 'email' | 'modules' | 'subkeys'>('sms');
  
  // New subkeyword input
  const [newSubkeyword, setNewSubkeyword] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  // Fetch keywords on mount
  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await getKeywords();
      if (response.success) {
        setKeywords(response.data.keywords);
        setKeywordsLeft(response.data.keywords_left);
        setHasPlatinumAccess(response.data.has_platinum_access);
        setShortcode(response.data.shortcode);
      }
    } catch (error: any) {
      console.error('Error fetching keywords:', error);
      Alert.alert('Error', error.message || 'Failed to fetch keywords');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchKeywords();
    setRefreshing(false);
  }, []);

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleConfigure = async (keyword: Keyword) => {
    try {
      setConfigLoading(true);
      setShowConfigModal(true);
      setActiveConfigTab('sms');
      
      const response = await getKeywordDetails(keyword.id);
      if (response.success) {
        const kw = response.data.keyword;
        setSelectedKeyword(kw);
        setSmsShortcodes(response.data.sms_shortcodes);
        setEnabledModules(response.data.enabled_modules);
        setActiveModules(response.data.active_modules);
        setSubkeywords(response.data.subkeywords || []);
        setIsStarKeyword(response.data.is_star_keyword);
        setShowSubkeywordManagement(response.data.show_subkeyword_management);
        
        // Initialize forms
        setSmsResponderForm({
          sender_id: kw.response_sender_id || '',
          response_text: kw.response_content || '',
          response_route: kw.response_smsshortcodes_id || 0,
          allowed_update_numbers: kw.allowed_mobile_update_numbers || '',
          allow_subkeys: (kw.allow_mobile_update_across_subkeys || '0') as '0' | '1',
          advertise: (kw.advertise || '0') as '0' | '1',
        });
        
        setEmailForwarderForm({
          email_address: kw.forwarding_email || '',
          url_address: kw.forwarding_url || '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching keyword details:', error);
      Alert.alert('Error', error.message || 'Failed to fetch keyword details');
      setShowConfigModal(false);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSaveSmsResponder = async () => {
    if (!selectedKeyword) return;
    
    if (!smsResponderForm.sender_id.trim()) {
      Alert.alert('Error', 'Sender ID is required');
      return;
    }
    if (!smsResponderForm.response_text.trim()) {
      Alert.alert('Error', 'Response text is required');
      return;
    }
    if (!smsResponderForm.response_route) {
      Alert.alert('Error', 'Response route is required');
      return;
    }
    
    try {
      setSavingConfig(true);
      const response = await updateSmsResponder(selectedKeyword.id, {
        sender_id: smsResponderForm.sender_id,
        response_text: smsResponderForm.response_text,
        response_route: smsResponderForm.response_route,
        allowed_update_numbers: smsResponderForm.allowed_update_numbers,
        allow_subkeys: smsResponderForm.allow_subkeys,
        advertise: smsResponderForm.advertise,
      });
      
      if (response.success) {
        Alert.alert('Success', 'SMS Responder settings saved successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save SMS Responder settings');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveEmailForwarder = async () => {
    if (!selectedKeyword) return;
    
    try {
      setSavingConfig(true);
      const response = await updateEmailForwarder(selectedKeyword.id, {
        email_address: emailForwarderForm.email_address,
        url_address: emailForwarderForm.url_address,
      });
      
      if (response.success) {
        Alert.alert('Success', 'Email Forwarder settings saved successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save Email Forwarder settings');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleModule = async (moduleName: string, currentState: boolean) => {
    if (!selectedKeyword) return;
    
    try {
      const response = await toggleModule(selectedKeyword.id, {
        module: moduleName,
        action: currentState ? 'off' : 'on',
      });
      
      if (response.success) {
        setActiveModules(prev => ({
          ...prev,
          [moduleName]: !currentState,
        }));
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to toggle module');
    }
  };

  const handleAddSubkeyword = async () => {
    if (!selectedKeyword) return;
    if (!newSubkeyword.trim()) {
      Alert.alert('Error', 'Please enter a subkeyword');
      return;
    }
    
    try {
      setSavingConfig(true);
      const response = await addSubkeyword(selectedKeyword.id, newSubkeyword.trim());
      
      if (response.success) {
        Alert.alert('Success', response.message);
        setNewSubkeyword('');
        // Refresh subkeywords
        const subkeysResponse = await getSubkeywords(selectedKeyword.id);
        if (subkeysResponse.success) {
          setSubkeywords(subkeysResponse.data.subkeywords);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add subkeyword');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDeleteSubkeyword = async (subkeyword: string) => {
    if (!selectedKeyword) return;
    
    Alert.alert(
      'Delete Subkeyword',
      `Are you sure you want to delete "${subkeyword}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteSubkeyword(selectedKeyword.id, subkeyword);
              if (response.success) {
                Alert.alert('Success', response.message);
                setSubkeywords(prev => prev.filter(sk => sk.keyword !== subkeyword));
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete subkeyword');
            }
          },
        },
      ],
    );
  };

  const handleRegisterKeyword = () => {
    Alert.alert(
      'Register Keyword',
      `You can register ${keywordsLeft} more keyword(s) on ${shortcode}. Please contact support for assistance.`,
    );
    setShowInfoSheet(false);
  };

  const handleViewContracts = () => {
    setShowInfoSheet(false);
    navigation.navigate('Contracts');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'expiring_soon':
        return styles.statusExpiringSoon;
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

  const renderConfigContent = () => {
    if (configLoading) {
      return (
        <View style={styles.configLoadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.configLoadingText}>Loading configuration...</Text>
        </View>
      );
    }

    switch (activeConfigTab) {
      case 'sms':
        return renderSmsResponderTab();
      case 'email':
        return renderEmailForwarderTab();
      case 'modules':
        return renderModulesTab();
      case 'subkeys':
        return renderSubkeysTab();
      default:
        return null;
    }
  };

  const renderSmsResponderTab = () => {
    if (!enabledModules.smsResponder && !isStarKeyword) {
      return (
        <View style={styles.moduleDisabledContainer}>
          <Text style={styles.moduleDisabledIcon}>🔒</Text>
          <Text style={styles.moduleDisabledText}>SMS Responder is not available for this keyword</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.configTabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Sender ID (max 11 chars)</Text>
          <TextInput
            style={styles.formInput}
            value={smsResponderForm.sender_id}
            onChangeText={(text) => setSmsResponderForm(prev => ({...prev, sender_id: text.substring(0, 11)}))}
            placeholder="e.g., MyCompany"
            maxLength={11}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Response Text</Text>
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            value={smsResponderForm.response_text}
            onChangeText={(text) => setSmsResponderForm(prev => ({...prev, response_text: text}))}
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
                  smsResponderForm.response_route === sc.id && styles.routeOptionSelected,
                ]}
                onPress={() => setSmsResponderForm(prev => ({...prev, response_route: sc.id}))}>
                <Text style={[
                  styles.routeOptionText,
                  smsResponderForm.response_route === sc.id && styles.routeOptionTextSelected,
                ]}>{sc.number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.formLabel}>Allow mobile updates across subkeys</Text>
            <Switch
              value={smsResponderForm.allow_subkeys === '1'}
              onValueChange={(val) => setSmsResponderForm(prev => ({...prev, allow_subkeys: val ? '1' : '0'}))}
              trackColor={{false: '#d1d5db', true: '#fdba74'}}
              thumbColor={smsResponderForm.allow_subkeys === '1' ? '#ea6118' : '#9ca3af'}
            />
          </View>
        </View>
        
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
  };

  const renderEmailForwarderTab = () => {
    return (
      <ScrollView style={styles.configTabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Email Address(es)</Text>
          <TextInput
            style={styles.formInput}
            value={emailForwarderForm.email_address}
            onChangeText={(text) => setEmailForwarderForm(prev => ({...prev, email_address: text}))}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.formHint}>Separate multiple emails with commas</Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Forwarding URL</Text>
          <TextInput
            style={styles.formInput}
            value={emailForwarderForm.url_address}
            onChangeText={(text) => setEmailForwarderForm(prev => ({...prev, url_address: text}))}
            placeholder="https://yourwebsite.com/webhook"
            keyboardType="url"
            autoCapitalize="none"
          />
          <Text style={styles.formHint}>URL to forward incoming messages (Developer API)</Text>
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
  };

  const renderModulesTab = () => {
    const moduleNames: Record<string, string> = {
      smsResponder: 'SMS Responder',
      Forwarder: 'Email Forwarder / Developer',
      SMSForwarder: 'SMS Forwarder',
      BusinessCard: 'Business Card',
      Subscription: 'Subscription',
      WAPPushResponder: 'WAP Push Responder',
      Voting: 'Voting',
      EmailForwarder: 'Email Forwarder',
    };

    const moduleIcons: Record<string, string> = {
      smsResponder: '💬',
      Forwarder: '📧',
      SMSForwarder: '📱',
      BusinessCard: '💼',
      Subscription: '📋',
      WAPPushResponder: '🌐',
      Voting: '🗳️',
      EmailForwarder: '✉️',
    };

    return (
      <ScrollView style={styles.configTabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.modulesTitle}>Available Modules</Text>
        <Text style={styles.modulesSubtitle}>Toggle modules on/off for this keyword</Text>
        
        {Object.entries(enabledModules).map(([moduleName, isAvailable]) => {
          if (!isAvailable) return null;
          
          const isActive = activeModules[moduleName] || false;
          
          return (
            <View key={moduleName} style={styles.moduleRow}>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleIcon}>{moduleIcons[moduleName] || '⚙️'}</Text>
                <Text style={styles.moduleName}>{moduleNames[moduleName] || moduleName}</Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={() => handleToggleModule(moduleName, isActive)}
                trackColor={{false: '#d1d5db', true: '#fdba74'}}
                thumbColor={isActive ? '#ea6118' : '#9ca3af'}
              />
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderSubkeysTab = () => {
    if (!showSubkeywordManagement) {
      return (
        <View style={styles.moduleDisabledContainer}>
          <Text style={styles.moduleDisabledIcon}>🔒</Text>
          <Text style={styles.moduleDisabledText}>Subkeyword management is not available for this keyword</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.configTabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.modulesTitle}>Subkeywords</Text>
        <Text style={styles.modulesSubtitle}>Manage subkeywords for this keyword</Text>
        
        {/* Add Subkeyword */}
        <View style={styles.addSubkeywordContainer}>
          <TextInput
            style={styles.addSubkeywordInput}
            value={newSubkeyword}
            onChangeText={setNewSubkeyword}
            placeholder="Enter new subkeyword"
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.addSubkeywordButton, savingConfig && styles.addSubkeywordButtonDisabled]}
            onPress={handleAddSubkeyword}
            disabled={savingConfig}>
            <Text style={styles.addSubkeywordButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        {/* Subkeywords List */}
        {subkeywords.length === 0 ? (
          <View style={styles.noSubkeywordsContainer}>
            <Text style={styles.noSubkeywordsText}>No subkeywords configured yet</Text>
          </View>
        ) : (
          subkeywords.map((sk) => (
            <View key={sk.keyword} style={styles.subkeywordItem}>
              <View style={styles.subkeywordInfo}>
                <Text style={styles.subkeywordName}>{sk.keyword}</Text>
                {sk.response_sender_id && (
                  <Text style={styles.subkeywordDetail}>Sender: {sk.response_sender_id}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.deleteSubkeywordButton}
                onPress={() => handleDeleteSubkeyword(sk.keyword)}>
                <Text style={styles.deleteSubkeywordIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#293B50" />
        <Header
          title="Keywords"
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={handleNotificationPress}
          notificationCount={3}
          walletBalance="£6859"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading keywords...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      <Header
        title="Keywords"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
        walletBalance="£6859"
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ea6118']} />
        }>

        {/* Header Card with Total Count and Info Button */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.totalLabel}>Total Keywords:</Text>
            <Text style={styles.totalValue}>{keywords.length}</Text>
          </View>
          {/* Info Button */}
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => setShowInfoSheet(true)}>
            <Text style={styles.infoButtonIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Results Card */}
        <View style={styles.resultsCard}>
          {keywords.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataIcon}>🔑</Text>
              <Text style={styles.noDataTitle}>No Keywords Found</Text>
              <Text style={styles.noDataText}>
                You don't have any keywords registered yet.
              </Text>
            </View>
          ) : (
            <>
              {/* Keywords List */}
              <View style={styles.keywordsList}>
                {keywords.map(keyword => (
                  <TouchableOpacity
                    key={keyword.id}
                    style={styles.keywordItem}
                    onPress={() => handleConfigure(keyword)}>
                    <View style={styles.keywordRow}>
                      <View style={styles.keywordLeft}>
                        <Text style={styles.keywordLabel}>
                          {keyword.type === 'dedicated' ? 'Dedicated Number' : 'Keyword'}:
                        </Text>
                        <View style={[
                          styles.keywordBadge,
                          keyword.type === 'dedicated' && styles.dedicatedBadge,
                        ]}>
                          <Text style={styles.keywordBadgeText}>
                            {keyword.keyword === '*' ? '✱' : keyword.keyword}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, getStatusStyle(keyword.status)]}>
                        <Text style={[styles.statusText, {color: getStatusTextColor(keyword.status)}]}>
                          {keyword.status === 'active' ? 'Active' : keyword.status === 'expiring_soon' ? 'Expiring' : 'Expired'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.keywordDetailRow}>
                      <Text style={styles.keywordDetailIcon}>📱</Text>
                      <Text style={styles.keywordDetailText}>{keyword.virtual_number || 'No number assigned'}</Text>
                    </View>
                    <View style={styles.keywordDetailRow}>
                      <Text style={styles.keywordDetailIcon}>📅</Text>
                      <Text style={styles.keywordDetailText}>{keyword.status_text}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.configureButton}
                      onPress={() => handleConfigure(keyword)}>
                      <Text style={styles.configureButtonIcon}>⚙️</Text>
                      <Text style={styles.configureButtonText}>Configure</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>

              {/* End of List Indicator */}
              <View style={styles.endOfListContainer}>
                <Text style={styles.endOfListText}>— End of keywords —</Text>
              </View>
            </>
          )}
        </View>

      </ScrollView>

      {/* Configuration Modal */}
      <Modal
        visible={showConfigModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfigModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.configModalContainer}>
            {/* Modal Header */}
            <View style={styles.configModalHeader}>
              <View style={styles.configModalTitleRow}>
                <Text style={styles.configModalIcon}>⚙️</Text>
                <View style={styles.configModalTitleContainer}>
                  <Text style={styles.configModalTitle}>Configure Keyword</Text>
                  {selectedKeyword && (
                    <Text style={styles.configModalSubtitle}>
                      {selectedKeyword.keyword === '*' ? 'Dedicated Number' : selectedKeyword.keyword} on {selectedKeyword.virtual_number}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowConfigModal(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Config Tabs */}
            {!configLoading && (
              <View style={styles.configTabs}>
                <TouchableOpacity
                  style={[styles.configTab, activeConfigTab === 'sms' && styles.configTabActive]}
                  onPress={() => setActiveConfigTab('sms')}>
                  <Text style={[styles.configTabText, activeConfigTab === 'sms' && styles.configTabTextActive]}>SMS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.configTab, activeConfigTab === 'email' && styles.configTabActive]}
                  onPress={() => setActiveConfigTab('email')}>
                  <Text style={[styles.configTabText, activeConfigTab === 'email' && styles.configTabTextActive]}>Email</Text>
                </TouchableOpacity>
                {!isStarKeyword && (
                  <TouchableOpacity
                    style={[styles.configTab, activeConfigTab === 'modules' && styles.configTabActive]}
                    onPress={() => setActiveConfigTab('modules')}>
                    <Text style={[styles.configTabText, activeConfigTab === 'modules' && styles.configTabTextActive]}>Modules</Text>
                  </TouchableOpacity>
                )}
                {showSubkeywordManagement && (
                  <TouchableOpacity
                    style={[styles.configTab, activeConfigTab === 'subkeys' && styles.configTabActive]}
                    onPress={() => setActiveConfigTab('subkeys')}>
                    <Text style={[styles.configTabText, activeConfigTab === 'subkeys' && styles.configTabTextActive]}>Subkeys</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Config Content */}
            <View style={styles.configContent}>
              {renderConfigContent()}
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
                <Text style={styles.bottomSheetIcon}>ℹ️</Text>
                <Text style={styles.bottomSheetTitle}>Keywords Information</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* Register Keywords Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.yellowBg]}>
                    <Text style={styles.infoSectionIcon}>➕</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Register Keywords</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.yellowBorder]}>
                  <Text style={styles.infoSectionText}>
                    {keywordsLeft < 1 
                      ? '→ You can\'t currently register any more keywords. Please contact us to discuss setting up additional keywords.'
                      : `→ You can register ${keywordsLeft} more keyword(s) on ${shortcode}. Please contact us if you need more keywords.`
                    }
                  </Text>
                </View>
              </View>

              {/* Virtual Number Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.purpleBg]}>
                    <Text style={styles.infoSectionIcon}>📱</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Dedicated Virtual Mobile Number</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.purpleBorder]}>
                  <Text style={styles.infoSectionText}>
                    → Please contact us to discuss setting up dedicated virtual numbers.
                  </Text>
                </View>
              </View>

              {/* Contract Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.redBg]}>
                    <Text style={styles.infoSectionIcon}>📄</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Contractual Reminder</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.redBorder]}>
                  <Text style={styles.infoSectionText}>
                    → By continuing to use the SMS Expert services you agree to the latest{' '}
                    <Text style={styles.infoLinkRed} onPress={handleViewContracts}>
                      contract
                    </Text>{' '}
                    and to abide by all applicable laws and regulations.
                  </Text>
                </View>
              </View>

              {/* About Keywords Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>💡</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>About Keywords & Virtual Numbers</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    Keywords are text commands that customers can send to your virtual numbers to trigger automated responses, subscriptions, or other services. Each keyword is associated with a virtual number and can be configured with various modules to handle different types of interactions.
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
  // Header Card
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 6,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ea6118',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonIcon: {
    fontSize: 18,
  },
  // Results Card
  resultsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  // No Data State
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataIcon: {
    fontSize: 64,
    color: '#cbd5e1',
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Keywords List
  keywordsList: {
    padding: 0,
  },
  keywordItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  keywordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  keywordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keywordLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
  },
  keywordBadge: {
    backgroundColor: '#ea6118',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dedicatedBadge: {
    backgroundColor: '#7c3aed',
  },
  keywordBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusExpiringSoon: {
    backgroundColor: '#fef3c7',
  },
  statusExpired: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  keywordDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  keywordDetailIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  keywordDetailText: {
    fontSize: 14,
    color: '#475569',
  },
  configureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea6118',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  configureButtonIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  configureButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // End of List
  endOfListContainer: {
    padding: 16,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  // Config Modal
  configModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  configModalHeader: {
    backgroundColor: '#ea6118',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  configModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  configModalIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  configModalTitleContainer: {
    flex: 1,
  },
  configModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  configModalSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  configTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
  },
  configTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  configTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  configTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  configTabTextActive: {
    color: '#ea6118',
  },
  configContent: {
    maxHeight: 450,
  },
  configLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  configLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  configTabContent: {
    padding: 16,
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
    fontSize: 12,
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
  // Modules Tab
  modulesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 4,
  },
  modulesSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  moduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  moduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  moduleName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#293B50',
  },
  moduleDisabledContainer: {
    padding: 40,
    alignItems: 'center',
  },
  moduleDisabledIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  moduleDisabledText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  // Subkeywords Tab
  addSubkeywordContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
    backgroundColor: '#ea6118',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 10,
  },
  addSubkeywordButtonDisabled: {
    opacity: 0.7,
  },
  addSubkeywordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  noSubkeywordsContainer: {
    padding: 30,
    alignItems: 'center',
  },
  noSubkeywordsText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  subkeywordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subkeywordInfo: {
    flex: 1,
  },
  subkeywordName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
  },
  subkeywordDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  deleteSubkeywordButton: {
    padding: 8,
  },
  deleteSubkeywordIcon: {
    fontSize: 18,
  },
  // Bottom Sheet Modal
  bottomSheetContainer: {
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
  bottomSheetBody: {
    padding: 20,
    maxHeight: 450,
  },
  // Info Sections
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
    marginRight: 10,
  },
  yellowBg: {
    backgroundColor: '#fef3c7',
  },
  purpleBg: {
    backgroundColor: '#ede9fe',
  },
  redBg: {
    backgroundColor: '#fef2f2',
  },
  blueBg: {
    backgroundColor: '#f0f9ff',
  },
  infoSectionIcon: {
    fontSize: 18,
  },
  infoSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
    flex: 1,
  },
  infoSectionContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
  },
  yellowBorder: {
    borderLeftColor: '#f59e0b',
  },
  purpleBorder: {
    borderLeftColor: '#8b5cf6',
  },
  redBorder: {
    borderLeftColor: '#ef4444',
  },
  blueBorder: {
    borderLeftColor: '#0891b2',
  },
  infoSectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  infoLink: {
    color: '#ea6118',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  infoLinkRed: {
    color: '#dc2626',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Bottom Sheet Footer
  bottomSheetFooter: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeSheetButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  closeSheetButtonIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#ffffff',
  },
  closeSheetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default KeywordsScreen;
