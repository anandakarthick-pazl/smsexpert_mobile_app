import React, {useState, useCallback, useEffect} from 'react';
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
  TextInput,
  Clipboard,
  ToastAndroid,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getAccounts,
  transferFunds,
  canAddSubAccount,
  Account,
  AccountStatistics,
} from '../services/accountsService';

interface ViewAccountsScreenProps {
  navigation: any;
}

const ViewAccountsScreen: React.FC<ViewAccountsScreenProps> = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [statistics, setStatistics] = useState<AccountStatistics | null>(null);
  const [canAddAccount, setCanAddAccount] = useState(false);
  
  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const [accountsResponse, canAddResponse] = await Promise.all([
        getAccounts(),
        canAddSubAccount(),
      ]);
      
      if (accountsResponse.success && accountsResponse.data) {
        setAccounts(accountsResponse.data.accounts);
        setStatistics(accountsResponse.data.statistics);
      }
      
      if (canAddResponse.success && canAddResponse.data) {
        setCanAddAccount(canAddResponse.data.can_add);
      }
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      Alert.alert('Error', 'Failed to load accounts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAccounts();
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Username copied: ${text}`, ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', `Username "${text}" copied to clipboard`);
    }
  };

  const handleTransfer = async () => {
    if (!fromAccount) {
      Alert.alert('Error', 'Please select a source account');
      return;
    }
    if (!toAccount) {
      Alert.alert('Error', 'Please select a destination account');
      return;
    }
    if (fromAccount === toAccount) {
      Alert.alert('Error', 'Source and destination accounts must be different');
      return;
    }
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Transfer £${amount.toFixed(2)} from ${fromAccount} to ${toAccount}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Transfer',
          onPress: async () => {
            setIsTransferring(true);
            try {
              const response = await transferFunds(fromAccount, toAccount, amount);
              if (response.success) {
                Alert.alert('Success', response.message || 'Transfer completed successfully');
                setShowTransferModal(false);
                resetTransferForm();
                fetchAccounts();
              } else {
                Alert.alert('Error', response.message || 'Failed to transfer funds');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to transfer funds');
            } finally {
              setIsTransferring(false);
            }
          },
        },
      ]
    );
  };

  const resetTransferForm = () => {
    setFromAccount('');
    setToAccount('');
    setTransferAmount('');
  };

  const renderAccountRow = (account: Account, index: number) => {
    const isPositiveBalance = account.wallet_balance > 0;
    
    return (
      <View 
        key={account.id} 
        style={[
          styles.tableRow, 
          account.is_master && styles.masterRow,
          index % 2 === 0 && styles.evenRow,
        ]}>
        <View style={styles.rowHeader}>
          <View style={styles.rowNumber}>
            <Text style={styles.rowNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.rowInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.contactName}>{account.contact_name}</Text>
              {account.is_master && (
                <View style={styles.masterBadge}>
                  <Text style={styles.masterBadgeText}>Master</Text>
                </View>
              )}
            </View>
            <Text style={styles.businessName}>{account.business_name}</Text>
          </View>
        </View>
        
        <View style={styles.rowDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{account.email}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailHalf}>
              <Text style={styles.detailLabel}>Daily Limit</Text>
              <Text style={styles.detailValue}>{account.daily_limit_formatted}</Text>
            </View>
            <View style={styles.detailHalf}>
              <Text style={styles.detailLabel}>Keywords</Text>
              <Text style={styles.detailValue}>{account.keywords}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailHalf}>
              <Text style={styles.detailLabel}>Wallet Balance</Text>
              <View style={[
                styles.walletBadge,
                isPositiveBalance ? styles.walletPositive : styles.walletNegative,
              ]}>
                <Text style={[
                  styles.walletBadgeText,
                  isPositiveBalance ? styles.walletTextPositive : styles.walletTextNegative,
                ]}>
                  {account.wallet_balance_formatted}
                </Text>
              </View>
            </View>
            <View style={styles.detailHalf}>
              <Text style={styles.detailLabel}>Username</Text>
              <TouchableOpacity 
                style={styles.usernameContainer}
                onPress={() => copyToClipboard(account.username)}>
                <Text style={styles.usernameText}>{account.username}</Text>
                <Text style={styles.copyIcon}>📋</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header 
          title="View Accounts" 
          onMenuPress={() => navigation.openDrawer()}
          walletBalance="£6,859.83"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
      <Header 
        title="View Accounts" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance={statistics?.total_wallet_formatted || '£0.00'}
      />
      
      <View style={styles.content}>
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

          {/* Page Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderContent}>
              <View style={styles.pageHeaderText}>
                <Text style={styles.pageHeaderTitle}>👥 View Accounts</Text>
                <Text style={styles.pageHeaderSubtitle}>Manage your master and sub-accounts, transfer funds</Text>
              </View>
            </View>
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardOrange]}>
              <Text style={styles.statValue}>{statistics?.total_accounts || 0}</Text>
              <Text style={styles.statLabel}>Total Accounts</Text>
            </View>
            <View style={[styles.statCard, styles.statCardBlue]}>
              <Text style={styles.statValue}>{statistics?.sub_accounts || 0}</Text>
              <Text style={styles.statLabel}>Sub Accounts</Text>
            </View>
            <View style={[styles.statCard, styles.statCardGreen]}>
              <Text style={styles.statValue}>{statistics?.total_wallet_formatted || '£0'}</Text>
              <Text style={styles.statLabel}>Total Balance</Text>
            </View>
          </View>

          {/* Accounts List Card */}
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderIcon}>👤</Text>
              <Text style={styles.cardHeaderTitle}>Account List</Text>
              <Text style={styles.cardHeaderCount}>{accounts.length}</Text>
            </View>
            
            <View style={styles.cardBody}>
              {accounts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyText}>No accounts found</Text>
                </View>
              ) : (
                accounts.map((account, index) => renderAccountRow(account, index))
              )}
            </View>
          </View>

          {/* Transfer Funds Card */}
          <View style={styles.transferCard}>
            <View style={styles.transferCardHeader}>
              <Text style={styles.transferCardIcon}>💸</Text>
              <Text style={styles.transferCardTitle}>Transfer Wallet Funds</Text>
            </View>
            
            <View style={styles.transferCardBody}>
              <Text style={styles.transferDescription}>
                Transfer funds between your master and sub-accounts instantly.
              </Text>
              <TouchableOpacity 
                style={styles.transferButton}
                onPress={() => setShowTransferModal(true)}>
                <Text style={styles.transferButtonIcon}>↔️</Text>
                <Text style={styles.transferButtonText}>Transfer Funds</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>

        {/* Floating Action Button - Add Sub Account */}
        {canAddAccount && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AddSubAccount')}
            activeOpacity={0.8}>
            <View style={styles.fabContent}>
              <Text style={styles.fabIcon}>+</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Transfer Modal */}
      <Modal
        visible={showTransferModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTransferModal(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTransferModal(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>💸 Transfer Wallet Funds</Text>
            <Text style={styles.modalSubtitle}>Transfer funds between accounts</Text>

            {/* From Account */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>From Account</Text>
              <View style={styles.pickerContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.accountPicker}>
                  {accounts.map(account => (
                    <TouchableOpacity
                      key={`from-${account.username}`}
                      style={[
                        styles.accountChip,
                        fromAccount === account.username && styles.accountChipSelected,
                      ]}
                      onPress={() => setFromAccount(account.username)}>
                      <Text style={[
                        styles.accountChipText,
                        fromAccount === account.username && styles.accountChipTextSelected,
                      ]}>
                        {account.username}
                      </Text>
                      <Text style={[
                        styles.accountChipBalance,
                        fromAccount === account.username && styles.accountChipTextSelected,
                      ]}>
                        {account.wallet_balance_formatted}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* To Account */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>To Account</Text>
              <View style={styles.pickerContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.accountPicker}>
                  {accounts.map(account => (
                    <TouchableOpacity
                      key={`to-${account.username}`}
                      style={[
                        styles.accountChip,
                        toAccount === account.username && styles.accountChipSelected,
                      ]}
                      onPress={() => setToAccount(account.username)}>
                      <Text style={[
                        styles.accountChipText,
                        toAccount === account.username && styles.accountChipTextSelected,
                      ]}>
                        {account.username}
                      </Text>
                      <Text style={[
                        styles.accountChipBalance,
                        toAccount === account.username && styles.accountChipTextSelected,
                      ]}>
                        {account.business_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount (£)</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
                value={transferAmount}
                onChangeText={setTransferAmount}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleTransfer}
                disabled={isTransferring}>
                {isTransferring ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.confirmButtonIcon}>✓</Text>
                    <Text style={styles.confirmButtonText}>Transfer</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowTransferModal(false);
                  resetTransferForm();
                }}
                disabled={isTransferring}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  // Page Header
  pageHeader: {
    backgroundColor: '#ea6118',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#ea6118',
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
  // Statistics Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statCardOrange: {
    borderLeftColor: '#ea6118',
  },
  statCardBlue: {
    borderLeftColor: '#3b82f6',
  },
  statCardGreen: {
    borderLeftColor: '#16a34a',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  // Data Card
  dataCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cardHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardHeaderTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  cardHeaderCount: {
    backgroundColor: '#ea6118',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBody: {
    padding: 0,
  },
  // Table Row
  tableRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  masterRow: {
    backgroundColor: 'rgba(234, 97, 24, 0.05)',
  },
  evenRow: {
    backgroundColor: '#fafafa',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  rowInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  masterBadge: {
    backgroundColor: '#ea6118',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  masterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  businessName: {
    fontSize: 13,
    color: '#64748b',
  },
  rowDetails: {
    marginLeft: 40,
  },
  detailItem: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailHalf: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 13,
    color: '#475569',
  },
  walletBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  walletPositive: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  walletNegative: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  walletBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  walletTextPositive: {
    color: '#16a34a',
  },
  walletTextNegative: {
    color: '#dc2626',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  usernameText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#64748b',
  },
  copyIcon: {
    fontSize: 12,
    marginLeft: 6,
  },
  // Empty State
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  // Transfer Card
  transferCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transferCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.2)',
  },
  transferCardIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  transferCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
  },
  transferCardBody: {
    padding: 16,
  },
  transferDescription: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  transferButton: {
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#f59e0b',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  transferButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  transferButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Floating Action Button (FAB)
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 50,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
  },
  // Form
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
  },
  accountPicker: {
    flexDirection: 'row',
  },
  accountChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 90,
  },
  accountChipSelected: {
    backgroundColor: '#ea6118',
    borderColor: '#ea6118',
  },
  accountChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 2,
  },
  accountChipBalance: {
    fontSize: 10,
    color: '#64748b',
  },
  accountChipTextSelected: {
    color: '#ffffff',
  },
  amountInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#293B50',
    textAlign: 'center',
  },
  // Modal Buttons
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  confirmButton: {
    backgroundColor: '#ea6118',
    shadowColor: '#ea6118',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#ffffff',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});

export default ViewAccountsScreen;
