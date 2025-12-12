/**
 * Wallet Service
 * Handle wallet related API calls
 */

import {API_ENDPOINTS} from './api.config';
import {get} from './apiService';

// Types
export interface WalletData {
  balance: number;
  total_wallet: number;
  server1_sent: number;
  server2_sent: number;
  total_used: number;
  currency: string;
}

export interface WalletResponse {
  status: boolean;
  message: string;
  data: WalletData;
}

/**
 * Get wallet balance and data
 * Note: showErrorToast is false because this is called on every screen change
 * and we don't want to spam the user with errors
 */
export const getWalletBalance = async (): Promise<{
  success: boolean;
  message: string;
  data?: WalletData;
}> => {
  try {
    console.log('Fetching wallet balance...');

    // Make API call - disable error toast for background refresh
    const response = await get<WalletData>(API_ENDPOINTS.WALLET, true, false);

    console.log('Wallet response:', response);

    if (response.status && response.data) {
      return {
        success: true,
        message: response.message || 'Wallet data retrieved successfully',
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || 'Failed to fetch wallet data',
    };
  } catch (error: any) {
    console.error('Get wallet error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch wallet data',
    };
  }
};

/**
 * Format wallet balance with currency symbol
 */
export const formatWalletBalance = (balance: number, currency: string = 'GBP'): string => {
  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
    INR: '₹',
  };
  
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${balance.toFixed(2)}`;
};

export default {
  getWalletBalance,
  formatWalletBalance,
};
