import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getModuleInfo} from '../services/keywordsService';

interface BusinessCardScreenProps {
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

const BusinessCardScreen: React.FC<BusinessCardScreenProps> = ({navigation, route}) => {
  const keywordId = route.params?.keywordId || 0;
  const keywordName = route.params?.keywordName || '';

  const [loading, setLoading] = useState(true);
  const [canEnable, setCanEnable] = useState(false);
  const [message, setMessage] = useState('');
  const [conflictingModules, setConflictingModules] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const response = await getModuleInfo(keywordId, 'BusinessCard');
      if (response.success) {
        setCanEnable(response.data.can_enable);
        setMessage(response.data.message);
        setConflictingModules(response.data.conflicting_modules);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [keywordId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          <Text style={styles.headerTitle}>Business Card</Text>
          <Text style={styles.headerSubtitle}>{keywordName}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningIconContainer}>
            <Icon name="warning" size={40} color="#f59e0b" />
          </View>
          
          <Text style={styles.warningTitle}>Module Cannot Be Enabled</Text>
          
          <Text style={styles.warningText}>
            The <Text style={styles.bold}>Business Card Module</Text> cannot be
            switched on whilst there are other Modules enabled which can result
            in outbound SMS (such as the <Text style={styles.bold}>WAP Push responder</Text>{' '}
            Module), as this can be potentially confusing for users.
          </Text>

          <Text style={styles.warningText}>
            You must switch off such Modules before you can enable the Business
            Card Module.
          </Text>

          {conflictingModules.length > 0 && (
            <View style={styles.conflictingSection}>
              <Text style={styles.conflictingTitle}>Currently Active Conflicting Modules:</Text>
              {conflictingModules.map((module, index) => (
                <View key={index} style={styles.conflictingItem}>
                  <Icon name="block" size={16} color="#dc2626" />
                  <Text style={styles.conflictingText}>
                    {module === 'smsResponder' ? 'SMS Auto-Responder' : 
                     module === 'WAPPushResponder' ? 'WAP Push Responder' :
                     module === 'Subscription' ? 'Subscription' : module}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.okButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.okButtonText}>OK</Text>
        </TouchableOpacity>
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
  warningCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth: 4,
    borderTopColor: '#f59e0b',
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#293b50',
    marginBottom: 15,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
    color: '#293b50',
  },
  conflictingSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 10,
    width: '100%',
  },
  conflictingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 10,
  },
  conflictingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  conflictingText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  okButton: {
    backgroundColor: '#ea6118',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  okButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BusinessCardScreen;
