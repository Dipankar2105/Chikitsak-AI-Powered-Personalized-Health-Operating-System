'use client';

import { ReactNode } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Lock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PlanGuardProps {
    children: ReactNode;
    requireTier: 'free' | 'pro' | 'medical_plus';
    fallback?: ReactNode;
}

const TIER_WEIGHTS = {
    'free': 0,
    'pro': 1,
    'medical_plus': 2
};

export default function PlanGuard({ children, requireTier, fallback }: PlanGuardProps) {
    const { planTier, isAuthenticated } = useAppStore();
    const router = useRouter();

    const userWeight = TIER_WEIGHTS[planTier || 'free'];
    const requiredWeight = TIER_WEIGHTS[requireTier];

    if (userWeight >= requiredWeight) {
        return <>{children}</>;
    }

    if (fallback) return <>{fallback}</>;

    return (
        <div style={{
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F8FAFC',
            border: '2px dashed #E2E8F0',
            padding: 40,
            textAlign: 'center'
        }}>
            <div style={{ maxWidth: 400 }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%', background: '#F0FDFA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px', color: '#0EA5A4'
                }}>
                    <Lock size={32} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
                    Premium Feature
                </h3>
                <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: 32 }}>
                    The <strong>{requireTier.replace('_', '+').toUpperCase()}</strong> plan is required to access this specialized health module. Upgrade now to unlock full AI capabilities.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    {!isAuthenticated ? (
                        <button
                            onClick={() => router.push('/login')}
                            className="btn-login"
                            style={{ padding: '12px 24px' }}
                        >
                            Sign In to Check
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push('/app/settings?activeTab=plan')}
                            className="btn-gradient"
                            style={{ padding: '12px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <Sparkles size={18} /> Upgrade Plan
                        </button>
                    )}
                </div>
            </div>

            {/* Blurred background preview to make it look premium */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                opacity: 0.1, zIndex: -1, pointerEvents: 'none', filter: 'blur(4px)'
            }}>
                {children}
            </div>
        </div>
    );
}
