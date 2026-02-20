'use client';

import { useAppStore } from '@/store/useAppStore';
import { MapPin, Wind, Sun, Bug, Thermometer, AlertTriangle, CloudRain, Droplets, TrendingUp, Shield } from 'lucide-react';

const cityAlerts: Record<string, { illnesses: { name: string; risk: string; desc: string; trend: string }[]; aqi: number; aqiLabel: string; weather: string; temp: number; humidity: number; seasonal: string[] }> = {
    default: {
        illnesses: [
            { name: 'Seasonal Flu', risk: 'Medium', desc: 'Flu cases rising due to temperature changes.', trend: '↑ 12% this week' },
            { name: 'Common Cold', risk: 'Low', desc: 'Standard prevalence for the season.', trend: '→ Stable' },
            { name: 'Dengue', risk: 'Low', desc: 'Monsoon season alert. Use mosquito repellent.', trend: '↓ 5% this month' },
        ],
        aqi: 95, aqiLabel: 'Moderate', weather: 'Cloudy', temp: 28, humidity: 65,
        seasonal: ['Wear masks in crowded areas', 'Stay hydrated — drink 3+ liters daily', 'Use insect repellent outdoors'],
    },
    Mumbai: {
        illnesses: [
            { name: 'Leptospirosis', risk: 'High', desc: 'Waterborne disease risk elevated during monsoon.', trend: '↑ 25% this month' },
            { name: 'Typhoid', risk: 'Medium', desc: 'Check water sources. Boil water before drinking.', trend: '↑ 8% this week' },
            { name: 'Malaria', risk: 'Medium', desc: 'Mosquito-borne. Use nets and repellent.', trend: '→ Stable' },
        ],
        aqi: 145, aqiLabel: 'Unhealthy for Sensitive Groups', weather: 'Humid', temp: 32, humidity: 85,
        seasonal: ['Avoid waterlogged areas', 'Carry ORS packets during commute', 'Monitor AQI before outdoor exercise'],
    },
    Delhi: {
        illnesses: [
            { name: 'Respiratory Issues', risk: 'High', desc: 'Air quality severely impacting lung health.', trend: '↑ 30% this month' },
            { name: 'Asthma Flareups', risk: 'High', desc: 'PM2.5 levels dangerous for sensitive groups.', trend: '↑ 20% this week' },
            { name: 'Eye Infections', risk: 'Medium', desc: 'Dust and pollution causing conjunctivitis.', trend: '↑ 10% this week' },
        ],
        aqi: 312, aqiLabel: 'Hazardous', weather: 'Hazy', temp: 25, humidity: 40,
        seasonal: ['Wear N95 mask outdoors', 'Use air purifiers indoors', 'Avoid morning walks when AQI > 200'],
    },
    Bangalore: {
        illnesses: [
            { name: 'Viral Fever', risk: 'Medium', desc: 'Cases uptick in surrounding areas.', trend: '↑ 15% this week' },
            { name: 'Chikungunya', risk: 'Low', desc: 'Isolated cases reported. Take preventive measures.', trend: '→ Stable' },
        ],
        aqi: 62, aqiLabel: 'Good', weather: 'Pleasant', temp: 24, humidity: 55,
        seasonal: ['Great weather for outdoor exercise', 'Allergy season — carry antihistamines', 'Stay hydrated despite cool weather'],
    },
};

function getAqiColor(aqi: number) {
    if (aqi <= 50) return '#22C55E';
    if (aqi <= 100) return '#EAB308';
    if (aqi <= 200) return '#F97316';
    if (aqi <= 300) return '#EF4444';
    return '#7C3AED';
}

function getRiskColor(risk: string) {
    if (risk === 'High') return '#EF4444';
    if (risk === 'Medium') return '#F59E0B';
    return '#22C55E';
}

export default function LocationHealthPage() {
    const { userProfile } = useAppStore();
    const city = userProfile?.city || 'default';
    const data = cityAlerts[city] || cityAlerts['default'];
    const displayCity = city === 'default' ? 'Your Area' : city;

    return (
        <div style={{ padding: '32px', overflowY: 'auto', maxHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <MapPin size={24} color="#0EA5A4" />
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>Health Alerts — {displayCity}</h1>
            </div>

            {/* Weather Strip */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28,
            }}>
                {[
                    { label: 'Temperature', value: `${data.temp}°C`, icon: Thermometer, color: '#EF4444' },
                    { label: 'AQI', value: `${data.aqi}`, icon: Wind, color: getAqiColor(data.aqi) },
                    { label: 'Weather', value: data.weather, icon: CloudRain, color: '#3B82F6' },
                    { label: 'Humidity', value: `${data.humidity}%`, icon: Droplets, color: '#0EA5A4' },
                ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} style={{
                            background: 'white', borderRadius: 16, padding: '18px 20px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                            display: 'flex', alignItems: 'center', gap: 14,
                        }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={20} color={item.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{item.label}</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>{item.value}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* AQI Detail Bar */}
            <div style={{
                padding: '16px 20px', borderRadius: 14, marginBottom: 28,
                background: `${getAqiColor(data.aqi)}15`, border: `1px solid ${getAqiColor(data.aqi)}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Wind size={18} color={getAqiColor(data.aqi)} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Air Quality Index: {data.aqi}</span>
                    <span style={{ padding: '2px 10px', borderRadius: 99, background: getAqiColor(data.aqi), color: 'white', fontSize: 11, fontWeight: 600 }}>
                        {data.aqiLabel}
                    </span>
                </div>
                <div style={{ width: 200, height: 8, borderRadius: 99, background: '#E2E8F0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(data.aqi / 5, 100)}%`, background: getAqiColor(data.aqi), borderRadius: 99 }} />
                </div>
            </div>

            {/* Trending Illnesses */}
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={20} color="#EF4444" /> Trending Illnesses
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
                {data.illnesses.map((illness, i) => (
                    <div key={i} style={{
                        background: 'white', borderRadius: 16, padding: 20,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9',
                        borderLeft: `4px solid ${getRiskColor(illness.risk)}`,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{illness.name}</h3>
                            <span style={{
                                padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                                background: `${getRiskColor(illness.risk)}15`, color: getRiskColor(illness.risk),
                            }}>
                                {illness.risk} Risk
                            </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 8 }}>{illness.desc}</p>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0EA5A4' }}>{illness.trend}</div>
                    </div>
                ))}
            </div>

            {/* Seasonal Health Tips */}
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={20} color="#22C55E" /> Seasonal Health Tips
            </h2>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                {data.seasonal.map((tip, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                        borderBottom: i < data.seasonal.length - 1 ? '1px solid #F8FAFC' : 'none',
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: '#334155' }}>{tip}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
