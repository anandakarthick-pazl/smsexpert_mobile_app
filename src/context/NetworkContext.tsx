/**
 * Network Context
 * Monitors network connectivity and provides status throughout the app
 */

import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import {AppState, AppStateStatus, Platform} from 'react-native';

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  checkConnection: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

// Simple connectivity check by making a request to a reliable endpoint
const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Try to fetch from Google's generate_204 endpoint (very reliable)
    const response = await fetch('https://clients3.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.status === 204 || response.ok;
  } catch (error) {
    // If Google fails, try Cloudflare as backup
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://1.1.1.1/cdn-cgi/trace', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
};

export const NetworkProvider: React.FC<NetworkProviderProps> = ({children}) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

  // Check connection function
  const checkConnection = useCallback(async (): Promise<boolean> => {
    const connected = await checkInternetConnection();
    setIsConnected(connected);
    setIsInternetReachable(connected);
    return connected;
  }, []);

  // Initial check and periodic monitoring
  useEffect(() => {
    // Initial check
    checkConnection();

    // Check when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkConnection();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Periodic check every 10 seconds when app is active
    const intervalId = setInterval(() => {
      if (AppState.currentState === 'active') {
        checkConnection();
      }
    }, 10000);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [checkConnection]);

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
        checkConnection,
      }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export default NetworkContext;
