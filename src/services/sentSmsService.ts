/**
 * Sent SMS Service
 * Handles all Sent SMS related API calls
 */

import {API_CONFIG} from './api.config';
import {getToken} from './storageService';

// Types for Sent SMS
export interface SentMessage {
  id: number;
  table_name: string;
  mobile: string;
  message_preview: string;
  message_full: string;
  sent_time: string;
  sent_time_raw: string;
  status: string;
  status_code: 'delivered' | 'pending' | 'failed' | 'scheduled' | 'unknown';
  originator: string;
  initiator: string;
}

export interface SentMessageDetails {
  id: number;
  table_name: string;
  date_submitted: string;
  send_at_time: string;
  sent_at_time: string;
  delivery_time: string;
  sender: string;
  message: string;
  sent_to: string;
  sent_by: string;
  recipient_cost: string;
  cost_to_you: string;
  delivery_status: string;
  message_status: string;
  num_parts: number;
  country_code: string;
  requested_route: number;
}

export interface SentSmsStats {
  total_messages: number;
  today_messages: number;
  week_messages: number;
  month_messages: number;
  delivered_count: number;
  failed_count: number;
  pending_count: number;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface SentSmsFilters {
  sources?: string[];
  route?: string;
  delivery_status?: string;
  mobile?: string;
  start_date?: string;
  end_date?: string;
  start_hour?: string;
  start_minute?: string;
  end_hour?: string;
  end_minute?: string;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_records: number;
  has_more: boolean;
}

export interface SentSmsPageData {
  source_options: FilterOption[];
  route_options: FilterOption[];
  delivery_options: FilterOption[];
  default_start_date: string;
  default_end_date: string;
}

export interface SentSmsMessagesData {
  messages: SentMessage[];
  pagination: PaginationInfo;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Get sent SMS page data (filter options)
 */
export const getSentSmsPageData = async (): Promise<{
  success: boolean;
  message?: string;
  data: SentSmsPageData;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication required',
        data: {
          source_options: [],
          route_options: [],
          delivery_options: [],
          default_start_date: new Date().toISOString().split('T')[0],
          default_end_date: new Date().toISOString().split('T')[0],
        },
      };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}sent-sms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result: ApiResponse<SentSmsPageData> = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    // Return default data on failure
    return {
      success: false,
      message: result.message || 'Failed to fetch sent SMS data',
      data: {
        source_options: [],
        route_options: [
          {value: 'all', label: 'All Routes'},
          {value: 'standard', label: 'Standard Routes'},
          {value: 'premium', label: 'Premium Routes'},
        ],
        delivery_options: [
          {value: 'all', label: 'All Messages'},
          {value: 'delivered', label: 'Delivered'},
          {value: 'failed', label: 'Failed'},
          {value: 'pending', label: 'Pending'},
          {value: 'scheduled', label: 'Scheduled'},
        ],
        default_start_date: new Date().toISOString().split('T')[0],
        default_end_date: new Date().toISOString().split('T')[0],
      },
    };
  } catch (error: any) {
    console.error('Error fetching sent SMS data:', error);
    return {
      success: false,
      message: error.message || 'Network error',
      data: {
        source_options: [],
        route_options: [
          {value: 'all', label: 'All Routes'},
          {value: 'standard', label: 'Standard Routes'},
          {value: 'premium', label: 'Premium Routes'},
        ],
        delivery_options: [
          {value: 'all', label: 'All Messages'},
          {value: 'delivered', label: 'Delivered'},
          {value: 'failed', label: 'Failed'},
          {value: 'pending', label: 'Pending'},
          {value: 'scheduled', label: 'Scheduled'},
        ],
        default_start_date: new Date().toISOString().split('T')[0],
        default_end_date: new Date().toISOString().split('T')[0],
      },
    };
  }
};

/**
 * Get sent SMS messages with filters and pagination
 */
export const getSentSmsMessages = async (
  filters: SentSmsFilters = {},
  page: number = 1,
  perPage: number = 20,
): Promise<{
  success: boolean;
  message?: string;
  data: SentSmsMessagesData;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication required',
        data: {
          messages: [],
          pagination: {
            current_page: 1,
            per_page: perPage,
            total_pages: 0,
            total_records: 0,
            has_more: false,
          },
        },
      };
    }

    // Build query params
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());

    if (filters.route) queryParams.append('route', filters.route);
    if (filters.delivery_status)
      queryParams.append('delivery_status', filters.delivery_status);
    if (filters.mobile) queryParams.append('mobile', filters.mobile);
    if (filters.start_date) queryParams.append('start_date', filters.start_date);
    if (filters.end_date) queryParams.append('end_date', filters.end_date);
    if (filters.start_hour) queryParams.append('start_hour', filters.start_hour);
    if (filters.start_minute)
      queryParams.append('start_minute', filters.start_minute);
    if (filters.end_hour) queryParams.append('end_hour', filters.end_hour);
    if (filters.end_minute) queryParams.append('end_minute', filters.end_minute);

    const url = `${API_CONFIG.BASE_URL}sent-sms/messages?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result: ApiResponse<SentSmsMessagesData> = await response.json();

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
      data: {
        messages: [],
        pagination: {
          current_page: 1,
          per_page: perPage,
          total_pages: 0,
          total_records: 0,
          has_more: false,
        },
      },
    };
  } catch (error: any) {
    console.error('Error fetching sent messages:', error);
    return {
      success: false,
      message: error.message || 'Network error',
      data: {
        messages: [],
        pagination: {
          current_page: 1,
          per_page: perPage,
          total_pages: 0,
          total_records: 0,
          has_more: false,
        },
      },
    };
  }
};

/**
 * Get sent SMS statistics
 */
export const getSentSmsStats = async (): Promise<{
  success: boolean;
  message?: string;
  data: SentSmsStats;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication required',
        data: {
          total_messages: 0,
          today_messages: 0,
          week_messages: 0,
          month_messages: 0,
          delivered_count: 0,
          failed_count: 0,
          pending_count: 0,
        },
      };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}sent-sms/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result: ApiResponse<SentSmsStats> = await response.json();

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
      data: {
        total_messages: 0,
        today_messages: 0,
        week_messages: 0,
        month_messages: 0,
        delivered_count: 0,
        failed_count: 0,
        pending_count: 0,
      },
    };
  } catch (error: any) {
    console.error('Error fetching sent SMS stats:', error);
    return {
      success: false,
      message: error.message || 'Network error',
      data: {
        total_messages: 0,
        today_messages: 0,
        week_messages: 0,
        month_messages: 0,
        delivered_count: 0,
        failed_count: 0,
        pending_count: 0,
      },
    };
  }
};

/**
 * Get single sent message details
 */
export const getSentMessageDetails = async (
  tableName: string,
  id: number,
): Promise<{
  success: boolean;
  message?: string;
  data?: SentMessageDetails;
}> => {
  try {
    const token = await getToken();
    if (!token) {
      return {success: false, message: 'Authentication required'};
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}sent-sms/${tableName}/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result: ApiResponse<SentMessageDetails> = await response.json();

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
 * Helper function to get status color
 */
export const getStatusColor = (statusCode: string): string => {
  switch (statusCode) {
    case 'delivered':
      return '#16a34a'; // Green
    case 'pending':
      return '#f59e0b'; // Orange
    case 'failed':
      return '#dc2626'; // Red
    case 'scheduled':
      return '#0891b2'; // Cyan
    default:
      return '#64748b'; // Gray
  }
};

/**
 * Helper function to get status icon
 */
export const getStatusIcon = (statusCode: string): string => {
  switch (statusCode) {
    case 'delivered':
      return 'checkmark-circle';
    case 'pending':
      return 'time';
    case 'failed':
      return 'close-circle';
    case 'scheduled':
      return 'calendar';
    default:
      return 'help-circle';
  }
};

export default {
  getSentSmsPageData,
  getSentSmsMessages,
  getSentSmsStats,
  getSentMessageDetails,
  getStatusColor,
  getStatusIcon,
};
