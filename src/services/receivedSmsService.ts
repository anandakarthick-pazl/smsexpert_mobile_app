/**
 * Received SMS Service
 * Handles all Received SMS related API calls
 */

import {API_CONFIG} from './api.config';
import {getToken} from './storageService';

// Types
export interface FilterOption {
  id: string;
  keyword: string;
  number: string;
  display_name: string;
}

export interface ReceivedSmsPageData {
  filter_options: FilterOption[];
  total_messages: number;
  default_filter: string;
}

export interface ReceivedMessage {
  id: number;
  sender: string;
  message: string;
  message_preview: string;
  received_at: string;
  received_at_raw: string;
  received_to: string;
  keyword: string;
  network: string;
  msisdn_alias: string;
}

export interface MessageDetails {
  id: number;
  sender: string;
  message: string;
  received_at: string;
  received_at_formatted: string;
  received_to: string;
  keyword: string;
  network: string;
  msisdn_alias: string;
  auto_response: {
    sent: boolean;
    message: string | null;
    sent_at: string | null;
  };
}

export interface ReceivedMessagesData {
  messages: ReceivedMessage[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
    has_more: boolean;
  };
  filters: {
    filter: string;
    start_date: string | null;
    end_date: string | null;
    search: string;
  };
}

export interface ReceivedSmsStats {
  total_messages: number;
  today_messages: number;
  week_messages: number;
  month_messages: number;
  stop_messages: number;
}

export interface ExportResult {
  download_url: string;
  filename: string;
  record_count: number;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Get Received SMS page initial data (filter options)
 */
export const getReceivedSmsPageData = async (): Promise<{
  success: boolean;
  message: string;
  data?: ReceivedSmsPageData;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {success: false, message: 'Authentication required'};
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}received-sms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result: ApiResponse<ReceivedSmsPageData> = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || 'Failed to fetch received SMS data',
    };
  } catch (error: any) {
    console.error('Error fetching received SMS data:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Get received SMS messages with filters and pagination
 */
export const getReceivedMessages = async (params: {
  filter?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<{
  success: boolean;
  message: string;
  data?: ReceivedMessagesData;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {success: false, message: 'Authentication required'};
    }

    // Build query params
    const queryParams = new URLSearchParams();
    if (params.filter) queryParams.append('filter', params.filter);
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.endDate) queryParams.append('end_date', params.endDate);
    if (params.startTime) queryParams.append('start_time', params.startTime);
    if (params.endTime) queryParams.append('end_time', params.endTime);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.perPage) queryParams.append('per_page', params.perPage.toString());
    if (params.search) queryParams.append('search', params.search);

    const url = `${API_CONFIG.BASE_URL}received-sms/messages?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result: ApiResponse<ReceivedMessagesData> = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || 'Failed to fetch messages',
    };
  } catch (error: any) {
    console.error('Error fetching received messages:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Get single message details
 */
export const getMessageDetails = async (
  messageId: number,
): Promise<{
  success: boolean;
  message: string;
  data?: MessageDetails;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {success: false, message: 'Authentication required'};
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}received-sms/${messageId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result: ApiResponse<MessageDetails> = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || 'Failed to fetch message details',
    };
  } catch (error: any) {
    console.error('Error fetching message details:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Get received SMS statistics
 */
export const getReceivedSmsStats = async (): Promise<{
  success: boolean;
  message: string;
  data?: ReceivedSmsStats;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {success: false, message: 'Authentication required'};
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}received-sms/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result: ApiResponse<ReceivedSmsStats> = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || 'Failed to fetch statistics',
    };
  } catch (error: any) {
    console.error('Error fetching received SMS stats:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Export received SMS to CSV
 */
export const exportReceivedSms = async (params: {
  filter?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}): Promise<{
  success: boolean;
  message: string;
  data?: ExportResult;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {success: false, message: 'Authentication required'};
    }

    // Build query params
    const queryParams = new URLSearchParams();
    if (params.filter) queryParams.append('filter', params.filter);
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.endDate) queryParams.append('end_date', params.endDate);
    if (params.startTime) queryParams.append('start_time', params.startTime);
    if (params.endTime) queryParams.append('end_time', params.endTime);

    const url = `${API_CONFIG.BASE_URL}received-sms/export?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result: ApiResponse<ExportResult> = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || 'Failed to export messages',
    };
  } catch (error: any) {
    console.error('Error exporting received SMS:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

export default {
  getReceivedSmsPageData,
  getReceivedMessages,
  getMessageDetails,
  getReceivedSmsStats,
  exportReceivedSms,
};
