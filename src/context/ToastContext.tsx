/**
 * Toast Context
 * Provides global toast notifications throughout the app
 */

import React, {createContext, useContext, useState, useCallback, ReactNode} from 'react';
import Toast, {ToastType} from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({children}) => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
  });

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  }, []);

  const showSuccess = useCallback((message: string, duration: number = 3000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration: number = 4000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration: number = 3500) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration: number = 3000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const hideToast = useCallback(() => {
    setToast(prev => ({...prev, visible: false}));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideToast,
      }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Global toast functions for use outside React components (like in services)
let globalShowToast: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export const setGlobalToast = (showToast: (message: string, type?: ToastType, duration?: number) => void) => {
  globalShowToast = showToast;
};

export const toast = {
  show: (message: string, type?: ToastType, duration?: number) => {
    if (globalShowToast) {
      globalShowToast(message, type, duration);
    } else {
      console.warn('Toast not initialized. Make sure ToastProvider is mounted.');
    }
  },
  success: (message: string, duration?: number) => {
    toast.show(message, 'success', duration);
  },
  error: (message: string, duration?: number) => {
    toast.show(message, 'error', duration || 4000);
  },
  warning: (message: string, duration?: number) => {
    toast.show(message, 'warning', duration);
  },
  info: (message: string, duration?: number) => {
    toast.show(message, 'info', duration);
  },
};

export default ToastContext;
