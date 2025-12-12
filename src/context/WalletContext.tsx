/**
 * Wallet Context
 * Provides wallet balance across all screens
 */

import React, {createContext, useContext, useState, useCallback, ReactNode} from 'react';
import {getWalletBalance, formatWalletBalance, WalletData} from '../services/walletService';

interface WalletContextType {
  walletData: WalletData | null;
  walletBalance: string;
  isLoading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
}

const defaultWalletContext: WalletContextType = {
  walletData: null,
  walletBalance: '£0.00',
  isLoading: false,
  error: null,
  refreshWallet: async () => {},
};

const WalletContext = createContext<WalletContextType>(defaultWalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({children}) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('£0.00');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getWalletBalance();

      if (result.success && result.data) {
        setWalletData(result.data);
        setWalletBalance(formatWalletBalance(result.data.balance, result.data.currency));
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error('Error refreshing wallet:', err);
      setError(err.message || 'Failed to refresh wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletData,
        walletBalance,
        isLoading,
        error,
        refreshWallet,
      }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default WalletContext;
