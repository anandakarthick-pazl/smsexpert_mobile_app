/**
 * Wallet Service
 * Handles SMS Wallet API calls
 */

import {get, post} from './apiService';
import {API_ENDPOINTS} from './api.config';

// Types
export interface WalletData {
  user: {
    name: string;
    company: string;
    email: string;
  };
  wallet: {
    balance: number;
    total_wallet: number;
    used: number;
    currency: string;
    currency_symbol: string;
  };
  daily_notification_settings: {
    email_reminder_enabled: boolean;
    minimum_balance: number;
    reminder_period_days: number;
  } | null;
  immediate_notification_settings: {
    immediate_email_enabled: boolean;
    notification_email: string;
  } | null;
}

export interface WalletSettings {
  email_reminder_enabled?: boolean;
  minimum_balance?: number;
  reminder_period_days?: number;
  immediate_email_enabled?: boolean;
  notification_email?: string;
}

export interface BuySmsData {
  user: {
    name: string;
    email: string;
  };
  wallet_balance: number;
  minimum_purchase_amount: number;
  vat_rate: number;
  payment: {
    can_pay_by_card: boolean;
    max_card_purchase: number;
    max_card_purchase_before_vat: number;
    payment_message: string;
  };
  features: string[];
  terms: string[];
}

export interface InvoiceCreated {
  invoice_id: number;
  invoice_ref: string;
  amount_without_vat: number;
  vat_amount: number;
  total_amount: number;
  currency: string;
  currency_symbol: string;
  status: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_ref: number;
  display_ref: string;
  date: string;
  date_formatted: string;
  amount: number;
  amount_no_vat: number;
  vat_rate: number;
  status: string;
  status_label: string;
  is_paid: boolean;
  summary: string;
  currency: string;
  currency_symbol: string;
}

export interface CreditNote {
  id: number;
  amount: number;
  invoice_id: number;
  date: string;
  date_formatted: string;
  reason: string;
  currency: string;
  currency_symbol: string;
}

export interface InvoicesData {
  summary: {
    total_invoices: number;
    total_amount: number;
    total_credit_notes: number;
    currency: string;
    currency_symbol: string;
  };
  invoices: Invoice[];
  credit_notes: CreditNote[];
}

export interface InvoiceDetail {
  invoice: {
    id: number;
    invoice_ref: string;
    date: string;
    date_formatted: string;
    is_paid: boolean;
    paid_date: string | null;
    paid_date_formatted: string | null;
    payment_method: string | null;
    subtotal: number;
    vat_rate: number;
    vat_amount: number;
    total: number;
    currency: string;
    currency_symbol: string;
  };
  customer: {
    id: number;
    name: string;
    company: string;
    email: string;
    phone: string;
    address: {
      line1: string;
      line2: string;
      town: string;
      postcode: string;
      country: string;
    };
  };
  items: Array<{
    description: string;
    subtitle: string;
    quantity: number;
    unit_price: number;
    vat_rate: number;
    total: number;
  }>;
  company_details: {
    name: string;
    address: string;
    email: string;
    website: string;
    vat_number: string;
    company_number: string;
  };
  payment_instructions: {
    bank_name: string;
    reference: string;
  } | null;
}

/**
 * Get wallet data and settings
 */
export const getWalletData = async (): Promise<{
  success: boolean;
  message: string;
  data?: WalletData;
}> => {
  try {
    const response = await get<WalletData>(API_ENDPOINTS.WALLET, true, true);

    if (response.status) {
      return {
        success: true,
        message: response.message || 'Wallet data retrieved successfully',
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || 'Failed to get wallet data',
      };
    }
  } catch (error: any) {
    console.error('Error fetching wallet data:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch wallet data',
    };
  }
};

/**
 * Update wallet notification settings
 */
export const updateWalletSettings = async (
  settings: WalletSettings,
): Promise<{success: boolean; message: string}> => {
  try {
    const response = await post<any>(
      API_ENDPOINTS.WALLET_SETTINGS,
      settings,
      true,
      true,
    );

    if (response.status) {
      return {
        success: true,
        message: response.message || 'Settings updated successfully',
      };
    } else {
      return {
        success: false,
        message: response.message || 'Failed to update settings',
      };
    }
  } catch (error: any) {
    console.error('Error updating wallet settings:', error);
    return {
      success: false,
      message: error.message || 'Failed to update settings',
    };
  }
};

/**
 * Get buy SMS page data
 */
export const getBuySmsData = async (): Promise<{
  success: boolean;
  message: string;
  data?: BuySmsData;
}> => {
  try {
    const response = await get<BuySmsData>(API_ENDPOINTS.BUY_SMS, true, true);

    if (response.status) {
      return {
        success: true,
        message: response.message || 'Buy SMS data retrieved successfully',
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || 'Failed to get buy SMS data',
      };
    }
  } catch (error: any) {
    console.error('Error fetching buy SMS data:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch buy SMS data',
    };
  }
};

/**
 * Create invoice for SMS purchase
 */
export const createInvoice = async (
  amount: number,
): Promise<{
  success: boolean;
  message: string;
  data?: InvoiceCreated;
}> => {
  try {
    const response = await post<InvoiceCreated>(
      API_ENDPOINTS.BUY_SMS,
      {amount},
      true,
      true,
    );

    if (response.status) {
      return {
        success: true,
        message: response.message || 'Invoice created successfully',
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || 'Failed to create invoice',
      };
    }
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return {
      success: false,
      message: error.message || 'Failed to create invoice',
    };
  }
};

/**
 * Get all invoices
 */
export const getInvoices = async (): Promise<{
  success: boolean;
  message: string;
  data?: InvoicesData;
}> => {
  try {
    const response = await get<InvoicesData>(API_ENDPOINTS.INVOICES, true, true);

    if (response.status) {
      return {
        success: true,
        message: response.message || 'Invoices retrieved successfully',
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || 'Failed to get invoices',
      };
    }
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch invoices',
    };
  }
};

/**
 * Get single invoice details
 */
export const getInvoiceDetail = async (
  invoiceId: number,
): Promise<{
  success: boolean;
  message: string;
  data?: InvoiceDetail;
}> => {
  try {
    const response = await get<InvoiceDetail>(
      `${API_ENDPOINTS.INVOICES}/${invoiceId}`,
      true,
      true,
    );

    if (response.status) {
      return {
        success: true,
        message: response.message || 'Invoice details retrieved successfully',
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || 'Failed to get invoice details',
      };
    }
  } catch (error: any) {
    console.error('Error fetching invoice details:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch invoice details',
    };
  }
};

/**
 * Format currency display
 */
export const formatCurrency = (
  amount: number,
  symbol: string = '£',
): string => {
  return `${symbol}${amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Get wallet balance (simplified for dashboard)
 */
export const getWalletBalance = async (): Promise<{
  success: boolean;
  message: string;
  data?: {
    balance: number;
    currency: string;
  };
}> => {
  try {
    const response = await get<WalletData>(API_ENDPOINTS.WALLET, true, true);

    if (response.status && response.data) {
      return {
        success: true,
        message: 'Wallet balance retrieved successfully',
        data: {
          balance: response.data.wallet.balance,
          currency: response.data.wallet.currency || 'GBP',
        },
      };
    } else {
      return {
        success: false,
        message: response.message || 'Failed to get wallet balance',
      };
    }
  } catch (error: any) {
    console.error('Error fetching wallet balance:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch wallet balance',
    };
  }
};

/**
 * Format wallet balance for display
 */
export const formatWalletBalance = (
  balance: number,
  currency: string = 'GBP',
): string => {
  const symbol = currency === 'GBP' ? '£' : currency;
  return `${symbol}${balance.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
