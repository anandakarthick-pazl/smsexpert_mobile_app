/**
 * Groups Service
 * Handle all group-related API calls
 */

import {get, post, put, del} from './apiService';

export interface Group {
  id: number;
  name: string;
  member_count: number;
}

export interface GroupMember {
  id: number;
  name: string;
  phone: string;
  network: string;
  is_favourite: boolean;
}

export interface GroupDetails {
  id: number;
  name: string;
  member_count: number;
  members: GroupMember[];
}

export interface GroupStatistics {
  total_groups: number;
  total_members: number;
  active_groups: number;
}

export interface GroupsResponse {
  success: boolean;
  message?: string;
  data?: {
    groups: Group[];
    statistics: GroupStatistics;
  };
}

export interface GroupResponse {
  success: boolean;
  message?: string;
  data?: GroupDetails | Group;
}

export interface AvailableContactsResponse {
  success: boolean;
  message?: string;
  data?: GroupMember[];
}

/**
 * Get all groups with member counts
 */
export const getGroups = async (search?: string): Promise<GroupsResponse> => {
  try {
    let url = 'groups';
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    
    const response = await get(url);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Groups Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load groups',
    };
  }
};

/**
 * Get single group with members
 */
export const getGroup = async (id: number): Promise<GroupResponse> => {
  try {
    const response = await get(`groups/${id}`);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Group Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load group',
    };
  }
};

/**
 * Create new group
 */
export const createGroup = async (name: string): Promise<GroupResponse> => {
  try {
    const response = await post('groups', { name });
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Create Group Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create group',
    };
  }
};

/**
 * Update group
 */
export const updateGroup = async (id: number, name: string): Promise<GroupResponse> => {
  try {
    const response = await put(`groups/${id}`, { name });
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Update Group Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update group',
    };
  }
};

/**
 * Delete group
 */
export const deleteGroup = async (id: number): Promise<{success: boolean; message?: string}> => {
  try {
    const response = await del(`groups/${id}`);
    
    return {
      success: response.status || response.success,
      message: response.message,
    };
  } catch (error: any) {
    console.error('Delete Group Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete group',
    };
  }
};

/**
 * Get available contacts to add to group
 */
export const getAvailableContacts = async (groupId: number): Promise<AvailableContactsResponse> => {
  try {
    const response = await get(`groups/${groupId}/available-contacts`);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Available Contacts Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load available contacts',
    };
  }
};

/**
 * Add member to group
 */
export const addMemberToGroup = async (
  groupId: number,
  contactId: number
): Promise<{success: boolean; message?: string; data?: {group_id: number; member_count: number}}> => {
  try {
    const response = await post(`groups/${groupId}/members`, { contact_id: contactId });
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Add Member Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add member',
    };
  }
};

/**
 * Remove member from group
 */
export const removeMemberFromGroup = async (
  groupId: number,
  contactId: number
): Promise<{success: boolean; message?: string; data?: {group_id: number; member_count: number}}> => {
  try {
    const response = await del(`groups/${groupId}/members/${contactId}`);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Remove Member Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to remove member',
    };
  }
};
