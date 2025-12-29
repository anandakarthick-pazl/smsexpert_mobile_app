/**
 * API Configuration
 * Base URL and API endpoints
 * 
 * Environment-based configuration:
 * - local: Uses local development server (e.g., http://192.168.29.179:8000)
 * - development: Uses development server (e.g., https://dev-api.smsexpert.com)
 * - production: Uses production server (e.g., https://api.smsexpert.com)
 * 
 * To change environment, modify the .env file or use:
 * - .env.local for local development
 * - .env.development for development
 * - .env.production for production
 */

import {APP_ENV, API_BASE_URL, API_TIMEOUT} from '@env';

// Environment type
export type AppEnvironment = 'local' | 'development' | 'production';

// Current environment
export const CURRENT_ENV: AppEnvironment = APP_ENV || 'local';

// Environment-specific configurations (fallback if env vars not loaded)
const ENV_CONFIGS: Record<AppEnvironment, {baseUrl: string; timeout: number}> = {
  local: {
    baseUrl: 'https://smsexpert.nedtechnology.co.in/capi/mobile/',
    timeout: 30000,
  },
  development: {
    baseUrl: 'https://smsexpert.nedtechnology.co.in/api/mobile/',
    timeout: 30000,
  },
  production: {
    baseUrl: 'https://smsexpert.nedtechnology.co.in/api/mobile/',
    timeout: 30000,
  },
};

// Get configuration based on environment
const getConfig = () => {
  const envConfig = ENV_CONFIGS[CURRENT_ENV] || ENV_CONFIGS.local;
  
  return {
    BASE_URL: API_BASE_URL || envConfig.baseUrl,
    TIMEOUT: API_TIMEOUT ? parseInt(API_TIMEOUT, 10) : envConfig.timeout,
  };
};

export const API_CONFIG = getConfig();

// Log current environment (only in non-production)
if (CURRENT_ENV !== 'production') {
  console.log('=================================');
  console.log(`🌍 Environment: ${CURRENT_ENV.toUpperCase()}`);
  console.log(`🔗 API Base URL: ${API_CONFIG.BASE_URL}`);
  console.log(`⏱️ Timeout: ${API_CONFIG.TIMEOUT}ms`);
  console.log('=================================');
}

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

// Helper function to check if running in production
export const isProduction = (): boolean => CURRENT_ENV === 'production';

// Helper function to check if running in development
export const isDevelopment = (): boolean => CURRENT_ENV === 'development';

// Helper function to check if running locally
export const isLocal = (): boolean => CURRENT_ENV === 'local';

export default API_CONFIG;
