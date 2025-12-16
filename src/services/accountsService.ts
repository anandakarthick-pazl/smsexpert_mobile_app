/**
 * Accounts Service
 * Handle all account management API calls
 */

import {get, post} from './apiService';

export interface Account {
  id: string;
  username: string;
  contact_name: string;
  email: string;
  business_name: string;
  daily_limit: number;
  daily_limit_formatted: string;
  wallet_balance: number;
  wallet_balance_formatted: string;
  keywords: number;
  is_master: boolean;
  type: 'master' | 'sub';
}

export interface AccountStatistics {
  total_accounts: number;
  sub_accounts: number;
  total_wallet_balance: number;
  total_wallet_formatted: string;
}

export interface AccountsData {
  accounts: Account[];
  statistics: AccountStatistics;
}

export interface AccountsResponse {
  success: boolean;
  message?: string;
  data?: AccountsData;
}

export interface TransferResponse {
  success: boolean;
  message?: string;
  data?: {
    from_account: {
      username: string;
      business_name: string;
    };
    to_account: {
      username: string;
      business_name: string;
    };
    amount: number;
    amount_formatted: string;
  };
}

export interface CanAddResponse {
  success: boolean;
  message?: string;
  data?: {
    can_add: boolean;
    message: string;
  };
}

export interface NewAccountData {
  contact_name: string;
  business_name: string;
  email: string;
  phone?: string;
  mobile?: string;
}

export interface CreateAccountResponse {
  success: boolean;
  message?: string;
  data?: {
    username: string;
    password: string;
    contact_name: string;
    business_name: string;
    email: string;
  };
}

/**
 * Get all accounts (master and sub-accounts)
 */
export const getAccounts = async (): Promise<AccountsResponse> => {
  try {
    const response = await get('accounts');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Accounts Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load accounts',
    };
  }
};

/**
 * Check if user can add sub-accounts
 */
export const canAddSubAccount = async (): Promise<CanAddResponse> => {
  try {
    const response = await get('accounts/can-add');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Can Add SubAccount Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to check permissions',
    };
  }
};

/**
 * Transfer wallet funds between accounts
 */
export const transferFunds = async (
  fromAccount: string,
  toAccount: string,
  amount: number
): Promise<TransferResponse> => {
  try {
    const response = await post('accounts/transfer', {
      from_account: fromAccount,
      to_account: toAccount,
      amount: amount,
    });
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Transfer Funds Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to transfer funds',
    };
  }
};

/**
 * Create new sub-account
 */
export const createSubAccount = async (
  accountData: NewAccountData
): Promise<CreateAccountResponse> => {
  try {
    const response = await post('accounts', accountData);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Create SubAccount Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create sub-account',
    };
  }
};
