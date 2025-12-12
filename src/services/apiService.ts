/**
 * API Service
 * Handle all HTTP requests with token management
 */

import {API_CONFIG} from './api.config';
import {getToken} from './storageService';
import {toast} from '../context/ToastContext';

interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data?: T;
  errors?: any;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  showErrorToast?: boolean; // Whether to show error toast automatically
}

/**
 * Make API request
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = true,
    showErrorToast = true,
  } = options;

  try {
    // Build URL
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = await getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Build request config
    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    console.log(`API Request: ${method} ${url}`);
    
    // Make request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    config.signal = controller.signal;

    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Parse response
    const responseData = await response.json();
    
    console.log('API Response:', responseData);

    // Handle HTTP errors
    if (!response.ok) {
      const errorMessage = responseData.message || `HTTP Error: ${response.status}`;
      
      // Show error toast
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      return {
        status: false,
        message: errorMessage,
        errors: responseData.errors,
      };
    }

    // Check if API returned status: false
    if (responseData.status === false) {
      const errorMessage = responseData.message || 'Something went wrong';
      
      // Show error toast
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      return responseData;
    }

    return responseData;
  } catch (error: any) {
    console.error('API Request Error:', error);

    let errorMessage = 'An unexpected error occurred.';

    // Handle abort error (timeout)
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout. Please check your connection.';
    }
    // Handle network error
    else if (error.message === 'Network request failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    // Handle other errors
    else if (error.message) {
      errorMessage = error.message;
    }

    // Show error toast
    if (showErrorToast) {
      toast.error(errorMessage);
    }

    return {
      status: false,
      message: errorMessage,
    };
  }
};

/**
 * GET request
 */
export const get = <T = any>(
  endpoint: string, 
  requiresAuth = true,
  showErrorToast = true
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {method: 'GET', requiresAuth, showErrorToast});
};

/**
 * POST request
 */
export const post = <T = any>(
  endpoint: string,
  body: any,
  requiresAuth = true,
  showErrorToast = true
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {method: 'POST', body, requiresAuth, showErrorToast});
};

/**
 * PUT request
 */
export const put = <T = any>(
  endpoint: string,
  body: any,
  requiresAuth = true,
  showErrorToast = true
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {method: 'PUT', body, requiresAuth, showErrorToast});
};

/**
 * DELETE request
 */
export const del = <T = any>(
  endpoint: string, 
  requiresAuth = true,
  showErrorToast = true
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {method: 'DELETE', requiresAuth, showErrorToast});
};

/**
 * PATCH request
 */
export const patch = <T = any>(
  endpoint: string,
  body: any,
  requiresAuth = true,
  showErrorToast = true
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {method: 'PATCH', body, requiresAuth, showErrorToast});
};

export default {
  apiRequest,
  get,
  post,
  put,
  del,
  patch,
};
