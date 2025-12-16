import React, {useState, useEffect, useCallback} from 'react';
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
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getBlacklist,
  unblockNumber,
  downloadBlacklist,
  convertCsvToString,
  BlacklistItem,
  BlacklistStatistics,
} from '../services/blacklistService';

interface BlacklistScreenProps {
  navigation: any;
}

const BlacklistScreen: React.FC<BlacklistScreenProps> = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [unblocking, setUnblocking] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  // Data
  const [blacklistItems, setBlacklistItems] = useState<BlacklistItem[]>([]);
  const [statistics, setStatistics] = useState<BlacklistStatistics>({
    total_blacklisted: 0,
    added_this_month: 0,
    added_this_week: 0,
  });

  const fetchBlacklist = useCallback(async () => {
    try {
      const response = await getBlacklist();
      if (response.success && response.data) {
        setBlacklistItems(response.data.items || []);
        setStatistics(response.data.statistics || {
          total_blacklisted: 0,
          added_this_month: 0,
          added_this_week: 0,
        });
      } else {
        // If error, show message but don't crash
        console.error('Failed to fetch blacklist:', response.message);
      }
    } catch (error: any) {
      console.error('Error fetching blacklist:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlacklist();
  };

  const handleUnblock = (item: BlacklistItem) => {
    Alert.alert(
      'Unblock Number',
      `Are you sure you want to unblock ${item.phone_number}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            setUnblocking(item.id);
            try {
              const response = await unblockNumber(item.id);
              if (response.success) {
                // Remove from local state
                setBlacklistItems(prev => prev.filter(i => i.id !== item.id));
                // Update statistics
                setStatistics(prev => ({
                  ...prev,
                  total_blacklisted: Math.max(0, prev.total_blacklisted - 1),
                }));
                Alert.alert('Success', response.message || `${item.phone_number} has been unblocked.`);
              } else {
                Alert.alert('Error', response.message || 'Failed to unblock number');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to unblock number');
            } finally {
              setUnblocking(null);
            }
          },
        },
      ]
    );
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await downloadBlacklist();
      if (response.success && response.data) {
        const csvString = convertCsvToString(response.data.csv_data);
        
        // Use Share API to share/save the data
        await Share.share({
          message: csvString,
          title: response.data.filename,
        });
        
        Alert.alert(
          'Download Ready',
          `Blacklist data with ${response.data.total_records} records is ready to share.`
        );
      } else {
        Alert.alert('Error', response.message || 'No data available to download');
      }
    } catch (error: any) {
      if (error.message !== 'Share dismissed') {
        Alert.alert('Error', error.message || 'Failed to download blacklist');
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header 
          title="Blacklist" 
          onMenuPress={() => navigation.openDrawer()}
          walletBalance="£6,859.83"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading blacklist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
      <Header 
        title="Blacklist" 
        onMenuPress={() => navigation.openDrawer()}
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
            colors={['#ea6118']}
            tintColor="#ea6118"
          />
        }>
        
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🚫</Text>
            <Text style={styles.headerTitle}>Blacklist Management</Text>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfoSheet(true)}>
            <Text style={styles.infoButtonIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardRed]}>
            <Text style={styles.statNumber}>{statistics.total_blacklisted}</Text>
            <Text style={styles.statLabel}>Total Blacklisted</Text>
          </View>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={[styles.statNumber, styles.statNumberOrange]}>{statistics.added_this_month}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={[styles.statNumber, styles.statNumberBlue]}>{statistics.added_this_week}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Blacklisted Numbers Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>📋</Text>
            <Text style={styles.cardHeaderTitle}>Blacklisted Numbers</Text>
            <Text style={styles.cardHeaderCount}>{blacklistItems.length}</Text>
          </View>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderIcon}>📱</Text>
              <Text style={styles.tableHeaderText}>Phone</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderIcon}>📅</Text>
              <Text style={styles.tableHeaderText}>Blocked</Text>
            </View>
            <View style={styles.tableHeaderCellSmall}>
              <Text style={styles.tableHeaderIcon}>⚡</Text>
              <Text style={styles.tableHeaderText}>Action</Text>
            </View>
          </View>

          {/* Blacklist Items */}
          {blacklistItems.length > 0 ? (
            blacklistItems.map((item, index) => (
              <View 
                key={item.id} 
                style={[
                  styles.tableRow,
                  index === blacklistItems.length - 1 && styles.tableRowLast
                ]}>
                <View style={styles.phoneCell}>
                  <Text style={styles.phoneNumber}>{item.phone_number}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Blocked</Text>
                  </View>
                </View>
                <View style={styles.dateCell}>
                  <Text style={styles.dateText}>{item.blocked_date}</Text>
                </View>
                <View style={styles.actionCell}>
                  <TouchableOpacity 
                    style={[
                      styles.unblockButton,
                      unblocking === item.id && styles.unblockButtonDisabled
                    ]}
                    onPress={() => handleUnblock(item)}
                    disabled={unblocking === item.id}>
                    {unblocking === item.id ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.unblockButtonText}>Unblock</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>No Blocked Numbers</Text>
              <Text style={styles.emptyText}>Your blacklist is empty. Numbers you block will appear here.</Text>
            </View>
          )}
        </View>

        {/* Download Section */}
        <View style={styles.downloadCard}>
          <View style={styles.downloadHeader}>
            <Text style={styles.downloadIcon}>💾</Text>
            <Text style={styles.downloadTitle}>Backup & Maintenance</Text>
          </View>
          <Text style={styles.downloadDescription}>
            Download a complete backup of all blacklisted numbers for your records.
          </Text>
          <TouchableOpacity 
            style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
            onPress={handleDownload}
            disabled={downloading || blacklistItems.length === 0}>
            {downloading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.downloadButtonIcon}>⬇️</Text>
                <Text style={styles.downloadButtonText}>Download All Records</Text>
              </>
            )}
          </TouchableOpacity>
          {blacklistItems.length === 0 && (
            <Text style={styles.downloadNote}>No records available to download</Text>
          )}
        </View>

      </ScrollView>

      {/* Info Bottom Sheet Modal */}
      <Modal
        visible={showInfoSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInfoSheet(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            {/* Modal Header */}
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetTitleRow}>
                <Text style={styles.bottomSheetIcon}>🚫</Text>
                <Text style={styles.bottomSheetTitle}>Blacklist Info</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* What is Blacklist */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.redBg]}>
                    <Text style={styles.infoSectionIcon}>🚫</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>What is Blacklist?</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.redBorder]}>
                  <Text style={styles.infoSectionText}>
                    The blacklist contains phone numbers that are blocked from receiving SMS messages from your account. Messages will not be sent to these numbers.
                  </Text>
                </View>
              </View>

              {/* Managing Numbers */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>📋</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Managing Numbers</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    You can unblock numbers at any time by clicking the "Unblock" button. Once unblocked, messages will be delivered to that number again.
                  </Text>
                </View>
              </View>

              {/* Automatic Blocking */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.yellowBg]}>
                    <Text style={styles.infoSectionIcon}>⚠️</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Automatic Blocking</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.yellowBorder]}>
                  <Text style={styles.infoSectionText}>
                    Numbers may be automatically added to the blacklist when recipients reply with STOP or opt-out keywords. Check the STOPs/Optouts section for more details.
                  </Text>
                </View>
              </View>

              {/* Backup */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.greenBg]}>
                    <Text style={styles.infoSectionIcon}>💾</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Backup & Export</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.greenBorder]}>
                  <Text style={styles.infoSectionText}>
                    Use the download feature to export all blacklisted numbers for your records. This is useful for compliance and record-keeping purposes.
                  </Text>
                </View>
              </View>

            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.bottomSheetFooter}>
              <TouchableOpacity
                style={styles.closeSheetButton}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.closeSheetButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293B50',
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
  // Header Card
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth: 3,
    borderTopColor: '#dc2626',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonIcon: {
    fontSize: 18,
  },
  // Statistics Cards
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardRed: {
    borderTopWidth: 3,
    borderTopColor: '#dc2626',
  },
  statCardOrange: {
    borderTopWidth: 3,
    borderTopColor: '#ea6118',
  },
  statCardBlue: {
    borderTopWidth: 3,
    borderTopColor: '#0891b2',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 4,
  },
  statNumberOrange: {
    color: '#ea6118',
  },
  statNumberBlue: {
    color: '#0891b2',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Card Styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderTopWidth: 3,
    borderTopColor: '#ea6118',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cardHeaderIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#293B50',
    flex: 1,
  },
  cardHeaderCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  // Table Styles
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#293B50',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableHeaderCellSmall: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeaderIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  phoneCell: {
    flex: 1,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  dateCell: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
  },
  actionCell: {
    width: 80,
    alignItems: 'center',
  },
  unblockButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  unblockButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  unblockButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Empty State
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Download Section
  downloadCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ea6118',
  },
  downloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  downloadIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  downloadDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 22,
  },
  downloadButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 50,
  },
  downloadButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  downloadButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  downloadNote: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  bottomSheetHeader: {
    backgroundColor: '#ea6118',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomSheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomSheetIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomSheetBody: {
    padding: 20,
  },
  bottomSheetFooter: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 50,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeSheetButton: {
    backgroundColor: '#ea6118',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  closeSheetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Info Section Styles
  infoSection: {
    marginBottom: 16,
  },
  infoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoSectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  redBg: {
    backgroundColor: '#fee2e2',
  },
  blueBg: {
    backgroundColor: '#dbeafe',
  },
  greenBg: {
    backgroundColor: '#dcfce7',
  },
  yellowBg: {
    backgroundColor: '#fef3c7',
  },
  infoSectionIcon: {
    fontSize: 18,
  },
  infoSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#293B50',
    flex: 1,
  },
  infoSectionContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  redBorder: {
    borderLeftColor: '#dc2626',
  },
  blueBorder: {
    borderLeftColor: '#3b82f6',
  },
  greenBorder: {
    borderLeftColor: '#16a34a',
  },
  yellowBorder: {
    borderLeftColor: '#f59e0b',
  },
  infoSectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
});

export default BlacklistScreen;
