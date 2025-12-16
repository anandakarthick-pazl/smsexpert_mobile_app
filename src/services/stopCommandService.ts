/**
 * STOP Commands Service
 * Handle all STOP command/optout related API calls
 */

import {get, post} from './apiService';

export interface StopCommandSettings {
  stop_url: string;
  stop_email: string;
  stop_name: string;
}

export interface StopCommandStats {
  total_optouts: number;
  this_month: number;
  this_week: number;
}

export interface StopCommandResponse {
  success: boolean;
  message?: string;
  data?: StopCommandSettings;
}

export interface StopCommandStatsResponse {
  success: boolean;
  message?: string;
  data?: StopCommandStats;
}

/**
 * Get STOP command settings
 */
export const getStopCommandSettings = async (): Promise<StopCommandResponse> => {
  try {
    const response = await get('stop-commands');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Stop Command Settings Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load STOP command settings',
    };
  }
};

/**
 * Update STOP command settings
 */
export const updateStopCommandSettings = async (
  stopUrl: string,
  stopEmail: string,
  stopName: string
): Promise<StopCommandResponse> => {
  try {
    const response = await post('stop-commands', {
      stop_url: stopUrl,
      stop_email: stopEmail,
      stop_name: stopName,
    });
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Update Stop Command Settings Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update STOP command settings',
    };
  }
};

/**
 * Get STOP command statistics
 */
export const getStopCommandStats = async (): Promise<StopCommandStatsResponse> => {
  try {
    const response = await get('stop-commands/stats');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Stop Command Stats Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load STOP command statistics',
    };
  }
};
