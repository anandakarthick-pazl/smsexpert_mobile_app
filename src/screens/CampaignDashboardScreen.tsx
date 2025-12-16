import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface CampaignDashboardScreenProps {
  navigation: any;
  walletBalance?: string;
}

const CampaignDashboardScreen: React.FC<CampaignDashboardScreenProps> = ({navigation, walletBalance = '£0.00'}) => {
  
  const handleQuickCampaign = () => {
    navigation.navigate('CampaignQuick');
  };

  const handleBulkCampaign = () => {
    navigation.navigate('CampaignFile');
  };

  const handleCampaignsHistory = () => {
    navigation.navigate('CampaignHistory');
  };

  const handleMainDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const handleViewBlacklist = () => {
    navigation.navigate('CampaignBlacklist');
  };

  const handleViewAccounts = () => {
    navigation.navigate('CampaignAccounts');
  };

  const handleDownloadSampleCSV = () => {
    Alert.alert('Download', 'Downloading sample CSV file...');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
      <Header 
        title="Campaign Manager" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance={walletBalance}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Welcome Header */}
        <View style={styles.welcomeHeader}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>Welcome to Campaign Manager 🚀</Text>
              <Text style={styles.welcomeSubtitle}>Hello, Customer! Manage your SMS campaigns efficiently.</Text>
            </View>
            <Text style={styles.welcomeIcon}>📢</Text>
          </View>
          <View style={styles.welcomeDecoration} />
        </View>

        {/* Quick Actions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>⚡</Text>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionCardsContainer}>
          {/* Quick Campaign Card */}
          <TouchableOpacity style={styles.actionCard} onPress={handleQuickCampaign}>
            <View style={[styles.actionIconBox, styles.orangeGradient]}>
              <Text style={styles.actionIconText}>📤</Text>
            </View>
            <Text style={styles.actionCardTitle}>Quick Campaign</Text>
            <Text style={styles.actionCardDescription}>
              Send SMS to a list of mobile numbers instantly
            </Text>
          </TouchableOpacity>

          {/* Bulk Campaign Card */}
          <TouchableOpacity style={styles.actionCard} onPress={handleBulkCampaign}>
            <View style={[styles.actionIconBox, styles.greenGradient]}>
              <Text style={styles.actionIconText}>📁</Text>
            </View>
            <Text style={styles.actionCardTitle}>Bulk Campaign</Text>
            <Text style={styles.actionCardDescription}>
              Upload CSV for bulk SMS campaigns
            </Text>
          </TouchableOpacity>

          {/* Campaigns History Card */}
          <TouchableOpacity style={styles.actionCard} onPress={handleCampaignsHistory}>
            <View style={[styles.actionIconBox, styles.blueGradient]}>
              <Text style={styles.actionIconText}>📋</Text>
            </View>
            <Text style={styles.actionCardTitle}>Campaigns History</Text>
            <Text style={styles.actionCardDescription}>
              Track and manage your past campaigns
            </Text>
          </TouchableOpacity>
        </View>

        {/* Getting Started Section */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.infoCardHeaderIcon}>ℹ️</Text>
            <Text style={styles.infoCardHeaderTitle}>Getting Started</Text>
          </View>
          <View style={styles.infoCardBody}>
            <View style={styles.howToHeader}>
              <Text style={styles.howToIcon}>❓</Text>
              <Text style={styles.howToTitle}>How to send an SMS Campaign</Text>
            </View>

            {/* Step 1 */}
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>
                  <Text style={styles.stepBold}>Quick Campaign:</Text> Use this for simple campaigns where all recipients receive the same message. Just enter the recipient numbers, sender ID, and message text.
                </Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>
                  <Text style={styles.stepBold}>Bulk Campaign:</Text> Use this for larger campaigns or campaigns with personalized messages. Upload a CSV file containing recipient numbers, sender IDs, and message text.
                </Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>
                  <Text style={styles.stepBold}>Campaigns History:</Text> Track the status of your campaigns, download delivery reports, and manage ongoing campaigns.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Links Section */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.infoCardHeaderIcon}>🔗</Text>
            <Text style={styles.infoCardHeaderTitle}>Quick Links</Text>
          </View>
          <View style={styles.quickLinksBody}>
            {/* View STOP Blacklist */}
            <TouchableOpacity style={styles.quickLinkItem} onPress={handleViewBlacklist}>
              <View style={[styles.quickLinkIcon, styles.redGradient]}>
                <Text style={styles.quickLinkIconText}>🚫</Text>
              </View>
              <Text style={styles.quickLinkText}>View STOP Blacklist</Text>
              <Text style={styles.quickLinkArrow}>›</Text>
            </TouchableOpacity>

            {/* View Accounts */}
            <TouchableOpacity style={styles.quickLinkItem} onPress={handleViewAccounts}>
              <View style={[styles.quickLinkIcon, styles.greenGradient]}>
                <Text style={styles.quickLinkIconText}>👥</Text>
              </View>
              <Text style={styles.quickLinkText}>View Accounts</Text>
              <Text style={styles.quickLinkArrow}>›</Text>
            </TouchableOpacity>

            {/* Download Sample CSV */}
            <TouchableOpacity style={styles.quickLinkItem} onPress={handleDownloadSampleCSV}>
              <View style={[styles.quickLinkIcon, styles.blueGradient]}>
                <Text style={styles.quickLinkIconText}>⬇️</Text>
              </View>
              <Text style={styles.quickLinkText}>Download Sample CSV</Text>
              <Text style={styles.quickLinkArrow}>›</Text>
            </TouchableOpacity>
          </View>
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
  // Welcome Header
  welcomeHeader: {
    backgroundColor: '#ea6118',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  welcomeIcon: {
    fontSize: 50,
    opacity: 0.3,
  },
  welcomeDecoration: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#293B50',
  },
  // Action Cards
  actionCardsContainer: {
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  actionIconBox: {
    width: 56,
    height: 47,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  orangeGradient: {
    backgroundColor: '#ea6118',
  },
  greenGradient: {
    backgroundColor: '#16a34a',
  },
  blueGradient: {
    backgroundColor: '#0891b2',
  },
  primaryGradient: {
    backgroundColor: '#293B50',
  },
  redGradient: {
    backgroundColor: '#dc2626',
  },
  actionIconText: {
    fontSize: 24,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 6,
  },
  actionCardDescription: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Info Card
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoCardHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  infoCardHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  infoCardBody: {
    padding: 16,
  },
  // How To Section
  howToHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  howToIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  howToTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  // Steps
  stepItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  stepBold: {
    fontWeight: '700',
    color: '#293B50',
  },
  // Quick Links
  quickLinksBody: {
    padding: 8,
  },
  quickLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  quickLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickLinkIconText: {
    fontSize: 16,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 14,
    color: '#293B50',
    fontWeight: '500',
  },
  quickLinkArrow: {
    fontSize: 20,
    color: '#94a3b8',
  },
  // Account Info
  accountInfoBody: {
    padding: 16,
  },
  accountInfoItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  accountInfoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  accountInfoValueBox: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  accountInfoValue: {
    fontSize: 14,
    color: '#293B50',
    fontFamily: 'monospace',
  },
  accountInfoValueSmall: {
    fontSize: 11,
    color: '#293B50',
    fontFamily: 'monospace',
  },
  loginTypeBadge: {
    backgroundColor: '#ea6118',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  loginTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default CampaignDashboardScreen;
