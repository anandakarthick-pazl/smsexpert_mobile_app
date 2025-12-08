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
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';

interface InvoicesScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    openDrawer: () => void;
    goBack: () => void;
  };
}

interface InvoiceItem {
  id: number;
  date: string;
  amount: string;
}

const InvoicesScreen: React.FC<InvoicesScreenProps> = ({navigation}) => {
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  
  // Filter states
  const [filterInvoiceNumber, setFilterInvoiceNumber] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterAmountMin, setFilterAmountMin] = useState('');
  const [filterAmountMax, setFilterAmountMax] = useState('');

  // Invoice data
  const [invoices] = useState<InvoiceItem[]>([
    {id: 39, date: '6 Nov 2025', amount: '£600.00'},
    {id: 38, date: '6 Nov 2025', amount: '£600.00'},
    {id: 37, date: '6 Nov 2025', amount: '£600.00'},
    {id: 36, date: '6 Nov 2025', amount: '£600.00'},
    {id: 35, date: '6 Nov 2025', amount: '£600.00'},
    {id: 34, date: '6 Nov 2025', amount: '£1,200.00'},
    {id: 33, date: '6 Nov 2025', amount: '£120.00'},
    {id: 32, date: '6 Nov 2025', amount: '£600.00'},
    {id: 31, date: '6 Nov 2025', amount: '£600.00'},
    {id: 29, date: '5 Nov 2025', amount: '£600.00'},
    {id: 28, date: '5 Nov 2025', amount: '£600.00'},
    {id: 27, date: '5 Nov 2025', amount: '£600.00'},
    {id: 26, date: '5 Nov 2025', amount: '£600.00'},
    {id: 22, date: '23 Oct 2025', amount: '£2,400.00'},
    {id: 21, date: '23 Oct 2025', amount: '£579.60'},
    {id: 19, date: '23 Oct 2025', amount: '£600.00'},
    {id: 15, date: '21 Oct 2025', amount: '£1,200.00'},
    {id: 14, date: '13 Oct 2025', amount: '£600.00'},
    {id: 13, date: '13 Oct 2025', amount: '£720.00'},
    {id: 8, date: '4 Sep 2025', amount: '£133.20'},
    {id: 3, date: '3 Sep 2025', amount: '£600.00'},
    {id: 2, date: '3 Sep 2025', amount: '£144.00'},
  ]);

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    // Filter by invoice number
    if (filterInvoiceNumber && !invoice.id.toString().includes(filterInvoiceNumber)) {
      return false;
    }
    
    // Filter by amount range
    if (filterAmountMin || filterAmountMax) {
      const amount = parseFloat(invoice.amount.replace(/[£,]/g, ''));
      if (filterAmountMin && amount < parseFloat(filterAmountMin)) {
        return false;
      }
      if (filterAmountMax && amount > parseFloat(filterAmountMax)) {
        return false;
      }
    }
    
    return true;
  });

  // Check if any filter is active
  const isFilterActive = filterInvoiceNumber || filterDateFrom || filterDateTo || filterAmountMin || filterAmountMax;

  // Clear all filters
  const clearAllFilters = () => {
    setFilterInvoiceNumber('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterAmountMin('');
    setFilterAmountMax('');
  };

  // Apply filters and close sheet
  const applyFilters = () => {
    setShowFilterSheet(false);
  };

  // Statistics
  const stats = {
    totalInvoices: 22,
    totalAmount: '£14,896.80',
    creditNotes: 0,
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleViewInvoice = (invoice: InvoiceItem) => {
    Alert.alert('View Invoice', `Opening Pro Forma Invoice #${invoice.id}\nDate: ${invoice.date}\nAmount: ${invoice.amount}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />

      <Header
        title="Invoices"
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
            <Text style={styles.headerIcon}>🧾</Text>
            <Text style={styles.headerTitle}>Invoices</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.filterButton, isFilterActive && styles.filterButtonActive]}
              onPress={() => setShowFilterSheet(true)}>
              <Text style={styles.filterButtonIcon}>🔍</Text>
              {isFilterActive && <View style={styles.filterBadge} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setShowInfoSheet(true)}>
              <Text style={styles.infoButtonIcon}>ℹ️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Cards - Separate cards in one row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statNumber}>{stats.totalInvoices}</Text>
            <Text style={styles.statLabel}>Total Invoices</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={[styles.statNumber, styles.statNumberGreen]}>{stats.totalAmount}</Text>
            <Text style={styles.statLabel}>Total Amount</Text>
          </View>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={[styles.statNumber, styles.statNumberBlue]}>{stats.creditNotes}</Text>
            <Text style={styles.statLabel}>Credit Notes</Text>
          </View>
        </View>

        {/* Invoices Card */}
        <View style={styles.invoicesCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🧾</Text>
            <Text style={styles.sectionTitle}>Your Invoices</Text>
            {isFilterActive && (
              <View style={styles.filterResultBadge}>
                <Text style={styles.filterResultText}>
                  {filteredInvoices.length} of {invoices.length}
                </Text>
              </View>
            )}
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderIcon}>🧾</Text>
              <Text style={styles.tableHeaderText}>Invoice</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderIcon}>📅</Text>
              <Text style={styles.tableHeaderText}>Date</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderIcon}>💷</Text>
              <Text style={styles.tableHeaderText}>Amount</Text>
            </View>
          </View>

          {/* Invoice List */}
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice, index) => (
              <View 
                key={invoice.id} 
                style={[
                  styles.invoiceRow,
                  index === filteredInvoices.length - 1 && styles.invoiceRowLast
                ]}>
                <TouchableOpacity
                  style={styles.invoiceLink}
                  onPress={() => handleViewInvoice(invoice)}>
                  <Text style={styles.invoiceLinkIcon}>👁️</Text>
                  <Text style={styles.invoiceLinkText}>{invoice.id}</Text>
                </TouchableOpacity>
                <View style={styles.dateDisplay}>
                  <Text style={styles.dateIcon}>📅</Text>
                  <Text style={styles.dateText}>{invoice.date}</Text>
                </View>
                <View style={styles.amountDisplay}>
                  <Text style={styles.amountIcon}>💰</Text>
                  <Text style={styles.amountText}>{invoice.amount}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsIcon}>🔍</Text>
              <Text style={styles.noResultsTitle}>No Invoices Found</Text>
              <Text style={styles.noResultsText}>No invoices match your filter criteria.</Text>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Credit Notes Section */}
        <View style={styles.creditNotesCard}>
          <View style={styles.creditNotesHeader}>
            <Text style={styles.creditNotesIcon}>🧾</Text>
            <Text style={styles.creditNotesTitle}>Credit Notes</Text>
          </View>
          <View style={styles.creditNotesContent}>
            <View style={styles.noCreditNotes}>
              <Text style={styles.noCreditNotesIcon}>📝</Text>
              <Text style={styles.noCreditNotesTitle}>No Credit Notes</Text>
              <Text style={styles.noCreditNotesText}>
                You currently have no credit notes. Credit notes will appear here if any refunds or adjustments are processed.
              </Text>
            </View>
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
                <Text style={styles.bottomSheetIcon}>🧾</Text>
                <Text style={styles.bottomSheetTitle}>Invoice Management</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInfoSheet(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* Invoice Management Overview */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.orangeBg]}>
                    <Text style={styles.infoSectionIcon}>🧾</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Invoice Management</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.orangeBorder]}>
                  <Text style={styles.infoSectionText}>
                    View and manage all your SMS Expert invoices. Click on any invoice number to view detailed Pro Forma Invoice information. You can also access your credit notes and payment history from this page.
                  </Text>
                </View>
              </View>

              {/* View Invoices */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.blueBg]}>
                    <Text style={styles.infoSectionIcon}>👁️</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>View Invoices</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.blueBorder]}>
                  <Text style={styles.infoSectionText}>
                    Click on any invoice number to view the detailed Pro Forma Invoice. This includes itemized charges, payment terms, and company details.
                  </Text>
                </View>
              </View>

              {/* Invoice History */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.greenBg]}>
                    <Text style={styles.infoSectionIcon}>📊</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Invoice History</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.greenBorder]}>
                  <Text style={styles.infoSectionText}>
                    All your past invoices are stored here for your records. You can review your payment history and track your SMS credit purchases over time.
                  </Text>
                </View>
              </View>

              {/* Credit Notes */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.yellowBg]}>
                    <Text style={styles.infoSectionIcon}>📝</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Credit Notes</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.yellowBorder]}>
                  <Text style={styles.infoSectionText}>
                    Any refunds or adjustments to your account will appear as credit notes. These can be applied to future purchases or refunded to your payment method.
                  </Text>
                </View>
              </View>

              {/* Payment Support */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <View style={[styles.infoSectionIconBox, styles.purpleBg]}>
                    <Text style={styles.infoSectionIcon}>💬</Text>
                  </View>
                  <Text style={styles.infoSectionTitle}>Payment Support</Text>
                </View>
                <View style={[styles.infoSectionContent, styles.purpleBorder]}>
                  <Text style={styles.infoSectionText}>
                    If you have any questions about your invoices or need assistance with payments, please contact our support team for help.
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

      {/* Filter Bottom Sheet Modal */}
      <Modal
        visible={showFilterSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterSheet(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            {/* Modal Header */}
            <View style={styles.filterSheetHeader}>
              <View style={styles.bottomSheetTitleRow}>
                <Text style={styles.bottomSheetIcon}>🔍</Text>
                <Text style={styles.bottomSheetTitle}>Filter Invoices</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowFilterSheet(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Filter Body */}
            <ScrollView style={styles.filterSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* Invoice Number Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Text style={styles.filterLabelIcon}>🧾</Text>
                  <Text style={styles.filterLabel}>Invoice Number</Text>
                </View>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Search by invoice number..."
                  placeholderTextColor="#94a3b8"
                  value={filterInvoiceNumber}
                  onChangeText={setFilterInvoiceNumber}
                  keyboardType="numeric"
                />
              </View>

              {/* Date Range Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Text style={styles.filterLabelIcon}>📅</Text>
                  <Text style={styles.filterLabel}>Date Range</Text>
                </View>
                <View style={styles.filterRow}>
                  <View style={styles.filterHalf}>
                    <Text style={styles.filterSubLabel}>From</Text>
                    <TextInput
                      style={styles.filterInput}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#94a3b8"
                      value={filterDateFrom}
                      onChangeText={setFilterDateFrom}
                    />
                  </View>
                  <View style={styles.filterHalf}>
                    <Text style={styles.filterSubLabel}>To</Text>
                    <TextInput
                      style={styles.filterInput}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#94a3b8"
                      value={filterDateTo}
                      onChangeText={setFilterDateTo}
                    />
                  </View>
                </View>
              </View>

              {/* Amount Range Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Text style={styles.filterLabelIcon}>💷</Text>
                  <Text style={styles.filterLabel}>Amount Range (£)</Text>
                </View>
                <View style={styles.filterRow}>
                  <View style={styles.filterHalf}>
                    <Text style={styles.filterSubLabel}>Min Amount</Text>
                    <TextInput
                      style={styles.filterInput}
                      placeholder="0.00"
                      placeholderTextColor="#94a3b8"
                      value={filterAmountMin}
                      onChangeText={setFilterAmountMin}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.filterHalf}>
                    <Text style={styles.filterSubLabel}>Max Amount</Text>
                    <TextInput
                      style={styles.filterInput}
                      placeholder="10000.00"
                      placeholderTextColor="#94a3b8"
                      value={filterAmountMax}
                      onChangeText={setFilterAmountMax}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Active Filters Info */}
              {isFilterActive && (
                <View style={styles.activeFiltersInfo}>
                  <Text style={styles.activeFiltersIcon}>ℹ️</Text>
                  <Text style={styles.activeFiltersText}>
                    Showing {filteredInvoices.length} of {invoices.length} invoices
                  </Text>
                </View>
              )}

            </ScrollView>

            {/* Filter Footer */}
            <View style={styles.filterSheetFooter}>
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={clearAllFilters}>
                <Text style={styles.clearAllButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFilterButton}
                onPress={applyFilters}>
                <Text style={styles.applyFilterButtonIcon}>✓</Text>
                <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
  },
  filterButtonIcon: {
    fontSize: 18,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626',
    borderWidth: 2,
    borderColor: '#ffffff',
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
  // Statistics Cards
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 70,
  },
  statCardOrange: {
    borderTopWidth: 3,
    borderTopColor: '#ea6118',
  },
  statCardGreen: {
    borderTopWidth: 3,
    borderTopColor: '#16a34a',
  },
  statCardBlue: {
    borderTopWidth: 3,
    borderTopColor: '#0891b2',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ea6118',
    marginBottom: 4,
    textAlign: 'center',
  },
  statNumberGreen: {
    color: '#16a34a',
  },
  statNumberBlue: {
    color: '#0891b2',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Invoices Card
  invoicesCard: {
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
    flex: 1,
  },
  filterResultBadge: {
    backgroundColor: '#0891b2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterResultText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Table Header
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeaderCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeaderIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#293B50',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Invoice Row
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  invoiceRowLast: {
    borderBottomWidth: 0,
  },
  invoiceLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef7ed',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  invoiceLinkIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  invoiceLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ea6118',
    fontFamily: 'monospace',
  },
  dateDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  dateIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#293B50',
    fontWeight: '500',
  },
  amountDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  amountIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  amountText: {
    fontSize: 13,
    color: '#15803d',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  // No Results
  noResultsContainer: {
    padding: 30,
    alignItems: 'center',
  },
  noResultsIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearFiltersButton: {
    backgroundColor: '#0891b2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Credit Notes
  creditNotesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  creditNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
  },
  creditNotesIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  creditNotesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400e',
  },
  creditNotesContent: {
    padding: 16,
  },
  noCreditNotes: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noCreditNotesIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  noCreditNotesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  noCreditNotesText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
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
  greenBg: {
    backgroundColor: '#dcfce7',
  },
  yellowBg: {
    backgroundColor: '#fef3c7',
  },
  orangeBg: {
    backgroundColor: '#fff7ed',
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
  orangeBorder: {
    borderLeftColor: '#ea6118',
  },
  purpleBorder: {
    borderLeftColor: '#8b5cf6',
  },
  infoSectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  // Filter Sheet Styles
  filterSheetHeader: {
    backgroundColor: '#0891b2',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterSheetBody: {
    padding: 20,
    maxHeight: 400,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabelIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#293B50',
  },
  filterSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  filterInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#293B50',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterHalf: {
    flex: 1,
  },
  activeFiltersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0891b2',
  },
  activeFiltersIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  activeFiltersText: {
    fontSize: 13,
    color: '#0891b2',
    fontWeight: '600',
  },
  filterSheetFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  clearAllButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clearAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  applyFilterButton: {
    flex: 2,
    backgroundColor: '#0891b2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  applyFilterButtonIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#ffffff',
  },
  applyFilterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default InvoicesScreen;
