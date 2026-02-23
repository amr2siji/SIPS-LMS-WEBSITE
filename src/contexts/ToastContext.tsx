import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastProps } from '../components/Toast';

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'onClose'>) => void;
  showSuccess: (title: string, message: string, details?: string[]) => void;
  showError: (title: string, message: string, details?: string[]) => void;
  showWarning: (title: string, message: string, details?: string[]) => void;
  showInfo: (title: string, message: string, details?: string[]) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastWithId extends Omit<ToastProps, 'onClose'> {
  id: string;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastWithId[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const showSuccess = useCallback((title: string, message: string, details?: string[]) => {
    showToast({ type: 'success', title, message, details });
  }, [showToast]);

  const showError = useCallback((title: string, message: string, details?: string[]) => {
    showToast({ type: 'error', title, message, details });
  }, [showToast]);

  const showWarning = useCallback((title: string, message: string, details?: string[]) => {
    showToast({ type: 'warning', title, message, details });
  }, [showToast]);

  const showInfo = useCallback((title: string, message: string, details?: string[]) => {
    showToast({ type: 'info', title, message, details });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-4 max-w-md">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
