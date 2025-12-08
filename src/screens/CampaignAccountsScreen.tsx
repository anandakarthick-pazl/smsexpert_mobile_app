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
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface CampaignAccountsScreenProps {
  navigation: any;
}

interface Account {
  id: number;
  contactName: string;
  email: string;
  businessName: string;
  dailyLimit: number;
  walletBalance: number;
  keywords: number;
  username: string;
  isMaster: boolean;
}

const sampleAccounts: Account[] = [
  {
    id: 1,
    contactName: 'Customer',
    email: 'sabariraja@nedholdings.com',
    businessName: 'Customer',
    dailyLimit: 100,
    walletBalance: 6859.826,
    keywords: 1,
    username: 'master',
    isMaster: true,
  },
  {
    id: 2,
    contactName: 'sub1',
    email: '',
    businessName: 'sub1',
    dailyLimit: 1000,
    walletBalance: 0,
    keywords: 0,
    username: '401298b4',
    isMaster: false,
  },
  {
    id: 3,
    contactName: 'sub2',
    email: '',
    businessName: 'sub2',
    dailyLimit: 1000,
    walletBalance: 0,
    keywords: 0,
    username: '29853e13',
    isMaster: false,
  },
  {
    id: 4,
    contactName: 'sub3',
    email: '',
    businessName: 'sub3',
    dailyLimit: 1000,
    walletBalance: 0,
    keywords: 0,
    username: 'a97648a4',
    isMaster: false,
  },
];

const CampaignAccountsScreen: React.FC<CampaignAccountsScreenProps> = ({navigation}) => {
  const [accounts] = useState<Account[]>(sampleAccounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'master' | 'sub'>('all');
  
  // Transfer Modal States
  const [showTransferSheet, setShowTransferSheet] = useState(false);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Filter accounts based on search and filter type
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'master' && account.isMaster) ||
      (filterType === 'sub' && !account.isMaster);
    
    return matchesSearch && matchesFilter;
  });

  const copyToClipboard = (text: string) => {
    Alert.alert('Username', `Username: ${text}\n\n(Copy functionality available in production)`);
  };

  const handleTransfer = () => {
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

    Alert.alert(
      'Confirm Transfer',
      `Are you sure you want to transfer £${transferAmount} from ${fromAccount} to ${toAccount}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Transfer',
          onPress: () => {
            Alert.alert('Success', 'Funds transferred successfully');
            setFromAccount('');
            setToAccount('');
            setTransferAmount('');
            setShowTransferSheet(false);
          },
        },
      ]
    );
  };

  const formatBalance = (balance: number) => {
    return `£${balance.toFixed(3)}`;
  };

  const getAccountLabel = (username: string) => {
    const account = accounts.find(a => a.username === username);
    if (account) {
      return `${account.username} - ${account.contactName} (£${account.walletBalance.toFixed(2)})`;
    }
    return username;
  };

  const getAccountLabelShort = (username: string) => {
    const account = accounts.find(a => a.username === username);
    if (account) {
      return `${account.username} - ${account.contactName}`;
    }
    return username;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      <Header 
        title="View Accounts" 
        onMenuPress={() => navigation.openDrawer()}
        walletBalance="£6,859.83"
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

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
            <Text style={styles.cardHeaderIcon}>👥</Text>
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
            filteredAccounts.map((account) => (
              <View 
                key={account.id} 
                style={[styles.accountRow, account.isMaster && styles.masterRow]}>
                
                {/* Row Number & Name */}
                <View style={styles.accountMain}>
                  <View style={styles.accountNumber}>
                    <Text style={styles.accountNumberText}>{account.id}</Text>
                  </View>
                  <View style={styles.accountNameSection}>
                    <View style={styles.accountNameRow}>
                      <Text style={styles.accountName}>{account.contactName}</Text>
                      {account.isMaster && (
                        <View style={styles.masterBadge}>
                          <Text style={styles.masterBadgeText}>Master</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.businessName}>{account.businessName}</Text>
                    {account.email ? (
                      <Text style={styles.email}>{account.email}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Account Details */}
                <View style={styles.accountDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Daily Limit:</Text>
                    <Text style={styles.detailValue}>{account.dailyLimit.toLocaleString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Keywords:</Text>
                    <Text style={styles.detailValue}>{account.keywords}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Balance:</Text>
                    <View style={[
                      styles.walletBadge,
                      account.walletBalance > 0 ? styles.walletPositive : styles.walletNegative
                    ]}>
                      <Text style={[
                        styles.walletBadgeText,
                        account.walletBalance > 0 ? styles.walletPositiveText : styles.walletNegativeText
                      ]}>
                        {formatBalance(account.walletBalance)}
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

      </ScrollView>

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
              <View style={styles.formGroup}>
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
                        key={acc.id}
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
                            {acc.username} - {acc.contactName}
                          </Text>
                          <Text style={[
                            styles.dropdownItemBalance,
                            acc.walletBalance > 0 ? styles.balancePositive : styles.balanceNegative
                          ]}>
                            £{acc.walletBalance.toFixed(2)}
                          </Text>
                        </View>
                        {acc.isMaster && (
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
              <View style={styles.formGroup}>
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
                        key={acc.id}
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
                            {acc.username} - {acc.contactName}
                          </Text>
                        </View>
                        {acc.isMaster && (
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
              <View style={styles.formGroup}>
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
                  }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.transferButton}
                  onPress={handleTransfer}>
                  <Text style={styles.transferButtonIcon}>💸</Text>
                  <Text style={styles.transferButtonText}>Transfer Funds</Text>
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
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
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
    fontFamily: 'monospace',
    color: '#64748b',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  copyButtonText: {
    fontSize: 14,
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
    zIndex: 1,
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
