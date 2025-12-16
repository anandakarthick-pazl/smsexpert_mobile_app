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
  FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getCampaignHistory,
  pauseCampaign,
  resumeCampaign,
  deleteCampaign,
  getStatusColor,
  getStatusLabel,
  Campaign,
} from '../services/campaignService';

interface CampaignHistoryScreenProps {
  navigation: any;
}

const CampaignHistoryScreen: React.FC<CampaignHistoryScreenProps> = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      const response = await getCampaignHistory(page, 20);
      if (response.success && response.data) {
        if (append) {
          setCampaigns(prev => [...prev, ...response.data!.campaigns]);
        } else {
          setCampaigns(response.data.campaigns);
        }
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCampaigns(1, false);
  };

  const loadMore = () => {
    if (pagination.current_page < pagination.last_page && !loadingMore) {
      setLoadingMore(true);
      fetchCampaigns(pagination.current_page + 1, true);
    }
  };

  const handlePause = (campaign: Campaign) => {
    Alert.alert(
      'Pause Campaign',
      `Are you sure you want to pause campaign "${campaign.campaign_name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Pause',
          onPress: async () => {
            setActionLoading(campaign.campaign_id);
            try {
              const response = await pauseCampaign(campaign.campaign_id);
              if (response.success) {
                Alert.alert('Success', response.message || 'Campaign paused successfully');
                fetchCampaigns(1, false);
              } else {
                Alert.alert('Error', response.message || 'Failed to pause campaign');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to pause campaign');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleResume = (campaign: Campaign) => {
    Alert.alert(
      'Resume Campaign',
      `Are you sure you want to resume campaign "${campaign.campaign_name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Resume',
          onPress: async () => {
            setActionLoading(campaign.campaign_id);
            try {
              const response = await resumeCampaign(campaign.campaign_id);
              if (response.success) {
                Alert.alert('Success', response.message || 'Campaign resumed successfully');
                fetchCampaigns(1, false);
              } else {
                Alert.alert('Error', response.message || 'Failed to resume campaign');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to resume campaign');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (campaign: Campaign) => {
    Alert.alert(
      'Delete Campaign',
      `Are you sure you want to delete campaign "${campaign.campaign_name}"? This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(campaign.campaign_id);
            try {
              const response = await deleteCampaign(campaign.campaign_id);
              if (response.success) {
                Alert.alert('Success', response.message || 'Campaign deleted successfully');
                fetchCampaigns(1, false);
              } else {
                Alert.alert('Error', response.message || 'Failed to delete campaign');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete campaign');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleCreateCampaign = () => {
    Alert.alert(
      'Create Campaign',
      'Choose campaign type:',
      [
        {
          text: 'Quick Campaign',
          onPress: () => navigation.navigate('CampaignQuick'),
        },
        {
          text: 'Bulk Upload',
          onPress: () => navigation.navigate('CampaignFile'),
        },
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  const renderCampaignItem = ({item}: {item: Campaign}) => {
    const isLoading = actionLoading === item.campaign_id;
    const statusColor = getStatusColor(item.status);
    const statusLabel = getStatusLabel(item.status);
    const isPaused = item.status.toLowerCase() === 'paused';
    const isCompleted = item.status.toLowerCase() === 'completed' || item.status.toLowerCase() === 'done';
    const isFailed = item.status.toLowerCase() === 'failed';

    return (
      <View style={styles.campaignCard}>
        {/* Campaign Header */}
        <View style={styles.campaignHeader}>
          <View style={styles.campaignInfo}>
            <Text style={styles.campaignName} numberOfLines={1}>{item.campaign_name}</Text>
            <Text style={styles.campaignId}>ID: {item.campaign_id}</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: statusColor}]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                {width: `${item.progress_percent}%`, backgroundColor: statusColor}
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{item.progress_percent}%</Text>
        </View>

        {/* Campaign Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{item.num_lines}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Sent</Text>
            <Text style={styles.statValue}>{item.num_lines_done}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={styles.statValue}>{item.num_lines - item.num_lines_done}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Date</Text>
            <Text style={[styles.statValue, styles.dateValue]} numberOfLines={1}>{item.datetime}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#ea6118" />
          ) : (
            <>
              {isPaused ? (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.resumeButton]}
                  onPress={() => handleResume(item)}>
                  <Text style={styles.actionButtonIcon}>▶️</Text>
                  <Text style={styles.actionButtonText}>Resume</Text>
                </TouchableOpacity>
              ) : !isCompleted && !isFailed && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.pauseButton]}
                  onPress={() => handlePause(item)}>
                  <Text style={styles.actionButtonIcon}>⏸️</Text>
                  <Text style={styles.actionButtonText}>Pause</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item)}>
                <Text style={styles.actionButtonIcon}>🗑️</Text>
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header 
          title="Campaign History" 
          onMenuPress={() => navigation.openDrawer()}
          walletBalance="£6,859.83"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading campaigns...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
      <Header 
        title="Campaign History" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance="£6,859.83"
      />
      
      <View style={styles.content}>
        {/* Campaign List */}
        {campaigns.length > 0 ? (
          <>
            {/* Summary Bar */}
            <View style={styles.summaryBar}>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryCount}>{pagination.total}</Text> campaign(s)
              </Text>
            </View>
            
            <FlatList
              data={campaigns}
              renderItem={renderCampaignItem}
              keyExtractor={(item) => item.campaign_id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#ea6118']}
                  tintColor="#ea6118"
                />
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#ea6118" />
                </View>
              ) : null}
            />
          </>
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#ea6118']}
                tintColor="#ea6118"
              />
            }>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No Campaigns Yet</Text>
            <Text style={styles.emptyText}>You haven't created any campaigns yet. Tap the + button below to create your first campaign.</Text>
          </ScrollView>
        )}

        {/* Floating Action Button (FAB) - Gmail style */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateCampaign}
          activeOpacity={0.8}>
          <View style={styles.fabContent}>
            <Text style={styles.fabIcon}>+</Text>
          </View>
        </TouchableOpacity>
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
  // Summary Bar
  summaryBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryText: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryCount: {
    fontWeight: '700',
    color: '#293B50',
  },
  // List
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  // Campaign Card
  campaignCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignInfo: {
    flex: 1,
    marginRight: 12,
  },
  campaignName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 4,
  },
  campaignId: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    width: 40,
    textAlign: 'right',
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
  },
  dateValue: {
    fontSize: 11,
  },
  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    minHeight: 36,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pauseButton: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  resumeButton: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
  },
  actionButtonIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#293B50',
  },
  deleteButtonText: {
    color: '#dc2626',
  },
  // Footer
  footerLoader: {
    paddingVertical: 20,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingBottom: 120, // Space for FAB
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
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
  // Floating Action Button (FAB) - Gmail style
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    fontWeight: '300',
    color: '#ffffff',
    marginTop: -2,
  },
});

export default CampaignHistoryScreen;
