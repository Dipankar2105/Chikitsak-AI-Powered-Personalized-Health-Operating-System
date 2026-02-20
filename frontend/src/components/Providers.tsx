'use client';

import { ReactNode, useEffect } from 'react';
import i18n from '@/lib/i18n';
import { ToastProvider } from '@/context/ToastContext';
import { useAppStore } from '@/store/useAppStore';

export default function Providers({ children }: { children: ReactNode }) {
    const language = useAppStore((s) => s.language);

    // Sync stored language with i18next on mount and when language changes
    useEffect(() => {
        if (language && i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language]);

    return (
        <ToastProvider>
            {children}
        </ToastProvider>
    );
}
