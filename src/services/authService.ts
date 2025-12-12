/**
 * Auth Service
 * Handle authentication related API calls
 */

import {API_ENDPOINTS} from './api.config';
import {post, get} from './apiService';
import {
  storeToken,
  storeUserData,
  storeSessionId,
  storeSettings,
  clearAllAuthData,
  getDeviceId,
  getToken,
  getUserData,
} from './storageService';
import {Platform} from 'react-native';

// Try to import DeviceInfo, use fallback if not available
let DeviceInfo: any = null;
try {
  DeviceInfo = require('react-native-device-info').default;
} catch (error) {
  console.log('react-native-device-info not available, using fallback');
}

// Types
export interface User {
  id: number;
  bigid: string;
  username: string;
  userref: string | null;
  contact_name: string;
  email: string | null;
  mobile: string | null;
  company_name: string | null;
  login_type: string;
  wallet_balance: number;
  smsg_wallet: number;
  created_at: string | null;
}

export interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
  session_id: number;
  settings: {
    notifications_enabled: boolean;
    profile_update_required: boolean;
  };
}

export interface LoginRequest {
  userName: string;
  password: string;
  device_name: string;
  device_id: string;
  fcm_token?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

/**
 * Get device name in format: "OS/manufacturer/model - version/API level"
 * Example: "Android/samsung/SM-A356E - 16/API 36"
 * Example iOS: "iOS/Apple/iPhone 14 Pro - 17.0"
 */
const getDeviceName = async (): Promise<string> => {
  try {
    const os = Platform.OS === 'ios' ? 'iOS' : 'Android';
    
    // If DeviceInfo is available, use it
    if (DeviceInfo) {
      const brand = await DeviceInfo.getBrand(); // samsung, Apple
      const model = await DeviceInfo.getModel(); // SM-A356E, iPhone 14 Pro
      const systemVersion = await DeviceInfo.getSystemVersion(); // 16, 17.0
      
      if (Platform.OS === 'android') {
        const apiLevel = await DeviceInfo.getApiLevel(); // 36
        return `${os}/${brand}/${model} - ${systemVersion}/API ${apiLevel}`;
      } else {
        // iOS doesn't have API level
        return `${os}/${brand}/${model} - ${systemVersion}`;
      }
    }
    
    // Fallback if DeviceInfo is not available
    return `${os}/${Platform.Version}`;
  } catch (error) {
    console.error('Error getting device name:', error);
    const os = Platform.OS === 'ios' ? 'iOS' : 'Android';
    return `${os}/Unknown Device`;
  }
};

/**
 * Get unique device ID
 */
const getUniqueDeviceId = async (): Promise<string> => {
  try {
    // If DeviceInfo is available, use it
    if (DeviceInfo) {
      const uniqueId = await DeviceInfo.getUniqueId();
      if (uniqueId) {
        return uniqueId;
      }
    }
    
    // Fallback to storage-based device ID
    return await getDeviceId();
  } catch (error) {
    console.error('Error getting unique device ID:', error);
    return await getDeviceId();
  }
};

/**
 * Login user
 */
export const login = async (
  username: string,
  password: string,
  fcmToken?: string
): Promise<{success: boolean; message: string; data?: LoginResponse}> => {
  try {
    // Get device info
    const deviceName = await getDeviceName();
    const deviceId = await getUniqueDeviceId();

    // Prepare request body
    const requestBody: LoginRequest = {
      userName: username,
      password: password,
      device_name: deviceName,
      device_id: deviceId,
      fcm_token: fcmToken || '',
    };

    console.log('Login request:', requestBody);

    // Make API call - show error toast
    const response = await post<LoginResponse>(API_ENDPOINTS.LOGIN, requestBody, false, true);

    console.log('Login response:', response);

    if (response.status && response.data) {
      // Store token
      await storeToken(response.data.token);
      
      // Store user data
      await storeUserData(response.data.user);
      
      // Store session ID
      await storeSessionId(response.data.session_id);
      
      // Store settings
      await storeSettings(response.data.settings);

      return {
        success: true,
        message: response.message || 'Login successful',
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || 'Login failed. Please try again.',
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'Login failed. Please try again.',
    };
  }
};

/**
 * Logout user (current device)
 */
export const logout = async (): Promise<{success: boolean; message: string}> => {
  try {
    // Call logout API - disable error toast since we logout anyway
    const response = await post(API_ENDPOINTS.LOGOUT, {}, true, false);
    
    console.log('Logout response:', response);

    // Clear all stored auth data regardless of API response
    await clearAllAuthData();

    return {
      success: true,
      message: response.message || 'Logout successful',
    };
  } catch (error: any) {
    console.error('Logout error:', error);
    
    // Clear data even if API fails
    await clearAllAuthData();
    
    return {
      success: true,
      message: 'Logged out',
    };
  }
};

/**
 * Logout from all devices
 */
export const logoutAllDevices = async (): Promise<{success: boolean; message: string}> => {
  try {
    // Call logout-all API - show error toast
    const response = await post(API_ENDPOINTS.LOGOUT_ALL, {}, true, true);
    
    console.log('Logout all devices response:', response);

    // Clear all stored auth data
    await clearAllAuthData();

    return {
      success: response.status || false,
      message: response.message || 'Logged out from all devices',
    };
  } catch (error: any) {
    console.error('Logout all devices error:', error);
    
    // Clear data even if API fails
    await clearAllAuthData();
    
    return {
      success: false,
      message: error.message || 'Failed to logout from all devices',
    };
  }
};

/**
 * Change password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{success: boolean; message: string}> => {
  try {
    const requestBody: ChangePasswordRequest = {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    };

    console.log('Change password request');

    // Make API call - show error toast
    const response = await post(API_ENDPOINTS.CHANGE_PASSWORD, requestBody, true, true);

    console.log('Change password response:', response);

    return {
      success: response.status || false,
      message: response.message || (response.status ? 'Password changed successfully' : 'Failed to change password'),
    };
  } catch (error: any) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: error.message || 'Failed to change password. Please try again.',
    };
  }
};

/**
 * Update push notification token
 * Note: This is a background operation, so we disable error toast
 */
export const updatePushToken = async (fcmToken: string): Promise<{success: boolean; message: string}> => {
  try {
    const deviceId = await getUniqueDeviceId();
    
    const requestBody = {
      fcm_token: fcmToken,
      device_id: deviceId,
    };

    console.log('Update push token request:', requestBody);

    // Make API call - disable error toast for background operation
    const response = await post(API_ENDPOINTS.PUSH_TOKEN, requestBody, true, false);

    console.log('Update push token response:', response);

    return {
      success: response.status || false,
      message: response.message || 'Push token updated',
    };
  } catch (error: any) {
    console.error('Update push token error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update push token',
    };
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    return !!token;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

/**
 * Get current user data
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userData = await getUserData();
    return userData;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

/**
 * Validate token with server (optional - can be used to verify token is still valid)
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    if (!token) {
      return false;
    }

    // You can add an API call here to validate token with server
    // For now, just check if token exists
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export default {
  login,
  logout,
  logoutAllDevices,
  changePassword,
  updatePushToken,
  isAuthenticated,
  getCurrentUser,
  validateToken,
};
