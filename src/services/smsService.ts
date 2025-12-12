/**
 * SMS Service
 * Handles all Send SMS related API calls
 */

import {API_CONFIG, API_ENDPOINTS} from './api.config';
import {getToken} from './storageService';

// Types
export interface SendSmsData {
  user: {
    bigid: string;
    name: string;
    email: string;
  };
  wallet: {
    balance: number;
    currency: string;
    formatted: string;
  };
  sender_id: {
    default: string;
    custom: string;
  };
  whatsapp_enabled: boolean;
  sms_shortcodes: Array<{
    id: number;
    number: string;
  }>;
  current_time: {
    date: string;
    hour: string;
    minute: string;
  };
  message_limits: {
    max_characters: number;
    single_sms_limit: number;
    concatenated_sms_limit: number;
  };
}

export interface Contact {
  id: string;
  name: string;
  number: string;
}

export interface ContactsData {
  type: string;
  contacts: Contact[];
  total: number;
}

export interface CostBreakdown {
  country: string;
  dialcode: string;
  count: number;
  rate_per_sms: number;
  total_cost: number;
}

export interface CalculateCostData {
  message_info: {
    length: number;
    sms_parts: number;
    part_info: string;
  };
  recipients: {
    total: number;
    invalid: number;
    invalid_numbers: string[];
  };
  cost_breakdown: CostBreakdown[];
  total_cost: {
    amount: number;
    formatted: string;
  };
  wallet: {
    balance: number;
    formatted: string;
    sufficient_funds: boolean;
    shortage: number;
  };
}

export interface SendSmsResult {
  batch_id: string;
  sent: number;
  failed: number;
  invalid_numbers: string[];
}

export interface ScheduleSmsResult {
  batch_id: string;
  scheduled: number;
  failed: number;
  scheduled_at: string;
  invalid_numbers: string[];
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Get Send SMS page data
 */
export const getSendSmsData = async (): Promise<{
  success: boolean;
  message: string;
  data?: SendSmsData;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {success: false, message: 'Authentication required'};
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}send-sms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result: ApiResponse<SendSmsData> = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || 'Failed to fetch send SMS data',
    };
  } catch (error: any) {
    console.error('Error fetching send SMS data:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Get contacts (favourites or groups)
 */
export const getContacts = async (
  type: 'favourites' | 'groups' = 'favourites',
): Promise<{
  success: boolean;
  message: string;
  data?: ContactsData;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {success: false, message: 'Authentication required'};
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}send-sms/contacts?type=${type}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result: ApiResponse<ContactsData> = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || 'Failed to fetch contacts',
    };
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Calculate SMS cost
 */
export const calculateSmsCost = async (
  recipients: string,
  message: string,
): Promise<{
  success: boolean;
  message: string;
  data?: CalculateCostData;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {success: false, message: 'Authentication required'};
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}send-sms/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipients,
        message,
      }),
    });

    const result: ApiResponse<CalculateCostData> = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || 'Failed to calculate cost',
    };
  } catch (error: any) {
    console.error('Error calculating SMS cost:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Send SMS immediately
 */
export const sendSms = async (
  recipients: string,
  message: string,
  senderId: string,
  messageType: 'sms' | 'whatsapp' = 'sms',
): Promise<{
  success: boolean;
  message: string;
  data?: SendSmsResult;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {success: false, message: 'Authentication required'};
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipients,
        message,
        sender_id: senderId,
        message_type: messageType,
      }),
    });

    const result: ApiResponse<SendSmsResult> = await response.json();

    return {
      success: result.success,
      message: result.message,
      data: result.data,
    };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Schedule SMS for later
 */
export const scheduleSms = async (
  recipients: string,
  message: string,
  senderId: string,
  sendDate: string,
  sendHour: string,
  sendMinute: string,
  messageType: 'sms' | 'whatsapp' = 'sms',
): Promise<{
  success: boolean;
  message: string;
  data?: ScheduleSmsResult;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {success: false, message: 'Authentication required'};
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}send-sms/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipients,
        message,
        sender_id: senderId,
        send_date: sendDate,
        send_hour: sendHour,
        send_minute: sendMinute,
        message_type: messageType,
      }),
    });

    const result: ApiResponse<ScheduleSmsResult> = await response.json();

    return {
      success: result.success,
      message: result.message,
      data: result.data,
    };
  } catch (error: any) {
    console.error('Error scheduling SMS:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Calculate SMS parts based on message length
 */
export const calculateSmsParts = (message: string): number => {
  const length = message.length;
  if (length <= 160) {
    return 1;
  }
  return Math.ceil(length / 153);
};

/**
 * Get character count info with SMS parts
 */
export const getCharacterCountInfo = (
  message: string,
): {
  length: number;
  parts: number;
  maxChars: number;
  remaining: number;
  isMultiPart: boolean;
} => {
  const length = message.length;
  const parts = calculateSmsParts(message);
  const isMultiPart = parts > 1;

  let maxChars: number;
  if (length <= 160) {
    maxChars = 160;
  } else {
    maxChars = parts * 153;
  }

  const remaining = maxChars - length;

  return {
    length,
    parts,
    maxChars,
    remaining,
    isMultiPart,
  };
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (number: string): boolean => {
  const cleanNumber = number.replace(/\D/g, '');

  // UK number starting with 07
  if (/^07\d{9}$/.test(cleanNumber)) {
    return true;
  }

  // UK number with country code
  if (/^44\d{10}$/.test(cleanNumber)) {
    return true;
  }

  // International number (10-15 digits)
  if (/^\d{10,15}$/.test(cleanNumber)) {
    return true;
  }

  return false;
};

/**
 * Format phone number to standard format
 */
export const formatPhoneNumber = (number: string): string => {
  let cleanNumber = number.replace(/\D/g, '');

  // Convert 07 to 447
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '44' + cleanNumber.substring(1);
  }

  return cleanNumber;
};

/**
 * Parse multiple phone numbers from string
 */
export const parsePhoneNumbers = (
  input: string,
): {
  valid: string[];
  invalid: string[];
} => {
  const numbers = input
    .split(/[,\n]/)
    .map(n => n.trim())
    .filter(n => n.length > 0);

  const valid: string[] = [];
  const invalid: string[] = [];

  numbers.forEach(number => {
    if (isValidPhoneNumber(number)) {
      valid.push(formatPhoneNumber(number));
    } else {
      invalid.push(number);
    }
  });

  return {valid, invalid};
};

export default {
  getSendSmsData,
  getContacts,
  calculateSmsCost,
  sendSms,
  scheduleSms,
  calculateSmsParts,
  getCharacterCountInfo,
  isValidPhoneNumber,
  formatPhoneNumber,
  parsePhoneNumbers,
};
