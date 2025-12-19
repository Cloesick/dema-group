'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <FiCheck className="h-5 w-5" />,
  error: <FiX className="h-5 w-5" />,
  warning: <FiAlertCircle className="h-5 w-5" />,
  info: <FiInfo className="h-5 w-5" />,
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-primary/10 border-primary/30 text-primary-dark',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-green-500 bg-green-100',
  error: 'text-red-500 bg-red-100',
  warning: 'text-yellow-500 bg-yellow-100',
  info: 'text-primary bg-primary/20',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${toastStyles[toast.type]}`}
      role="alert"
    >
      <div className={`flex-shrink-0 p-1 rounded-full ${iconStyles[toast.type]}`}>
        {toastIcons[toast.type]}
      </div>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Dismiss"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
