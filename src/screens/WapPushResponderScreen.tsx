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
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getWapPushResponder, updateWapPushResponder} from '../services/keywordsService';

interface WapPushResponderScreenProps {
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

const WapPushResponderScreen: React.FC<WapPushResponderScreenProps> = ({navigation, route}) => {
  const keywordId = route.params?.keywordId || 0;
  const keywordName = route.params?.keywordName || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [shortcodeNumber, setShortcodeNumber] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  
  const [showTitleHelp, setShowTitleHelp] = useState(false);
  const [showUrlHelp, setShowUrlHelp] = useState(false);
  const [showKnownIssues, setShowKnownIssues] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await getWapPushResponder(keywordId);
      if (response.success) {
        setKeyword(response.data.keyword);
        setShortcodeNumber(response.data.shortcode_number);
        setTitle(response.data.title || '');
        setUrl(response.data.url || '');
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
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Alert.alert('Error', 'URL must start with http:// or https://');
      return;
    }

    setSaving(true);
    try {
      const result = await updateWapPushResponder(keywordId, {
        title: title.trim(),
        url: url.trim(),
      });

      if (result.success) {
        Alert.alert('Success', 'WAP Push Responder settings updated successfully', [
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
          <Text style={styles.headerTitle}>WAP Push Responder</Text>
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
            Send the following WAP Push URL back
          </Text>
        </View>

        {/* WAP Push Settings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="link" size={20} color="#ea6118" />
            <Text style={styles.cardTitle}>WAP Push Settings</Text>
          </View>

          {/* Title */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Title</Text>
              <TouchableOpacity onPress={() => setShowTitleHelp(true)}>
                <Icon name="help" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              maxLength={90}
              placeholder="Enter title"
              placeholderTextColor="#999"
            />
          </View>

          {/* URL */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>URL</Text>
              <TouchableOpacity onPress={() => setShowUrlHelp(true)}>
                <Icon name="help" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://example.com/page"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Response Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Response Type</Text>
            <View style={styles.staticField}>
              <Text style={styles.staticFieldText}>At cost to my Wallet</Text>
            </View>
          </View>
        </View>

        {/* Test Info */}
        <View style={styles.infoBox}>
          <Icon name="phone-android" size={20} color="#0891b2" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Test WAP Push</Text>
            <Text style={styles.infoText}>
              To test how your phone handles WAP Push Service Indicator message,
              send a text consisting of <Text style={styles.bold}>itagg wap</Text>{' '}
              to <Text style={styles.bold}>{shortcodeNumber}</Text>.
            </Text>
            <Text style={styles.infoText}>
              This should return a message to your handset containing a link to
              a test WAP page (demo costs standard rate).
            </Text>
          </View>
        </View>

        {/* Known Issues Link */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setShowKnownIssues(true)}>
          <Icon name="warning" size={18} color="#ea6118" />
          <Text style={styles.linkButtonText}>
            Click here to see any known issues
          </Text>
        </TouchableOpacity>

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

      {/* Title Help Modal */}
      <Modal visible={showTitleHelp} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>WAP Push Information</Text>
              <TouchableOpacity onPress={() => setShowTitleHelp(false)}>
                <Icon name="close" size={24} color="#293b50" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                A WAP Push message is a specially formatted SMS message that the
                recipient uses to connect to the internet.
              </Text>
              <Text style={styles.modalText}>
                These messages are used to allow people to connect to the internet
                to view a WAP page, download a Java game or ringtone or an image
                etc.
              </Text>
              <Text style={styles.modalText}>
                The Title that you are asked to set is for the benefit of the
                person receiving the message - it describes what the link is
                (eg. 'Space Combat' or 'daily pic - Wednesday')
              </Text>
              <Text style={styles.modalText}>
                WAP Push messages are fairly standard and work on most phones,
                but please bear in mind that they are not supported by 100% of
                phones.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowTitleHelp(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* URL Help Modal */}
      <Modal visible={showUrlHelp} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>URL Format</Text>
              <TouchableOpacity onPress={() => setShowUrlHelp(false)}>
                <Icon name="close" size={24} color="#293b50" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                The URL must start with the protocol (http:// or https://).
              </Text>
              <Text style={styles.modalSubtitle}>Valid URLs:</Text>
              <Text style={styles.codeText}>
                http://www.example.com/mobile.php{'\n'}
                https://secure.site.com/wapServlet{'\n'}
                http://www.things.co.uk/mob.php?sender=itagg
              </Text>
              <Text style={styles.modalSubtitle}>Invalid URLs:</Text>
              <Text style={styles.codeText}>
                www.mysite.com{'\n'}
                mysite.com
              </Text>
              <Text style={styles.modalText}>
                Avoid using spaces in your URL if at all possible, as problems
                have been encountered.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowUrlHelp(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Known Issues Modal */}
      <Modal visible={showKnownIssues} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Known Issues</Text>
              <TouchableOpacity onPress={() => setShowKnownIssues(false)}>
                <Icon name="close" size={24} color="#293b50" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                WAP push messages generally come in to a different 'inbox' than
                normal SMS messages. Look somewhere in the 'Services' menu area.
              </Text>
              <Text style={styles.modalSubtitle}>User tested phones:</Text>
              <Text style={styles.modalText}>
                Nokia 7650, 3650, 7210, 7250, 7250i, 6310i, 6230, 6230i{'\n'}
                Sony Ericsson T610, Z600, P800, P900{'\n'}
                Ericsson T68, LG 7100, Sony Ericsson K700i
              </Text>
              <Text style={styles.modalSubtitle}>Known issues with:</Text>
              <Text style={styles.modalText}>
                Motorola v525, Motorola E-365 - documented problems with Vodafone Live.{'\n'}
                Nokia 3330 - doesn't seem to receive them.{'\n'}
                Siemens C35 - interprets them as text (incorrect).{'\n'}
                Motorola v545 - problems connecting to the internet.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowKnownIssues(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293b50',
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
  staticField: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  staticFieldText: {
    fontSize: 15,
    color: '#64748b',
  },
  infoBox: {
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(8, 145, 178, 0.2)',
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
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 15,
  },
  linkButtonText: {
    color: '#ea6118',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#293b50',
  },
  modalBody: {
    maxHeight: 400,
  },
  modalText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#293b50',
    marginTop: 10,
    marginBottom: 5,
  },
  codeText: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#64748b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default WapPushResponderScreen;
