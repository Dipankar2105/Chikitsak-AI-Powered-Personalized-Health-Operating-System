'use client';

import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { Phone, X, AlertTriangle } from 'lucide-react';

export default function EmergencyOverlay() {
    const { t } = useTranslation();
    const { emergencyActive, dismissEmergency } = useAppStore();

    if (!emergencyActive) return null;

    return (
        <div className="emergency-overlay">
            <button onClick={dismissEmergency} style={{
                position: 'absolute', top: 24, right: 24,
                background: 'rgba(255,255,255,0.2)', border: 'none',
                borderRadius: 12, padding: 12, cursor: 'pointer', color: 'white',
            }}>
                <X size={24} />
            </button>

            <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
            }}>
                <AlertTriangle size={40} color="white" />
            </div>

            <h1 style={{
                color: 'white', fontSize: 36, fontWeight: 800,
                marginBottom: 12, textAlign: 'center',
            }}>
                🚨 {t('emergency.title')}
            </h1>

            <p style={{
                color: 'rgba(255,255,255,0.9)', fontSize: 18,
                marginBottom: 40, textAlign: 'center',
            }}>
                {t('emergency.subtitle')}
            </p>

            <a href={`tel:${t('emergency.number')}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: 'white', color: '#EF4444',
                padding: '18px 40px', borderRadius: 16,
                fontSize: 20, fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
                <Phone size={24} />
                {t('emergency.callNow')} — {t('emergency.number')}
            </a>

            <p style={{
                color: 'rgba(255,255,255,0.8)', fontSize: 14,
                marginTop: 24, textAlign: 'center',
            }}>
                {t('emergency.instruction')}
            </p>
        </div>
    );
}
