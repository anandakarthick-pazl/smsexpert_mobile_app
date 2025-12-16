import React, {useState, useEffect, useCallback} from 'react';
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
  ActivityIndicator,
  RefreshControl,
  Share,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  uploadBulkCampaign,
  downloadSampleCsv,
  getCsvFormatGuide,
  CSVColumn,
} from '../services/campaignService';

// Note: You'll need to install react-native-document-picker
// npm install react-native-document-picker
// or use expo-document-picker for Expo projects

let DocumentPicker: any;
try {
  DocumentPicker = require('react-native-document-picker').default;
} catch (e) {
  console.log('react-native-document-picker not installed');
}

interface BulkCampaignScreenProps {
  navigation: any;
}

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

const defaultCsvColumns: CSVColumn[] = [
  {column: 1, name: 'Mobile', description: 'Recipient mobile number (447... format)', required: true, example: '447123456789'},
  {column: 2, name: 'Custom1', description: 'Custom field for personalization', required: false, example: 'John'},
  {column: 3, name: 'Originator', description: 'Sender ID (who the SMS comes from)', required: true, example: 'YourBrand'},
  {column: 4, name: 'Message', description: 'SMS text content', required: true, example: 'Hello, this is your message!'},
  {column: 5, name: 'Send Time', description: 'Scheduled send time (YYYYMMDDHHmm)', required: false, example: '202412251400'},
  {column: 6, name: 'DLR URL', description: 'Delivery receipt callback URL', required: false, example: 'https://yoursite.com/dlr'},
  {column: 7, name: 'Custom2', description: 'Additional custom field', required: false, example: '-'},
  {column: 8, name: 'Route', description: 'Route letter (d, p, e, etc.)', required: false, example: 'd'},
];

const BulkCampaignScreen: React.FC<BulkCampaignScreenProps> = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [csvColumns, setCsvColumns] = useState<CSVColumn[]>(defaultCsvColumns);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const fetchCsvGuide = useCallback(async () => {
    try {
      const response = await getCsvFormatGuide();
      if (response.success && response.data) {
        setCsvColumns(response.data);
      }
    } catch (error) {
      console.error('Error fetching CSV guide:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCsvGuide();
  }, [fetchCsvGuide]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCsvGuide();
  };

  const handleSelectFile = async () => {
    if (!DocumentPicker) {
      // Fallback for when document picker is not available
      Alert.alert(
        'File Picker Not Available',
        'The file picker is not available. Please install react-native-document-picker.',
        [
          {
            text: 'Simulate Selection',
            onPress: () => setSelectedFile({
              uri: 'file://mock/campaign_data.csv',
              name: 'campaign_data.csv',
              type: 'text/csv',
              size: 1024,
            }),
          },
          {text: 'Cancel', style: 'cancel'},
        ]
      );
      return;
    }

    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });

      const file = result[0];
      
      // Validate file extension
      const extension = file.name?.split('.').pop()?.toLowerCase();
      if (extension !== 'csv') {
        Alert.alert('Invalid File', 'Please select a CSV file.');
        return;
      }

      // Validate file size (100MB max)
      if (file.size && file.size > 104857600) {
        Alert.alert('File Too Large', 'Maximum file size is 100MB.');
        return;
      }

      setSelectedFile({
        uri: file.fileCopyUri || file.uri,
        name: file.name || 'campaign.csv',
        type: file.type || 'text/csv',
        size: file.size,
      });
    } catch (error: any) {
      if (DocumentPicker.isCancel(error)) {
        // User cancelled
        console.log('File selection cancelled');
      } else {
        console.error('File selection error:', error);
        Alert.alert('Error', 'Failed to select file. Please try again.');
      }
    }
  };

  const handleDownloadSample = async (type: 'csv' | 'excel' | 'instructions') => {
    setIsDownloading(type);
    try {
      if (type === 'csv') {
        const response = await downloadSampleCsv();
        if (response.success && response.data) {
          // Decode base64 and share
          const csvContent = atob(response.data.content);
          
          await Share.share({
            message: csvContent,
            title: 'Sample Campaign CSV',
          });
        } else {
          Alert.alert('Error', response.message || 'Failed to download sample CSV');
        }
      } else {
        Alert.alert(
          'Web Portal Required',
          `${type === 'excel' ? 'Sample Excel' : 'Instructions'} download is available in the web portal.`,
          [{text: 'OK'}]
        );
      }
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('Error', error.message || 'Failed to download file');
    } finally {
      setIsDownloading(null);
    }
  };

  const resetForm = () => {
    setCampaignName('');
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    // Validation
    if (!campaignName.trim()) {
      Alert.alert('Error', 'Please enter a campaign name.');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a CSV file to upload.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const response = await uploadBulkCampaign(campaignName.trim(), selectedFile);

      if (response.success) {
        Alert.alert(
          'Campaign Uploaded',
          response.message || 'Your bulk SMS campaign has been uploaded successfully.',
          [
            {
              text: 'View History',
              onPress: () => {
                resetForm();
                navigation.navigate('CampaignHistory');
              },
            },
            {
              text: 'New Upload',
              onPress: resetForm,
            },
          ]
        );
      } else {
        const errorMessage = response.errors 
          ? response.errors.join('\n') 
          : response.message || 'Failed to upload campaign';
        Alert.alert('Upload Failed', errorMessage);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload campaign');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
      <Header 
        title="Bulk Campaign" 
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
            colors={['#16a34a']}
            tintColor="#16a34a"
          />
        }>

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <View style={styles.pageHeaderText}>
              <Text style={styles.pageHeaderTitle}>📁 Submit new SMS campaign (file upload)</Text>
              <Text style={styles.pageHeaderSubtitle}>Upload a CSV campaign file and begin sending your SMS</Text>
            </View>
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => navigation.navigate('CampaignHistory')}>
              <Text style={styles.historyButtonIcon}>📋</Text>
              <Text style={styles.historyButtonText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Download Links Section - Visible at top like web */}
        <View style={styles.downloadLinksCard}>
          <View style={styles.downloadLinksHeader}>
            <Text style={styles.downloadLinksIcon}>ℹ️</Text>
            <Text style={styles.downloadLinksTitle}>Download sample files to help format your CSV correctly:</Text>
          </View>
          <View style={styles.downloadLinksButtons}>
            <TouchableOpacity 
              style={styles.downloadLinkButton}
              onPress={() => handleDownloadSample('csv')}
              disabled={isDownloading === 'csv'}>
              {isDownloading === 'csv' ? (
                <ActivityIndicator size="small" color="#293B50" />
              ) : (
                <>
                  <Text style={styles.downloadLinkIcon}>⬇️</Text>
                  <Text style={styles.downloadLinkText}>Sample CSV</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.downloadLinkButton}
              onPress={() => handleDownloadSample('excel')}
              disabled={isDownloading === 'excel'}>
              <Text style={styles.downloadLinkIcon}>⬇️</Text>
              <Text style={styles.downloadLinkText}>Sample Excel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.downloadLinkButton}
              onPress={() => handleDownloadSample('instructions')}
              disabled={isDownloading === 'instructions'}>
              <Text style={styles.downloadLinkIcon}>📄</Text>
              <Text style={styles.downloadLinkText}>Instructions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.formCardHeader}>
            <View style={styles.formCardHeaderLeft}>
              <Text style={styles.formCardHeaderIcon}>☁️</Text>
              <Text style={styles.formCardHeaderTitle}>Upload Campaign File</Text>
            </View>
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
                style={[styles.uploadArea, selectedFile && styles.uploadAreaSelected]}
                onPress={handleSelectFile}
                disabled={isSubmitting}>
                {selectedFile ? (
                  <>
                    <Text style={styles.uploadIconSuccess}>✅</Text>
                    <Text style={styles.uploadTitleSuccess}>File Selected</Text>
                    <View style={styles.selectedFileContainer}>
                      <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                      <Text style={styles.selectedFileSize}>{formatFileSize(selectedFile.size)}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.changeFileButton}
                      onPress={handleSelectFile}>
                      <Text style={styles.changeFileButtonText}>Change File</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.uploadIcon}>☁️</Text>
                    <Text style={styles.uploadTitle}>Drag & drop your CSV file here</Text>
                    <Text style={styles.uploadOr}>or</Text>
                    <View style={styles.browseButton}>
                      <Text style={styles.browseButtonText}>Browse Files</Text>
                    </View>
                    <Text style={styles.uploadHint}>No file selected • CSV format only • Max 100MB</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {width: `${uploadProgress}%`}]} />
                </View>
                <Text style={styles.progressText}>{uploadProgress}%</Text>
              </View>
            )}

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
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonIcon}>⬆️</Text>
                    <Text style={styles.submitButtonText}>Upload & Submit Campaign</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={isSubmitting}>
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
              <Text style={[styles.tableHeaderCell, styles.exampleCell]}>Example</Text>
            </View>
            {/* Table Body */}
            {csvColumns.map((col, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.columnCell}>
                  <Text style={styles.columnName}>{col.column}. {col.name}</Text>
                </View>
                <Text style={[styles.tableCell, styles.descCell]} numberOfLines={2}>{col.description}</Text>
                <View style={styles.reqCell}>
                  <View style={[styles.badge, col.required ? styles.badgeRequired : styles.badgeOptional]}>
                    <Text style={[styles.badgeText, col.required ? styles.badgeTextRequired : styles.badgeTextOptional]}>
                      {col.required ? 'Required' : 'Optional'}
                    </Text>
                  </View>
                </View>
                <View style={styles.exampleCell}>
                  <Text style={styles.exampleCode}>{col.example}</Text>
                </View>
              </View>
            ))}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  // Page Header
  pageHeader: {
    backgroundColor: '#16a34a',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#16a34a',
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
  historyButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  historyButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  historyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  // Download Links Section
  downloadLinksCard: {
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(8, 145, 178, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  downloadLinksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  downloadLinksIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  downloadLinksTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0e7490',
  },
  downloadLinksButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  downloadLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
    justifyContent: 'center',
  },
  downloadLinkIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  downloadLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#293B50',
  },
  // Form Card
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  uploadAreaSelected: {
    borderColor: '#16a34a',
    backgroundColor: 'rgba(22, 163, 74, 0.05)',
    borderStyle: 'solid',
  },
  uploadIcon: {
    fontSize: 60,
    color: '#94a3b8',
    marginBottom: 12,
  },
  uploadIconSuccess: {
    fontSize: 50,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadTitleSuccess: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16a34a',
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
    paddingHorizontal: 24,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 4,
  },
  selectedFileSize: {
    fontSize: 12,
    color: '#64748b',
  },
  changeFileButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  changeFileButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
    width: 40,
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
    minHeight: 50,
    shadowColor: '#16a34a',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '600',
    color: '#293B50',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 11,
    color: '#475569',
  },
  columnCell: {
    flex: 1,
    minWidth: 70,
  },
  descCell: {
    flex: 1.5,
    paddingHorizontal: 4,
  },
  reqCell: {
    flex: 0.8,
    alignItems: 'center',
  },
  exampleCell: {
    flex: 1,
    alignItems: 'flex-end',
  },
  columnName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#293B50',
  },
  exampleCode: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  badgeRequired: {
    backgroundColor: '#dc2626',
  },
  badgeOptional: {
    backgroundColor: '#e2e8f0',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '500',
  },
  badgeTextRequired: {
    color: '#ffffff',
  },
  badgeTextOptional: {
    color: '#64748b',
  },
});

export default BulkCampaignScreen;
