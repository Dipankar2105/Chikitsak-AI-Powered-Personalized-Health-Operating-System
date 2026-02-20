'use client';

import { useTranslation } from 'react-i18next';
import { MapPin, Wind, Sun, AlertTriangle } from 'lucide-react';

const alerts = [
    {
        key: 'aqi',
        icon: Wind,
        color: '#F59E0B',
        bg: '#FFFBEB',
        value: 'AQI: 142 — Unhealthy for Sensitive Groups',
        location: 'New Delhi, India',
    },
    {
        key: 'outbreak',
        icon: AlertTriangle,
        color: '#EF4444',
        bg: '#FEF2F2',
        value: 'Dengue cases rising 23% this week',
        location: 'Mumbai Region',
    },
    {
        key: 'uv',
        icon: Sun,
        color: '#F59E0B',
        bg: '#FFFBEB',
        value: 'UV Index: 9 — Very High',
        location: 'Chennai, India',
    },
];

export default function HealthAlerts() {
    const { t } = useTranslation();

    return (
        <section style={{
            padding: '80px 24px',
            background: '#FFFBEB08',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
                        {t('healthAlerts.title')}
                    </h2>
                    <p style={{ color: '#64748B', fontSize: 16 }}>
                        {t('healthAlerts.subtitle')}
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 20,
                }}>
                    {alerts.map((alert) => {
                        const Icon = alert.icon;
                        return (
                            <div key={alert.key} className="card" style={{
                                padding: 24,
                                borderLeft: `4px solid ${alert.color}`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        background: alert.bg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icon size={22} color={alert.color} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 600, fontSize: 14 }}>
                                            {t(`healthAlerts.${alert.key}`)}
                                        </h4>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            color: '#94A3B8', fontSize: 12,
                                        }}>
                                            <MapPin size={12} />
                                            {alert.location}
                                        </div>
                                    </div>
                                </div>
                                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
                                    {alert.value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
