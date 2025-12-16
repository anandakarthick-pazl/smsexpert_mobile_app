/**
 * Delivery Receipt Service
 * Handle all delivery receipt-related API calls
 */

import {get, post} from './apiService';

export interface ConnectionSettings {
  attempts: number;
  pause_minutes: number;
}

export interface TestDefaults {
  msisdn: string;
  submission_reference: string;
}

export interface DeliveryReceiptSettings {
  delivery_url: string;
  connection_settings: ConnectionSettings;
  test_defaults: TestDefaults;
}

export interface DeliveryReceiptResponse {
  success: boolean;
  message?: string;
  data?: DeliveryReceiptSettings;
}

export interface UpdateUrlResponse {
  success: boolean;
  message?: string;
  data?: {
    delivery_url: string;
  };
}

export interface TestPayload {
  msisdn: string;
  submission_reference: string;
  status: string;
  status_code: string;
  status_text: string;
  delivery_time: string;
  test_mode: boolean;
  timestamp: number;
}

export interface TestResult {
  url: string;
  payload_sent: TestPayload;
  response_status: number | null;
  response_body: string | null;
  success: boolean;
  error?: string;
}

export interface TestResponse {
  success: boolean;
  message?: string;
  data?: TestResult;
}

/**
 * Get delivery receipt settings
 */
export const getDeliveryReceiptSettings = async (): Promise<DeliveryReceiptResponse> => {
  try {
    const response = await get('delivery-receipt');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Delivery Receipt Settings Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load delivery receipt settings',
    };
  }
};

/**
 * Update delivery receipt URL
 */
export const updateDeliveryReceiptUrl = async (url: string): Promise<UpdateUrlResponse> => {
  try {
    const response = await post('delivery-receipt/url', { url });
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Update Delivery Receipt URL Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update delivery receipt URL',
    };
  }
};

/**
 * Test delivery receipt mechanism
 */
export const testDeliveryReceipt = async (
  msisdn?: string,
  submissionReference?: string
): Promise<TestResponse> => {
  try {
    const payload: any = {};
    if (msisdn) payload.msisdn = msisdn;
    if (submissionReference) payload.submission_reference = submissionReference;

    const response = await post('delivery-receipt/test', payload);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Test Delivery Receipt Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to test delivery receipt',
    };
  }
};
