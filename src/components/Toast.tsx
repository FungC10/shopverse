'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast, type ToastVariant } from '@/lib/useToast';

function ToastItem({
  id,
  title,
  message,
  variant,
  onClose,
}: {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  onClose: () => void;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [isPaused, onClose]);

  const variantStyles = {
    success: 'bg-green-500/90 text-white border-green-400/50',
    error: 'bg-red-500/90 text-white border-red-400/50',
    info: 'bg-cyan-500/90 text-white border-cyan-400/50',
  };

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`rounded-lg border shadow-lg backdrop-blur-sm px-4 py-3 min-w-[300px] max-w-md ${
        variantStyles[variant]
      } transition-all duration-300`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-sm">{message}</div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Toast() {
  const { toasts, remove } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          title={toast.title}
          message={toast.message}
          variant={toast.variant}
          onClose={() => remove(toast.id)}
        />
      ))}
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id}>
            {toast.variant === 'error' && 'Error: '}
            {toast.variant === 'success' && 'Success: '}
            {toast.variant === 'info' && 'Info: '}
            {toast.title && `${toast.title}. `}
            {toast.message}
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}
