import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import FilterPopup from '../components/FilterPopup';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  trend?: string;
  trendUp?: boolean;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  trend,
  trendUp,
  bgColor,
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, {backgroundColor: bgColor}]}>
      <Text style={styles.statIconText}>{icon}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend && (
      <View style={styles.trendContainer}>
        <Text style={trendUp ? styles.trendUp : styles.trendDown}>
          {trendUp ? '↑' : '↓'} {trend}
        </Text>
      </View>
    )}
  </View>
);

interface QuickLinkProps {
  icon: string;
  title: string;
  bgColor: string;
  onPress: () => void;
}

const QuickLink: React.FC<QuickLinkProps> = ({icon, title, bgColor, onPress}) => (
  <TouchableOpacity style={styles.quickLink} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.quickLinkIcon, {backgroundColor: bgColor}]}>
      <Text style={styles.quickLinkIconText}>{icon}</Text>
    </View>
    <Text style={styles.quickLinkTitle}>{title}</Text>
    <Text style={styles.quickLinkArrow}>→</Text>
  </TouchableOpacity>
);

interface DashboardScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
  };
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({navigation}) => {
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleFilterPress = () => {
    setShowFilterPopup(true);
  };

  const handleApplyFilter = (startDate: Date, endDate: Date) => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };
    Alert.alert(
      'Filter Applied',
      `Showing data from ${formatDate(startDate)} to ${formatDate(endDate)}`
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      {/* Header with Wallet, Filter & Notification */}
      <Header
        title="Dashboard"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        onFilterPress={handleFilterPress}
        notificationCount={3}
        walletBalance="£6859"
        showFilter={true}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back! 🚀</Text>
          <Text style={styles.welcomeSubtitle}>
            Here's your SMS Expert dashboard overview
          </Text>
          <Text style={styles.welcomeDate}>{currentDate}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="📤"
            value="20"
            label="Total Sent"
            trend="+0 today"
            trendUp={true}
            bgColor="#293B50"
          />
          <StatCard
            icon="✅"
            value="12"
            label="Delivered"
            trend="60%"
            trendUp={true}
            bgColor="#16a34a"
          />
          <StatCard
            icon="⏳"
            value="8"
            label="Pending"
            bgColor="#f59e0b"
          />
          <StatCard
            icon="❌"
            value="0"
            label="Failed"
            trend="0%"
            trendUp={true}
            bgColor="#dc2626"
          />
        </View>

        {/* Financial Stats */}
        <View style={styles.financialSection}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.financialGrid}>
            <View style={styles.financialCard}>
              <Text style={styles.financialIcon}>💰</Text>
              <Text style={styles.financialValue}>£17.40</Text>
              <Text style={styles.financialLabel}>Total Spent</Text>
            </View>
            <View style={styles.financialCard}>
              <Text style={styles.financialIcon}>💳</Text>
              <Text style={styles.financialValue}>£6,859</Text>
              <Text style={styles.financialLabel}>Wallet Balance</Text>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinksSection}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <QuickLink
            icon="📤"
            title="Send SMS"
            bgColor="#293B50"
            onPress={() => navigation.navigate('SendSMS')}
          />
          <QuickLink
            icon="🛒"
            title="Buy SMS"
            bgColor="#16a34a"
            onPress={() => navigation.navigate('SMSWallet')}
          />
          <QuickLink
            icon="📜"
            title="Sent SMS History"
            bgColor="#0891b2"
            onPress={() => navigation.navigate('SentSMS')}
          />
          <QuickLink
            icon="👥"
            title="Manage Groups"
            bgColor="#f59e0b"
            onPress={() => navigation.navigate('Groups')}
          />
        </View>
      </ScrollView>

      {/* Filter Popup */}
      <FilterPopup
        visible={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        onApply={handleApplyFilter}
      />
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
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  welcomeDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIconText: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendContainer: {
    marginTop: 6,
  },
  trendUp: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  trendDown: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 10,
  },
  financialSection: {
    marginBottom: 14,
  },
  financialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  financialIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  financialValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 4,
  },
  financialLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  quickLinksSection: {
    marginBottom: 14,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickLinkIconText: {
    fontSize: 18,
  },
  quickLinkTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
  },
  quickLinkArrow: {
    fontSize: 18,
    color: '#ea6118',
    fontWeight: '600',
  },
});

export default DashboardScreen;
