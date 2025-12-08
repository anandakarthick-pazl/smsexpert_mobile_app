import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface BulkCampaignScreenProps {
  navigation: any;
}

interface CSVColumn {
  column: string;
  description: string;
  required: boolean;
  example: string;
}

const csvColumns: CSVColumn[] = [
  {column: '1. Mobile', description: 'Recipient mobile number (447... format)', required: true, example: '447123456789'},
  {column: '2. Custom1', description: 'Custom field for personalization', required: false, example: 'John'},
  {column: '3. Originator', description: 'Sender ID (who the SMS comes from)', required: true, example: 'YourBrand'},
  {column: '4. Message', description: 'SMS text content', required: true, example: 'Hello, this is your message!'},
  {column: '5. Send Time', description: 'Scheduled send time (YYYYMMDDHHmm)', required: false, example: '202412251400'},
  {column: '6. DLR URL', description: 'Delivery receipt callback URL', required: false, example: 'https://yoursite.com/dlr'},
  {column: '7. Custom2', description: 'Additional custom field', required: false, example: '-'},
  {column: '8. Route', description: 'Route letter (d, p, e, etc.)', required: false, example: 'd'},
];

const BulkCampaignScreen: React.FC<BulkCampaignScreenProps> = ({navigation}) => {
  const [campaignName, setCampaignName] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);

  const handleDownloadSample = (type: string) => {
    Alert.alert('Download', `Downloading ${type}...`);
  };

  const handleSelectFile = () => {
    // In a real app, you'd use react-native-document-picker
    Alert.alert(
      'Select File',
      'In production, this would open a file picker to select a CSV file.',
      [
        {
          text: 'Simulate Selection',
          onPress: () => setSelectedFile('campaign_data.csv'),
        },
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  const handleSubmit = () => {
    if (!campaignName.trim()) {
      Alert.alert('Error', 'Please enter a campaign name.');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a CSV file to upload.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Campaign Uploaded',
        'Your bulk SMS campaign has been uploaded successfully. Check the Campaigns History for status.',
        [
          {
            text: 'View History',
            onPress: () => navigation.navigate('CampaignHistory'),
          },
          {text: 'OK'},
        ]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      <Header 
        title="Bulk Campaign" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance="£6,859.83"
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.formCardHeader}>
            <View style={styles.formCardHeaderLeft}>
              <Text style={styles.formCardHeaderIcon}>☁️</Text>
              <Text style={styles.formCardHeaderTitle}>Upload Campaign File</Text>
            </View>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowInfoSheet(true)}>
              <Text style={styles.infoButtonText}>ℹ️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCardBody}>
            {/* Campaign Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Campaign Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter a name to identify this campaign"
                placeholderTextColor="#94a3b8"
                value={campaignName}
                onChangeText={setCampaignName}
              />
              <Text style={styles.formHint}>A simple description to help you identify the campaign in future.</Text>
            </View>

            {/* File Upload */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Select CSV File <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity 
                style={styles.uploadArea}
                onPress={handleSelectFile}>
                <Text style={styles.uploadIcon}>☁️</Text>
                <Text style={styles.uploadTitle}>Drag & drop your CSV file here</Text>
                <Text style={styles.uploadOr}>or</Text>
                <View style={styles.browseButton}>
                  <Text style={styles.browseButtonText}>Browse Files</Text>
                </View>
                {selectedFile ? (
                  <View style={styles.selectedFileContainer}>
                    <Text style={styles.selectedFileIcon}>✓</Text>
                    <Text style={styles.selectedFileText}>{selectedFile}</Text>
                  </View>
                ) : (
                  <Text style={styles.uploadHint}>No file selected • CSV format only • Max 100MB</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Warning Box */}
            <View style={styles.warningBox}>
              <View style={styles.warningHeader}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningTitle}>Important Notes:</Text>
              </View>
              <View style={styles.warningContent}>
                <Text style={styles.warningItem}>• Large files may take a few minutes to upload. Please be patient.</Text>
                <Text style={styles.warningItem}>• <Text style={styles.bold}>Do not refresh the page</Text> after clicking submit.</Text>
                <Text style={styles.warningItem}>• Need help with CSV format? Email your file to steve@sms.expert for review.</Text>
                <Text style={styles.warningItem}>• We can check format but not content or message wording.</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}>
                <Text style={styles.submitButtonIcon}>{isSubmitting ? '⏳' : '⬆️'}</Text>
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit Campaign'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => navigation.navigate('CampaignHome')}>
                <Text style={styles.cancelButtonIcon}>✕</Text>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CSV Format Guide */}
        <View style={styles.guideCard}>
          <View style={styles.guideCardHeader}>
            <Text style={styles.guideCardHeaderIcon}>❓</Text>
            <Text style={styles.guideCardHeaderTitle}>CSV Format Guide</Text>
          </View>
          <View style={styles.guideTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.columnCell]}>Column</Text>
              <Text style={[styles.tableHeaderCell, styles.descCell]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.reqCell]}>Required</Text>
            </View>
            {/* Table Body */}
            {csvColumns.map((col, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.columnCell}>
                  <Text style={styles.columnName}>{col.column}</Text>
                  <Text style={styles.exampleText}>e.g., {col.example}</Text>
                </View>
                <Text style={[styles.tableCell, styles.descCell]}>{col.description}</Text>
                <View style={styles.reqCell}>
                  <View style={[styles.badge, col.required ? styles.badgeRequired : styles.badgeOptional]}>
                    <Text style={[styles.badgeText, col.required ? styles.badgeTextRequired : styles.badgeTextOptional]}>
                      {col.required ? 'Required' : 'Optional'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
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
            <Text style={styles.bottomSheetTitle}>📥 Download Sample Files</Text>
            <Text style={styles.bottomSheetSubtitle}>Download sample files to help format your CSV correctly</Text>
            
            <View style={styles.downloadSection}>
              <TouchableOpacity 
                style={styles.downloadItem}
                onPress={() => handleDownloadSample('Sample CSV')}>
                <View style={[styles.downloadItemIcon, styles.downloadIconCSV]}>
                  <Text style={styles.downloadItemIconText}>📄</Text>
                </View>
                <View style={styles.downloadItemContent}>
                  <Text style={styles.downloadItemTitle}>Sample CSV</Text>
                  <Text style={styles.downloadItemDesc}>Download a sample CSV file with correct format</Text>
                </View>
                <Text style={styles.downloadItemArrow}>⬇️</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.downloadItem}
                onPress={() => handleDownloadSample('Sample Excel')}>
                <View style={[styles.downloadItemIcon, styles.downloadIconExcel]}>
                  <Text style={styles.downloadItemIconText}>📊</Text>
                </View>
                <View style={styles.downloadItemContent}>
                  <Text style={styles.downloadItemTitle}>Sample Excel</Text>
                  <Text style={styles.downloadItemDesc}>Download a sample Excel file</Text>
                </View>
                <Text style={styles.downloadItemArrow}>⬇️</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.downloadItem}
                onPress={() => handleDownloadSample('Instructions')}>
                <View style={[styles.downloadItemIcon, styles.downloadIconInstructions]}>
                  <Text style={styles.downloadItemIconText}>📋</Text>
                </View>
                <View style={styles.downloadItemContent}>
                  <Text style={styles.downloadItemTitle}>Instructions</Text>
                  <Text style={styles.downloadItemDesc}>Step-by-step guide for CSV formatting</Text>
                </View>
                <Text style={styles.downloadItemArrow}>⬇️</Text>
              </TouchableOpacity>
            </View>

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
  // Form Card
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  formCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formCardHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  formCardHeaderTitle: {
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
  formCardBody: {
    padding: 20,
  },
  // Form Elements
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#293B50',
  },
  formHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  // Upload Area
  uploadArea: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 50,
    color: '#94a3b8',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  uploadOr: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
  },
  browseButton: {
    backgroundColor: '#ea6118',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 16,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  uploadHint: {
    fontSize: 12,
    color: '#94a3b8',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedFileIcon: {
    fontSize: 14,
    color: '#16a34a',
    marginRight: 6,
  },
  selectedFileText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
  // Warning Box
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  warningContent: {},
  warningItem: {
    fontSize: 13,
    color: '#92400e',
    marginBottom: 6,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#64748b',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  // Guide Card
  guideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  guideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  guideCardHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  guideCardHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  guideTable: {
    padding: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '600',
    color: '#293B50',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: '#475569',
  },
  columnCell: {
    flex: 1.2,
  },
  descCell: {
    flex: 2,
  },
  reqCell: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  columnName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#293B50',
  },
  exampleText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeRequired: {
    backgroundColor: '#dc2626',
  },
  badgeOptional: {
    backgroundColor: '#e2e8f0',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  badgeTextRequired: {
    color: '#ffffff',
  },
  badgeTextOptional: {
    color: '#64748b',
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
    marginBottom: 4,
  },
  bottomSheetSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
  },
  downloadSection: {
    marginBottom: 16,
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  downloadItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  downloadIconCSV: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  downloadIconExcel: {
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
  },
  downloadIconInstructions: {
    backgroundColor: 'rgba(234, 97, 24, 0.1)',
  },
  downloadItemIconText: {
    fontSize: 22,
  },
  downloadItemContent: {
    flex: 1,
  },
  downloadItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 2,
  },
  downloadItemDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  downloadItemArrow: {
    fontSize: 18,
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

export default BulkCampaignScreen;
