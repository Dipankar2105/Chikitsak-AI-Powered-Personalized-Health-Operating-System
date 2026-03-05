'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { Activity, Droplets, Flame, AlertCircle, MapPin, Wind, TrendingUp, ChevronRight, Loader2, Utensils, Stethoscope, MessageCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import api from '@/lib/api';
import HealthScore from '@/components/HealthScore';

interface DashboardData {
    health_score: number;
    health_trend: { name: string; score: number }[];
    recent_symptoms: { symptoms: string[]; predicted_disease: string; triage_level: string; timestamp: string }[];
    nutrition_today: { calories: number; meals_logged: number };
    lab_status: { latest_report: string | null; summary: string | null; date: string | null };
    chat_sessions_this_week: number;
    user: { name: string; city: string | null };
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { userProfile, userLocation } = useAppStore();

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (useAppStore.getState().ruralMode) {
            router.push('/app/rural-dashboard');
            return;
        }

        api.get('/dashboard/summary')
            .then(res => {
                // Envelope is { status, data, message }
                const envelope = res.data;
                if (envelope.status === 'success') {
                    setData(envelope.data);
                }
            })
            .catch(() => setError('Could not load dashboard data'))
            .finally(() => setLoading(false));
    }, []);

    const healthScore = data?.health_score ?? 0;
    const healthTrends = data?.health_trend ?? [];
    const userName = data?.user?.name || userProfile?.name || 'User';
    const city = data?.user?.city || userProfile?.city || userLocation || 'Your Area';

    const healthDimensions = [
        { subject: 'Nutrition', A: data ? Math.min((data.nutrition_today.calories / 20), 150) : 0, fullMark: 150 },
        { subject: 'Symptoms', A: data ? Math.max(150 - data.recent_symptoms.length * 30, 20) : 80, fullMark: 150 },
        { subject: 'Labs', A: data?.lab_status?.summary?.toLowerCase().includes('normal') ? 130 : 70, fullMark: 150 },
        { subject: 'Chat', A: data ? Math.min(data.chat_sessions_this_week * 25, 150) : 0, fullMark: 150 },
        { subject: 'Overall', A: healthScore * 1.5, fullMark: 150 },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 12, color: '#64748B' }}>
                <Loader2 size={24} className="animate-spin" /> Loading dashboard...
            </div>
        );
    }

    const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 32, flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                        {greeting}, {userName.split(' ')[0]}!
                    </h1>
                    <p style={{ color: '#64748B', fontSize: 16 }}>Here is your daily health overview.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'white', borderRadius: 99, border: '1px solid #E2E8F0', fontSize: 13, color: '#64748B' }}>
                        <MapPin size={16} color="#0EA5A4" /> {city}
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ background: '#FEF2F2', color: '#DC2626', padding: 16, borderRadius: 12, fontSize: 14 }}>
                    {error} — showing default values.
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>

                {/* Left Column: Metrics & Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                    {/* AI Preventive Health Score */}
                    <HealthScore
                        score={healthScore}
                        breakdown={{
                            nutrition: data?.health_trend ? Math.round(data?.nutrition_today?.calories / 20) : Math.min(healthScore + 5, 100),
                            sleep: Math.max(healthScore - 12, 50),
                            activity: Math.min(healthScore + 8, 100),
                            mental_health: Math.min(healthScore + 2, 100),
                            medical_risk: Math.max(healthScore - 10, 40)
                        }}
                    />

                    {/* Summary Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <MetricCard icon={Utensils} label="Calories Today" value={`${Math.round(data?.nutrition_today?.calories || 0)}`} unit="kcal" color="#0EA5A4" bg="#F0FDFA" />
                        <MetricCard icon={Stethoscope} label="Symptom Logs" value={`${data?.recent_symptoms?.length || 0}`} unit="this week" color="#EF4444" bg="#FEF2F2" />
                        <MetricCard icon={MessageCircle} label="Chat Sessions" value={`${data?.chat_sessions_this_week || 0}`} unit="this week" color="#6366F1" bg="#EEF2FF" />
                        <MetricCard icon={Activity} label="Meals Logged" value={`${data?.nutrition_today?.meals_logged || 0}`} unit="today" color="#F59E0B" bg="#FFFBEB" />
                    </div>

                    {/* Health Trends */}
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>Wellness Trends</h3>
                        </div>
                        <div style={{ height: 250 }}>
                            {healthTrends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={healthTrends}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontSize: 14 }}>
                                    No trend data yet. Start logging symptoms and nutrition to see your health trends.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column: Insights & Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Lab Status */}
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Stethoscope size={18} color="#0EA5A4" /> Lab Report Status
                        </h3>
                        {data?.lab_status?.latest_report ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ fontSize: 14, color: '#334155' }}><strong>Latest:</strong> {data.lab_status.latest_report}</div>
                                <div style={{ fontSize: 13, color: '#64748B' }}>{data.lab_status.summary || 'No summary'}</div>
                                <div style={{ fontSize: 12, color: '#94A3B8' }}>{data.lab_status.date ? new Date(data.lab_status.date).toLocaleDateString() : ''}</div>
                            </div>
                        ) : (
                            <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>No lab reports yet. Upload one to get analysis.</p>
                        )}
                    </div>

                    {/* Recent Symptoms */}
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertCircle size={18} color="#EF4444" /> Recent Symptom Logs
                        </h3>
                        {data?.recent_symptoms && data.recent_symptoms.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {data.recent_symptoms.slice(0, 3).map((s, i) => (
                                    <div key={i} style={{ padding: 12, borderRadius: 12, background: s.triage_level === 'High / Emergency' ? '#FEF2F2' : '#F8FAFC' }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: s.triage_level === 'High / Emergency' ? '#DC2626' : '#334155' }}>
                                            {s.predicted_disease || 'Unknown'} — {s.triage_level}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                                            {s.symptoms?.join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>No symptoms logged this week. Stay healthy!</p>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { label: 'AI Health Chat', path: '/app/workspace' },
                                { label: 'Upload Lab Report', path: '/app/lab-reports' },
                                { label: 'Log Nutrition', path: '/app/nutrition' },
                                { label: 'Check Symptoms', path: '/app/conditions' },
                            ].map((action, i) => (
                                <button key={i} onClick={() => router.push(action.path)} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '12px', borderRadius: 12, background: '#F8FAFC', border: 'none',
                                    color: '#334155', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                    textAlign: 'left', transition: 'background 0.2s'
                                }}>
                                    {action.label} <ChevronRight size={16} color="#94A3B8" />
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, unit, color, bg }: any) {
    return (
        <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                <Icon size={20} />
            </div>
            <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>
                    {value} <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{unit}</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>{label}</div>
            </div>
        </div>
    );
}
