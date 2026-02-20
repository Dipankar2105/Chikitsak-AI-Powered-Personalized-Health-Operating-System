'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import EmergencyOverlay from '@/components/EmergencyOverlay';
import DisclaimerModal from '@/components/DisclaimerModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { disclaimerAccepted, acceptDisclaimer, isAuthenticated } = useAppStore();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auth guard: redirect unauthenticated users to login
    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [mounted, isAuthenticated, router, pathname]);

    if (!mounted) return null;

    // Don't render app content if not authenticated
    if (!isAuthenticated) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', background: '#F8FAFC', color: '#64748B',
                fontSize: 15,
            }}>
                Redirecting to login...
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            <Sidebar />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {children}
            </main>
            <EmergencyOverlay />
            {!disclaimerAccepted && <DisclaimerModal onAccept={acceptDisclaimer} />}
        </div>
    );
}
