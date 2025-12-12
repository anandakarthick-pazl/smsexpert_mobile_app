/**
 * API Configuration
 * Base URL and API endpoints
 */

export const API_CONFIG = {
  // Your computer's IP address
  BASE_URL: 'http://192.168.29.179:8000/api/mobile/',
  TIMEOUT: 30000, // 30 seconds
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: 'auth/login',
  LOGOUT: 'auth/logout',
  LOGOUT_ALL: 'auth/logout-all',
  CHANGE_PASSWORD: 'auth/change-password',
  PUSH_TOKEN: 'auth/push-token',
  
  // Dashboard
  DASHBOARD: 'dashboard',
  WALLET: 'dashboard/wallet',
  
  // SMS
  SEND_SMS: 'sms/send',
  RECEIVED_SMS: 'sms/received',
  SENT_SMS: 'sms/sent',
  
  // Wallet
  WALLET_HISTORY: 'wallet/history',
  
  // Groups
  GROUPS: 'groups',
  
  // Keywords
  KEYWORDS: 'keywords',
  
  // Numbers
  NUMBERS: 'numbers',
  
  // Profile
  PROFILE: 'profile',
  UPDATE_PROFILE: 'profile/update',
  
  // Contracts
  CONTRACTS: 'contracts',
  
  // Invoices
  INVOICES: 'invoices',
  
  // Blacklist
  BLACKLIST: 'blacklist',
  
  // Delivery Receipt
  DELIVERY_RECEIPT: 'delivery-receipt',
  
  // Campaign
  CAMPAIGN_DASHBOARD: 'campaign/dashboard',
  CAMPAIGN_QUICK: 'campaign/quick',
  CAMPAIGN_BULK: 'campaign/bulk',
  CAMPAIGN_HISTORY: 'campaign/history',
  CAMPAIGN_BLACKLIST: 'campaign/blacklist',
  CAMPAIGN_ACCOUNTS: 'campaign/accounts',
  CAMPAIGN_ADD_ACCOUNT: 'campaign/accounts/add',
  CAMPAIGN_TRANSFER: 'campaign/transfer',
};

export default API_CONFIG;
