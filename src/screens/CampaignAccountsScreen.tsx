import React, {useState, useCallback, useEffect} from 'react';
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
  Pressable,
  ActivityIndicator,
  RefreshControl,
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

interface CampaignAccountsScreenProps {
  navigation: any;
}

const CampaignAccountsScreen: React.FC<CampaignAccountsScreenProps> = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [statistics, setStatistics] = useState<AccountStatistics | null>(null);
  const [canAddAccount, setCanAddAccount] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'master' | 'sub'>('all');
  
  // Transfer Modal States
  const [showTransferSheet, setShowTransferSheet] = useState(false);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
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
      } else {
        console.error('Failed to fetch accounts:', accountsResponse.message);
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

  // Filter accounts based on search and filter type
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.business_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'master' && account.is_master) ||
      (filterType === 'sub' && !account.is_master);
    
    return matchesSearch && matchesFilter;
  });

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
      Alert.alert('Error', 'Please select source account');
      return;
    }
    if (!toAccount) {
      Alert.alert('Error', 'Please select destination account');
      return;
    }
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (fromAccount === toAccount) {
      Alert.alert('Error', 'Source and destination accounts cannot be the same');
      return;
    }

    const amount = parseFloat(transferAmount);

    Alert.alert(
      'Confirm Transfer',
      `Are you sure you want to transfer £${amount.toFixed(2)} from ${fromAccount} to ${toAccount}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Transfer',
          onPress: async () => {
            setIsTransferring(true);
            try {
              const response = await transferFunds(fromAccount, toAccount, amount);
              
              if (response.success) {
                Alert.alert('Success', response.message || 'Funds transferred successfully');
                setFromAccount('');
                setToAccount('');
                setTransferAmount('');
                setShowTransferSheet(false);
                fetchAccounts(); // Refresh accounts
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

  const handleAddAccount = () => {
    if (canAddAccount) {
      navigation.navigate('CampaignAddAccount');
    } else {
      Alert.alert(
        'Permission Denied',
        'You do not have permission to add sub-accounts. Only master accounts can create sub-accounts.'
      );
    }
  };

  const getAccountLabel = (username: string) => {
    const account = accounts.find(a => a.username === username);
    if (account) {
      return `${account.username} - ${account.contact_name} (${account.wallet_balance_formatted})`;
    }
    return username;
  };

  const getAccountLabelShort = (username: string) => {
    const account = accounts.find(a => a.username === username);
    if (account) {
      return `${account.username} - ${account.contact_name}`;
    }
    return username;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
        <Header 
          title="View Accounts" 
          onMenuPress={() => navigation.openDrawer()}
          walletBalance="£0.00"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
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
      
      <View style={styles.contentWrapper}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7c3aed']}
              tintColor="#7c3aed"
            />
          }>

          {/* Statistics Cards */}
          {statistics && (
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statCardPurple]}>
                <Text style={styles.statValue}>{statistics.total_accounts}</Text>
                <Text style={styles.statLabel}>Total Accounts</Text>
              </View>
              <View style={[styles.statCard, styles.statCardBlue]}>
                <Text style={styles.statValue}>{statistics.sub_accounts}</Text>
                <Text style={styles.statLabel}>Sub Accounts</Text>
              </View>
              <View style={[styles.statCard, styles.statCardGreen]}>
                <Text style={styles.statValueSmall}>{statistics.total_wallet_formatted}</Text>
                <Text style={styles.statLabel}>Total Balance</Text>
              </View>
            </View>
          )}

          {/* Filter Card */}
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterHeaderIcon}>🔍</Text>
              <Text style={styles.filterHeaderTitle}>Filter Accounts</Text>
              <TouchableOpacity 
                style={styles.transferIconButton}
                onPress={() => setShowTransferSheet(true)}>
                <Text style={styles.transferIconText}>💸</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterBody}>
              {/* Search Input */}
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name, username..."
                  placeholderTextColor="#94a3b8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Type Buttons */}
              <View style={styles.filterTypeRow}>
                <TouchableOpacity
                  style={[
                    styles.filterTypeButton,
                    filterType === 'all' && styles.filterTypeButtonActive
                  ]}
                  onPress={() => setFilterType('all')}>
                  <Text style={[
                    styles.filterTypeText,
                    filterType === 'all' && styles.filterTypeTextActive
                  ]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterTypeButton,
                    filterType === 'master' && styles.filterTypeButtonActiveMaster
                  ]}
                  onPress={() => setFilterType('master')}>
                  <Text style={[
                    styles.filterTypeText,
                    filterType === 'master' && styles.filterTypeTextActive
                  ]}>Master</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterTypeButton,
                    filterType === 'sub' && styles.filterTypeButtonActiveSub
                  ]}
                  onPress={() => setFilterType('sub')}>
                  <Text style={[
                    styles.filterTypeText,
                    filterType === 'sub' && styles.filterTypeTextActive
                  ]}>Sub-Accounts</Text>
                </TouchableOpacity>
              </View>

              {/* Results Count & Reset */}
              <View style={styles.filterFooter}>
                <Text style={styles.resultsCount}>
                  {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''} found
                </Text>
                {(searchQuery || filterType !== 'all') && (
                  <TouchableOpacity onPress={resetFilters}>
                    <Text style={styles.resetText}>🔄 Reset</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Accounts List Card */}
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderIcon}>👤</Text>
              <Text style={styles.cardHeaderTitle}>Account List</Text>
            </View>

            {/* Account Items */}
            {filteredAccounts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>No accounts found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
              </View>
            ) : (
              filteredAccounts.map((account, index) => (
                <View 
                  key={account.id} 
                  style={[styles.accountRow, account.is_master && styles.masterRow]}>
                  
                  {/* Row Number & Name */}
                  <View style={styles.accountMain}>
                    <View style={styles.accountNumber}>
                      <Text style={styles.accountNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.accountNameSection}>
                      <View style={styles.accountNameRow}>
                        <Text style={styles.accountName}>{account.contact_name}</Text>
                        {account.is_master && (
                          <View style={styles.masterBadge}>
                            <Text style={styles.masterBadgeText}>Master</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.businessName}>{account.business_name}</Text>
                      {account.email ? (
                        <Text style={styles.email}>{account.email}</Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Account Details */}
                  <View style={styles.accountDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Daily Limit:</Text>
                      <Text style={styles.detailValue}>{account.daily_limit_formatted}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Keywords:</Text>
                      <Text style={styles.detailValue}>{account.keywords}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Balance:</Text>
                      <View style={[
                        styles.walletBadge,
                        account.wallet_balance > 0 ? styles.walletPositive : styles.walletNegative
                      ]}>
                        <Text style={[
                          styles.walletBadgeText,
                          account.wallet_balance > 0 ? styles.walletPositiveText : styles.walletNegativeText
                        ]}>
                          {account.wallet_balance_formatted}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Username Row */}
                  <View style={styles.usernameRow}>
                    <View style={styles.usernameBadge}>
                      <Text style={styles.usernameText}>{account.username}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => copyToClipboard(account.username)}>
                      <Text style={styles.copyButtonText}>📋</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Transfer Funds Card */}
          <View style={styles.transferCard}>
            <View style={styles.transferCardHeader}>
              <Text style={styles.transferCardIcon}>↔️</Text>
              <Text style={styles.transferCardTitle}>Transfer Wallet Funds Between Accounts</Text>
            </View>
            <View style={styles.transferCardBody}>
              <Text style={styles.transferDescription}>
                Transfer funds between your master and sub-accounts instantly.
              </Text>
              <TouchableOpacity 
                style={styles.transferMainButton}
                onPress={() => setShowTransferSheet(true)}>
                <Text style={styles.transferMainButtonIcon}>💸</Text>
                <Text style={styles.transferMainButtonText}>Transfer Funds</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleAddAccount}
          activeOpacity={0.8}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Transfer Funds Bottom Sheet */}
      <Modal
        visible={showTransferSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTransferSheet(false)}>
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => {
            setShowFromDropdown(false);
            setShowToDropdown(false);
          }}>
          <Pressable 
            style={styles.bottomSheet}
            onPress={() => {
              setShowFromDropdown(false);
              setShowToDropdown(false);
            }}>
            <View style={styles.bottomSheetHandle} />
            
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetIcon}>💸</Text>
              <Text style={styles.bottomSheetTitle}>Transfer Wallet Funds</Text>
            </View>

            <ScrollView 
              style={styles.bottomSheetScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">

              {/* From Account Dropdown */}
              <View style={[styles.formGroup, {zIndex: 3}]}>
                <Text style={styles.formLabel}>From Account *</Text>
                <TouchableOpacity
                  style={styles.selectBox}
                  onPress={() => {
                    setShowFromDropdown(!showFromDropdown);
                    setShowToDropdown(false);
                  }}>
                  <Text style={[
                    styles.selectBoxText,
                    !fromAccount && styles.selectBoxPlaceholder
                  ]}>
                    {fromAccount ? getAccountLabel(fromAccount) : 'Select source account'}
                  </Text>
                  <Text style={styles.selectBoxArrow}>{showFromDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                
                {showFromDropdown && (
                  <View style={styles.dropdown}>
                    {accounts.map((acc) => (
                      <TouchableOpacity
                        key={`from-${acc.id}`}
                        style={[
                          styles.dropdownItem,
                          fromAccount === acc.username && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setFromAccount(acc.username);
                          setShowFromDropdown(false);
                        }}>
                        <View style={styles.dropdownItemContent}>
                          <Text style={[
                            styles.dropdownItemText,
                            fromAccount === acc.username && styles.dropdownItemTextSelected
                          ]}>
                            {acc.username} - {acc.contact_name}
                          </Text>
                          <Text style={[
                            styles.dropdownItemBalance,
                            acc.wallet_balance > 0 ? styles.balancePositive : styles.balanceNegative
                          ]}>
                            {acc.wallet_balance_formatted}
                          </Text>
                        </View>
                        {acc.is_master && (
                          <View style={styles.dropdownMasterBadge}>
                            <Text style={styles.dropdownMasterText}>Master</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* To Account Dropdown */}
              <View style={[styles.formGroup, {zIndex: 2}]}>
                <Text style={styles.formLabel}>To Account *</Text>
                <TouchableOpacity
                  style={styles.selectBox}
                  onPress={() => {
                    setShowToDropdown(!showToDropdown);
                    setShowFromDropdown(false);
                  }}>
                  <Text style={[
                    styles.selectBoxText,
                    !toAccount && styles.selectBoxPlaceholder
                  ]}>
                    {toAccount ? getAccountLabelShort(toAccount) : 'Select destination account'}
                  </Text>
                  <Text style={styles.selectBoxArrow}>{showToDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                
                {showToDropdown && (
                  <View style={styles.dropdown}>
                    {accounts.map((acc) => (
                      <TouchableOpacity
                        key={`to-${acc.id}`}
                        style={[
                          styles.dropdownItem,
                          toAccount === acc.username && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setToAccount(acc.username);
                          setShowToDropdown(false);
                        }}>
                        <View style={styles.dropdownItemContent}>
                          <Text style={[
                            styles.dropdownItemText,
                            toAccount === acc.username && styles.dropdownItemTextSelected
                          ]}>
                            {acc.username} - {acc.contact_name}
                          </Text>
                        </View>
                        {acc.is_master && (
                          <View style={styles.dropdownMasterBadge}>
                            <Text style={styles.dropdownMasterText}>Master</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Transfer Amount */}
              <View style={[styles.formGroup, {zIndex: 1}]}>
                <Text style={styles.formLabel}>Amount (£) *</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.amountCurrency}>£</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    value={transferAmount}
                    onChangeText={setTransferAmount}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowTransferSheet(false);
                    setFromAccount('');
                    setToAccount('');
                    setTransferAmount('');
                  }}
                  disabled={isTransferring}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.transferButton, isTransferring && styles.transferButtonDisabled]}
                  onPress={handleTransfer}
                  disabled={isTransferring}>
                  {isTransferring ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.transferButtonIcon}>💸</Text>
                      <Text style={styles.transferButtonText}>Transfer</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293B50',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
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
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for FAB
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
  statCardPurple: {
    borderLeftColor: '#7c3aed',
  },
  statCardBlue: {
    borderLeftColor: '#3b82f6',
  },
  statCardGreen: {
    borderLeftColor: '#16a34a',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 4,
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  // Filter Card
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  filterHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
    flex: 1,
  },
  transferIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferIconText: {
    fontSize: 18,
  },
  filterBody: {
    padding: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#293B50',
  },
  clearIcon: {
    fontSize: 14,
    color: '#94a3b8',
    padding: 4,
  },
  filterTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTypeButtonActive: {
    backgroundColor: '#293B50',
    borderColor: '#293B50',
  },
  filterTypeButtonActiveMaster: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  filterTypeButtonActiveSub: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
  },
  filterTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTypeTextActive: {
    color: '#ffffff',
  },
  filterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 12,
    color: '#64748b',
  },
  resetText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '600',
  },
  // Data Card
  dataCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  // Empty State
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94a3b8',
  },
  // Account Row
  accountRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  masterRow: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  accountMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  accountNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  accountNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  accountNameSection: {
    flex: 1,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293B50',
  },
  masterBadge: {
    backgroundColor: '#7c3aed',
    paddingVertical: 2,
    paddingHorizontal: 8,
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
  email: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  // Account Details
  accountDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#293B50',
  },
  walletBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
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
    fontSize: 12,
    fontWeight: '600',
  },
  walletPositiveText: {
    color: '#16a34a',
  },
  walletNegativeText: {
    color: '#dc2626',
  },
  // Username Row
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameBadge: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  usernameText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#64748b',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  copyButtonText: {
    fontSize: 14,
  },
  // Transfer Card
  transferCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
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
    flex: 1,
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
  transferMainButton: {
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
  transferMainButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  transferMainButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
    marginTop: -2,
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
    maxHeight: '85%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomSheetIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293B50',
  },
  bottomSheetScroll: {
    flexGrow: 0,
  },
  // Form Elements
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#293B50',
    marginBottom: 8,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
  },
  selectBoxText: {
    fontSize: 14,
    color: '#293B50',
    flex: 1,
  },
  selectBoxPlaceholder: {
    color: '#94a3b8',
  },
  selectBoxArrow: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#293B50',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  dropdownItemBalance: {
    fontSize: 12,
    marginTop: 2,
  },
  balancePositive: {
    color: '#16a34a',
  },
  balanceNegative: {
    color: '#dc2626',
  },
  dropdownMasterBadge: {
    backgroundColor: '#7c3aed',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  dropdownMasterText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#ffffff',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  amountCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    paddingHorizontal: 14,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
  },
  amountInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#293B50',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  transferButton: {
    flex: 2,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  transferButtonDisabled: {
    backgroundColor: '#fcd34d',
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
});

export default CampaignAccountsScreen;
