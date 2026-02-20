'use client';

import { useTranslation } from 'react-i18next';
import { AlertTriangle, MapPin, Wind, Sun, Bug, Thermometer, Droplets, CloudRain } from 'lucide-react';

const alerts = [
    { title: 'Air Quality Warning', icon: Wind, color: '#F59E0B', bg: '#FFFBEB', severity: 'warning', location: 'New Delhi, India', description: 'AQI has risen to 182 — Unhealthy. Wear N95 masks outdoors. Avoid prolonged exposure.', time: '2 hours ago' },
    { title: 'Dengue Outbreak Alert', icon: Bug, color: '#EF4444', bg: '#FEF2F2', severity: 'danger', location: 'Mumbai, Maharashtra', description: 'Dengue cases increased 34% this week. Use mosquito repellent. Eliminate standing water.', time: '5 hours ago' },
    { title: 'UV Index High', icon: Sun, color: '#F59E0B', bg: '#FFFBEB', severity: 'warning', location: 'Chennai, Tamil Nadu', description: 'UV Index reached 9 (Very High). Apply SPF 50+ sunscreen. Avoid outdoor activities 11am-3pm.', time: '1 day ago' },
    { title: 'Heat Wave Advisory', icon: Thermometer, color: '#EF4444', bg: '#FEF2F2', severity: 'danger', location: 'Rajasthan', description: 'Temperatures expected to reach 45°C. Stay hydrated. Avoid direct sunlight.', time: '1 day ago' },
    { title: 'Water Quality Alert', icon: Droplets, color: '#3B82F6', bg: '#EFF6FF', severity: 'info', location: 'Bengaluru, Karnataka', description: 'Elevated TDS levels detected in tap water. Recommend using RO-purified water for drinking.', time: '2 days ago' },
    { title: 'Seasonal Flu Alert', icon: CloudRain, color: '#8B5CF6', bg: '#F5F3FF', severity: 'info', location: 'Nationwide', description: 'Flu season peak expected. Get vaccinated. Wash hands frequently.', time: '3 days ago' },
];

export default function HealthAlertsPage() {
    const { t } = useTranslation();

    return (
        <div style={{ padding: 32, maxWidth: 1000, overflowY: 'auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={28} color="#F59E0B" /> {t('healthAlerts.title')}
            </h1>
            <p style={{ color: '#64748B', fontSize: 15, marginBottom: 32 }}>
                {t('healthAlerts.subtitle')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {alerts.map((alert, i) => {
                    const Icon = alert.icon;
                    return (
                        <div key={i} className="card" style={{
                            padding: 24,
                            borderLeft: `4px solid ${alert.color}`,
                            animation: `fadeIn 0.3s ease ${i * 0.1}s forwards`,
                            opacity: 0,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 14, background: alert.bg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <Icon size={24} color={alert.color} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                            <h3 style={{ fontWeight: 600, fontSize: 16 }}>{alert.title}</h3>
                                            <span className={`badge badge-${alert.severity === 'danger' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}`}>
                                                {alert.severity.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94A3B8', fontSize: 12, marginBottom: 8 }}>
                                            <MapPin size={12} /> {alert.location}
                                        </div>
                                        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{alert.description}</p>
                                    </div>
                                </div>
                                <span style={{ fontSize: 12, color: '#CBD5E1', whiteSpace: 'nowrap', marginLeft: 16 }}>{alert.time}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
