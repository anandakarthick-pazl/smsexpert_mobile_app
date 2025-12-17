import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Share,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getBlacklist,
  downloadBlacklist,
  decodeBase64,
  BlacklistStatistics,
} from '../services/blacklistService';

interface CampaignBlacklistScreenProps {
  navigation: any;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

const CampaignBlacklistScreen: React.FC<CampaignBlacklistScreenProps> = ({navigation, onNotificationPress, notificationCount = 0}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [statistics, setStatistics] = useState<BlacklistStatistics>({
    total_blacklisted: 0,
    added_this_month: 0,
    added_this_week: 0,
  });

  const fetchBlacklistData = useCallback(async () => {
    try {
      const response = await getBlacklist();
      if (response.success && response.data) {
        setStatistics(response.data.statistics);
      }
    } catch (error: any) {
      console.error('Error fetching blacklist:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBlacklistData();
  }, [fetchBlacklistData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlacklistData();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await downloadBlacklist();
      
      if (response.success && response.data) {
        // Decode base64 content
        const csvContent = decodeBase64(response.data.content);
        
        // Share the CSV content
        await Share.share({
          message: csvContent,
          title: response.data.filename || 'blacklist_report.csv',
        });
        
        Alert.alert(
          'Download Ready',
          `Blacklist report with ${response.data.total_records} records is ready for sharing.`,
          [{text: 'OK'}]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to download blacklist report');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('Error', error.message || 'Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header 
          title="STOP Blacklist" 
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={onNotificationPress}
          notificationCount={notificationCount}
          walletBalance="£6,859.83"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Loading blacklist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
      <Header 
        title="STOP Blacklist" 
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={onNotificationPress}
        notificationCount={notificationCount}
        walletBalance="£6,859.83"
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#dc2626']}
            tintColor="#dc2626"
          />
        }>

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <View style={styles.pageHeaderText}>
              <Text style={styles.pageHeaderTitle}>🚫 View STOP Blacklist</Text>
              <Text style={styles.pageHeaderSubtitle}>View and download your blacklisted mobile numbers</Text>
            </View>
            <TouchableOpacity 
              style={styles.downloadHeaderButton}
              onPress={handleDownload}
              disabled={isDownloading}>
              {isDownloading ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <>
                  <Text style={styles.downloadHeaderIcon}>⬇️</Text>
                  <Text style={styles.downloadHeaderText}>Download</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardRed]}>
            <Text style={styles.statValue}>{statistics.total_blacklisted}</Text>
            <Text style={styles.statLabel}>Total Blacklisted</Text>
          </View>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statValue}>{statistics.added_this_month}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={[styles.statCard, styles.statCardYellow]}>
            <Text style={styles.statValue}>{statistics.added_this_week}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardHeaderIcon}>ℹ️</Text>
              <Text style={styles.cardHeaderTitle}>About the STOP Blacklist</Text>
            </View>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowInfoSheet(true)}>
              <Text style={styles.infoButtonText}>❓</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardBody}>
            {/* Info Alert */}
            <View style={styles.alertInfo}>
              <Text style={styles.alertIcon}>ℹ️</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitleInfo}>What is the STOP Blacklist?</Text>
                <Text style={styles.alertTextInfo}>
                  Click the download button to retrieve your STOP Blacklist report. This report shows all mobile numbers that you have sent SMS to that have sent in a STOP or STOP ALL request, together with the date and time.
                </Text>
                <Text style={styles.alertTextInfo}>
                  If you have previously uploaded batches of mobile numbers to your Blacklist then these will also be shown in the report.
                </Text>
              </View>
            </View>

            {/* Warning Alert */}
            <View style={styles.alertWarning}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitleWarning}>Important Notice</Text>
                <Text style={styles.alertTextWarning}>
                  You are <Text style={styles.bold}>unable to send any further texts</Text> to the numbers found in this blacklist.
                </Text>
                <Text style={styles.alertTextWarning}>
                  To remove this blacklisting facility from your account, please contact us. Note: If people have texted STOP multiple times, this report may show duplicate numbers.
                </Text>
              </View>
            </View>

            {/* Download Section */}
            <View style={styles.downloadSection}>
              <Text style={styles.downloadIcon}>📥</Text>
              <Text style={styles.downloadTitle}>Download Your Blacklist Report</Text>
              <Text style={styles.downloadText}>Get a CSV file containing all blacklisted mobile numbers with dates</Text>
              <TouchableOpacity 
                style={styles.downloadButton} 
                onPress={handleDownload}
                disabled={isDownloading}>
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.downloadButtonText}>Click here to download</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Info Bottom Sheet */}
      <Modal
        visible={showInfoSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInfoSheet(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInfoSheet(false)}>
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>ℹ️ About STOP Blacklist</Text>
            
            <ScrollView 
              style={styles.bottomSheetScroll}
              showsVerticalScrollIndicator={false}>
              
              {/* Info Alert */}
              <View style={styles.alertInfoSheet}>
                <Text style={styles.alertIcon}>ℹ️</Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitleInfo}>What is the STOP Blacklist?</Text>
                  <Text style={styles.alertTextInfo}>
                    Click the download button to retrieve your STOP Blacklist report. This report shows all mobile numbers that you have sent SMS to that have sent in a STOP or STOP ALL request, together with the date and time.
                  </Text>
                  <Text style={styles.alertTextInfo}>
                    If you have previously uploaded batches of mobile numbers to your Blacklist then these will also be shown in the report.
                  </Text>
                </View>
              </View>

              {/* Warning Alert */}
              <View style={styles.alertWarningSheet}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitleWarning}>Important Notice</Text>
                  <Text style={styles.alertTextWarning}>
                    You are <Text style={styles.bold}>unable to send any further texts</Text> to the numbers found in this blacklist.
                  </Text>
                  <Text style={styles.alertTextWarning}>
                    To remove this blacklisting facility from your account, please contact us. Note: If people have texted STOP multiple times, this report may show duplicate numbers.
                  </Text>
                </View>
              </View>

            </ScrollView>

            <TouchableOpacity 
              style={styles.closeSheetButton}
              onPress={() => setShowInfoSheet(false)}>
              <Text style={styles.closeSheetButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293B50',
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
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  // Page Header
  pageHeader: {
    backgroundColor: '#dc2626',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#dc2626',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pageHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageHeaderText: {
    flex: 1,
    marginRight: 12,
  },
  pageHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  pageHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  downloadHeaderButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 100,
    justifyContent: 'center',
  },
  downloadHeaderIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  downloadHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  // Statistics Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statCardRed: {
    borderLeftColor: '#dc2626',
  },
  statCardOrange: {
    borderLeftColor: '#ea6118',
  },
  statCardYellow: {
    borderLeftColor: '#f59e0b',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  // Info Card
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(8, 145, 178, 0.3)',
  },
  infoButtonText: {
    fontSize: 18,
  },
  cardBody: {
    padding: 16,
  },
  // Info Alert
  alertInfo: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(8, 145, 178, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#0891b2',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  alertInfoSheet: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(8, 145, 178, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#0891b2',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertTitleInfo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0e7490',
    marginBottom: 8,
  },
  alertTextInfo: {
    fontSize: 13,
    color: '#0e7490',
    lineHeight: 20,
    marginBottom: 6,
  },
  // Warning Alert
  alertWarning: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  alertWarningSheet: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  alertTitleWarning: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  alertTextWarning: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
    marginBottom: 6,
  },
  bold: {
    fontWeight: '700',
  },
  // Download Section
  downloadSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
  },
  downloadIcon: {
    fontSize: 60,
    color: '#94a3b8',
    marginBottom: 16,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 6,
    textAlign: 'center',
  },
  downloadText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  downloadButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 180,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 16,
  },
  bottomSheetScroll: {
    marginBottom: 16,
  },
  closeSheetButton: {
    backgroundColor: '#293B50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeSheetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default CampaignBlacklistScreen;
