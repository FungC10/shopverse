'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toasts: ToastData[];
  push: (toast: { title?: string; message: string; variant?: ToastVariant }) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const push = useCallback((toast: { title?: string; message: string; variant?: ToastVariant }) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: ToastData = {
      id,
      title: toast.title,
      message: toast.message,
      variant: toast.variant || 'success',
    };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return <ToastContext.Provider value={{ toasts, push, remove }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

