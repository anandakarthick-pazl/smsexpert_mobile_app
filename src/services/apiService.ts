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
              const errorMessage = responseData.message || `HTTP Error: ${xhr.status}`;
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
            const errorMessage = 'Failed to parse server response';
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
          const errorMessage = 'Network error during upload';
          if (showErrorToast) {
            toast.error(errorMessage);
          }
          resolve({
            status: false,
            message: errorMessage,
          });
        });

        xhr.addEventListener('timeout', () => {
          const errorMessage = 'Upload timeout';
          if (showErrorToast) {
            toast.error(errorMessage);
          }
          resolve({
            status: false,
            message: errorMessage,
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
      const errorMessage = responseData.message || `HTTP Error: ${response.status}`;
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
      const errorMessage = responseData.message || 'Upload failed';
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      return responseData;
    }

    return responseData;
  } catch (error: any) {
    console.error('API Upload Error:', error);

    let errorMessage = 'Upload failed';
    if (error.message === 'Network request failed') {
      errorMessage = 'Network error during upload. Please check your connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    if (showErrorToast) {
      toast.error(errorMessage);
    }

    return {
      status: false,
      message: errorMessage,
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
