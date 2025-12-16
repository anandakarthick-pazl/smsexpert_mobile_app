import React, {useState, useEffect, useCallback, useRef} from 'react';
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
  Linking,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import SignatureScreen from 'react-native-signature-canvas';
import Header from '../components/Header';
import {
  getContracts,
  getContractDetail,
  signContract,
  getContractDownloadUrl,
  ContractItem,
  ContractStatistics,
  PricingInfo,
  AgreementStatus,
} from '../services/contractsService';

interface ContractsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

const ContractsScreen: React.FC<ContractsScreenProps> = ({navigation}) => {
  const {width} = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState<ContractStatistics>({
    master_agreements: 0,
    addendums: 0,
    privacy_policies: 0,
    signed: 0,
    pending: 0,
  });
  const [mainContracts, setMainContracts] = useState<ContractItem[]>([]);
  const [addendums, setAddendums] = useState<ContractItem[]>([]);
  const [privacyPolicies, setPrivacyPolicies] = useState<ContractItem[]>([]);
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [agreementStatus, setAgreementStatus] = useState<AgreementStatus>({
    has_agreed: false,
    agreed_date: null,
  });

  // Modal states
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [signingContract, setSigningContract] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Signature Modal states
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [contractToSign, setContractToSign] = useState<ContractItem | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const signatureRef = useRef<any>(null);

  const fetchContracts = useCallback(async () => {
    try {
      const response = await getContracts();
      if (response.success && response.data) {
        setStatistics(response.data.statistics);
        setMainContracts(response.data.main_contracts);
        setAddendums(response.data.addendums);
        setPrivacyPolicies(response.data.privacy_policies);
        setPricing(response.data.pricing);
        setAgreementStatus(response.data.agreement_status);
      } else {
        Alert.alert('Error', response.message || 'Failed to load contracts');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContracts();
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleViewContract = async (contract: ContractItem) => {
    setLoadingContract(true);
    setSelectedContract(contract);
    setShowContractModal(true);

    try {
      const response = await getContractDetail(contract.id);
      if (response.success && response.data) {
        setSelectedContract(response.data);
      }
    } catch (error: any) {
      console.error('Error loading contract:', error);
    } finally {
      setLoadingContract(false);
    }
  };

  const handleDownloadContract = async (contract: ContractItem) => {
    try {
      const response = await getContractDownloadUrl(contract.id);
      if (response.success && response.data) {
        await Linking.openURL(response.data.url);
      } else {
        Alert.alert('Error', response.message || 'Failed to get download URL');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to download contract');
    }
  };

  // Open signature modal
  const openSignatureModal = (contract: ContractItem) => {
    setContractToSign(contract);
    setSignatureData(null);
    setAgreeTerms(false);
    setShowSignatureModal(true);
  };

  // Handle signature capture
  const handleSignatureOK = (signature: string) => {
    setSignatureData(signature);
  };

  // Handle signature clear
  const handleSignatureClear = () => {
    signatureRef.current?.clearSignature();
    setSignatureData(null);
  };

  // Handle signature empty
  const handleSignatureEmpty = () => {
    Alert.alert('Signature Required', 'Please draw your signature before submitting.');
  };

  // Submit signature
  const handleSubmitSignature = async () => {
    if (!signatureData) {
      Alert.alert('Signature Required', 'Please draw your signature before submitting.');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Agreement Required', 'Please agree to the terms and conditions.');
      return;
    }

    if (!contractToSign) return;

    Alert.alert(
      'Confirm Signature',
      `By signing, you agree to all terms in "${contractToSign.title}". This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm & Sign',
          onPress: async () => {
            setSigningContract(true);
            try {
              const response = await signContract(contractToSign.id, signatureData);
              if (response.success) {
                Alert.alert('Success', 'Contract signed successfully!', [
                  {
                    text: 'OK',
                    onPress: () => {
                      setShowSignatureModal(false);
                      setShowContractModal(false);
                      fetchContracts();
                    },
                  },
                ]);
              } else {
                Alert.alert('Error', response.message || 'Failed to sign contract');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign contract');
            } finally {
              setSigningContract(false);
            }
          },
        },
      ]
    );
  };

  const getSignatureBadgeStyle = (status: string) => {
    switch (status) {
      case 'signed':
        return styles.badgeSigned;
      case 'pending':
        return styles.badgePending;
      default:
        return styles.badgeNone;
    }
  };

  const getSignatureBadgeText = (status: string) => {
    switch (status) {
      case 'signed':
        return '✓ Signed';
      case 'pending':
        return '⏳ Pending Signature';
      default:
        return 'ℹ️ For Reference';
    }
  };

  // Generate HTML wrapper for WebView
  const generateHtmlContent = (content: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #293B50;
            padding: 16px;
            margin: 0;
            background-color: #ffffff;
          }
          h1 {
            font-size: 20px;
            font-weight: 700;
            color: #293B50;
            margin: 16px 0;
            text-align: center;
          }
          h2 {
            font-size: 18px;
            font-weight: 700;
            color: #293B50;
            margin: 14px 0 12px;
          }
          h3 {
            font-size: 16px;
            font-weight: 700;
            color: #293B50;
            margin: 12px 0 10px;
          }
          p {
            color: #475569;
            margin: 0 0 12px;
          }
          ul, ol {
            margin: 0 0 12px;
            padding-left: 24px;
          }
          li {
            color: #475569;
            margin-bottom: 6px;
          }
          strong, b {
            font-weight: 700;
          }
          a {
            color: #ea6118;
            text-decoration: underline;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f8fafc;
            font-weight: 600;
          }
          .MsoNormal, .MsoBodyText {
            margin: 0 0 10px;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  };

  // Signature pad style
  const signatureStyle = `.m-signature-pad--footer { display: none; }
    .m-signature-pad { box-shadow: none; border: none; }
    .m-signature-pad--body { border: 2px dashed #cbd5e1; border-radius: 12px; }
    body, html { background-color: #f8fafc; }`;

  const renderContractItem = (contract: ContractItem, iconColor: string = '#ea6118') => (
    <View key={contract.id} style={styles.documentItem}>
      <View style={[styles.documentIcon, {backgroundColor: iconColor}]}>
        <Text style={styles.documentIconText}>📄</Text>
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>{contract.title}</Text>
        <Text style={styles.documentDescription}>
          Version {contract.version} | Updated: {contract.updated_at || 'N/A'}
          {contract.has_file ? ` | ${contract.file_type} (${contract.file_size})` : ''}
        </Text>
        <View style={[styles.signatureBadge, getSignatureBadgeStyle(contract.signature_status)]}>
          <Text style={styles.signatureBadgeText}>
            {getSignatureBadgeText(contract.signature_status)}
          </Text>
        </View>
        {contract.signed_at && (
          <Text style={styles.signedDate}>Signed on: {contract.signed_at}</Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.btnView}
          onPress={() => handleViewContract(contract)}>
          <Text style={styles.btnText}>👁️</Text>
        </TouchableOpacity>
        {contract.has_file && (
          <TouchableOpacity
            style={styles.btnDownload}
            onPress={() => handleDownloadContract(contract)}>
            <Text style={styles.btnText}>⬇️</Text>
          </TouchableOpacity>
        )}
        {contract.signature_status === 'pending' && (
          <TouchableOpacity
            style={styles.btnSign}
            onPress={() => openSignatureModal(contract)}>
            <Text style={styles.btnText}>✍️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header
          title="Contracts"
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={handleNotificationPress}
          notificationCount={3}
          walletBalance="£6859"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading contracts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />

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
        contentContainerStyle={styles.scrollContent}
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
            <Text style={styles.headerIcon}>📋</Text>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Your SMS Expert Agreement</Text>
              <Text style={styles.headerSubtitle}>
                Review your contract terms, pricing, and policies
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfoModal(true)}>
            <Text style={styles.infoButtonIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statTotal]}>
            <Text style={styles.statNumber}>{statistics.master_agreements}</Text>
            <Text style={styles.statLabel}>Master Agreement</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statistics.addendums}</Text>
            <Text style={styles.statLabel}>Addendums</Text>
          </View>
          <View style={[styles.statCard, styles.statPrivacy]}>
            <Text style={styles.statNumber}>{statistics.privacy_policies}</Text>
            <Text style={styles.statLabel}>Privacy Policy</Text>
          </View>
          <View style={[styles.statCard, styles.statSigned]}>
            <Text style={styles.statNumber}>{statistics.signed}</Text>
            <Text style={styles.statLabel}>Signed</Text>
          </View>
          <View style={[styles.statCard, styles.statPending]}>
            <Text style={styles.statNumber}>{statistics.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Main Client Contracts */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📑</Text>
            <Text style={styles.sectionTitle}>Main Client Contracts</Text>
          </View>
          <View style={styles.sectionContent}>
            {mainContracts.length > 0 ? (
              mainContracts.map(contract => renderContractItem(contract, '#ea6118'))
            ) : (
              <View style={styles.noContracts}>
                <Text style={styles.noContractsIcon}>📭</Text>
                <Text style={styles.noContractsText}>No contracts available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contract Addendums */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>Contract Addendums</Text>
          </View>
          <View style={styles.sectionContent}>
            {addendums.length > 0 ? (
              addendums.map(contract => renderContractItem(contract, '#f59e0b'))
            ) : (
              <View style={styles.noContracts}>
                <Text style={styles.noContractsIcon}>ℹ️</Text>
                <View>
                  <Text style={styles.noContractsTitle}>No Addendums Available</Text>
                  <Text style={styles.noContractsSubtitle}>
                    Any future modifications will appear here.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Privacy & Data Protection */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🛡️</Text>
            <Text style={styles.sectionTitle}>Privacy & Data Protection</Text>
          </View>
          <View style={styles.sectionContent}>
            {privacyPolicies.length > 0 ? (
              privacyPolicies.map(contract => renderContractItem(contract, '#16a34a'))
            ) : (
              <View style={styles.noContracts}>
                <Text style={styles.noContractsIcon}>📭</Text>
                <Text style={styles.noContractsText}>No privacy policies available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Pricing Structure */}
        {pricing && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💷</Text>
              <Text style={styles.sectionTitle}>Current Pricing Structure</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.pricingNote}>
                <Text style={styles.pricingNoteIcon}>ℹ️</Text>
                <Text style={styles.pricingNoteText}>
                  Unless alternative rates have been agreed in writing, our standard pricing applies.
                </Text>
              </View>

              {pricing.items.map((item, index) => (
                <View key={index} style={styles.pricingRow}>
                  <View style={styles.pricingHeader}>
                    <Text style={styles.pricingIcon}>
                      {item.icon === 'phone' ? '📱' : item.icon === 'public' ? '🌍' : '🇬🇧'}
                    </Text>
                    <View style={styles.pricingInfo}>
                      <Text style={styles.pricingTitle}>{item.title}</Text>
                      {item.description && (
                        <Text style={styles.pricingDescription}>{item.description}</Text>
                      )}
                    </View>
                    {item.price && (
                      <Text style={styles.pricingPrice}>{item.price}</Text>
                    )}
                  </View>
                  {item.tiers && (
                    <View style={styles.pricingTiers}>
                      {item.tiers.map((tier, tierIndex) => (
                        <View key={tierIndex} style={styles.tierRow}>
                          <Text style={styles.tierRange}>{tier.range}</Text>
                          <Text style={styles.tierPrice}>{tier.price}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              <View style={styles.effectiveDate}>
                <Text style={styles.effectiveDateIcon}>📅</Text>
                <Text style={styles.effectiveDateText}>
                  Pricing effective from: {pricing.effective_date}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Acceptance Notice */}
        <View style={styles.acceptanceNotice}>
          <Text style={styles.acceptanceIcon}>⚠️</Text>
          <Text style={styles.acceptanceTitle}>Terms Acceptance</Text>
          <Text style={styles.acceptanceText}>
            By making any purchases or continuing to use any of our services, you are deemed to have
            accepted the current Contract, Privacy Policy, Pricing, and any Addendums in full.
          </Text>
        </View>

        {/* Agreement Status */}
        {agreementStatus.has_agreed ? (
          <View style={styles.agreedBadge}>
            <Text style={styles.agreedIcon}>✅</Text>
            <View>
              <Text style={styles.agreedTitle}>Contract Agreed</Text>
              {agreementStatus.agreed_date && (
                <Text style={styles.agreedDate}>
                  Agreed on: {agreementStatus.agreed_date}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.pendingAgreement}>
            <Text style={styles.pendingIcon}>⏳</Text>
            <View>
              <Text style={styles.pendingTitle}>Agreement Pending</Text>
              <Text style={styles.pendingText}>
                Please review and sign all required contracts.
              </Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Contract Detail Modal with WebView for HTML Content */}
      <Modal
        visible={showContractModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContractModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerFull}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedContract?.title || 'Contract Details'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowContractModal(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {loadingContract ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#ea6118" />
                <Text style={styles.loadingText}>Loading contract...</Text>
              </View>
            ) : selectedContract ? (
              <>
                {/* Contract Meta */}
                <View style={styles.contractMetaBar}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabelSmall}>Version</Text>
                    <Text style={styles.metaValueSmall}>{selectedContract.version}</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabelSmall}>Updated</Text>
                    <Text style={styles.metaValueSmall}>{selectedContract.updated_at || 'N/A'}</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={[styles.signatureBadgeSmall, getSignatureBadgeStyle(selectedContract.signature_status)]}>
                    <Text style={styles.signatureBadgeTextSmall}>
                      {getSignatureBadgeText(selectedContract.signature_status)}
                    </Text>
                  </View>
                </View>

                {/* HTML Content with WebView */}
                {selectedContract.content ? (
                  <View style={styles.webViewContainer}>
                    <WebView
                      source={{html: generateHtmlContent(selectedContract.content)}}
                      style={styles.webView}
                      originWhitelist={['*']}
                      scrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                      javaScriptEnabled={true}
                      onShouldStartLoadWithRequest={(request) => {
                        if (request.url !== 'about:blank' && !request.url.startsWith('data:')) {
                          Linking.openURL(request.url);
                          return false;
                        }
                        return true;
                      }}
                    />
                  </View>
                ) : (
                  <View style={styles.noContentContainer}>
                    <View style={styles.noContent}>
                      <Text style={styles.noContentIcon}>📄</Text>
                      <Text style={styles.noContentText}>
                        Contract content not available in text format.
                      </Text>
                      <Text style={styles.noContentSubtext}>
                        Please download the document to view the full contract.
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.modalFooter}>
                  {selectedContract.has_file && (
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      onPress={() => handleDownloadContract(selectedContract)}>
                      <Text style={styles.downloadBtnText}>⬇️ Download</Text>
                    </TouchableOpacity>
                  )}
                  {selectedContract.signature_status === 'pending' && (
                    <TouchableOpacity
                      style={styles.signBtn}
                      onPress={() => openSignatureModal(selectedContract)}>
                      <Text style={styles.signBtnText}>✍️ Sign Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Signature Modal */}
      <Modal
        visible={showSignatureModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSignatureModal(false)}>
        <View style={styles.signatureModalOverlay}>
          <View style={styles.signatureModalContainer}>
            {/* Header */}
            <View style={styles.signatureModalHeader}>
              <View>
                <Text style={styles.signatureModalTitle}>Sign Contract</Text>
                <Text style={styles.signatureModalSubtitle} numberOfLines={1}>
                  {contractToSign?.title}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowSignatureModal(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.signatureModalBody} showsVerticalScrollIndicator={false}>
              {/* Instructions */}
              <View style={styles.signatureInstructions}>
                <Text style={styles.instructionIcon}>✍️</Text>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Draw Your Signature</Text>
                  <Text style={styles.instructionText}>
                    Use your finger to sign in the box below. This will serve as your electronic signature.
                  </Text>
                </View>
              </View>

              {/* Signature Pad */}
              <View style={styles.signaturePadContainer}>
                <Text style={styles.signatureLabel}>Your Signature</Text>
                <View style={styles.signaturePadWrapper}>
                  <SignatureScreen
                    ref={signatureRef}
                    onOK={handleSignatureOK}
                    onEmpty={handleSignatureEmpty}
                    descriptionText=""
                    clearText="Clear"
                    confirmText="Save"
                    webStyle={signatureStyle}
                    autoClear={false}
                    imageType="image/png"
                    backgroundColor="#f8fafc"
                    penColor="#293B50"
                    dotSize={3}
                    minWidth={2}
                    maxWidth={4}
                  />
                </View>
                
                {/* Signature Actions */}
                <View style={styles.signatureActions}>
                  <TouchableOpacity
                    style={styles.clearSignatureBtn}
                    onPress={handleSignatureClear}>
                    <Text style={styles.clearSignatureBtnText}>🗑️ Clear Signature</Text>
                  </TouchableOpacity>
                  {signatureData && (
                    <View style={styles.signatureCaptured}>
                      <Text style={styles.signatureCapturedText}>✓ Signature captured</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Terms Agreement */}
              <TouchableOpacity
                style={styles.termsCheckbox}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.7}>
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                  {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I have read and agree to all terms and conditions in this contract. I understand that my electronic signature is legally binding.
                </Text>
              </TouchableOpacity>

              {/* Legal Notice */}
              <View style={styles.legalNotice}>
                <Text style={styles.legalNoticeIcon}>⚖️</Text>
                <Text style={styles.legalNoticeText}>
                  By signing this contract electronically, you agree that your signature is as valid as a handwritten signature.
                </Text>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.signatureModalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowSignatureModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitSignatureBtn,
                  (!signatureData || !agreeTerms || signingContract) && styles.submitSignatureBtnDisabled,
                ]}
                onPress={handleSubmitSignature}
                disabled={!signatureData || !agreeTerms || signingContract}>
                {signingContract ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitSignatureBtnText}>✍️ Submit Signature</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInfoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetTitleRow}>
                <Text style={styles.bottomSheetIcon}>📋</Text>
                <Text style={styles.bottomSheetTitle}>About Contracts</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInfoModal(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.bottomSheetBody}>
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIconText}>📑</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Main Contracts</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    Your primary agreement with SMS Expert outlining terms of service, usage policies, and obligations.
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.yellowBg]}>
                    <Text style={styles.infoSectionIconText}>📝</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Addendums</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.yellowBorder]}>
                  <Text style={styles.infoSectionText}>
                    Supplementary documents that modify or add to the main contract terms.
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.greenBg]}>
                    <Text style={styles.infoSectionIconText}>🛡️</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Privacy Policy</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.greenBorder]}>
                  <Text style={styles.infoSectionText}>
                    Details how your data is collected, used, and protected in compliance with data protection regulations.
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.orangeBg]}>
                    <Text style={styles.infoSectionIconText}>✍️</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Electronic Signature</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.orangeBorder]}>
                  <Text style={styles.infoSectionText}>
                    Sign contracts using your finger. Your electronic signature is legally binding and securely stored.
                  </Text>
                </View>
              </View>
            </ScrollView>
            <View style={styles.bottomSheetFooter}>
              <TouchableOpacity
                style={styles.closeSheetButton}
                onPress={() => setShowInfoModal(false)}>
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
    flex: 1,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 3,
    borderLeftColor: '#94a3b8',
  },
  statTotal: {
    borderLeftColor: '#ea6118',
  },
  statPrivacy: {
    borderLeftColor: '#16a34a',
  },
  statSigned: {
    borderLeftColor: '#16a34a',
  },
  statPending: {
    borderLeftColor: '#f59e0b',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#293B50',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  // Section Card
  sectionCard: {
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
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentIconText: {
    fontSize: 20,
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
  documentDescription: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 6,
  },
  signatureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeSigned: {
    backgroundColor: '#dcfce7',
  },
  badgePending: {
    backgroundColor: '#fef3c7',
  },
  badgeNone: {
    backgroundColor: '#f1f5f9',
  },
  signatureBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  signedDate: {
    fontSize: 10,
    color: '#16a34a',
    marginTop: 4,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  btnView: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#293B50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDownload: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSign: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
  },
  // No Contracts
  noContracts: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef7ed',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  noContractsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  noContractsText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  noContractsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  noContractsSubtitle: {
    fontSize: 12,
    color: '#a16207',
    marginTop: 2,
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
  pricingRow: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricingIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  pricingInfo: {
    flex: 1,
  },
  pricingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
  },
  pricingDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  pricingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ea6118',
  },
  pricingTiers: {
    marginTop: 12,
    paddingLeft: 30,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tierRange: {
    fontSize: 13,
    color: '#64748b',
  },
  tierPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ea6118',
  },
  effectiveDate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
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
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  acceptanceIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  acceptanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 8,
  },
  acceptanceText: {
    fontSize: 13,
    color: '#991b1b',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Agreed Badge
  agreedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  agreedIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  agreedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  agreedDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  pendingAgreement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  pendingIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
  },
  pendingText: {
    fontSize: 14,
    color: '#a16207',
    marginTop: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainerFull: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
  },
  modalHeader: {
    backgroundColor: '#ea6118',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
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
  modalLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabelSmall: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  metaValueSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#293B50',
    marginTop: 2,
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  signatureBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  signatureBadgeTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
  },
  noContentIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  noContentText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  noContentSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  downloadBtn: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  signBtn: {
    backgroundColor: '#ea6118',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  signBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Signature Modal Styles
  signatureModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  signatureModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
  },
  signatureModalHeader: {
    backgroundColor: '#293B50',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signatureModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  signatureModalSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    maxWidth: 250,
  },
  signatureModalBody: {
    flex: 1,
    padding: 20,
  },
  signatureInstructions: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0891b2',
  },
  instructionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: '#0369a1',
    lineHeight: 20,
  },
  signaturePadContainer: {
    marginBottom: 20,
  },
  signatureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 10,
  },
  signaturePadWrapper: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  signatureActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  clearSignatureBtn: {
    backgroundColor: '#fee2e2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearSignatureBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  signatureCaptured: {
    backgroundColor: '#dcfce7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  signatureCapturedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  legalNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  legalNoticeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  legalNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  signatureModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  submitSignatureBtn: {
    flex: 2,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitSignatureBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitSignatureBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Bottom Sheet
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
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  bottomSheetBody: {
    padding: 20,
    maxHeight: 400,
  },
  bottomSheetFooter: {
    padding: 20,
    paddingBottom: 50,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeSheetButton: {
    backgroundColor: '#ea6118',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
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
  infoSectionIconText: {
    fontSize: 18,
  },
  blueBg: {
    backgroundColor: '#f0f9ff',
  },
  greenBg: {
    backgroundColor: '#dcfce7',
  },
  yellowBg: {
    backgroundColor: '#fef3c7',
  },
  orangeBg: {
    backgroundColor: '#fff7ed',
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
  orangeBorder: {
    borderLeftColor: '#ea6118',
  },
  infoSectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
});

export default ContractsScreen;
