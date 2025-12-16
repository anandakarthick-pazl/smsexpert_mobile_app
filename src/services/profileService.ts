/**
 * Profile Service
 * Handle all profile-related API calls
 */

import {get, post, put, del} from './apiService';

export interface ProfileData {
  service_description: string;
  business_name: string;
  contact_name: string;
  address1: string;
  address2: string;
  town: string;
  country: string;
  postcode: string;
  mobile_number: string;
  phone_number: string;
  email: string;
  default_sender_id: string;
  account_expiry: string;
  username: string;
}

export interface ProfileLimits {
  daily_sms_limit: number;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data?: {
    profile: ProfileData;
    limits: ProfileLimits;
    ip_whitelist: string[];
    push_delivery_active: boolean;
  };
}

export interface UpdateProfileData {
  service_description: string;
  business_name: string;
  contact_name: string;
  address1: string;
  address2?: string;
  town: string;
  country?: string;
  postcode: string;
  mobile_number?: string;
  phone_number: string;
  email: string;
  default_sender_id?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Get user profile
 */
export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await get('profile');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Profile Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load profile',
    };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileData): Promise<{success: boolean; message?: string}> => {
  try {
    const response = await put('profile', data);
    
    return {
      success: response.status || response.success,
      message: response.message,
    };
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update profile',
    };
  }
};

/**
 * Change password
 */
export const changePassword = async (data: ChangePasswordData): Promise<{success: boolean; message?: string; errors?: any}> => {
  try {
    const response = await post('profile/change-password', data);
    
    return {
      success: response.status || response.success,
      message: response.message,
      errors: response.errors,
    };
  } catch (error: any) {
    console.error('Change Password Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to change password',
      errors: error.response?.data?.errors,
    };
  }
};

/**
 * Add IP to whitelist
 */
export const addIpToWhitelist = async (ipAddress: string): Promise<{success: boolean; message?: string; data?: string[]}> => {
  try {
    const response = await post('profile/ip', { ip_address: ipAddress });
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Add IP Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add IP address',
    };
  }
};

/**
 * Remove IP from whitelist
 */
export const removeIpFromWhitelist = async (ipAddress: string): Promise<{success: boolean; message?: string; data?: string[]}> => {
  try {
    const response = await del(`profile/ip?ip_address=${encodeURIComponent(ipAddress)}`);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Remove IP Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to remove IP address',
    };
  }
};
