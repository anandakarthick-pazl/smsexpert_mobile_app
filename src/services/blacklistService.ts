/**
 * Blacklist Service
 * Handle all blacklist related API calls
 */

import {get, del} from './apiService';

export interface BlacklistItem {
  id: number;
  phone_number: string;
  blocked_date: string;
  blocked_date_raw: string;
  status: 'blocked';
}

export interface BlacklistStatistics {
  total_blacklisted: number;
  added_this_month: number;
  added_this_week: number;
}

export interface BlacklistData {
  items: BlacklistItem[];
  statistics: BlacklistStatistics;
}

export interface BlacklistResponse {
  success: boolean;
  message?: string;
  data?: BlacklistData;
}

export interface UnblockResponse {
  success: boolean;
  message?: string;
  data?: {
    unblocked_number: string;
  };
}

export interface DownloadResponse {
  success: boolean;
  message?: string;
  data?: {
    filename: string;
    csv_data: string[][];
    total_records: number;
  };
}

/**
 * Get all blacklisted numbers with statistics
 */
export const getBlacklist = async (): Promise<BlacklistResponse> => {
  try {
    const response = await get('blacklist');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Blacklist Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load blacklist',
    };
  }
};

/**
 * Unblock a phone number (remove from blacklist)
 */
export const unblockNumber = async (id: number): Promise<UnblockResponse> => {
  try {
    const response = await del(`blacklist/${id}`);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Unblock Number Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to unblock number',
    };
  }
};

/**
 * Get blacklist data for download
 */
export const downloadBlacklist = async (): Promise<DownloadResponse> => {
  try {
    const response = await get('blacklist/download');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Download Blacklist Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to download blacklist',
    };
  }
};

/**
 * Convert CSV data to string for sharing
 */
export const convertCsvToString = (csvData: string[][]): string => {
  return csvData.map(row => row.join(',')).join('\n');
};
