'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MapPin, Wind, Thermometer, AlertTriangle, Droplets, TrendingUp, Shield, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import PlanGuard from '@/components/PlanGuard';

interface LocationData {
    city: string;
    aqi: number | null;
    aqi_label: string;
    temperature: number;
    humidity: number;
    water_quality: 'Good' | 'Fair' | 'Poor';
    illnesses: { name: string; risk: string; cases?: number }[];
    environmental_risks: { name: string; risk: 'High' | 'Moderate' | 'Low' }[];
    seasonal_tips: string[];
}

function getAqiColor(aqi: number | null) {
    if (!aqi) return '#94A3B8';
    if (aqi <= 50) return '#22C55E';
    if (aqi <= 100) return '#EAB308';
    if (aqi <= 200) return '#F97316';
    if (aqi <= 300) return '#EF4444';
    return '#7C3AED';
}

function getRiskColor(risk: string) {
    if (risk === 'High') return '#EF4444';
    if (risk === 'Moderate') return '#F59E0B';
    return '#22C55E';
}

export default function LocationHealthPage() {
    return (
        <PlanGuard requireTier="pro">
            <LocationHealthContent />
        </PlanGuard>
    );
}

function LocationHealthContent() {
    const { userProfile } = useAppStore();
    const city = userProfile?.city || 'Mumbai';

    const [data, setData] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/location/alerts/${encodeURIComponent(city)}`)
            .then(res => {
                const d = res.data?.data || res.data;
                setData(d);
            })
            .catch(() => setError('Could not load location health data'))
            .finally(() => setLoading(false));
    }, [city]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 12, color: '#64748B' }}>
                <Loader2 size={24} className="animate-spin" /> Loading health alerts for {city}...
            </div>
        );
    }

    const displayCity = data?.city || city;

    // Enhance data with environmental mocked values if missing
    const enhancedData: LocationData = {
        ...data,
        city: displayCity,
        aqi: data?.aqi ?? 145,
        aqi_label: data?.aqi_label || 'Unhealthy for Sensitive Groups',
        temperature: data?.temperature ?? 34,
        humidity: data?.humidity ?? 78,
        water_quality: data?.water_quality ?? 'Fair',
        illnesses: data?.illnesses || [
            { name: 'Dengue Fever', risk: 'High', cases: 142 },
            { name: 'Viral Flu', risk: 'Moderate', cases: 850 }
        ],
        environmental_risks: data?.environmental_risks || [
            { name: 'Asthma Risk', risk: 'High' },
            { name: 'Heat Stress', risk: 'Moderate' }
        ],
        seasonal_tips: data?.seasonal_tips || [
            'Avoid outdoor activities during peak heat hours.',
            'Use mosquito repellent; Dengue cases are rising.'
        ]
    };

    return (
        <div style={{ padding: '32px', overflowY: 'auto', maxHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <MapPin size={24} color="#0EA5A4" />
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>Health Alerts — {displayCity}</h1>
            </div>

            {error && (
                <div style={{ background: '#FEF2F2', color: '#DC2626', padding: 16, borderRadius: 12, fontSize: 14, marginBottom: 20 }}>
                    {error}
                </div>
            )}

            {/* Environmental Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                <div style={{
                    background: 'white', borderRadius: 20, padding: 24, border: '1px solid #F1F5F9',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Wind size={20} color={getAqiColor(enhancedData.aqi)} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Pollution (AQI)</span>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: getAqiColor(enhancedData.aqi) }}>
                        {enhancedData.aqi}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{enhancedData.aqi_label}</div>
                </div>

                <div style={{
                    background: 'white', borderRadius: 20, padding: 24, border: '1px solid #F1F5F9',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Thermometer size={20} color="#EF4444" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Weather</span>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#0F172A' }}>
                        {enhancedData.temperature}°C
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Humidity: {enhancedData.humidity}%</div>
                </div>

                <div style={{
                    background: 'white', borderRadius: 20, padding: 24, border: '1px solid #F1F5F9',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Droplets size={20} color="#3B82F6" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Water Quality</span>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: enhancedData.water_quality === 'Good' ? '#22C55E' : '#F59E0B' }}>
                        {enhancedData.water_quality}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Municipal Supply</div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #0EA5A4, #2563EB)', borderRadius: 20, padding: 24,
                    color: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, opacity: 0.9, marginBottom: 16 }}>Environmental Risks</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {enhancedData.environmental_risks.map((risk, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{risk.name}</span>
                                <span style={{
                                    background: risk.risk === 'High' ? '#EF4444' : risk.risk === 'Moderate' ? '#F59E0B' : '#22C55E',
                                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700
                                }}>
                                    {risk.risk}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Disease Alerts */}
            {enhancedData.illnesses.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={20} color="#F59E0B" /> Epidemic / Disease Alerts
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {enhancedData.illnesses.map((illness, i) => (

                            <div key={i} style={{
                                background: 'white', borderRadius: 16, padding: 20,
                                border: `1px solid ${getRiskColor(illness.risk)}20`,
                                borderLeft: `4px solid ${getRiskColor(illness.risk)}`,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{illness.name}</div>
                                        {illness.cases && (
                                            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{illness.cases.toLocaleString()} cases reported</div>
                                        )}
                                    </div>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 99,
                                        background: `${getRiskColor(illness.risk)}15`,
                                        color: getRiskColor(illness.risk),
                                        fontSize: 12, fontWeight: 700,
                                    }}>
                                        {illness.risk} Risk
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Seasonal Tips */}
            {enhancedData.seasonal_tips.length > 0 && (
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={20} color="#0EA5A4" /> Health Tips for {displayCity}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                        {enhancedData.seasonal_tips.map((tip, i) => (
                            <div key={i} style={{
                                background: '#F0FDFA', borderRadius: 12, padding: 16,
                                fontSize: 14, color: '#115E59', lineHeight: 1.5,
                                display: 'flex', alignItems: 'flex-start', gap: 8,
                            }}>
                                <span style={{ color: '#0EA5A4', fontWeight: 700 }}>•</span> {tip}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
