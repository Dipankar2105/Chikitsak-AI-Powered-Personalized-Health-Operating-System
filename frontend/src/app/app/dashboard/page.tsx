'use client';

import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { Activity, Droplets, Moon, Footprints, Flame, AlertCircle, MapPin, Wind, TrendingUp, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

/* Mock Data */
const healthTrends = [
    { name: 'Mon', score: 85 }, { name: 'Tue', score: 82 }, { name: 'Wed', score: 88 },
    { name: 'Thu', score: 90 }, { name: 'Fri', score: 87 }, { name: 'Sat', score: 92 }, { name: 'Sun', score: 95 },
];

const healthDimensions = [
    { subject: 'Physical', A: 120, fullMark: 150 },
    { subject: 'Mental', A: 98, fullMark: 150 },
    { subject: 'Sleep', A: 86, fullMark: 150 },
    { subject: 'Nutrition', A: 99, fullMark: 150 },
    { subject: 'Activity', A: 85, fullMark: 150 },
    { subject: 'Vitals', A: 65, fullMark: 150 },
];

export default function DashboardPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { userProfile, userLocation } = useAppStore();

    return (
        <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 32, flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                        Good Morning, {userProfile?.name?.split(' ')[0] || 'User'}!
                    </h1>
                    <p style={{ color: '#64748B', fontSize: 16 }}>Here is your daily health overview.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'white', borderRadius: 99, border: '1px solid #E2E8F0', fontSize: 13, color: '#64748B' }}>
                        <MapPin size={16} color="#0EA5A4" /> {userLocation || 'Mumbai, IN'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>

                {/* Left Column: Metrics & Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                    {/* Health Score Banner */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0EA5A4, #2563EB)', borderRadius: 24, padding: 32,
                        color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 20px 25px -5px rgba(14, 165, 164, 0.3)'
                    }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Health Score</div>
                            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}>92<span style={{ fontSize: 24, opacity: 0.7 }}>/100</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 99, width: 'fit-content', fontSize: 13 }}>
                                <TrendingUp size={14} /> +2% from last week
                            </div>
                        </div>
                        <div style={{ width: 150, height: 150 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={healthDimensions}>
                                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 10 }} />
                                    <Radar name="User" dataKey="A" stroke="#FFFFFF" fill="#FFFFFF" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Vitals Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <MetricCard icon={Activity} label="Heart Rate" value="72" unit="bpm" color="#EF4444" bg="#FEF2F2" />
                        <MetricCard icon={Droplets} label="Blood Oxygen" value="98" unit="%" color="#0EA5A4" bg="#F0FDFA" />
                        <MetricCard icon={Moon} label="Sleep" value="7h 20m" unit="avg" color="#6366F1" bg="#EEF2FF" />
                        <MetricCard icon={Footprints} label="Steps" value="6,432" unit="/ 10k" color="#F59E0B" bg="#FFFBEB" />
                    </div>

                    {/* Health Trends */}
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>Wellness Trends</h3>
                            <select style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', color: '#64748B', fontSize: 13 }}>
                                <option>This Week</option>
                                <option>This Month</option>
                            </select>
                        </div>
                        <div style={{ height: 250 }}>
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
                        </div>
                    </div>

                </div>

                {/* Right Column: Insights & Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Location Risk */}
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MapPin size={18} color="#0EA5A4" /> Location Health
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, background: '#FFF7ED', color: '#C2410C' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                                    <Wind size={16} /> AQI (Air Quality)
                                </div>
                                <div style={{ fontWeight: 700 }}>142 (Moderate)</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, background: '#EFF6FF', color: '#1D4ED8' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                                    <Droplets size={16} /> Humidity
                                </div>
                                <div style={{ fontWeight: 700 }}>85%</div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Insights */}
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Flame size={18} color="#F59E0B" /> Daily Insights
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ background: '#FEF2F2', padding: 16, borderRadius: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <AlertCircle size={14} /> Precaution
                                </div>
                                <p style={{ fontSize: 14, color: '#7F1D1D', margin: 0, lineHeight: 1.5 }}>Viral fever cases are rising in your area. Mask recommended in crowded places.</p>
                            </div>
                            <div style={{ background: '#F0FDFA', padding: 16, borderRadius: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0D9488', marginBottom: 6 }}>Fact of the Day</div>
                                <p style={{ fontSize: 14, color: '#115E59', margin: 0, lineHeight: 1.5 }}>Drinking water right after waking up helps jumpstart your metabolism.</p>
                            </div>
                            <div style={{ background: '#EEF2FF', padding: 16, borderRadius: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#4338CA', marginBottom: 6 }}>Suggestion</div>
                                <p style={{ fontSize: 14, color: '#312E81', margin: 0, lineHeight: 1.5 }}>Your sleep score dropped. Try dimming lights 30 mins before bed.</p>
                            </div>
                        </div>
                    </div>

                    {/* Wearable Sync */}
                    <div style={{ background: '#1E293B', borderRadius: 24, padding: 24, color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ marginBottom: 16 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Sync Wearable</h3>
                                <p style={{ fontSize: 13, color: '#94A3B8' }}>Connect Apple Watch or Fitbit.</p>
                            </div>
                            <button style={{ width: '100%', padding: '12px', background: '#3B82F6', borderRadius: 12, border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                Connect Device
                            </button>
                        </div>
                        <Activity size={120} color="white" style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05 }} />
                    </div>

                    {/* Quick Actions */}
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {['Log Symptoms', 'Upload Lab Report', 'Add Medication', 'Book Tele-consult'].map((action, i) => (
                                <button key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '12px', borderRadius: 12, background: '#F8FAFC', border: 'none',
                                    color: '#334155', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                    textAlign: 'left', transition: 'background 0.2s'
                                }} className="hover:bg-slate-100">
                                    {action} <ChevronRight size={16} color="#94A3B8" />
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
