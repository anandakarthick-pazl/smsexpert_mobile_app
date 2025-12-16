/**
 * Quick Campaign Service
 * Handle all campaign related API calls
 */

import {get, post, del, uploadFile} from './apiService';

export interface SenderId {
  label: string;
  value: string;
}

export interface SenderIdResponse {
  success: boolean;
  message?: string;
  data?: {
    sender_ids: string[];
    count: number;
  };
}

export interface BulkCampaignUploadResponse {
  success: boolean;
  message?: string;
  errors?: string[];
  data?: {
    campaign_id: string;
    campaign_name: string;
    line_count: number;
    original_filename?: string;
    file_size?: number;
    status: string;
  };
}

export interface SampleCsvResponse {
  success: boolean;
  message?: string;
  data?: {
    filename: string;
    content: string; // base64 encoded
    mime_type: string;
  };
}

export interface CSVColumn {
  column: number;
  name: string;
  description: string;
  required: boolean;
  example: string;
}

export interface CSVGuideResponse {
  success: boolean;
  message?: string;
  data?: CSVColumn[];
}

export interface CampaignSubmitData {
  campaign_name: string;
  sender_id: string;
  other_sender_id?: string;
  recipients: string;
  message: string;
  route_letter?: string;
}

export interface CampaignSubmitResponse {
  success: boolean;
  message?: string;
  errors?: string[];
  data?: {
    campaign_id: string;
    campaign_name: string;
    recipient_count: number;
    sender_id: string;
    status: string;
  };
}

export interface Campaign {
  id: number;
  campaign_id: string;
  campaign_name: string;
  status: string;
  status_info: string | null;
  num_lines: number;
  num_lines_done: number;
  progress_percent: number;
  datetime: string;
  datetime_raw?: string;
}

export interface CampaignHistoryResponse {
  success: boolean;
  message?: string;
  data?: {
    campaigns: Campaign[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface CampaignActionResponse {
  success: boolean;
  message?: string;
  data?: {
    campaign_id: string;
    status?: string;
  };
}

/**
 * Get available sender IDs for the user
 */
export const getSenderIds = async (): Promise<SenderIdResponse> => {
  try {
    const response = await get('campaign/sender-ids');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Sender IDs Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load sender IDs',
    };
  }
};

/**
 * Submit a quick campaign
 */
export const submitQuickCampaign = async (data: CampaignSubmitData): Promise<CampaignSubmitResponse> => {
  try {
    const response = await post('campaign/quick', data);
    
    return {
      success: response.status || response.success,
      message: response.message,
      errors: response.errors,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Submit Campaign Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to submit campaign',
      errors: error.response?.data?.errors,
    };
  }
};

/**
 * Get campaign history
 */
export const getCampaignHistory = async (page: number = 1, perPage: number = 20): Promise<CampaignHistoryResponse> => {
  try {
    const response = await get(`campaign/history?page=${page}&per_page=${perPage}`);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Campaign History Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load campaign history',
    };
  }
};

/**
 * Get single campaign details
 */
export const getCampaignDetails = async (campaignId: string): Promise<CampaignActionResponse & {data?: Campaign}> => {
  try {
    const response = await get(`campaign/${campaignId}`);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Campaign Details Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load campaign details',
    };
  }
};

/**
 * Pause a campaign
 */
export const pauseCampaign = async (campaignId: string): Promise<CampaignActionResponse> => {
  try {
    const response = await post(`campaign/${campaignId}/pause`, {});
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Pause Campaign Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to pause campaign',
    };
  }
};

/**
 * Resume a campaign
 */
export const resumeCampaign = async (campaignId: string): Promise<CampaignActionResponse> => {
  try {
    const response = await post(`campaign/${campaignId}/resume`, {});
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Resume Campaign Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to resume campaign',
    };
  }
};

/**
 * Delete a campaign
 */
export const deleteCampaign = async (campaignId: string): Promise<CampaignActionResponse> => {
  try {
    const response = await del(`campaign/${campaignId}`);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Delete Campaign Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete campaign',
    };
  }
};

/**
 * Format sender IDs for dropdown
 */
export const formatSenderIdsForDropdown = (senderIds: string[]): SenderId[] => {
  const options: SenderId[] = [
    {label: 'Choose...', value: 'choose'},
    {label: "Use 'other sender id'", value: 'useotherbelow'},
  ];
  
  senderIds.forEach(id => {
    options.push({label: id, value: id});
  });
  
  return options;
};

/**
 * Get status color based on campaign status
 */
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'done':
      return '#16a34a'; // green
    case 'processing':
    case 'filewaiting':
    case 'sending':
      return '#ea6118'; // orange
    case 'paused':
      return '#f59e0b'; // yellow
    case 'failed':
    case 'deleted':
      return '#dc2626'; // red
    default:
      return '#64748b'; // gray
  }
};

/**
 * Get status label for display
 */
export const getStatusLabel = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'filewaiting':
      return 'Processing';
    case 'completed':
    case 'done':
      return 'Completed';
    case 'processing':
      return 'Processing';
    case 'sending':
      return 'Sending';
    case 'paused':
      return 'Paused';
    case 'failed':
      return 'Failed';
    case 'deleted':
      return 'Deleted';
    default:
      return status;
  }
};

/**
 * Upload a bulk campaign file
 */
export const uploadBulkCampaign = async (
  campaignName: string,
  file: {
    uri: string;
    name: string;
    type: string;
  }
): Promise<BulkCampaignUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('campaign_name', campaignName);
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type || 'text/csv',
    } as any);

    const response = await uploadFile('campaign/bulk-upload', formData);
    
    return {
      success: response.status || response.success,
      message: response.message,
      errors: response.errors,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Bulk Campaign Upload Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to upload campaign file',
      errors: error.response?.data?.errors,
    };
  }
};

/**
 * Download sample CSV
 */
export const downloadSampleCsv = async (): Promise<SampleCsvResponse> => {
  try {
    const response = await get('campaign/sample-csv');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Sample CSV Download Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to download sample CSV',
    };
  }
};

/**
 * Get CSV format guide
 */
export const getCsvFormatGuide = async (): Promise<CSVGuideResponse> => {
  try {
    const response = await get('campaign/csv-guide');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('CSV Guide Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to get CSV format guide',
    };
  }
};

/**
 * Decode base64 content to string
 */
export const decodeBase64 = (base64: string): string => {
  try {
    return atob(base64);
  } catch (error) {
    console.error('Base64 decode error:', error);
    return '';
  }
};
