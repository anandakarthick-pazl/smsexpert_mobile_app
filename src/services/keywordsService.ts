// Keywords Service - API calls for keywords management
import {API_CONFIG} from './api.config';
import {getToken} from './storageService';

export interface Keyword {
  id: number;
  keyword: string;
  virtual_number: string;
  type: 'keyword' | 'dedicated';
  description: string;
  expiry_date: string;
  expiry_formatted: string;
  purchased_date: string;
  days_until_expiry: number;
  status: 'active' | 'expired' | 'expiring_soon';
  status_text: string;
  response_sender_id: string;
  response_content: string;
  forwarding_email: string;
  forwarding_url: string;
  modules_enabled: number;
  module_restrict: number;
  show_subkeyword_management: boolean;
}

export interface KeywordDetail extends Keyword {
  smsshortcodes_id: number;
  response_smsshortcodes_id: number;
  advertise: string;
  allowed_mobile_update_numbers: string;
  allow_mobile_update_across_subkeys: string;
}

export interface SmsShortcode {
  id: number;
  number: string;
}

export interface Subkeyword {
  keyword: string;
  response_sender_id: string;
  response_content: string;
  response_smsshortcodes_id: number;
  forwarding_email: string;
  forwarding_url: string;
  modules_enabled?: number;
}

export interface KeywordsResponse {
  success: boolean;
  data: {
    keywords: Keyword[];
    total_keywords: number;
    keywords_left: number;
    has_platinum_access: boolean;
    shortcode: string;
  };
  message?: string;
}

export interface KeywordDetailResponse {
  success: boolean;
  data: {
    keyword: KeywordDetail;
    sms_shortcodes: SmsShortcode[];
    subkeywords: Subkeyword[];
    enabled_modules: Record<string, boolean>;
    active_modules: Record<string, boolean>;
    show_subkeyword_management: boolean;
    is_star_keyword: boolean;
  };
  message?: string;
}

export interface SubkeywordsResponse {
  success: boolean;
  data: {
    subkeywords: Subkeyword[];
    total: number;
  };
  message?: string;
}

export interface AvailabilityResponse {
  success: boolean;
  available: boolean;
  keyword: string;
  shortcode: string;
  message: string;
}

// Get all keywords
export const getKeywords = async (): Promise<KeywordsResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}keywords`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch keywords');
  }

  return data;
};

// Get single keyword details
export const getKeywordDetails = async (
  keywordId: number,
): Promise<KeywordDetailResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}keywords/${keywordId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch keyword details');
  }

  return data;
};

// Update SMS Responder settings
export const updateSmsResponder = async (
  keywordId: number,
  params: {
    sender_id: string;
    response_text: string;
    response_route: number;
    allowed_update_numbers?: string;
    allow_subkeys: '0' | '1';
    subkeyword?: string;
    advertise?: '0' | '1';
  },
): Promise<{success: boolean; message: string}> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}keywords/${keywordId}/sms-responder`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update SMS Responder');
  }

  return data;
};

// Update Email Forwarder settings
export const updateEmailForwarder = async (
  keywordId: number,
  params: {
    email_address?: string;
    url_address?: string;
    subkeyword?: string;
  },
): Promise<{success: boolean; message: string}> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}keywords/${keywordId}/email-forwarder`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update Email Forwarder');
  }

  return data;
};

// Toggle module on/off
export const toggleModule = async (
  keywordId: number,
  params: {
    module: string;
    action: 'on' | 'off';
    subkeyword?: string;
  },
): Promise<{success: boolean; message: string; status: string}> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}keywords/${keywordId}/toggle-module`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to toggle module');
  }

  return data;
};

// Get subkeywords
export const getSubkeywords = async (
  keywordId: number,
): Promise<SubkeywordsResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}keywords/${keywordId}/subkeywords`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch subkeywords');
  }

  return data;
};

// Add subkeyword
export const addSubkeyword = async (
  keywordId: number,
  subkeyword: string,
): Promise<{success: boolean; message: string}> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}keywords/${keywordId}/subkeywords`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({subkeyword}),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to add subkeyword');
  }

  return data;
};

// Delete subkeyword
export const deleteSubkeyword = async (
  keywordId: number,
  subkeyword: string,
): Promise<{success: boolean; message: string}> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}keywords/${keywordId}/subkeywords/${encodeURIComponent(
      subkeyword,
    )}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete subkeyword');
  }

  return data;
};

// Check keyword availability
export const checkKeywordAvailability = async (
  keyword: string,
): Promise<AvailabilityResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}keywords/check-availability`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({keyword}),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to check keyword availability');
  }

  return data;
};

// Export all functions as default object
export default {
  getKeywords,
  getKeywordDetails,
  updateSmsResponder,
  updateEmailForwarder,
  toggleModule,
  getSubkeywords,
  addSubkeyword,
  deleteSubkeyword,
  checkKeywordAvailability,
};
