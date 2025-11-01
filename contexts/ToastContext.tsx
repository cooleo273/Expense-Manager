import { Toast } from '@/components/Toast';
import React, { createContext, ReactNode, useContext, useState } from 'react';

type ToastContextType = {
  showToast: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastDuration, setToastDuration] = useState(3000);

  const showToast = (message: string, duration = 3000) => {
    setToastMessage(message);
    setToastDuration(duration);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={hideToast}
        duration={toastDuration}
      />
    </ToastContext.Provider>
  );
};