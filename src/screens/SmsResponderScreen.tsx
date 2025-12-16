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
  Switch,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getKeywordDetails, updateSmsResponder} from '../services/keywordsService';

interface SmsResponderScreenProps {
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

const SmsResponderScreen: React.FC<SmsResponderScreenProps> = ({navigation, route}) => {
  const keywordId = route.params?.keywordId || 0;
  const keywordName = route.params?.keywordName || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [keywordData, setKeywordData] = useState<any>(null);
  const [senderId, setSenderId] = useState('');
  const [responseText, setResponseText] = useState('');
  const [allowedUpdateNumbers, setAllowedUpdateNumbers] = useState('');
  const [allowSubkeys, setAllowSubkeys] = useState(false);
  const [responseRoute, setResponseRoute] = useState<number>(0);

  const fetchData = useCallback(async () => {
    try {
      const response = await getKeywordDetails(keywordId);
      if (response.success) {
        const kw = response.data.keyword;
        setKeywordData(kw);
        setSenderId(kw.response_sender_id || kw.keyword || '');
        setResponseText(
          kw.response_content ||
            `This is a demo auto-response for your keyword ${kw.keyword}`,
        );
        setAllowedUpdateNumbers(kw.allowed_mobile_update_numbers || '');
        setAllowSubkeys(kw.allow_mobile_update_across_subkeys === '1');
        setResponseRoute(kw.response_smsshortcodes_id || kw.smsshortcodes_id);
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

  const calculateSmsCount = (text: string) => {
    const length = text.length;
    if (length === 0) return 0;
    if (length <= 160) return 1;
    return Math.ceil(length / 153);
  };

  const handleSave = async () => {
    if (!senderId.trim()) {
      Alert.alert('Error', 'Please enter a Sender ID');
      return;
    }
    if (senderId.length > 11) {
      Alert.alert('Error', 'Sender ID must not exceed 11 characters');
      return;
    }
    if (!responseText.trim()) {
      Alert.alert('Error', 'Please enter a response text');
      return;
    }

    setSaving(true);
    try {
      const result = await updateSmsResponder(keywordId, {
        sender_id: senderId.trim(),
        response_text: responseText.trim(),
        response_route: responseRoute,
        allowed_update_numbers: allowedUpdateNumbers.trim(),
        allow_subkeys: allowSubkeys ? '1' : '0',
      });

      if (result.success) {
        Alert.alert('Success', 'SMS Responder settings updated successfully', [
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
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>SMS Auto-Responder</Text>
          <Text style={styles.headerSubtitle}>{keywordName}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>ℹ️</Text>
            <Text style={styles.cardTitle}>Auto-Responder Settings</Text>
          </View>

          {/* Sender ID */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Sender ID <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={senderId}
              onChangeText={setSenderId}
              maxLength={11}
              placeholder="Enter sender ID"
              placeholderTextColor="#999"
            />
            <Text style={styles.helperText}>
              The sender ID that will appear on the response message (max 11
              characters)
            </Text>
          </View>

          {/* Response Text */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Response Text <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={responseText}
              onChangeText={setResponseText}
              multiline
              numberOfLines={5}
              placeholder="Enter your auto-response message"
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
            <View style={styles.charCounter}>
              <Text style={styles.charCountText}>
                {responseText.length} characters |{' '}
                {calculateSmsCount(responseText)} SMS message(s)
              </Text>
            </View>
          </View>

          {/* Allowed Mobile Update Numbers */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Allow Mobile Updates from</Text>
            <TextInput
              style={styles.input}
              value={allowedUpdateNumbers}
              onChangeText={setAllowedUpdateNumbers}
              placeholder="e.g., 447700900123,447700900456"
              placeholderTextColor="#999"
            />
            <Text style={styles.helperText}>
              Enter comma-separated mobile numbers that can update this
              responder
            </Text>
          </View>

          {/* Allow for Subkeywords */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              Allow for ALL 'SMS Auto-Responder' subkeywords
            </Text>
            <Switch
              value={allowSubkeys}
              onValueChange={setAllowSubkeys}
              trackColor={{false: '#ccc', true: '#ea6118'}}
              thumbColor={allowSubkeys ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Mobile Updates Feature</Text>
            <Text style={styles.infoText}>
              This allows you to update the SMS Auto-Responder response text via
              your mobile phone. Simply enter the mobile phone number to be
              allowed to update the content.
            </Text>
            {keywordData && (
              <Text style={styles.infoText}>
                To update this keyword, send a message from the specified phone
                to <Text style={styles.bold}>{keywordData.virtual_number}</Text>{' '}
                starting with <Text style={styles.bold}>{keywordData.keyword}</Text>{' '}
                then a space, then your new content.
              </Text>
            )}
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
                <Text style={styles.buttonIcon}>💾</Text>
                <Text style={styles.buttonText}>Save Settings</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}>
            <Text style={styles.buttonIcon}>✕</Text>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
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
  cardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#293b50',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293b50',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
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
  charCounter: {
    marginTop: 5,
  },
  charCountText: {
    fontSize: 12,
    color: '#64748b',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 14,
    color: '#293b50',
    flex: 1,
    marginRight: 10,
  },
  infoBox: {
    backgroundColor: 'rgba(234, 97, 24, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(234, 97, 24, 0.2)',
  },
  infoIcon: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#293b50',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
    color: '#293b50',
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
  buttonIcon: {
    fontSize: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SmsResponderScreen;
