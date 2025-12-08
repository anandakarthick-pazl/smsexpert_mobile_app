import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface CampaignHistoryScreenProps {
  navigation: any;
}

interface Campaign {
  id: string;
  campaignId: string;
  name: string;
  status: 'completed' | 'firing' | 'paused' | 'failed' | 'deleted' | 'filewaiting';
  statusMessage?: string;
  dateUploaded: string;
  progressSent: number;
  progressTotal: number;
  deliveryStats: {
    delivered: number;
    nonDelivered: number;
    unknown: number;
    lostNotification: number;
    notSent: number;
    blank: number;
  };
  statsDate: string;
}

const sampleCampaigns: Campaign[] = [
  {
    id: '1',
    campaignId: 'w42df',
    name: 'Karthick',
    status: 'failed',
    statusMessage: 'File not found: /tmp/quick_campaign_...w42df.csv',
    dateUploaded: '4th Dec 2025, 10:18am',
    progressSent: 0,
    progressTotal: 1,
    deliveryStats: {delivered: 0, nonDelivered: 0, unknown: 0, lostNotification: 0, notSent: 0, blank: 0},
    statsDate: '8th Dec 2025, 9am',
  },
  {
    id: '2',
    campaignId: 'n7kmm',
    name: 'test campaign 2',
    status: 'failed',
    statusMessage: 'File not found: /tmp/quick_campaign_...n7kmm.csv',
    dateUploaded: '3rd Dec 2025, 3:53pm',
    progressSent: 0,
    progressTotal: 1,
    deliveryStats: {delivered: 0, nonDelivered: 0, unknown: 0, lostNotification: 0, notSent: 0, blank: 0},
    statsDate: '8th Dec 2025, 9am',
  },
  {
    id: '3',
    campaignId: 'y3aw2',
    name: 'test campaign',
    status: 'failed',
    statusMessage: 'File not found: /tmp/quick_campaign_...y3aw2.csv',
    dateUploaded: '3rd Dec 2025, 3:51pm',
    progressSent: 0,
    progressTotal: 2,
    deliveryStats: {delivered: 0, nonDelivered: 0, unknown: 0, lostNotification: 0, notSent: 0, blank: 0},
    statsDate: '8th Dec 2025, 9am',
  },
];

const CampaignHistoryScreen: React.FC<CampaignHistoryScreenProps> = ({navigation}) => {
  const [searchName, setSearchName] = useState('');
  const [searchId, setSearchId] = useState('');
  const [campaigns] = useState<Campaign[]>(sampleCampaigns);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'firing':
        return styles.statusFiring;
      case 'paused':
        return styles.statusPaused;
      case 'failed':
        return styles.statusFailed;
      case 'deleted':
        return styles.statusDeleted;
      case 'filewaiting':
        return styles.statusFileWaiting;
      default:
        return styles.statusFailed;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'firing':
        return 'Sending';
      case 'paused':
        return 'Paused';
      case 'failed':
        return 'Incomplete/Failed';
      case 'deleted':
        return 'Deleted';
      case 'filewaiting':
        return 'File Waiting';
      default:
        return status;
    }
  };

  const handleSearch = () => {
    // Implement search logic
  };

  const handleReset = () => {
    setSearchName('');
    setSearchId('');
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const nameMatch = campaign.name.toLowerCase().includes(searchName.toLowerCase());
    const idMatch = campaign.campaignId.toLowerCase().includes(searchId.toLowerCase());
    return nameMatch && idMatch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      <Header 
        title="Campaigns History" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance="£6,859.83"
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <Text style={styles.searchLabel}>Campaign Name</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                placeholderTextColor="#94a3b8"
                value={searchName}
                onChangeText={setSearchName}
              />
            </View>
            <View style={styles.searchInputContainer}>
              <Text style={styles.searchLabel}>Campaign ID</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by ID..."
                placeholderTextColor="#94a3b8"
                value={searchId}
                onChangeText={setSearchId}
              />
            </View>
          </View>
          <View style={styles.searchButtons}>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonIcon}>🔍</Text>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonIcon}>🔄</Text>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Card */}
        <View style={styles.dataCard}>
          {/* Legend */}
          <View style={styles.legendBar}>
            <View style={styles.legendItem}>
              <Text style={styles.legendIconDelete}>🗑️</Text>
              <Text style={styles.legendText}>Remove campaign</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIconDownload}>⬇️</Text>
              <Text style={styles.legendText}>Download report</Text>
            </View>
          </View>

          {/* Campaigns List */}
          {filteredCampaigns.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>No campaigns found</Text>
              <Text style={styles.emptyStateText}>Try adjusting your search criteria</Text>
            </View>
          ) : (
            filteredCampaigns.map((campaign) => (
              <View key={campaign.id}>
                {/* Campaign Row */}
                <View style={styles.campaignRow}>
                  {/* Left: Status & Name */}
                  <View style={styles.campaignInfo}>
                    <View style={[styles.statusBadge, getStatusStyle(campaign.status)]}>
                      <Text style={styles.statusBadgeText}>{getStatusLabel(campaign.status)}</Text>
                    </View>
                    {campaign.statusMessage && (
                      <Text style={styles.statusMessage} numberOfLines={1}>{campaign.statusMessage}</Text>
                    )}
                    <Text style={styles.campaignName}>{campaign.name}</Text>
                    <Text style={styles.campaignDate}>{campaign.dateUploaded}</Text>
                  </View>

                  {/* Right: Progress & ID */}
                  <View style={styles.campaignMeta}>
                    <View style={styles.progressBadge}>
                      <Text style={styles.progressText}>
                        {campaign.progressSent} / {campaign.progressTotal}
                      </Text>
                    </View>
                    <View style={styles.campaignIdBadge}>
                      <Text style={styles.campaignIdText}>{campaign.campaignId}</Text>
                    </View>
                  </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <Text style={styles.statsIcon}>📊</Text>
                  <View style={styles.statsContent}>
                    <Text style={styles.statsLabel}>
                      Delivery Status <Text style={styles.statsDate}>({campaign.statsDate})</Text>
                    </Text>
                    <Text style={styles.statsText}>
                      Delivered: {campaign.deliveryStats.delivered}, 
                      Non Delivered: {campaign.deliveryStats.nonDelivered}, 
                      Unknown: {campaign.deliveryStats.unknown}, 
                      Lost: {campaign.deliveryStats.lostNotification}, 
                      Not Sent: {campaign.deliveryStats.notSent}, 
                      Blank: {campaign.deliveryStats.blank}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  // Search Card
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
  },
  searchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 6,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#293B50',
  },
  searchButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#0891b2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resetButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  // Data Card
  dataCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  // Legend
  legendBar: {
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIconDelete: {
    fontSize: 14,
    marginRight: 6,
  },
  legendIconDownload: {
    fontSize: 14,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
  // Campaign Row
  campaignRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  campaignInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusCompleted: {
    backgroundColor: '#16a34a',
  },
  statusFiring: {
    backgroundColor: '#0891b2',
  },
  statusPaused: {
    backgroundColor: '#f59e0b',
  },
  statusFailed: {
    backgroundColor: '#dc2626',
  },
  statusDeleted: {
    backgroundColor: '#94a3b8',
  },
  statusFileWaiting: {
    backgroundColor: '#f59e0b',
  },
  statusMessage: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 4,
  },
  campaignName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 2,
  },
  campaignDate: {
    fontSize: 12,
    color: '#64748b',
  },
  campaignMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  progressBadge: {
    backgroundColor: 'rgba(41, 59, 80, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#293B50',
  },
  campaignIdBadge: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  campaignIdText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#64748b',
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statsIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  statsContent: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 2,
  },
  statsDate: {
    fontWeight: '400',
    color: '#94a3b8',
  },
  statsText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
  // Empty State
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 50,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#94a3b8',
  },
});

export default CampaignHistoryScreen;
