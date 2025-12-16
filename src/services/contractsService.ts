/**
 * Contracts Service
 * Handle all contracts-related API calls
 */

import {get, post} from './apiService';

export interface ContractItem {
  id: number;
  title: string;
  type: string;
  version: number;
  updated_at: string | null;
  has_file: boolean;
  file_name: string | null;
  file_type: string;
  file_size: string | null;
  requires_signature: boolean;
  signature_status: 'none' | 'signed' | 'pending';
  signed_at: string | null;
  content?: string;
}

export interface PricingTier {
  range: string;
  price: string;
}

export interface PricingItem {
  title: string;
  description?: string;
  price?: string;
  icon: string;
  tiers?: PricingTier[];
}

export interface PricingInfo {
  effective_date: string;
  items: PricingItem[];
}

export interface ContractStatistics {
  master_agreements: number;
  addendums: number;
  privacy_policies: number;
  signed: number;
  pending: number;
}

export interface AgreementStatus {
  has_agreed: boolean;
  agreed_date: string | null;
}

export interface ContractsResponse {
  success: boolean;
  message?: string;
  data?: {
    statistics: ContractStatistics;
    main_contracts: ContractItem[];
    addendums: ContractItem[];
    privacy_policies: ContractItem[];
    pricing: PricingInfo;
    agreement_status: AgreementStatus;
  };
}

export interface ContractDetailResponse {
  success: boolean;
  message?: string;
  data?: ContractItem;
}

export interface DownloadResponse {
  success: boolean;
  message?: string;
  data?: {
    url: string;
    file_name: string;
    file_type: string;
    file_size: string;
  };
}

/**
 * Get all contracts
 */
export const getContracts = async (): Promise<ContractsResponse> => {
  try {
    const response = await get('contracts');
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Contracts Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load contracts',
    };
  }
};

/**
 * Get single contract details
 */
export const getContractDetail = async (id: number): Promise<ContractDetailResponse> => {
  try {
    const response = await get(`contracts/${id}`);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Contract Detail Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load contract details',
    };
  }
};

/**
 * Sign a contract with hand signature
 * @param id Contract ID
 * @param signatureData Base64 encoded signature image (PNG format)
 */
export const signContract = async (
  id: number, 
  signatureData?: string
): Promise<{success: boolean; message?: string}> => {
  try {
    const response = await post(`contracts/${id}/sign`, {
      signature: signatureData,
    });
    
    return {
      success: response.status || response.success,
      message: response.message,
    };
  } catch (error: any) {
    console.error('Sign Contract Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to sign contract',
    };
  }
};

/**
 * Get download URL for contract
 */
export const getContractDownloadUrl = async (id: number): Promise<DownloadResponse> => {
  try {
    const response = await get(`contracts/${id}/download`);
    
    return {
      success: response.status || response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Get Download URL Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to get download URL',
    };
  }
};
