/**
 * Buy SMS Screen
 * Purchase SMS credits and create invoice
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getBuySmsData,
  createInvoice,
  formatCurrency,
  BuySmsData,
} from '../services/walletService';

interface Props {
  navigation: any;
}

const BuySmsScreen: React.FC<Props> = ({navigation}) => {
  const onMenuPress = () => navigation.openDrawer();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<BuySmsData | null>(null);
  const [amount, setAmount] = useState('500');
  const [amountError, setAmountError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await getBuySmsData();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching buy SMS data:', error);
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

  const validateAmount = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 100) {
      setAmountError('Minimum purchase amount is £100');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setAmount(cleanValue);
    if (cleanValue) {
      validateAmount(cleanValue);
    } else {
      setAmountError('');
    }
  };

  const calculateTotal = (): {subtotal: number; vat: number; total: number} => {
    const subtotal = parseFloat(amount) || 0;
    const vat = subtotal * 0.2;
    const total = subtotal + vat;
    return {subtotal, vat, total};
  };

  const handleBuySms = async () => {
    if (!validateAmount(amount)) {
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `We will generate and email an SMS Expert invoice for £${amount} + VAT.\n\nAre you sure?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            setSubmitting(true);
            try {
              const response = await createInvoice(parseFloat(amount));
              if (response.success && response.data) {
                Alert.alert(
                  'Success',
                  `Invoice #${response.data.invoice_ref} created successfully!\n\nConfirmation email has been sent to your registered email address.`,
                  [
                    {
                      text: 'View Invoices',
                      onPress: () => navigation.navigate('Invoices'),
                    },
                    {text: 'OK'},
                  ],
                );
              } else {
                Alert.alert('Error', response.message);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to create invoice');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const {subtotal, vat, total} = calculateTotal();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#293B50" />
        <Header title="Buy SMS" onMenuPress={onMenuPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea6118" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      <Header title="Buy SMS" onMenuPress={onMenuPress} />
      
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
        
        {/* Current Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceIcon}>💰</Text>
            <Text style={styles.balanceLabel}>Current Balance</Text>
          </View>
          <Text style={styles.balanceValue}>
            {formatCurrency(data?.wallet_balance || 0)}
          </Text>
        </View>

        {/* Purchase Form */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>🛒</Text>
            <Text style={styles.cardTitle}>Purchase SMS Credits</Text>
          </View>

          <Text style={styles.welcomeText}>
            You are logged in as: {data?.user?.name}
          </Text>

          {/* Payment Info */}
          <View style={styles.paymentInfoBox}>
            <Text style={styles.paymentInfoIcon}>
              {data?.payment?.can_pay_by_card ? '💳' : '🏦'}
            </Text>
            <Text style={styles.paymentInfoText}>
              {data?.payment?.payment_message}
            </Text>
          </View>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Purchase Amount (£)</Text>
            <Text style={styles.inputHint}>
              Minimum: £{data?.minimum_purchase_amount || 100}
            </Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencyPrefix}>£</Text>
              <TextInput
                style={[styles.amountInput, amountError ? styles.inputError : null]}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#94a3b8"
              />
            </View>
            {amountError ? (
              <Text style={styles.errorText}>{amountError}</Text>
            ) : null}
          </View>

          {/* Price Summary */}
          <View style={styles.priceSummary}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>VAT (20%)</Text>
              <Text style={styles.priceValue}>{formatCurrency(vat)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          {/* Buy Button */}
          <TouchableOpacity
            style={[styles.buyButton, submitting && styles.buyButtonDisabled]}
            onPress={handleBuySms}
            disabled={submitting || !amount || !!amountError}>
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.buyButtonIcon}>🧾</Text>
                <Text style={styles.buyButtonText}>Buy SMS</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.secureNote}>
            <Text style={styles.secureIcon}>🔒</Text>
            <Text style={styles.secureText}>Secure SSL encrypted transaction</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293B50',
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
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  balanceCard: {
    backgroundColor: '#293b50',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293b50',
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  paymentInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#fef7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  paymentInfoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  paymentInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#293b50',
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 10,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  currencyPrefix: {
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#293b50',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
  },
  priceSummary: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#293b50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293b50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ea6118',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea6118',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  secureText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  bottomPadding: {
    height: 30,
  },
});

export default BuySmsScreen;
