/**
 * Invoice Detail Screen
 * View detailed invoice information
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
import {getInvoiceDetail, formatCurrency, InvoiceDetail} from '../services/walletService';

interface Props {
  navigation: any;
  route: any;
}

const InvoiceDetailScreen: React.FC<Props> = ({navigation, route}) => {
  const onMenuPress = () => navigation.openDrawer();
  const {invoiceId} = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<InvoiceDetail | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await getInvoiceDetail(invoiceId);
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching invoice detail:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Invoice Details"
          onMenuPress={onMenuPress}
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <Header
          title="Invoice Details"
          onMenuPress={onMenuPress}
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>Failed to load invoice details</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const {invoice, customer, items, company_details, payment_instructions} = data;

  return (
    <View style={styles.container}>
      <Header
        title={`Invoice #${invoice.invoice_ref}`}
        onMenuPress={onMenuPress}
        showBack
        onBackPress={() => navigation.goBack()}
      />

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
        
        {/* Invoice Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.companyName}>{company_details.name}</Text>
              <Text style={styles.companyAddress}>{company_details.address}</Text>
            </View>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerBottom}>
            <View style={styles.invoiceTitle}>
              <Text style={styles.invoiceTitleText}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>#{invoice.invoice_ref}</Text>
            </View>
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
                {invoice.is_paid ? 'PAID' : 'UNPAID'}
              </Text>
            </View>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.card}>
          <View style={styles.detailsRow}>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Bill To</Text>
              <Text style={styles.detailValue}>{customer.company || customer.name}</Text>
              <Text style={styles.detailSubtext}>{customer.name}</Text>
              {customer.address.line1 && (
                <Text style={styles.detailSubtext}>{customer.address.line1}</Text>
              )}
              {customer.address.line2 && (
                <Text style={styles.detailSubtext}>{customer.address.line2}</Text>
              )}
              {customer.address.town && (
                <Text style={styles.detailSubtext}>
                  {customer.address.town}, {customer.address.postcode}
                </Text>
              )}
              <Text style={styles.detailSubtext}>{customer.email}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Invoice Date</Text>
              <Text style={styles.detailValue}>{invoice.date_formatted}</Text>
              
              {invoice.is_paid && invoice.paid_date_formatted && (
                <>
                  <Text style={[styles.detailLabel, styles.marginTop]}>Paid Date</Text>
                  <Text style={styles.detailValue}>{invoice.paid_date_formatted}</Text>
                </>
              )}
              
              {invoice.payment_method && (
                <>
                  <Text style={[styles.detailLabel, styles.marginTop]}>Payment Method</Text>
                  <Text style={styles.detailValue}>{invoice.payment_method}</Text>
                </>
              )}
              
              <Text style={[styles.detailLabel, styles.marginTop]}>VAT Number</Text>
              <Text style={styles.detailValue}>{company_details.vat_number}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Invoice Items</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.descriptionCol]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.vatCol]}>VAT</Text>
            <Text style={[styles.tableHeaderText, styles.amountCol]}>Amount</Text>
          </View>
          
          {/* Table Rows */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.descriptionCol}>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={[styles.tableCell, styles.vatCol]}>{item.vat_rate}%</Text>
              <Text style={[styles.tableCell, styles.amountCol]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.card}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT ({invoice.vat_rate}%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.vat_amount)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {/* Payment Info (if unpaid) */}
        {!invoice.is_paid && payment_instructions && (
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentIcon}>🏦</Text>
              <Text style={styles.paymentTitle}>Payment Instructions</Text>
            </View>
            <Text style={styles.paymentText}>{payment_instructions.bank_name}</Text>
            <Text style={styles.paymentRef}>
              Reference: {payment_instructions.reference}
            </Text>
          </View>
        )}

        {/* Paid Confirmation */}
        {invoice.is_paid && (
          <View style={styles.paidCard}>
            <View style={styles.paidHeader}>
              <Text style={styles.paidIcon}>✅</Text>
              <Text style={styles.paidTitle}>Payment Received</Text>
            </View>
            <Text style={styles.paidText}>This invoice has been paid in full.</Text>
            {invoice.paid_date_formatted && (
              <Text style={styles.paidDate}>
                Payment Date: {invoice.paid_date_formatted}
              </Text>
            )}
            {invoice.payment_method && (
              <Text style={styles.paidMethod}>
                Payment Method: {invoice.payment_method}
              </Text>
            )}
          </View>
        )}

        {/* Company Footer */}
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Thank you for your business!</Text>
          <Text style={styles.footerText}>
            For any queries regarding this invoice, please contact {company_details.email}
          </Text>
          <Text style={styles.footerCompany}>
            {company_details.name} | UK Reg. {company_details.company_number} | VAT Reg. {company_details.vat_number}
          </Text>
        </View>

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ea6118',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#293b50',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  headerTop: {
    marginBottom: 16,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceTitle: {},
  invoiceTitleText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  invoiceNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusPaid: {
    backgroundColor: '#16a34a',
  },
  statusPending: {
    backgroundColor: '#dc2626',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusTextPaid: {
    color: '#ffffff',
  },
  statusTextPending: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293b50',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailSection: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293b50',
    marginBottom: 2,
  },
  detailSubtext: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  marginTop: {
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  descriptionCol: {
    flex: 2,
  },
  vatCol: {
    flex: 0.5,
    textAlign: 'center',
  },
  amountCol: {
    flex: 1,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  itemDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293b50',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  tableCell: {
    fontSize: 14,
    color: '#475569',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293b50',
  },
  grandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: '#293b50',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293b50',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ea6118',
  },
  paymentCard: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0891b2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0891b2',
  },
  paymentText: {
    fontSize: 14,
    color: '#0e7490',
    marginBottom: 8,
  },
  paymentRef: {
    fontSize: 13,
    color: '#0e7490',
    fontWeight: '600',
  },
  paidCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  paidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paidIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  paidTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16a34a',
  },
  paidText: {
    fontSize: 14,
    color: '#15803d',
    marginBottom: 8,
  },
  paidDate: {
    fontSize: 13,
    color: '#15803d',
  },
  paidMethod: {
    fontSize: 13,
    color: '#15803d',
    marginTop: 4,
  },
  footerCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293b50',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  footerCompany: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 30,
  },
});

export default InvoiceDetailScreen;
