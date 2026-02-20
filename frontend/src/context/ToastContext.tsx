'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-dismiss
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div style={{
                position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                display: 'flex', flexDirection: 'column', gap: 12
            }}>
                {toasts.map((toast) => (
                    <div key={toast.id} style={{
                        minWidth: 300, padding: 16, borderRadius: 12,
                        background: 'white',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        borderLeft: `4px solid ${toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#3B82F6'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {toast.type === 'success' && <CheckCircle size={20} color="#10B981" />}
                            {toast.type === 'error' && <AlertCircle size={20} color="#EF4444" />}
                            {toast.type === 'info' && <Info size={20} color="#3B82F6" />}
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#1E293B' }}>{toast.message}</span>
                        </div>
                        <button onClick={() => removeToast(toast.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
