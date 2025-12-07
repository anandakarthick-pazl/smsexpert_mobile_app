import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface PlaceholderScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
  };
  route: {
    name: string;
  };
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({navigation, route}) => {
  const screenName = route.name;

  const screenInfo: {[key: string]: {icon: string; title: string}} = {
    SMSWallet: {icon: '💰', title: 'SMS Wallet'},
    SendSMS: {icon: '📤', title: 'Send New SMS'},
    ReceivedSMS: {icon: '📥', title: 'Received SMS'},
    SentSMS: {icon: '💬', title: 'Sent SMS'},
    Keywords: {icon: '🔑', title: 'Keywords'},
    Numbers: {icon: '📋', title: 'Numbers'},
    Groups: {icon: '👥', title: 'Groups'},
    Profile: {icon: '👤', title: 'Client Profile'},
    Contracts: {icon: '📄', title: 'Contracts'},
    Invoices: {icon: '🧾', title: 'Invoices'},
    TechDocs: {icon: '💡', title: 'Technical Docs'},
    DeliveryReceipt: {icon: '📖', title: 'Delivery Receipt'},
    Stops: {icon: '🛟', title: 'STOPs/Optouts'},
    Blacklist: {icon: '🚫', title: 'Blacklist'},
  };

  const info = screenInfo[screenName] || {icon: '📱', title: screenName};

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      {/* Header with Wallet & Notification (Common for all pages) */}
      <Header
        title={info.title}
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
        walletBalance="£6859"
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.icon}>{info.icon}</Text>
          <Text style={styles.title}>{info.title}</Text>
          <Text style={styles.subtitle}>This screen is under development</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={0.7}>
            <Text style={styles.backButtonText}>← Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#ea6118',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default PlaceholderScreen;
