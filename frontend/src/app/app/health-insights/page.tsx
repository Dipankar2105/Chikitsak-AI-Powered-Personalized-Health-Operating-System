'use client';

import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Heart, Activity, Moon, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const weeklyTrend = [
    { day: 'Mon', score: 78 }, { day: 'Tue', score: 80 }, { day: 'Wed', score: 76 },
    { day: 'Thu', score: 82 }, { day: 'Fri', score: 84 }, { day: 'Sat', score: 83 }, { day: 'Sun', score: 85 },
];

const healthRadar = [
    { subject: 'Physical', value: 78 },
    { subject: 'Mental', value: 65 },
    { subject: 'Nutrition', value: 72 },
    { subject: 'Sleep', value: 80 },
    { subject: 'Activity', value: 70 },
    { subject: 'Vitals', value: 85 },
];

const insights = [
    { icon: Heart, color: '#EF4444', title: 'Heart Health', score: 85, tip: 'Your resting heart rate is stable. Continue regular cardio.' },
    { icon: Moon, color: '#6366F1', title: 'Sleep Quality', score: 78, tip: 'You averaged 7.2 hours. Aim for 7.5–8 hours for optimal recovery.' },
    { icon: Activity, color: '#0EA5A4', title: 'Activity Level', score: 72, tip: '7,200 steps average. Try to reach 8,000 steps daily.' },
    { icon: Zap, color: '#F59E0B', title: 'Energy Level', score: 68, tip: 'Consider checking iron and B12 levels if fatigue persists.' },
];

export default function HealthInsightsPage() {
    const { t } = useTranslation();

    return (
        <div style={{ padding: 32, maxWidth: 1200, overflowY: 'auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
                <BarChart3 size={28} color="#0EA5A4" /> {t('sidebar.healthInsights')}
            </h1>

            {/* Overall Health Score */}
            <div className="card" style={{
                padding: 32, marginBottom: 32, textAlign: 'center',
                background: 'linear-gradient(135deg, #F0FDFA, #EEF2FF)',
            }}>
                <h2 style={{ fontSize: 14, fontWeight: 500, color: '#64748B', marginBottom: 8 }}>Overall Health Score</h2>
                <div style={{
                    fontSize: 64, fontWeight: 800,
                    background: 'linear-gradient(135deg, #0EA5A4, #6366F1)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>82</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#22C55E', fontSize: 14, fontWeight: 500 }}>
                    <TrendingUp size={16} /> +3 from last week
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                {/* Weekly Trend */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Weekly Health Score Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={weeklyTrend}>
                            <defs>
                                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0EA5A4" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#0EA5A4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="day" fontSize={12} stroke="#94A3B8" />
                            <YAxis domain={[60, 100]} fontSize={12} stroke="#94A3B8" />
                            <Tooltip />
                            <Area type="monotone" dataKey="score" stroke="#0EA5A4" fill="url(#healthGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Health Radar */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Health Dimensions</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={healthRadar}>
                            <PolarGrid stroke="#E2E8F0" />
                            <PolarAngleAxis dataKey="subject" fontSize={12} />
                            <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
                            <Radar name="Health" dataKey="value" stroke="#0EA5A4" fill="#0EA5A4" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Individual Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                {insights.map((insight, i) => {
                    const Icon = insight.icon;
                    return (
                        <div key={i} className="card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: `${insight.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={22} color={insight.color} />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 600, fontSize: 14 }}>{insight.title}</h4>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: insight.color }}>{insight.score}%</div>
                                </div>
                            </div>
                            <div className="progress-bar" style={{ marginBottom: 12 }}>
                                <div className="progress-fill" style={{ width: `${insight.score}%` }} />
                            </div>
                            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{insight.tip}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
