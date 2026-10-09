import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="toast-container" style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            borderLeft: `4px solid ${
              toast.type === 'success' ? 'var(--success-color)' :
              toast.type === 'error' ? 'var(--danger-color)' :
              toast.type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)'
            }`,
            minWidth: '280px',
            maxWidth: '420px',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {toast.type === 'success' && <CheckCircle2 size={18} color="var(--success-color)" />}
            {toast.type === 'error' && <AlertCircle size={18} color="var(--danger-color)" />}
            {toast.type === 'warning' && <AlertTriangle size={18} color="var(--warning-color)" />}
            {toast.type === 'info' && <Info size={18} color="var(--primary-color)" />}
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
            <button 
              type="button" 
              onClick={() => removeToast(toast.id)} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
