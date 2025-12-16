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
import {getKeywordDetails, updateEmailForwarder} from '../services/keywordsService';

interface EmailForwarderScreenProps {
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

const EmailForwarderScreen: React.FC<EmailForwarderScreenProps> = ({navigation, route}) => {
  const keywordId = route.params?.keywordId || 0;
  const keywordName = route.params?.keywordName || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [keywordData, setKeywordData] = useState<any>(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [urlAddress, setUrlAddress] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await getKeywordDetails(keywordId);
      if (response.success) {
        const kw = response.data.keyword;
        setKeywordData(kw);
        setEmailAddress(kw.forwarding_email || '');
        setUrlAddress(kw.forwarding_url || '');
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
    setSaving(true);
    try {
      const result = await updateEmailForwarder(keywordId, {
        email_address: emailAddress.trim(),
        url_address: urlAddress.trim(),
      });

      if (result.success) {
        Alert.alert('Success', 'Email Forwarder settings updated successfully', [
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
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>SMS to Email Forwarder</Text>
          <Text style={styles.headerSubtitle}>{keywordName}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Description */}
        {keywordData && (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              When somebody sends an SMS message to{' '}
              <Text style={styles.bold}>{keywordData.virtual_number}</Text>{' '}
              starting with "<Text style={styles.bold}>{keywordData.keyword}</Text>
              "...
            </Text>
          </View>
        )}

        {/* Email Settings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📧</Text>
            <Text style={styles.cardTitle}>Email Forwarding</Text>
          </View>

          {/* Email Addresses */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              1. Forward a notification by email to
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={emailAddress}
              onChangeText={setEmailAddress}
              multiline
              numberOfLines={4}
              placeholder="Enter email addresses"
              placeholderTextColor="#999"
              textAlignVertical="top"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>
              Separate multiple email addresses with a comma.
            </Text>
          </View>

          {/* URL Address */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              2. Forward the request to URL (advanced)
            </Text>
            <TextInput
              style={styles.input}
              value={urlAddress}
              onChangeText={setUrlAddress}
              placeholder="https://example.com/webhook"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </View>

        {/* Retry Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🔄</Text>
            <Text style={styles.cardTitle}>Retry Settings</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Number of attempts:</Text>
            <Text style={styles.infoValue}>2</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Wait before retry:</Text>
            <Text style={styles.infoValue}>60 minute(s)</Text>
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
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
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

export default EmailForwarderScreen;
