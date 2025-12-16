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
  getProfile,
  updateProfile,
  changePassword,
  addIpToWhitelist,
  removeIpFromWhitelist,
  ProfileData,
} from '../services/profileService';

interface ProfileScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const [showSenderIdInfo, setShowSenderIdInfo] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [showIpInfo, setShowIpInfo] = useState(false);
  const [showWelcomeInfo, setShowWelcomeInfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Profile form data
  const [profileData, setProfileData] = useState<ProfileData>({
    service_description: '',
    business_name: '',
    contact_name: '',
    address1: '',
    address2: '',
    town: '',
    country: '',
    postcode: '',
    mobile_number: '',
    phone_number: '',
    email: '',
    default_sender_id: 'MYBRANDNAME',
    account_expiry: 'Not Set',
    username: '',
  });

  // Limits
  const [dailySmsLimit, setDailySmsLimit] = useState(100000);
  const [pushDeliveryActive, setPushDeliveryActive] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // IP List
  const [ipList, setIpList] = useState<string[]>([]);
  const [newIp, setNewIp] = useState('');
  const [addingIp, setAddingIp] = useState(false);
  const [removingIp, setRemovingIp] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await getProfile();
      if (response.success && response.data) {
        setProfileData(response.data.profile);
        setDailySmsLimit(response.data.limits.daily_sms_limit);
        setIpList(response.data.ip_whitelist);
        setPushDeliveryActive(response.data.push_delivery_active);
      } else {
        Alert.alert('Error', response.message || 'Failed to load profile');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({...prev, [field]: value}));
  };

  const handleAddIp = async () => {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ipRegex.test(newIp)) {
      Alert.alert('Error', 'Please enter a valid IP address.');
      return;
    }

    setAddingIp(true);
    try {
      const response = await addIpToWhitelist(newIp);
      if (response.success) {
        if (response.data) {
          setIpList(response.data);
        } else {
          setIpList([...ipList, newIp]);
        }
        setNewIp('');
        Alert.alert('Success', 'IP address added successfully.');
      } else {
        Alert.alert('Error', response.message || 'Failed to add IP address.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add IP address.');
    } finally {
      setAddingIp(false);
    }
  };

  const handleDeleteIp = async (ip: string) => {
    Alert.alert(
      'Remove IP',
      `Are you sure you want to remove ${ip}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingIp(ip);
            try {
              const response = await removeIpFromWhitelist(ip);
              if (response.success) {
                if (response.data) {
                  setIpList(response.data);
                } else {
                  setIpList(ipList.filter(item => item !== ip));
                }
                Alert.alert('Success', 'IP address removed successfully.');
              } else {
                Alert.alert('Error', response.message || 'Failed to remove IP address.');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove IP address.');
            } finally {
              setRemovingIp(null);
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password.');
      return;
    }
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'The new passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      if (response.success) {
        Alert.alert('Success', 'Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', response.message || 'Failed to change password.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!profileData.service_description?.trim()) {
      Alert.alert('Error', 'Please enter a service description.');
      return;
    }
    if (!profileData.business_name?.trim()) {
      Alert.alert('Error', 'Please enter a business name.');
      return;
    }
    if (!profileData.contact_name?.trim()) {
      Alert.alert('Error', 'Please enter a contact name.');
      return;
    }
    if (!profileData.address1?.trim()) {
      Alert.alert('Error', 'Please enter address line 1.');
      return;
    }
    if (!profileData.town?.trim()) {
      Alert.alert('Error', 'Please enter a town/city.');
      return;
    }
    if (!profileData.postcode?.trim()) {
      Alert.alert('Error', 'Please enter a post code.');
      return;
    }
    if (!profileData.phone_number?.trim()) {
      Alert.alert('Error', 'Please enter a phone number.');
      return;
    }
    if (!profileData.email?.trim()) {
      Alert.alert('Error', 'Please enter an email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateProfile({
        service_description: profileData.service_description,
        business_name: profileData.business_name,
        contact_name: profileData.contact_name,
        address1: profileData.address1,
        address2: profileData.address2,
        town: profileData.town,
        country: profileData.country,
        postcode: profileData.postcode,
        mobile_number: profileData.mobile_number,
        phone_number: profileData.phone_number,
        email: profileData.email,
        default_sender_id: profileData.default_sender_id,
      });

      if (response.success) {
        Alert.alert('Success', response.message || 'Profile updated successfully.');
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#293B50" />
        <Header
          title="Client Profile"
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={handleNotificationPress}
          notificationCount={3}
          walletBalance="£6859"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      <Header
        title="Client Profile"
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ea6118']}
            tintColor="#ea6118"
          />
        }>

        {/* Header Card with Welcome Info Button */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>👤</Text>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Welcome to Your Profile</Text>
              <View style={styles.expiryRow}>
                <Text style={styles.expiryIconSmall}>⏰</Text>
                <Text style={styles.expiryTextSmall}>
                  Account Expires: {profileData.account_expiry}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowWelcomeInfo(true)}>
            <Text style={styles.infoButtonIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Service Description */}
        <View style={styles.profileCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>Service Description</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                <Text style={styles.required}>*</Text> Service Description
              </Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                multiline
                numberOfLines={4}
                value={profileData.service_description}
                onChangeText={(text) => updateProfileField('service_description', text)}
                placeholder="Describe your SMS service usage..."
                placeholderTextColor="#94a3b8"
              />
              <Text style={styles.helpText}>
                ℹ️ Provide a brief description of how you plan to use SMS services
              </Text>
            </View>
          </View>
        </View>

        {/* Client Details */}
        <View style={styles.profileCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🏢</Text>
            <Text style={styles.sectionTitle}>Client Details</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>
                  <Text style={styles.required}>*</Text> Business Name
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={profileData.business_name}
                  onChangeText={(text) => updateProfileField('business_name', text)}
                  placeholder="Enter business name"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>
                  <Text style={styles.required}>*</Text> Contact Name
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={profileData.contact_name}
                  onChangeText={(text) => updateProfileField('contact_name', text)}
                  placeholder="Enter contact name"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                <Text style={styles.required}>*</Text> Address Line 1
              </Text>
              <TextInput
                style={styles.formInput}
                value={profileData.address1}
                onChangeText={(text) => updateProfileField('address1', text)}
                placeholder="Enter address line 1"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address Line 2</Text>
              <TextInput
                style={styles.formInput}
                value={profileData.address2}
                onChangeText={(text) => updateProfileField('address2', text)}
                placeholder="Enter address line 2"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>
                  <Text style={styles.required}>*</Text> Town/City
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={profileData.town}
                  onChangeText={(text) => updateProfileField('town', text)}
                  placeholder="Enter town"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Country</Text>
                <TextInput
                  style={styles.formInput}
                  value={profileData.country}
                  onChangeText={(text) => updateProfileField('country', text)}
                  placeholder="Enter country"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>
                  <Text style={styles.required}>*</Text> Post Code
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={profileData.postcode}
                  onChangeText={(text) => updateProfileField('postcode', text)}
                  placeholder="Enter post code"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={profileData.mobile_number}
                  onChangeText={(text) => updateProfileField('mobile_number', text)}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>
                  <Text style={styles.required}>*</Text> Phone Number
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={profileData.phone_number}
                  onChangeText={(text) => updateProfileField('phone_number', text)}
                  placeholder="Enter phone number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>
                  <Text style={styles.required}>*</Text> Email Address
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={profileData.email}
                  onChangeText={(text) => updateProfileField('email', text)}
                  placeholder="Enter email address"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <Text style={styles.requiredNote}>
              ℹ️ <Text style={styles.required}>*</Text> Denotes a required field
            </Text>
          </View>
        </View>

        {/* SMS Limits Info */}
        <View style={styles.limitInfo}>
          <View style={styles.limitHeader}>
            <Text style={styles.limitIcon}>⚡</Text>
            <Text style={styles.limitTitle}>Daily SMS Sending Limits</Text>
          </View>
          <Text style={styles.limitText}>Each day you are currently allowed to send up to:</Text>
          <View style={styles.limitBadge}>
            <Text style={styles.limitBadgeText}>{dailySmsLimit.toLocaleString()} SMS messages</Text>
          </View>
          <Text style={styles.limitNote}>
            To increase your limit, please contact the helpdesk or your account director.
          </Text>
        </View>

        {/* Sender ID Configuration */}
        <View style={styles.profileCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🆔</Text>
            <Text style={styles.sectionTitle}>Sender ID Configuration</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.senderIdSection}>
              <View style={styles.formGroup}>
                <View style={styles.labelWithHelp}>
                  <Text style={styles.formLabel}>Default Sender ID</Text>
                  <TouchableOpacity onPress={() => setShowSenderIdInfo(true)}>
                    <Text style={styles.helpIcon}>❓</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.formInput}
                  value={profileData.default_sender_id}
                  onChangeText={(text) => updateProfileField('default_sender_id', text)}
                  placeholder="Enter sender ID"
                  placeholderTextColor="#94a3b8"
                  maxLength={11}
                />
                <Text style={styles.helpText}>
                  ℹ️ This will be used as the default sender for your SMS messages
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Advanced Options Header */}
        <View style={styles.advancedHeader}>
          <Text style={styles.advancedIcon}>⚙️</Text>
          <Text style={styles.advancedTitle}>Advanced Options</Text>
        </View>

        {/* Security Settings */}
        <View style={styles.profileCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🔒</Text>
            <Text style={styles.sectionTitle}>Security Settings</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Change Password */}
            <View style={styles.passwordSection}>
              <View style={styles.labelWithHelp}>
                <Text style={styles.subSectionTitle}>🔑 Change Password</Text>
                <TouchableOpacity onPress={() => setShowPasswordInfo(true)}>
                  <Text style={styles.helpIcon}>❓</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Current Password</Text>
                <TextInput
                  style={styles.formInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>New Password</Text>
                <TextInput
                  style={styles.formInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.formInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.changePasswordBtn, changingPassword && styles.disabledBtn]}
                onPress={handleChangePassword}
                disabled={changingPassword}>
                {changingPassword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.changePasswordIcon}>🔐</Text>
                    <Text style={styles.changePasswordText}>Change Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* IP Access Control */}
            <View style={styles.ipSection}>
              <View style={styles.labelWithHelp}>
                <Text style={styles.subSectionTitle}>🔐 IP Access Control</Text>
                <TouchableOpacity onPress={() => setShowIpInfo(true)}>
                  <Text style={styles.helpIcon}>❓</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Authorized IP Addresses</Text>
              
              {ipList.length > 0 ? (
                <View style={styles.ipList}>
                  {ipList.map((ip, index) => (
                    <View key={index} style={styles.ipItem}>
                      <Text style={styles.ipText}>{ip}</Text>
                      <TouchableOpacity 
                        style={styles.ipDeleteBtn}
                        onPress={() => handleDeleteIp(ip)}
                        disabled={removingIp === ip}>
                        {removingIp === ip ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.ipDeleteText}>✕</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noIpContainer}>
                  <Text style={styles.noIpText}>No IP addresses configured</Text>
                </View>
              )}

              <View style={styles.ipInputRow}>
                <TextInput
                  style={[styles.formInput, styles.ipInput]}
                  value={newIp}
                  onChangeText={setNewIp}
                  placeholder="Enter IP address"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[styles.addIpBtn, addingIp && styles.disabledBtn]}
                  onPress={handleAddIp}
                  disabled={addingIp}>
                  {addingIp ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.addIpText}>➕</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Push Delivery Receipts */}
        <View style={styles.pushDeliverySection}>
          <View style={styles.pushHeader}>
            <Text style={styles.pushIcon}>📧</Text>
            <Text style={styles.pushTitle}>Push Delivery Receipts</Text>
          </View>
          <View style={[styles.statusBadge, pushDeliveryActive && styles.statusBadgeActive]}>
            <Text style={styles.statusIcon}>{pushDeliveryActive ? '✅' : '⏳'}</Text>
            <Text style={[styles.statusText, pushDeliveryActive && styles.statusTextActive]}>
              {pushDeliveryActive ? 'Active' : 'Not Active'}
            </Text>
          </View>
          <Text style={styles.pushText}>
            {pushDeliveryActive 
              ? 'Delivery receipt push is active for this account.'
              : 'Delivery receipt push is not yet active for this account. Contact support to enable this feature.'}
          </Text>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.submitIcon}>✅</Text>
                <Text style={styles.submitText}>Confirm All Details</Text>
                <Text style={styles.submitArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.submitNote}>
            ℹ️ Changes will require email confirmation before taking effect
          </Text>
        </View>

      </ScrollView>

      {/* Sender ID Info Modal */}
      <Modal
        visible={showSenderIdInfo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSenderIdInfo(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>❓ Sender ID Information</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowSenderIdInfo(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                The Sender ID is the sender name the recipient sees when they receive a standard rate SMS message. You cannot set the sender ID for premium rate messages - these will automatically have a shortcode ID.
              </Text>
              <Text style={styles.modalSubtitle}>There are three different types of Sender ID:</Text>
              <View style={styles.modalListItem}>
                <Text style={styles.modalBullet}>📱</Text>
                <Text style={styles.modalListText}>
                  <Text style={styles.bold}>Mobile number:</Text> A mobile number (11 to 15 characters) starting with the country code (44 for the UK) or 0.
                </Text>
              </View>
              <View style={styles.modalListItem}>
                <Text style={styles.modalBullet}>🔤</Text>
                <Text style={styles.modalListText}>
                  <Text style={styles.bold}>Alphanumeric:</Text> A string of up to 11 characters starting with a letter and consisting of letters, numbers, spaces, full stops, and hyphens.
                </Text>
              </View>
              <View style={styles.modalListItem}>
                <Text style={styles.modalBullet}>🔢</Text>
                <Text style={styles.modalListText}>
                  <Text style={styles.bold}>Shortcode:</Text> A shortcode number which can be up to 5 digits long, such as 83248.
                </Text>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSenderIdInfo(false)}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Info Modal */}
      <Modal
        visible={showPasswordInfo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordInfo(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔒 Password Security</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowPasswordInfo(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                This section allows you to change your account password. Please note that passwords are case-sensitive.
              </Text>
              <Text style={styles.modalText}>
                When changing your password, you'll be asked for the new password twice to prevent typing errors.
              </Text>
              <View style={styles.modalHighlight}>
                <Text style={styles.modalHighlightTitle}>🛡️ Security Recommendation</Text>
                <Text style={styles.modalHighlightText}>
                  We recommend changing your password frequently (at least once a month) to ensure maximum account security.
                </Text>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPasswordInfo(false)}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* IP Access Info Modal */}
      <Modal
        visible={showIpInfo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIpInfo(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔐 IP Access Control</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowIpInfo(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                The IP Security feature allows you to specify which IP addresses can access your SMS APIs.
              </Text>
              <Text style={styles.modalText}>
                When this feature is enabled, only connections from the specified IP addresses will be allowed to use your SMS APIs.
              </Text>
              <Text style={styles.modalSubtitle}>Benefits:</Text>
              <View style={styles.modalListItem}>
                <Text style={styles.modalBullet}>✅</Text>
                <Text style={styles.modalListText}>Enhanced security for your SMS account</Text>
              </View>
              <View style={styles.modalListItem}>
                <Text style={styles.modalBullet}>✅</Text>
                <Text style={styles.modalListText}>Protection against unauthorized API access</Text>
              </View>
              <View style={styles.modalListItem}>
                <Text style={styles.modalBullet}>✅</Text>
                <Text style={styles.modalListText}>Control over who can send SMS through your account</Text>
              </View>
              <Text style={styles.modalNote}>
                Leave the list empty to allow access from any IP address.
              </Text>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowIpInfo(false)}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Welcome Info Bottom Sheet Modal */}
      <Modal
        visible={showWelcomeInfo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWelcomeInfo(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetTitleRow}>
                <Text style={styles.bottomSheetIcon}>👋</Text>
                <Text style={styles.bottomSheetTitle}>Welcome to Your Profile</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowWelcomeInfo(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>✏️</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Update Your Profile</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    Update your profile information below and click 'Confirm all Details' to save changes. Keep your information up-to-date for better service.
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.greenBg]}>
                    <Text style={styles.infoSectionIcon}>📧</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Email Confirmation</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.greenBorder]}>
                  <Text style={styles.infoSectionText}>
                    An email will be sent to your existing email address ({profileData.email}) to confirm any changes you make.
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.yellowBg]}>
                    <Text style={styles.infoSectionIcon}>⚠️</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Important Notice</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.yellowBorder]}>
                  <Text style={styles.infoSectionText}>
                    Your account access will be temporarily blocked until you confirm the changes via email. Please check your inbox after making changes.
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.redBg]}>
                    <Text style={styles.infoSectionIcon}>⏰</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Account Package Expiry</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.redBorder]}>
                  <Text style={styles.infoSectionText}>
                    Account Package Expires: {profileData.account_expiry}
                  </Text>
                  <Text style={[styles.infoSectionText, {marginTop: 8}]}>
                    Contact support to set up or renew your account package.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomSheetFooter}>
              <TouchableOpacity
                style={styles.closeSheetButton}
                onPress={() => setShowWelcomeInfo(false)}>
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
    flex: 1,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  expiryIconSmall: {
    fontSize: 12,
    marginRight: 4,
  },
  expiryTextSmall: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
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
  // Profile Card
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  sectionContent: {
    padding: 20,
  },
  // Form Elements
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
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
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#293B50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  requiredNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  // Sender ID Section
  senderIdSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  labelWithHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  helpIcon: {
    fontSize: 18,
    color: '#64748b',
  },
  // Limit Info
  limitInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#0891b2',
  },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  limitIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0891b2',
  },
  limitText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  limitBadge: {
    backgroundColor: '#0891b2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  limitBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  limitNote: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  // Advanced Header
  advancedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  advancedIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  advancedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  // Password Section
  passwordSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
  },
  changePasswordBtn: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  changePasswordIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  changePasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledBtn: {
    backgroundColor: '#94a3b8',
  },
  // IP Section
  ipSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ipList: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    maxHeight: 150,
  },
  ipItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  ipText: {
    fontSize: 14,
    color: '#293B50',
    fontFamily: 'monospace',
  },
  ipDeleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ipDeleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  noIpContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  noIpText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  ipInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ipInput: {
    flex: 1,
  },
  addIpBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIpText: {
    fontSize: 18,
  },
  // Push Delivery Section
  pushDeliverySection: {
    backgroundColor: '#fef3c7',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  pushHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pushIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  pushTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusBadgeActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  statusTextActive: {
    color: '#16a34a',
  },
  pushText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 22,
  },
  // Submit Section
  submitSection: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea6118',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  submitIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  submitArrow: {
    fontSize: 18,
    color: '#ffffff',
    marginLeft: 10,
  },
  submitNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
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
    maxHeight: '80%',
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
  modalTitle: {
    fontSize: 16,
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
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 12,
  },
  modalListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalBullet: {
    fontSize: 16,
    marginRight: 10,
  },
  modalListText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
  },
  modalHighlight: {
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0891b2',
  },
  modalHighlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0891b2',
    marginBottom: 8,
  },
  modalHighlightText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  modalNote: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 12,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalCloseButton: {
    backgroundColor: '#ea6118',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Bottom Sheet Styles
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
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  bottomSheetBody: {
    padding: 20,
    maxHeight: 450,
  },
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
  blueBg: {
    backgroundColor: '#f0f9ff',
  },
  greenBg: {
    backgroundColor: '#dcfce7',
  },
  yellowBg: {
    backgroundColor: '#fef3c7',
  },
  redBg: {
    backgroundColor: '#fef2f2',
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
  blueBorder: {
    borderLeftColor: '#0891b2',
  },
  greenBorder: {
    borderLeftColor: '#16a34a',
  },
  yellowBorder: {
    borderLeftColor: '#f59e0b',
  },
  redBorder: {
    borderLeftColor: '#dc2626',
  },
  infoSectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
});

export default ProfileScreen;
