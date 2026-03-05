'use client';

import { useState } from 'react';
import { Users, AlertTriangle, TrendingUp, MapPin, Activity, ShieldAlert, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const mockTrends = [
    { name: 'Mon', flu: 120, dengue: 45, asthma: 80 },
    { name: 'Tue', flu: 150, dengue: 52, asthma: 85 },
    { name: 'Wed', flu: 180, dengue: 80, asthma: 70 },
    { name: 'Thu', flu: 220, dengue: 120, asthma: 95 },
    { name: 'Fri', flu: 260, dengue: 190, asthma: 110 },
    { name: 'Sat', flu: 320, dengue: 250, asthma: 150 },
    { name: 'Sun', flu: 410, dengue: 310, asthma: 210 },
];

const mockZones = [
    { area: 'North District', risk: 'High', cases: 1450, primary: 'Viral Flu' },
    { area: 'South District', risk: 'Critical', cases: 890, primary: 'Dengue Fever' },
    { area: 'East District', risk: 'Moderate', cases: 420, primary: 'Asthma Exacerbation' },
    { area: 'West District', risk: 'Low', cases: 150, primary: 'Food Poisoning' },
];

export default function PopulationDashboard() {
    const { t } = useTranslation();

    return (
        <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Users color="#0EA5A4" size={32} /> Population Health & Outbreaks
                    </h1>
                    <p style={{ color: '#64748B', marginTop: 8 }}>Real-time epidemiological tracking and public health risk assessment.</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ padding: '8px 16px', background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                        <MapPin size={16} color="#64748B" /> Regional View: Mumbai
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <div style={{ background: '#FEF2F2', borderRadius: 20, padding: 24, border: '1px solid #FECACA', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                        <ShieldAlert size={18} /> Active Outbreaks
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#991B1B' }}>2</div>
                    <div style={{ fontSize: 13, color: '#B91C1C' }}>Dengue, Viral Flu</div>
                </div>

                <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                        <Activity size={18} color="#0EA5A4" /> Total Cases Logged
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#0F172A' }}>2,910</div>
                    <div style={{ fontSize: 13, color: '#64748B' }}>+18% from last week</div>
                </div>

                <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                        <AlertTriangle size={18} color="#F59E0B" /> High Risk Zones
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#0F172A' }}>4</div>
                    <div style={{ fontSize: 13, color: '#64748B' }}>Requires intervention</div>
                </div>

                <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                        <TrendingUp size={18} color="#6366F1" /> AI Prediction
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>Peak Expected</div>
                    <div style={{ fontSize: 13, color: '#64748B' }}>in next 72 hours</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

                {/* Outbreak Trajectory Chart */}
                <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BarChart3 size={20} color="#6366F1" /> Disease Syndiromic Trends
                    </h2>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockTrends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="flu" stackId="1" stroke="#0EA5A4" fill="#14B8A6" fillOpacity={0.6} name="Viral Flu" />
                                <Area type="monotone" dataKey="dengue" stackId="1" stroke="#EF4444" fill="#F87171" fillOpacity={0.6} name="Dengue" />
                                <Area type="monotone" dataKey="asthma" stackId="1" stroke="#F59E0B" fill="#FBBF24" fillOpacity={0.6} name="Asthma" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Regional Risk Zones */}
                <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={20} color="#0EA5A4" /> Regional Risk Zones
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {mockZones.map((zone, i) => (
                            <div key={i} style={{
                                padding: 16, borderRadius: 16,
                                background: zone.risk === 'Critical' ? '#FEF2F2' : zone.risk === 'High' ? '#FFFBEB' : '#F8FAFC',
                                border: `1px solid ${zone.risk === 'Critical' ? '#FECACA' : zone.risk === 'High' ? '#FDE68A' : '#E2E8F0'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ fontWeight: 700, color: '#1E293B' }}>{zone.area}</div>
                                    <div style={{
                                        padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                        background: zone.risk === 'Critical' ? '#DC2626' : zone.risk === 'High' ? '#F59E0B' : '#64748B',
                                        color: 'white'
                                    }}>
                                        {zone.risk}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#64748B' }}>Primary: <strong style={{ color: '#334155' }}>{zone.primary}</strong></span>
                                    <span style={{ color: '#64748B', fontWeight: 600 }}>{zone.cases} cases</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
