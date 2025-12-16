/**
 * Numbers/Contacts Service
 * Handle all numbers/address book related API calls
 */

import {get, post, put, del} from './apiService';

export interface Contact {
  id: number;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  group_id?: number;
  network?: string;
  is_favourite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactsResponse {
  items: Contact[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_more: boolean;
  };
}

export interface CreateContactData {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  group_id?: number;
  is_favourite?: boolean;
}

export interface UpdateContactData {
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  group_id?: number;
  is_favourite?: boolean;
}

/**
 * Get all contacts with pagination and search
 */
export const getContacts = async (
  page: number = 1,
  perPage: number = 50,
  search?: string,
  groupId?: number
): Promise<{success: boolean; data?: ContactsResponse; message?: string}> => {
  try {
    let endpoint = `contacts?page=${page}&per_page=${perPage}`;
    
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    
    if (groupId) {
      endpoint += `&group_id=${groupId}`;
    }
    
    const response = await get<ContactsResponse>(endpoint);
    
    return {
      success: response.status,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch contacts',
    };
  }
};

/**
 * Get single contact details
 */
export const getContact = async (
  id: number
): Promise<{success: boolean; data?: Contact; message?: string}> => {
  try {
    const response = await get<Contact>(`contacts/${id}`);
    
    return {
      success: response.status,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch contact',
    };
  }
};

/**
 * Create new contact
 */
export const createContact = async (
  data: CreateContactData
): Promise<{success: boolean; data?: Contact; message?: string}> => {
  try {
    const response = await post<Contact>('contacts', data);
    
    return {
      success: response.status,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create contact',
    };
  }
};

/**
 * Update existing contact
 */
export const updateContact = async (
  id: number,
  data: UpdateContactData
): Promise<{success: boolean; data?: Contact; message?: string}> => {
  try {
    const response = await put<Contact>(`contacts/${id}`, data);
    
    return {
      success: response.status,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update contact',
    };
  }
};

/**
 * Delete contact
 */
export const deleteContact = async (
  id: number
): Promise<{success: boolean; message?: string}> => {
  try {
    const response = await del(`contacts/${id}`);
    
    return {
      success: response.status,
      message: response.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete contact',
    };
  }
};

/**
 * Delete all contacts
 */
export const deleteAllContacts = async (): Promise<{success: boolean; message?: string}> => {
  try {
    const response = await del('contacts/delete-all');
    
    return {
      success: response.status,
      message: response.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete all contacts',
    };
  }
};

export default {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  deleteAllContacts,
};
