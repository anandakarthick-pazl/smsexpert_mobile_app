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
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getSubscription, updateSubscription} from '../services/keywordsService';

interface SubscriptionScreenProps {
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

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({navigation, route}) => {
  const keywordId = route.params?.keywordId || 0;
  const keywordName = route.params?.keywordName || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [shortcodeNumber, setShortcodeNumber] = useState('');
  const [subscribeResponse, setSubscribeResponse] = useState('');
  const [unsubscribeResponse, setUnsubscribeResponse] = useState('');
  const [failResponse, setFailResponse] = useState('');
  const [maxSubscribersEnabled, setMaxSubscribersEnabled] = useState(false);
  const [maxSubscribers, setMaxSubscribers] = useState('');
  const [sendMobiles, setSendMobiles] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await getSubscription(keywordId);
      if (response.success) {
        setKeyword(response.data.keyword);
        setShortcodeNumber(response.data.shortcode_number);
        setSubscribeResponse(response.data.subscribe_response);
        setUnsubscribeResponse(response.data.unsubscribe_response);
        setFailResponse(response.data.fail_response);
        const maxSubs = response.data.max_subscribers;
        if (maxSubs && maxSubs !== '' && maxSubs !== '0') {
          setMaxSubscribersEnabled(true);
          setMaxSubscribers(String(maxSubs));
        }
        setSendMobiles(response.data.send_mobiles);
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
    if (!subscribeResponse.trim()) {
      Alert.alert('Error', 'Please enter a subscribe response');
      return;
    }
    if (!unsubscribeResponse.trim()) {
      Alert.alert('Error', 'Please enter an unsubscribe response');
      return;
    }
    if (!failResponse.trim()) {
      Alert.alert('Error', 'Please enter a failure response');
      return;
    }

    setSaving(true);
    try {
      const result = await updateSubscription(keywordId, {
        subscribe_response: subscribeResponse.trim(),
        unsubscribe_response: unsubscribeResponse.trim(),
        fail_response: failResponse.trim(),
        max_subscribers: maxSubscribersEnabled && maxSubscribers 
          ? parseInt(maxSubscribers, 10) 
          : null,
        send_mobiles: sendMobiles.trim(),
      });

      if (result.success) {
        Alert.alert('Success', 'Subscription settings updated successfully', [
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
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Subscription</Text>
          <Text style={styles.headerSubtitle}>{keywordName}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Subscribe Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person-add" size={20} color="#16a34a" />
            <Text style={styles.cardTitle}>When someone subscribes</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Response</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={subscribeResponse}
              onChangeText={setSubscribeResponse}
              multiline
              numberOfLines={4}
              placeholder="Enter subscribe response"
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Unsubscribe Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person-remove" size={20} color="#dc2626" />
            <Text style={styles.cardTitle}>When someone unsubscribes</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Response</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={unsubscribeResponse}
              onChangeText={setUnsubscribeResponse}
              multiline
              numberOfLines={4}
              placeholder="Enter unsubscribe response"
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Failure Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="error" size={20} color="#f59e0b" />
            <Text style={styles.cardTitle}>When subscription fails</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Response</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={failResponse}
              onChangeText={setFailResponse}
              multiline
              numberOfLines={4}
              placeholder="Enter failure response"
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* User Instructions */}
        <View style={styles.instructionCard}>
          <View style={styles.cardHeader}>
            <Icon name="info" size={20} color="#0891b2" />
            <Text style={styles.cardTitle}>User Instructions</Text>
          </View>

          <View style={styles.instructionRow}>
            <Text style={styles.instructionLabel}>Start:</Text>
            <Text style={styles.instructionText}>
              text <Text style={styles.bold}>{keyword} start</Text> to{' '}
              <Text style={styles.bold}>{shortcodeNumber}</Text>
            </Text>
          </View>

          <View style={styles.instructionRow}>
            <Text style={styles.instructionLabel}>Stop:</Text>
            <Text style={styles.instructionText}>
              text <Text style={styles.bold}>{keyword} stop</Text> to{' '}
              <Text style={styles.bold}>{shortcodeNumber}</Text>
            </Text>
          </View>
        </View>

        {/* Additional Settings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="settings" size={20} color="#ea6118" />
            <Text style={styles.cardTitle}>Additional Settings</Text>
          </View>

          {/* Max Subscribers */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Maximum number of Subscribers</Text>
            <Switch
              value={maxSubscribersEnabled}
              onValueChange={setMaxSubscribersEnabled}
              trackColor={{false: '#ccc', true: '#ea6118'}}
              thumbColor={maxSubscribersEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          {maxSubscribersEnabled && (
            <View style={styles.formGroup}>
              <TextInput
                style={styles.input}
                value={maxSubscribers}
                onChangeText={(text) => setMaxSubscribers(text.replace(/[^0-9]/g, ''))}
                placeholder="Enter max number"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Subscription Group Name */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>The Subscription Group is called:</Text>
            <Text style={styles.infoValue}>
              {keyword} ({shortcodeNumber})
            </Text>
          </View>

          {/* Allow Mobile Sends */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Allow mobile sends from</Text>
            <TextInput
              style={styles.input}
              value={sendMobiles}
              onChangeText={setSendMobiles}
              placeholder="Enter allowed mobile numbers"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Mobile Send Info */}
        <View style={styles.infoBox}>
          <Icon name="phone-iphone" size={20} color="#ea6118" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Send from mobile phone</Text>
            <Text style={styles.infoText}>
              This allows you to send a message to this subscription group from
              your mobile phone. Enter the mobile phone number to be allowed to
              do this (or comma-separated numbers if more than one).
            </Text>
            <Text style={styles.infoText}>
              To send a message to the group, text in a message from the
              specified phone to <Text style={styles.bold}>{shortcodeNumber}</Text>{' '}
              starting with <Text style={styles.bold}>{keyword}</Text> then a
              space, then your message.
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
  instructionCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#0891b2',
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
    marginBottom: 15,
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
    height: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 14,
    color: '#293b50',
    flex: 1,
    marginRight: 10,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  instructionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#293b50',
    width: 50,
  },
  instructionText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
    color: '#293b50',
  },
  infoRow: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#293b50',
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

export default SubscriptionScreen;
