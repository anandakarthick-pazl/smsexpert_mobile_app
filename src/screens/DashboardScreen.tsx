import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import FilterPopup from '../components/FilterPopup';
import {
  getDashboardData,
  DashboardData,
  RecentActivity,
  DateFilter,
  formatActivityDate,
  getStatusColor,
  getStatusIcon,
} from '../services/dashboardService';

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

interface ActivityItemProps {
  activity: RecentActivity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({activity}) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, {backgroundColor: getStatusColor(activity.status) + '20'}]}>
      <Text style={styles.activityIconText}>{getStatusIcon(activity.status)}</Text>
    </View>
    <View style={styles.activityContent}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityRecipient}>{activity.recipient}</Text>
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor(activity.status) + '20'}]}>
          <Text style={[styles.statusText, {color: getStatusColor(activity.status)}]}>
            {activity.status}
          </Text>
        </View>
      </View>
      <Text style={styles.activityMessage} numberOfLines={1}>
        {activity.message}
      </Text>
      <Text style={styles.activityTime}>{formatActivityDate(activity.sent_at)}</Text>
    </View>
  </View>
);

interface DashboardScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
  };
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({navigation}) => {
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: null,
    endDate: null,
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (showLoader = true, filter?: DateFilter) => {
    if (showLoader) {
      setIsLoading(true);
    }
    
    try {
      const result = await getDashboardData(filter || dateFilter);
      
      if (result.success && result.data) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateFilter]);

  // Load data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleFilterPress = () => {
    setShowFilterPopup(true);
  };

  const handleApplyFilter = (startDate: Date, endDate: Date) => {
    console.log('Applying filter:', startDate, endDate);
    
    const newFilter: DateFilter = {
      startDate,
      endDate,
    };
    
    setDateFilter(newFilter);
    setShowFilterPopup(false);
    
    // Fetch data with new filter
    fetchDashboardData(true, newFilter);
  };

  const handleClearFilter = () => {
    const clearedFilter: DateFilter = {
      startDate: null,
      endDate: null,
    };
    
    setDateFilter(clearedFilter);
    fetchDashboardData(true, clearedFilter);
  };

  // Calculate display values from API data
  const displayWalletBalance = dashboardData 
    ? `£${dashboardData.wallet.balance.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
    : '£0.00';

  // Use period_stats from API (filtered data)
  const totalSent = dashboardData?.period_stats.total_sms || 0;
  const delivered = dashboardData?.period_stats.delivered || 0;
  const failed = dashboardData?.period_stats.failed || 0;
  const pending = totalSent - delivered - failed;
  const deliveryRate = dashboardData?.period_stats.delivery_rate || 0;
  const totalCost = dashboardData?.period_stats.total_cost || 0;
  const todaySms = dashboardData?.today.total_sms || 0;

  // Get period label from API
  const periodLabel = dashboardData?.filter?.period_label || 'This Month';
  const isCustomFilter = dashboardData?.filter?.is_custom || false;

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#293B50" />
        <Header
          title="Dashboard"
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={handleNotificationPress}
          notificationCount={3}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      {/* Header */}
      <Header
        title="Dashboard"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#ea6118']}
            tintColor="#ea6118"
          />
        }>
        
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back! 🚀</Text>
          <Text style={styles.welcomeSubtitle}>
            Here's your SMS Expert dashboard overview
          </Text>
          <Text style={styles.welcomeDate}>{currentDate}</Text>
        </View>

        {/* Date Filter Badge */}
        <View style={styles.filterBadgeContainer}>
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeIcon}>📅</Text>
            <Text style={styles.filterBadgeText}>{periodLabel}</Text>
            {isCustomFilter && (
              <TouchableOpacity 
                style={styles.clearFilterBtn}
                onPress={handleClearFilter}>
                <Text style={styles.clearFilterText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.changeFilterBtn}
            onPress={handleFilterPress}>
            <Text style={styles.changeFilterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="📤"
            value={totalSent.toString()}
            label="Total Sent"
            trend={`+${todaySms} today`}
            trendUp={todaySms > 0}
            bgColor="#293B50"
          />
          <StatCard
            icon="✅"
            value={delivered.toString()}
            label="Delivered"
            trend={`${deliveryRate.toFixed(1)}%`}
            trendUp={deliveryRate > 50}
            bgColor="#16a34a"
          />
          <StatCard
            icon="⏳"
            value={pending > 0 ? pending.toString() : '0'}
            label="Pending"
            bgColor="#f59e0b"
          />
          <StatCard
            icon="❌"
            value={failed.toString()}
            label="Failed"
            trend={totalSent > 0 && failed > 0 ? `${((failed / totalSent) * 100).toFixed(1)}%` : '0%'}
            trendUp={failed === 0}
            bgColor="#dc2626"
          />
        </View>

        {/* Financial Stats */}
        <View style={styles.financialSection}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.financialGrid}>
            <View style={styles.financialCard}>
              <Text style={styles.financialIcon}>💰</Text>
              <Text style={styles.financialValue}>£{totalCost.toFixed(2)}</Text>
              <Text style={styles.financialLabel}>{periodLabel} Spent</Text>
            </View>
            <View style={styles.financialCard}>
              <Text style={styles.financialIcon}>💳</Text>
              <Text style={styles.financialValue}>{displayWalletBalance}</Text>
              <Text style={styles.financialLabel}>Wallet Balance</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 && (
          <View style={styles.activitySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SentSMS')}>
                <Text style={styles.viewAllLink}>View All →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityList}>
              {dashboardData.recent_activity.slice(0, 5).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </View>
          </View>
        )}

        {/* No Activity Message */}
        {(!dashboardData?.recent_activity || dashboardData.recent_activity.length === 0) && (
          <View style={styles.noActivityCard}>
            <Text style={styles.noActivityIcon}>📭</Text>
            <Text style={styles.noActivityTitle}>No Activity</Text>
            <Text style={styles.noActivityText}>
              No SMS activity found for {periodLabel.toLowerCase()}
            </Text>
          </View>
        )}

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

      {/* Filter Bottom Sheet */}
      <FilterPopup
        visible={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        onApply={handleApplyFilter}
        initialStartDate={dateFilter.startDate || undefined}
        initialEndDate={dateFilter.endDate || undefined}
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
  // Filter Badge
  filterBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ea611815',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ea611830',
  },
  filterBadgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ea6118',
  },
  clearFilterBtn: {
    marginLeft: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearFilterText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  changeFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ea6118',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ea6118',
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
    textAlign: 'center',
  },
  // Activity Section
  activitySection: {
    marginBottom: 14,
  },
  activityList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityRecipient: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activityMessage: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  // No Activity
  noActivityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  noActivityIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  noActivityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 4,
  },
  noActivityText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  // Quick Links
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
