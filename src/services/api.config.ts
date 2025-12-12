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
  DASHBOARD_WALLET: 'dashboard/wallet',
  
  // Send SMS
  SEND_SMS: 'send-sms',
  SEND_SMS_CONTACTS: 'send-sms/contacts',
  SEND_SMS_CALCULATE: 'send-sms/calculate',
  SEND_SMS_SCHEDULE: 'send-sms/schedule',
  
  // SMS History
  RECEIVED_SMS: 'sms/received',
  SENT_SMS: 'sms/sent',
  SMS_HISTORY: 'sms/history',
  
  // Wallet & SMS Wallet Settings
  WALLET: 'wallet',
  WALLET_SETTINGS: 'wallet/settings',
  
  // Buy SMS
  BUY_SMS: 'buy-sms',
  
  // Invoices
  INVOICES: 'invoices',
  INVOICES_BY_TYPE: 'invoices/type',
  
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
