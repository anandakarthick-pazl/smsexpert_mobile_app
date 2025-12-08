import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface KeywordsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

interface KeywordItem {
  id: number;
  keyword: string;
  virtualNumber: string;
  expiryDate: string;
  isActive: boolean;
}

const KeywordsScreen: React.FC<KeywordsScreenProps> = ({navigation}) => {
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  
  const [keywords] = useState<KeywordItem[]>([
    {
      id: 83,
      keyword: '*',
      virtualNumber: '447418318903',
      expiryDate: '24 Nov 2026',
      isActive: true,
    },
  ]);

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleConfigure = (keyword: KeywordItem) => {
    Alert.alert(
      'Configure Keyword',
      `Configure settings for keyword "${keyword.keyword}" on ${keyword.virtualNumber}`,
      [{text: 'OK'}]
    );
  };

  const handleRegisterKeyword = () => {
    Alert.alert('Register Keyword', 'Redirecting to keyword registration...');
    setShowInfoSheet(false);
  };

  const handleViewContracts = () => {
    setShowInfoSheet(false);
    navigation.navigate('Contracts');
  };

  const getStatusStyle = (isActive: boolean) => {
    return isActive ? styles.statusActive : styles.statusExpired;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      <Header
        title="Keywords"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
        walletBalance="£6859"
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Header Card with Total Count and Info Button */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.totalLabel}>Total Keywords:</Text>
            <Text style={styles.totalValue}>{keywords.length}</Text>
          </View>
          {/* Info Button */}
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => setShowInfoSheet(true)}>
            <Text style={styles.infoButtonIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Results Card - Sent SMS Style */}
        <View style={styles.resultsCard}>
          {keywords.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataIcon}>🔑</Text>
              <Text style={styles.noDataTitle}>No Keywords Found</Text>
              <Text style={styles.noDataText}>
                You don't have any keywords registered yet.
              </Text>
            </View>
          ) : (
            <>
              {/* Keywords List */}
              <View style={styles.keywordsList}>
                {keywords.map(keyword => (
                  <TouchableOpacity
                    key={keyword.id}
                    style={styles.keywordItem}
                    onPress={() => handleConfigure(keyword)}>
                    <View style={styles.keywordRow}>
                      <View style={styles.keywordLeft}>
                        <Text style={styles.keywordLabel}>Keyword:</Text>
                        <View style={styles.keywordBadge}>
                          <Text style={styles.keywordBadgeText}>{keyword.keyword}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, getStatusStyle(keyword.isActive)]}>
                        <Text style={styles.statusText}>
                          {keyword.isActive ? 'Active' : 'Expired'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.keywordDetailRow}>
                      <Text style={styles.keywordDetailIcon}>📱</Text>
                      <Text style={styles.keywordDetailText}>{keyword.virtualNumber}</Text>
                    </View>
                    <View style={styles.keywordDetailRow}>
                      <Text style={styles.keywordDetailIcon}>📅</Text>
                      <Text style={styles.keywordDetailText}>
                        {keyword.isActive ? `Valid until ${keyword.expiryDate}` : `Expired on ${keyword.expiryDate}`}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.configureButton}
                      onPress={() => handleConfigure(keyword)}>
                      <Text style={styles.configureButtonIcon}>⚙️</Text>
                      <Text style={styles.configureButtonText}>Configure</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>

              {/* End of List Indicator */}
              <View style={styles.endOfListContainer}>
                <Text style={styles.endOfListText}>— End of keywords —</Text>
              </View>
            </>
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
                <Text style={styles.bottomSheetIcon}>ℹ️</Text>
                <Text style={styles.bottomSheetTitle}>Keywords Information</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* Register Keywords Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.yellowBg]}>
                    <Text style={styles.infoSectionIcon}>➕</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Register Keywords</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.yellowBorder]}>
                  <Text style={styles.infoSectionText}>
                    → You can{' '}
                    <Text style={styles.infoLink} onPress={handleRegisterKeyword}>
                      register
                    </Text>{' '}
                    1 more keyword on 60300. Please contact us if you think you'll need more keywords.
                  </Text>
                </View>
              </View>

              {/* Virtual Number Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.purpleBg]}>
                    <Text style={styles.infoSectionIcon}>📱</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Dedicated Virtual Mobile Number</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.purpleBorder]}>
                  <Text style={styles.infoSectionText}>
                    → Please contact us to discuss setting up dedicated virtual numbers.
                  </Text>
                </View>
              </View>

              {/* Contract Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.redBg]}>
                    <Text style={styles.infoSectionIcon}>📄</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Contractual Reminder</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.redBorder]}>
                  <Text style={styles.infoSectionText}>
                    → By continuing to use the SMS Expert services you agree to the latest{' '}
                    <Text style={styles.infoLinkRed} onPress={handleViewContracts}>
                      contract
                    </Text>{' '}
                    and to abide by all applicable laws and regulations.
                  </Text>
                </View>
              </View>

              {/* About Keywords Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>💡</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>About Keywords & Virtual Numbers</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    Keywords are text commands that customers can send to your virtual numbers to trigger automated responses, subscriptions, or other services. Each keyword is associated with a virtual number and can be configured with various modules to handle different types of interactions.
                  </Text>
                </View>
              </View>

            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.bottomSheetFooter}>
              <TouchableOpacity
                style={styles.closeSheetButton}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.closeSheetButtonIcon}>✕</Text>
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
  // Header Card
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 6,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ea6118',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonIcon: {
    fontSize: 18,
  },
  // Results Card - Sent SMS Style
  resultsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  // No Data State
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataIcon: {
    fontSize: 64,
    color: '#cbd5e1',
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Keywords List
  keywordsList: {
    padding: 0,
  },
  keywordItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  keywordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  keywordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keywordLabel: {
    fontSize: 13,
    color: '#64748b',
    marginRight: 8,
  },
  keywordBadge: {
    backgroundColor: '#ea6118',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusExpired: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#293B50',
  },
  keywordDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  keywordDetailIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  keywordDetailText: {
    fontSize: 14,
    color: '#475569',
  },
  configureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea6118',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  configureButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  configureButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // End of List
  endOfListContainer: {
    padding: 16,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  // Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomSheetBody: {
    padding: 20,
    maxHeight: 450,
  },
  // Info Sections
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
    marginRight: 10,
  },
  yellowBg: {
    backgroundColor: '#fef3c7',
  },
  purpleBg: {
    backgroundColor: '#ede9fe',
  },
  redBg: {
    backgroundColor: '#fef2f2',
  },
  blueBg: {
    backgroundColor: '#f0f9ff',
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
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
  },
  yellowBorder: {
    borderLeftColor: '#f59e0b',
  },
  purpleBorder: {
    borderLeftColor: '#8b5cf6',
  },
  redBorder: {
    borderLeftColor: '#ef4444',
  },
  blueBorder: {
    borderLeftColor: '#0891b2',
  },
  infoSectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  infoLink: {
    color: '#ea6118',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  infoLinkRed: {
    color: '#dc2626',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Bottom Sheet Footer
  bottomSheetFooter: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeSheetButton: {
    backgroundColor: '#ea6118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  closeSheetButtonIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#ffffff',
  },
  closeSheetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default KeywordsScreen;
