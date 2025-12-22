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
  isNetworkError?: boolean;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  showErrorToast?: boolean; // Whether to show error toast automatically
}

/**
 * Check if the device has internet connectivity
 */
const checkConnectivity = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://clients3.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.status === 204 || response.ok;
  } catch {
    return false;
  }
};

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
      const errorMessage = responseData.message || 'Something went wrong. Please try again.';
      
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
      const errorMessage = responseData.message || 'Something went wrong. Please try again.';
      
      // Show error toast
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      return responseData;
    }

    return responseData;
  } catch (error: any) {
    console.error('API Request Error:', error);

    let errorMessage = 'Something went wrong. Please try again.';
    let isNetworkError = false;

    // Handle abort error (timeout)
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your connection and try again.';
      isNetworkError = true;
    }
    // Handle network error
    else if (error.message === 'Network request failed' || error.message?.includes('Network')) {
      // Check if it's actually a connectivity issue
      const hasInternet = await checkConnectivity();
      
      if (!hasInternet) {
        errorMessage = 'No internet connection. Please check your network and try again.';
        isNetworkError = true;
      } else {
        // Server might be down or unreachable
        errorMessage = 'Unable to connect to server. Please try again later.';
        isNetworkError = true;
      }
    }
    // Handle JSON parse error
    else if (error.name === 'SyntaxError') {
      errorMessage = 'Something went wrong. Please try again.';
    }
    // Handle other errors
    else if (error.message) {
      // Don't expose technical error messages to users
      console.error('Technical error:', error.message);
      errorMessage = 'Something went wrong. Please try again.';
    }

    // Show error toast
    if (showErrorToast) {
      toast.error(errorMessage);
    }

    return {
      status: false,
      message: errorMessage,
      isNetworkError,
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

/**
 * Upload file with FormData (multipart/form-data)
 */
export const uploadFile = async <T = any>(
  endpoint: string,
  formData: FormData,
  requiresAuth = true,
  showErrorToast = true,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    // Build headers - don't set Content-Type, let fetch set it for FormData
    const requestHeaders: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = await getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    console.log(`API Upload Request: POST ${url}`);

    // Use XMLHttpRequest for progress tracking if needed
    if (onProgress) {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          try {
            const responseData = JSON.parse(xhr.responseText);
            console.log('API Upload Response:', responseData);

            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(responseData);
            } else {
              const errorMessage = responseData.message || 'Something went wrong. Please try again.';
              if (showErrorToast) {
                toast.error(errorMessage);
              }
              resolve({
                status: false,
                message: errorMessage,
                errors: responseData.errors,
              });
            }
          } catch (e) {
            const errorMessage = 'Something went wrong. Please try again.';
            if (showErrorToast) {
              toast.error(errorMessage);
            }
            resolve({
              status: false,
              message: errorMessage,
            });
          }
        });

        xhr.addEventListener('error', () => {
          const errorMessage = 'Network error. Please check your connection and try again.';
          if (showErrorToast) {
            toast.error(errorMessage);
          }
          resolve({
            status: false,
            message: errorMessage,
            isNetworkError: true,
          });
        });

        xhr.addEventListener('timeout', () => {
          const errorMessage = 'Upload timed out. Please try again.';
          if (showErrorToast) {
            toast.error(errorMessage);
          }
          resolve({
            status: false,
            message: errorMessage,
            isNetworkError: true,
          });
        });

        xhr.open('POST', url);
        xhr.timeout = API_CONFIG.TIMEOUT * 3; // Triple timeout for uploads
        
        // Set headers
        Object.keys(requestHeaders).forEach((key) => {
          xhr.setRequestHeader(key, requestHeaders[key]);
        });

        xhr.send(formData);
      });
    }

    // Use fetch for simple uploads without progress
    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: formData,
    });

    const responseData = await response.json();
    console.log('API Upload Response:', responseData);

    if (!response.ok) {
      const errorMessage = responseData.message || 'Something went wrong. Please try again.';
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      return {
        status: false,
        message: errorMessage,
        errors: responseData.errors,
      };
    }

    if (responseData.status === false) {
      const errorMessage = responseData.message || 'Upload failed. Please try again.';
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      return responseData;
    }

    return responseData;
  } catch (error: any) {
    console.error('API Upload Error:', error);

    let errorMessage = 'Something went wrong. Please try again.';
    let isNetworkError = false;

    if (error.message === 'Network request failed' || error.message?.includes('Network')) {
      errorMessage = 'Network error. Please check your connection and try again.';
      isNetworkError = true;
    }

    if (showErrorToast) {
      toast.error(errorMessage);
    }

    return {
      status: false,
      message: errorMessage,
      isNetworkError,
    };
  }
};

export default {
  apiRequest,
  get,
  post,
  put,
  del,
  patch,
  uploadFile,
};
