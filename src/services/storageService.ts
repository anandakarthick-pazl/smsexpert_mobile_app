/**
 * Storage Service
 * Handle AsyncStorage operations for token and user data
 */

// Try to import AsyncStorage, use fallback if not available
let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  console.log('AsyncStorage not available, using in-memory storage');
}

// In-memory fallback storage
const memoryStorage: Record<string, string> = {};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@smsexpert_auth_token',
  USER_DATA: '@smsexpert_user_data',
  SESSION_ID: '@smsexpert_session_id',
  SETTINGS: '@smsexpert_settings',
  DEVICE_ID: '@smsexpert_device_id',
};

/**
 * Get item from storage (AsyncStorage or memory fallback)
 */
const getItem = async (key: string): Promise<string | null> => {
  try {
    if (AsyncStorage) {
      return await AsyncStorage.getItem(key);
    }
    return memoryStorage[key] || null;
  } catch (error) {
    console.error('Error getting item:', error);
    return memoryStorage[key] || null;
  }
};

/**
 * Set item in storage (AsyncStorage or memory fallback)
 */
const setItem = async (key: string, value: string): Promise<boolean> => {
  try {
    if (AsyncStorage) {
      await AsyncStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
    return true;
  } catch (error) {
    console.error('Error setting item:', error);
    memoryStorage[key] = value;
    return true;
  }
};

/**
 * Remove item from storage (AsyncStorage or memory fallback)
 */
const removeItem = async (key: string): Promise<boolean> => {
  try {
    if (AsyncStorage) {
      await AsyncStorage.removeItem(key);
    } else {
      delete memoryStorage[key];
    }
    return true;
  } catch (error) {
    console.error('Error removing item:', error);
    delete memoryStorage[key];
    return true;
  }
};

/**
 * Remove multiple items from storage
 */
const multiRemove = async (keys: string[]): Promise<boolean> => {
  try {
    if (AsyncStorage) {
      await AsyncStorage.multiRemove(keys);
    } else {
      keys.forEach(key => delete memoryStorage[key]);
    }
    return true;
  } catch (error) {
    console.error('Error removing multiple items:', error);
    keys.forEach(key => delete memoryStorage[key]);
    return true;
  }
};

/**
 * Store authentication token
 */
export const storeToken = async (token: string): Promise<boolean> => {
  return await setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Get authentication token
 */
export const getToken = async (): Promise<string | null> => {
  return await getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Remove authentication token
 */
export const removeToken = async (): Promise<boolean> => {
  return await removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Store user data
 */
export const storeUserData = async (userData: any): Promise<boolean> => {
  try {
    return await setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};

/**
 * Get user data
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    const userData = await getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Remove user data
 */
export const removeUserData = async (): Promise<boolean> => {
  return await removeItem(STORAGE_KEYS.USER_DATA);
};

/**
 * Store session ID
 */
export const storeSessionId = async (sessionId: number): Promise<boolean> => {
  return await setItem(STORAGE_KEYS.SESSION_ID, sessionId.toString());
};

/**
 * Get session ID
 */
export const getSessionId = async (): Promise<number | null> => {
  try {
    const sessionId = await getItem(STORAGE_KEYS.SESSION_ID);
    return sessionId ? parseInt(sessionId, 10) : null;
  } catch (error) {
    console.error('Error getting session ID:', error);
    return null;
  }
};

/**
 * Store settings
 */
export const storeSettings = async (settings: any): Promise<boolean> => {
  try {
    return await setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error storing settings:', error);
    return false;
  }
};

/**
 * Get settings
 */
export const getSettings = async (): Promise<any | null> => {
  try {
    const settings = await getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};

/**
 * Get or create device ID
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await getItem(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      // Generate a unique device ID
      deviceId = 'mobile-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      await setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return 'mobile-unknown-' + Date.now();
  }
};

/**
 * Clear all auth data (for logout)
 */
export const clearAllAuthData = async (): Promise<boolean> => {
  return await multiRemove([
    STORAGE_KEYS.AUTH_TOKEN,
    STORAGE_KEYS.USER_DATA,
    STORAGE_KEYS.SESSION_ID,
    STORAGE_KEYS.SETTINGS,
  ]);
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    return !!token;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

export default {
  storeToken,
  getToken,
  removeToken,
  storeUserData,
  getUserData,
  removeUserData,
  storeSessionId,
  getSessionId,
  storeSettings,
  getSettings,
  getDeviceId,
  clearAllAuthData,
  isLoggedIn,
  STORAGE_KEYS,
};
