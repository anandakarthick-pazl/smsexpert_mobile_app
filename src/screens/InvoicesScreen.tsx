/**
 * Invoices Screen
 * List all invoices and credit notes
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Header from '../components/Header';
import {
  getInvoices,
  formatCurrency,
  InvoicesData,
  Invoice,
  CreditNote,
} from '../services/walletService';

interface Props {
  navigation: any;
}

const InvoicesScreen: React.FC<Props> = ({navigation}) => {
  const onMenuPress = () => navigation.openDrawer();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<InvoicesData | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'proforma' | 'credits'>('all');

  const fetchData = useCallback(async () => {
    try {
      const response = await getInvoices();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const getFilteredInvoices = (): Invoice[] => {
    if (!data?.invoices) return [];
    
    switch (activeTab) {
      case 'paid':
        return data.invoices.filter(inv => inv.is_paid);
      case 'proforma':
        return data.invoices.filter(inv => !inv.is_paid);
      default:
        return data.invoices;
    }
  };

  const handleInvoicePress = (invoice: Invoice) => {
    navigation.navigate('InvoiceDetail', {invoiceId: invoice.invoice_ref});
  };

  const renderInvoiceItem = (invoice: Invoice) => (
    <TouchableOpacity
      key={invoice.id}
      style={styles.invoiceItem}
      onPress={() => handleInvoicePress(invoice)}
      activeOpacity={0.7}>
      <View style={styles.invoiceLeft}>
        <View style={styles.invoiceIconContainer}>
          <Text style={styles.invoiceIcon}>🧾</Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceRef}>#{invoice.display_ref}</Text>
          <Text style={styles.invoiceDate}>{invoice.date_formatted}</Text>
        </View>
      </View>
      <View style={styles.invoiceRight}>
        <Text style={styles.invoiceAmount}>{formatCurrency(invoice.amount)}</Text>
        <View
          style={[
            styles.statusBadge,
            invoice.is_paid ? styles.statusPaid : styles.statusPending,
          ]}>
          <Text
            style={[
              styles.statusText,
              invoice.is_paid ? styles.statusTextPaid : styles.statusTextPending,
            ]}>
            {invoice.status_label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCreditNoteItem = (note: CreditNote) => (
    <View key={note.id} style={styles.creditNoteItem}>
      <View style={styles.invoiceLeft}>
        <View style={[styles.invoiceIconContainer, styles.creditNoteIconBg]}>
          <Text style={styles.invoiceIcon}>📝</Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceRef}>Credit Note #{note.id}</Text>
          <Text style={styles.invoiceDate}>{note.date_formatted}</Text>
          <Text style={styles.creditNoteReason}>{note.reason}</Text>
        </View>
      </View>
      <View style={styles.invoiceRight}>
        <Text style={styles.creditNoteAmount}>-{formatCurrency(note.amount)}</Text>
        <Text style={styles.creditNoteInvoice}>Against: #{note.invoice_id}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Invoices" onMenuPress={onMenuPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const filteredInvoices = getFilteredInvoices();
  const paidCount = data?.invoices.filter(inv => inv.is_paid).length || 0;
  const proformaCount = data?.invoices.filter(inv => !inv.is_paid).length || 0;

  return (
    <View style={styles.container}>
      <Header title="Invoices" onMenuPress={onMenuPress} />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ea6118']}
          />
        }
        showsVerticalScrollIndicator={false}>
        
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{data?.summary.total_invoices || 0}</Text>
            <Text style={styles.summaryLabel}>Total Invoices</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {formatCurrency(data?.summary.total_amount || 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Amount</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{data?.summary.total_credit_notes || 0}</Text>
            <Text style={styles.summaryLabel}>Credit Notes</Text>
          </View>
        </View>

        {/* Tab Filter */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}>
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All ({data?.invoices.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'paid' && styles.tabActive]}
            onPress={() => setActiveTab('paid')}>
            <Text style={[styles.tabText, activeTab === 'paid' && styles.tabTextActive]}>
              Paid ({paidCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'proforma' && styles.tabActive]}
            onPress={() => setActiveTab('proforma')}>
            <Text style={[styles.tabText, activeTab === 'proforma' && styles.tabTextActive]}>
              Pro Forma ({proformaCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'credits' && styles.tabActive]}
            onPress={() => setActiveTab('credits')}>
            <Text style={[styles.tabText, activeTab === 'credits' && styles.tabTextActive]}>
              Credits ({data?.credit_notes.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>👆</Text>
          <Text style={styles.infoText}>
            Tap on an invoice to view details
          </Text>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'credits' ? (
          <View style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Credit Notes</Text>
            </View>
            {data?.credit_notes && data.credit_notes.length > 0 ? (
              data.credit_notes.map(note => renderCreditNoteItem(note))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyTitle}>No Credit Notes</Text>
                <Text style={styles.emptyText}>
                  You don't have any credit notes yet.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                {activeTab === 'all'
                  ? 'All Invoices'
                  : activeTab === 'paid'
                  ? 'Paid Invoices'
                  : 'Pro Forma Invoices'}
              </Text>
            </View>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map(invoice => renderInvoiceItem(invoice))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🧾</Text>
                <Text style={styles.emptyTitle}>No Invoices Found</Text>
                <Text style={styles.emptyText}>
                  {activeTab === 'paid'
                    ? "You don't have any paid invoices yet."
                    : activeTab === 'proforma'
                    ? "You don't have any pending invoices."
                    : "You don't have any invoices yet."}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Buy SMS Button */}
        <TouchableOpacity
          style={styles.buySmsButton}
          onPress={() => navigation.navigate('BuySms')}>
          <Text style={styles.buySmsIcon}>🛒</Text>
          <Text style={styles.buySmsText}>Buy More SMS</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ea6118',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#ea6118',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
  },
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  listHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293b50',
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  invoiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fef7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  invoiceIcon: {
    fontSize: 22,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceRef: {
    fontSize: 15,
    fontWeight: '700',
    color: '#293b50',
    marginBottom: 2,
  },
  invoiceDate: {
    fontSize: 13,
    color: '#64748b',
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293b50',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextPaid: {
    color: '#16a34a',
  },
  statusTextPending: {
    color: '#d97706',
  },
  creditNoteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  creditNoteIconBg: {
    backgroundColor: '#fef2f2',
  },
  creditNoteReason: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  creditNoteAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 4,
  },
  creditNoteInvoice: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  buySmsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea6118',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  buySmsIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  buySmsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 30,
  },
});

export default InvoicesScreen;
