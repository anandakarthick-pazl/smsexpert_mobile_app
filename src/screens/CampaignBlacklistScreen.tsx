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

interface CampaignBlacklistScreenProps {
  navigation: any;
}

const CampaignBlacklistScreen: React.FC<CampaignBlacklistScreenProps> = ({navigation}) => {
  const [showInfoSheet, setShowInfoSheet] = useState(false);

  const handleDownload = () => {
    Alert.alert(
      'Download Report',
      'Your STOP Blacklist report will be downloaded as a CSV file.',
      [
        {text: 'Download', onPress: () => console.log('Downloading...')},
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      <Header 
        title="STOP Blacklist" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance="£6,859.83"
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardHeaderIcon}>🚫</Text>
              <Text style={styles.cardHeaderTitle}>STOP Blacklist Report</Text>
            </View>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowInfoSheet(true)}>
              <Text style={styles.infoButtonText}>ℹ️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardBody}>
            {/* Download Section */}
            <View style={styles.downloadSection}>
              <Text style={styles.downloadIcon}>📥</Text>
              <Text style={styles.downloadTitle}>Download Your Blacklist Report</Text>
              <Text style={styles.downloadText}>Get a CSV file containing all blacklisted mobile numbers with dates</Text>
              <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                <Text style={styles.downloadButtonIcon}>⬇️</Text>
                <Text style={styles.downloadButtonText}>Click here to download</Text>
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
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  // Info Card
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
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
  // Download Section
  downloadSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
  },
  downloadIcon: {
    fontSize: 60,
    marginBottom: 16,
    opacity: 0.6,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 6,
  },
  downloadText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  downloadButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  downloadButtonIcon: {
    fontSize: 16,
    marginRight: 8,
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
