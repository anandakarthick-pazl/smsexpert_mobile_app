import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getSmsForwarder, updateSmsForwarder} from '../services/keywordsService';

interface SmsForwarderScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params?: {
      keywordId: number;
      keywordName: string;
    };
  };
}

const SmsForwarderScreen: React.FC<SmsForwarderScreenProps> = ({navigation, route}) => {
  const keywordId = route.params?.keywordId || 0;
  const keywordName = route.params?.keywordName || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [shortcodeNumber, setShortcodeNumber] = useState('');
  const [fwdMobile, setFwdMobile] = useState('');
  const [walletBalance, setWalletBalance] = useState('0.00');

  const fetchData = useCallback(async () => {
    try {
      const response = await getSmsForwarder(keywordId);
      if (response.success) {
        setKeyword(response.data.keyword);
        setShortcodeNumber(response.data.shortcode_number);
        setFwdMobile(response.data.fwd_mobile || '');
        setWalletBalance(response.data.wallet_balance);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [keywordId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSave = async () => {
    if (!fwdMobile.trim()) {
      Alert.alert('Error', 'Please enter at least one mobile number');
      return;
    }

    setSaving(true);
    try {
      const result = await updateSmsForwarder(keywordId, {
        fwd_mobile: fwdMobile.trim(),
      });

      if (result.success) {
        Alert.alert('Success', 'SMS Forwarder settings updated successfully', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>SMS Forwarder</Text>
          <Text style={styles.headerSubtitle}>{keywordName}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Description */}
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            When somebody sends in a message starting with "
            <Text style={styles.bold}>{keyword}</Text>"
          </Text>
        </View>

        {/* SMS Forwarder Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="phone-forwarded" size={20} color="#ea6118" />
            <Text style={styles.cardTitle}>SMS Forwarding Settings</Text>
          </View>

          {/* Mobile Numbers */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Forward the request onto the following mobile phone(s)
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={fwdMobile}
              onChangeText={setFwdMobile}
              multiline
              numberOfLines={5}
              placeholder="Enter mobile numbers"
              placeholderTextColor="#999"
              textAlignVertical="top"
              keyboardType="phone-pad"
            />
            <Text style={styles.helperText}>
              Use commas to separate phone numbers, e.g.:
              07889111111,07889222222,07889333333
            </Text>
          </View>
        </View>

        {/* Wallet Info Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletIconContainer}>
            <Icon name="account-balance-wallet" size={30} color="#ea6118" />
          </View>
          <View style={styles.walletContent}>
            <Text style={styles.walletLabel}>
              The messages will be sent at cost to your wallet.
            </Text>
            <Text style={styles.walletText}>
              Your current wallet level is{' '}
              <Text style={styles.walletAmount}>£{walletBalance}</Text>
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="save" size={20} color="#fff" />
                <Text style={styles.buttonText}>Save Settings</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}>
            <Icon name="close" size={20} color="#fff" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#293b50',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  headerTitleContainer: {
    marginLeft: 15,
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#ea6118',
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  descriptionBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ea6118',
  },
  descriptionText: {
    fontSize: 15,
    color: '#293b50',
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: '#ea6118',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#293b50',
    marginLeft: 10,
  },
  formGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293b50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  walletCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ea6118',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(234, 97, 24, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  walletContent: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  walletText: {
    fontSize: 15,
    color: '#293b50',
  },
  walletAmount: {
    fontWeight: 'bold',
    color: '#ea6118',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#ea6118',
  },
  cancelButton: {
    backgroundColor: '#64748b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SmsForwarderScreen;
