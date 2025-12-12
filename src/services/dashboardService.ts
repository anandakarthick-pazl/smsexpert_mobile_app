/**
 * Dashboard Service
 * Handle dashboard related API calls
 */

import {API_ENDPOINTS} from './api.config';
import {get} from './apiService';

// Types
export interface WalletInfo {
  balance: number;
  total_wallet: number;
  used: number;
}

export interface FilterInfo {
  start_date: string;
  end_date: string;
  period_label: string;
  is_custom: boolean;
}

export interface PeriodStats {
  total_sms: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
  total_cost: number;
}

export interface TodayStats {
  total_sms: number;
  delivered: number;
}

export interface RecentActivity {
  id: number;
  recipient: string;
  message: string;
  status: string;
  sent_at: string;
}

export interface DashboardData {
  wallet: WalletInfo;
  filter: FilterInfo;
  period_stats: PeriodStats;
  today: TodayStats;
  recent_activity: RecentActivity[];
}

export interface DateFilter {
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * Format date to API format (YYYY-MM-DD)
 */
export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get dashboard data with optional date filter
 */
export const getDashboardData = async (
  dateFilter?: DateFilter
): Promise<{
  success: boolean;
  message: string;
  data?: DashboardData;
}> => {
  try {
    console.log('Fetching dashboard data...', dateFilter);

    // Build query params
    let endpoint = API_ENDPOINTS.DASHBOARD;
    
    if (dateFilter?.startDate && dateFilter?.endDate) {
      const startDate = formatDateForApi(dateFilter.startDate);
      const endDate = formatDateForApi(dateFilter.endDate);
      endpoint = `${endpoint}?start_date=${startDate}&end_date=${endDate}`;
    }

    // Make API call
    const response = await get<DashboardData>(endpoint, true, true);

    console.log('Dashboard response:', response);

    if (response.status && response.data) {
      return {
        success: true,
        message: response.message || 'Dashboard data retrieved successfully',
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || 'Failed to fetch dashboard data',
    };
  } catch (error: any) {
    console.error('Get dashboard error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
    };
  }
};

/**
 * Get predefined date ranges
 */
export const getDateRanges = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 6);
  
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 29);
  
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  
  const thisYearStart = new Date(today.getFullYear(), 0, 1);

  return {
    today: {
      label: 'Today',
      startDate: today,
      endDate: today,
    },
    yesterday: {
      label: 'Yesterday',
      startDate: yesterday,
      endDate: yesterday,
    },
    last7Days: {
      label: 'Last 7 Days',
      startDate: last7Days,
      endDate: today,
    },
    last30Days: {
      label: 'Last 30 Days',
      startDate: last30Days,
      endDate: today,
    },
    thisMonth: {
      label: 'This Month',
      startDate: thisMonthStart,
      endDate: today,
    },
    lastMonth: {
      label: 'Last Month',
      startDate: lastMonthStart,
      endDate: lastMonthEnd,
    },
    thisYear: {
      label: 'This Year',
      startDate: thisYearStart,
      endDate: today,
    },
  };
};

/**
 * Format date for display
 */
export const formatActivityDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  } catch (error) {
    return dateString;
  }
};

/**
 * Format date for display in filter
 */
export const formatDateDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'DELIVERED':
      return '#16a34a';
    case 'PENDING':
      return '#f59e0b';
    case 'FAILED':
      return '#dc2626';
    case 'SENT':
      return '#0891b2';
    default:
      return '#64748b';
  }
};

/**
 * Get status icon
 */
export const getStatusIcon = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'DELIVERED':
      return '✅';
    case 'PENDING':
      return '⏳';
    case 'FAILED':
      return '❌';
    case 'SENT':
      return '📤';
    default:
      return '📱';
  }
};

export default {
  getDashboardData,
  getDateRanges,
  formatActivityDate,
  formatDateDisplay,
  formatDateForApi,
  getStatusColor,
  getStatusIcon,
};
