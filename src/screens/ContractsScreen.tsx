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
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface ContractsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

interface ContractItem {
  id: number;
  title: string;
  version: string;
  updatedDate: string;
  fileType: string;
  fileSize: string;
  status: 'signed' | 'pending' | 'reference';
}

const ContractsScreen: React.FC<ContractsScreenProps> = ({navigation}) => {
  const [showInfoSheet, setShowInfoSheet] = useState(false);

  // Contract data
  const [contracts] = useState<ContractItem[]>([
    {
      id: 1,
      title: 'Main Client Contract',
      version: '1',
      updatedDate: '04 Dec 2025',
      fileType: 'DOC',
      fileSize: '215.5 KB',
      status: 'reference',
    },
  ]);

  // Statistics
  const stats = {
    masterAgreement: 1,
    addendums: 0,
    privacyPolicy: 0,
    signed: 0,
    pending: 0,
  };

  const contractAgreedDate = 'July 6, 2021';

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleViewContract = (contract: ContractItem) => {
    Alert.alert('View Contract', `Opening: ${contract.title}`);
  };

  const handleDownloadContract = (contract: ContractItem) => {
    Alert.alert('Download', `Downloading: ${contract.title} (${contract.fileSize})`);
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://www.sms.expert/privacy-and-cookie-policy/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return {text: 'Signed', style: styles.badgeSigned};
      case 'pending':
        return {text: 'Pending', style: styles.badgePending};
      default:
        return {text: 'For Reference', style: styles.badgeReference};
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      <Header
        title="Contracts"
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
        walletBalance="£6859"
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>📜</Text>
            <Text style={styles.headerTitle}>Contract & Terms</Text>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfoSheet(true)}>
            <Text style={styles.infoButtonIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Contract Statistics */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statTotal]}>
            <Text style={styles.statNumber}>{stats.masterAgreement}</Text>
            <Text style={styles.statLabel}>Master Agreement</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.addendums}</Text>
            <Text style={styles.statLabel}>Addendums</Text>
          </View>
          <View style={[styles.statCard, styles.statPrivacy]}>
            <Text style={styles.statNumber}>{stats.privacyPolicy}</Text>
            <Text style={styles.statLabel}>Privacy Policy</Text>
          </View>
          <View style={[styles.statCard, styles.statSigned]}>
            <Text style={styles.statNumber}>{stats.signed}</Text>
            <Text style={styles.statLabel}>Signed</Text>
          </View>
          <View style={[styles.statCard, styles.statPending]}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Main Client Contracts */}
        <View style={styles.contractCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📋</Text>
            <Text style={styles.sectionTitle}>Main Client Contracts</Text>
          </View>
          <View style={styles.sectionContent}>
            {contracts.map((contract) => (
              <View key={contract.id} style={styles.documentItem}>
                <View style={styles.documentIconBox}>
                  <Text style={styles.documentIcon}>📄</Text>
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{contract.title}</Text>
                  <Text style={styles.documentMeta}>
                    Version {contract.version} | Updated: {contract.updatedDate} | {contract.fileType} ({contract.fileSize})
                  </Text>
                  <View style={getStatusBadge(contract.status).style}>
                    <Text style={styles.badgeText}>
                      {getStatusBadge(contract.status).text}
                    </Text>
                  </View>
                </View>
                <View style={styles.documentActions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewContract(contract)}>
                    <Text style={styles.actionButtonText}>👁️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownloadContract(contract)}>
                    <Text style={styles.actionButtonText}>⬇️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Contract Addendums */}
        <View style={styles.contractCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, {color: '#ea6118'}]}>📝</Text>
            <Text style={styles.sectionTitle}>Contract Addendums</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataIcon}>ℹ️</Text>
              <View style={styles.noDataTextContainer}>
                <Text style={styles.noDataTitle}>No Addendums Available</Text>
                <Text style={styles.noDataText}>
                  You currently have no addendums to your client contract. Any future modifications will appear here.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy & Data Protection */}
        <View style={styles.contractCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, {color: '#16a34a'}]}>🛡️</Text>
            <Text style={styles.sectionTitle}>Privacy & Data Protection</Text>
          </View>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.privacyLink}
              onPress={handlePrivacyPolicy}>
              <View style={[styles.documentIconBox, styles.greenBg]}>
                <Text style={styles.documentIcon}>🔒</Text>
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>Privacy & Cookie Policy</Text>
                <Text style={styles.documentMeta}>
                  How we collect, use, and protect your personal data
                </Text>
              </View>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing Structure */}
        <View style={styles.contractCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, {color: '#0891b2'}]}>💷</Text>
            <Text style={styles.sectionTitle}>Current Pricing Structure</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Pricing Note */}
            <View style={styles.pricingNote}>
              <Text style={styles.pricingNoteIcon}>ℹ️</Text>
              <Text style={styles.pricingNoteText}>
                Unless alternative rates have been agreed in writing, our standard pricing from 04/12/2025 applies as follows:
              </Text>
            </View>

            {/* Pricing Table */}
            <View style={styles.pricingTable}>
              <View style={styles.pricingHeader}>
                <Text style={styles.pricingHeaderIcon}>💷</Text>
                <Text style={styles.pricingHeaderText}>Service Pricing Overview</Text>
              </View>

              {/* Virtual Numbers */}
              <View style={styles.pricingRow}>
                <View style={styles.pricingItemLeft}>
                  <Text style={styles.pricingItemIcon}>📱</Text>
                  <View style={styles.pricingItemInfo}>
                    <Text style={styles.pricingItemTitle}>Virtual UK Mobile Numbers / Keywords on 60300</Text>
                    <Text style={styles.pricingItemDesc}>Annual subscription fee</Text>
                  </View>
                </View>
                <Text style={styles.pricingValue}>£250/year</Text>
              </View>

              {/* Overseas SMS */}
              <View style={styles.pricingRow}>
                <View style={styles.pricingItemLeft}>
                  <Text style={styles.pricingItemIcon}>🌍</Text>
                  <View style={styles.pricingItemInfo}>
                    <Text style={styles.pricingItemTitle}>SMS to Overseas Mobiles</Text>
                    <Text style={styles.pricingItemDesc}>All sent volumes</Text>
                  </View>
                </View>
                <Text style={styles.pricingValue}>£0.065</Text>
              </View>

              {/* UK SMS Tiers */}
              <View style={styles.pricingRowTiered}>
                <View style={styles.pricingItemLeft}>
                  <Text style={styles.pricingItemIcon}>🇬🇧</Text>
                  <View style={styles.pricingItemInfo}>
                    <Text style={styles.pricingItemTitle}>SMS to UK Mobiles</Text>
                    <Text style={styles.pricingItemDesc}>Based on monthly sent volumes:</Text>
                  </View>
                </View>
                <View style={styles.pricingTiers}>
                  <View style={styles.pricingTierRow}>
                    <Text style={styles.pricingTierText}>Up to 20,000 messages</Text>
                    <Text style={styles.pricingTierValue}>£0.0377</Text>
                  </View>
                  <View style={styles.pricingTierRow}>
                    <Text style={styles.pricingTierText}>Up to 50,000 messages</Text>
                    <Text style={styles.pricingTierValue}>£0.0319</Text>
                  </View>
                  <View style={styles.pricingTierRow}>
                    <Text style={styles.pricingTierText}>Over 50,000 messages</Text>
                    <Text style={styles.pricingTierValue}>£0.0290</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Effective Date */}
            <View style={styles.effectiveDate}>
              <Text style={styles.effectiveDateIcon}>🔄</Text>
              <Text style={styles.effectiveDateText}>Pricing effective from: December 4, 2025</Text>
            </View>
          </View>
        </View>

        {/* Acceptance Notice */}
        <View style={styles.acceptanceNotice}>
          <View style={styles.acceptanceHeader}>
            <Text style={styles.acceptanceIcon}>✅</Text>
            <Text style={styles.acceptanceTitle}>Terms Acceptance</Text>
          </View>
          <Text style={styles.acceptanceText}>
            By making any purchases or continuing to use any of our services or products, you are deemed to have accepted the current Contract, Privacy Policy, Pricing, and any Addendums in full. These terms constitute a legally binding agreement between you and SMS Expert.
          </Text>
        </View>

        {/* Verified Badge */}
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedIcon}>✅</Text>
          <View style={styles.verifiedContent}>
            <Text style={styles.verifiedTitle}>Contract Agreed</Text>
            <Text style={styles.verifiedDate}>
              You agreed to the contract on: <Text style={styles.verifiedDateBold}>{contractAgreedDate}</Text>
            </Text>
          </View>
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
                <Text style={styles.bottomSheetIcon}>📜</Text>
                <Text style={styles.bottomSheetTitle}>Your SMS Expert Agreement</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* Contract Overview */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>📋</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Contract Overview</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    Review your current contract terms, pricing, and policies. By continuing to use our services, you agree to be bound by these terms and conditions.
                  </Text>
                </View>
              </View>

              {/* Documents */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.greenBg]}>
                    <Text style={styles.infoSectionIcon}>📄</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Available Documents</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.greenBorder]}>
                  <Text style={styles.infoSectionText}>
                    View and download your main client contract, any addendums, and our privacy policy. All documents are available in their latest versions.
                  </Text>
                </View>
              </View>

              {/* Pricing */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.yellowBg]}>
                    <Text style={styles.infoSectionIcon}>💷</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Pricing Information</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.yellowBorder]}>
                  <Text style={styles.infoSectionText}>
                    Current pricing structure is displayed with tiered rates for UK SMS messages. Contact us if you require custom pricing arrangements.
                  </Text>
                </View>
              </View>

              {/* Legal */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.purpleBg]}>
                    <Text style={styles.infoSectionIcon}>⚖️</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Legal Agreement</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.purpleBorder]}>
                  <Text style={styles.infoSectionText}>
                    By using our services, you accept all terms in the contract. Your agreement date is recorded and the contract remains legally binding.
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
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonIcon: {
    fontSize: 18,
  },
  // Statistics
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statTotal: {
    borderLeftWidth: 4,
    borderLeftColor: '#ea6118',
  },
  statSigned: {
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  statPending: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  statPrivacy: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Contract Card
  contractCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 10,
    color: '#293B50',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  sectionContent: {
    padding: 16,
  },
  // Document Item
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  documentIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greenBg: {
    backgroundColor: '#16a34a',
  },
  documentIcon: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#293B50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  // Badges
  badgeSigned: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgePending: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeReference: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  // No Data
  noDataContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef7ed',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  noDataIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  noDataTextContainer: {
    flex: 1,
  },
  noDataTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  noDataText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
  // Privacy Link
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#64748b',
  },
  // Pricing
  pricingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0891b2',
  },
  pricingNoteIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  pricingNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#0c4a6e',
    lineHeight: 20,
  },
  pricingTable: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ea6118',
    padding: 14,
  },
  pricingHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  pricingHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pricingRowTiered: {
    padding: 14,
  },
  pricingItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  pricingItemIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  pricingItemInfo: {
    flex: 1,
  },
  pricingItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 2,
  },
  pricingItemDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  pricingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ea6118',
  },
  pricingTiers: {
    marginTop: 12,
    marginLeft: 28,
  },
  pricingTierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pricingTierText: {
    fontSize: 13,
    color: '#64748b',
  },
  pricingTierValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ea6118',
  },
  effectiveDate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  effectiveDateIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  effectiveDateText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  // Acceptance Notice
  acceptanceNotice: {
    backgroundColor: '#fef2f2',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  acceptanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  acceptanceIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  acceptanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  acceptanceText: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 22,
    textAlign: 'center',
  },
  // Verified Badge
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  verifiedIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  verifiedContent: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  verifiedDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  verifiedDateBold: {
    fontWeight: '700',
  },
  // Bottom Sheet
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
    fontSize: 16,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
  blueBg: {
    backgroundColor: '#f0f9ff',
  },
  yellowBg: {
    backgroundColor: '#fef3c7',
  },
  purpleBg: {
    backgroundColor: '#ede9fe',
  },
  infoSectionIcon: {
    fontSize: 18,
  },
  infoSectionTitle: {
    fontSize: 14,
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
  blueBorder: {
    borderLeftColor: '#0891b2',
  },
  greenBorder: {
    borderLeftColor: '#16a34a',
  },
  yellowBorder: {
    borderLeftColor: '#f59e0b',
  },
  purpleBorder: {
    borderLeftColor: '#8b5cf6',
  },
  infoSectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
});

export default ContractsScreen;
