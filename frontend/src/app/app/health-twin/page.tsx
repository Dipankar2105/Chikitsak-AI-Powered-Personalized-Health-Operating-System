'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import PlanGuard from '@/components/PlanGuard';
import api from '@/lib/api';
import {
    Activity, Heart, Brain, Zap, ShieldCheck,
    TrendingDown, Info, AlertCircle, Sparkles, RefreshCw
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, ResponsiveContainer, LineChart,
    Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function HealthTwinPage() {
    return (
        <PlanGuard requireTier="medical_plus">
            <HealthTwinContent />
        </PlanGuard>
    );
}

function HealthTwinContent() {
    const { t } = useTranslation();
    const { userProfile } = useAppStore();
    const [simulating, setSimulating] = useState(false);
    const [lifestyleData, setLifestyleData] = useState({
        sleep: 7,
        exercise: 30,
        diet: 80, // Quality score 0-100
        stress: 40
    });

    const [risks, setRisks] = useState({
        diabetes: 12,
        hypertension: 8,
        heart_disease: 5,
        stroke: 2
    });

    const handleSimulation = () => {
        setSimulating(true);
        // Simulate AI processing
        setTimeout(() => {
            const sleepImpact = (lifestyleData.sleep - 7) * 2;
            const exerciseImpact = (lifestyleData.exercise - 30) * 0.1;
            const dietImpact = (lifestyleData.diet - 80) * 0.2;

            setRisks({
                diabetes: Math.max(2, 12 - dietImpact - exerciseImpact),
                hypertension: Math.max(1, 8 - exerciseImpact - sleepImpact),
                heart_disease: Math.max(1, 5 - exerciseImpact * 2),
                stroke: Math.max(0, 2 - sleepImpact)
            });
            setSimulating(false);
        }, 1500);
    };

    const radarData = [
        { subject: 'Metabolism', A: 85, fullMark: 100 },
        { subject: 'Cognition', A: 92, fullMark: 100 },
        { subject: 'Cardio', A: 78, fullMark: 100 },
        { subject: 'Sleep', A: lifestyleData.sleep * 10, fullMark: 100 },
        { subject: 'Immunity', A: 88, fullMark: 100 },
    ];

    return (
        <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 12 }}>
                        Digital Health Twin <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: 'white' }}>Medical+</span>
                    </h1>
                    <p style={{ color: '#64748B', marginTop: 4 }}>Simulate lifestyle changes and predict future health outcomes with high-fidelity AI models.</p>
                </div>
                <button
                    onClick={handleSimulation}
                    disabled={simulating}
                    className="btn-gradient"
                    style={{ padding: '12px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}
                >
                    {simulating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {simulating ? 'Simulating...' : 'Sync & Re-calculate'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 32 }}>

                {/* Left: Body Model & Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="card" style={{ height: 500, position: 'relative', overflow: 'hidden', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #F0FDFA 0%, #FFFFFF 100%)' }}>

                        {/* Body Visualization Placeholder (SVG Body) */}
                        <div style={{ position: 'relative', width: 240, height: 400 }}>
                            <svg viewBox="0 0 200 400" width="100%" height="100%">
                                <path d="M100 20 C110 20 120 30 120 45 C120 60 110 70 100 70 C90 70 80 60 80 45 C80 30 90 20 100 20" fill="#0EA5A4" opacity="0.8" />
                                <rect x="80" y="75" width="40" height="100" rx="10" fill="#0EA5A4" opacity="0.6" />
                                <path d="M80 85 L50 180 L65 185 L80 100 Z" fill="#0EA5A4" opacity="0.4" />
                                <path d="M120 85 L150 180 L135 185 L120 100 Z" fill="#0EA5A4" opacity="0.4" />
                                <path d="M85 175 L75 350 L95 350 L100 185 Z" fill="#0EA5A4" opacity="0.4" />
                                <path d="M115 175 L125 350 L105 350 L100 185 Z" fill="#0EA5A4" opacity="0.4" />
                            </svg>

                            {/* Pulse Points */}
                            <div className="pulse-dot" style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)' }} />
                            <div className="pulse-dot" style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', animationDelay: '0.5s' }} />
                            <div className="pulse-dot" style={{ position: 'absolute', top: '55%', left: '42%' }} />
                            <div className="pulse-dot" style={{ position: 'absolute', top: '55%', left: '58%' }} />
                        </div>

                        <div style={{ position: 'absolute', top: 24, left: 24 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Biological Age</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A' }}>{userProfile?.age ? Number(userProfile.age) - 2 : '28'} <span style={{ fontSize: 14, color: '#22C55E' }}>(-2.4y)</span></div>
                        </div>

                        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 12, color: '#64748B' }}>Vitals</div>
                                <div style={{ fontWeight: 700, color: '#0EA5A4' }}>Optimal</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 12, color: '#64748B' }}>DNA Stability</div>
                                <div style={{ fontWeight: 700, color: '#6366F1' }}>98.2%</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 12, color: '#64748B' }}>Metabolic</div>
                                <div style={{ fontWeight: 700, color: '#F59E0B' }}>High</div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 20 }}>Systems Performance</h3>
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                    <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
                                    <Radar name="Twin" dataKey="A" stroke="#0EA5A4" fill="#0EA5A4" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right: Lifestyle Simulator & Predictions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Simulator Controls */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <RefreshCw size={20} color="#0EA5A4" /> Lifestyle Change Simulator
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                                    <span>Daily Sleep</span>
                                    <span style={{ fontWeight: 700, color: '#0EA5A4' }}>{lifestyleData.sleep} hours</span>
                                </label>
                                <input
                                    type="range" min={4} max={12} step={0.5}
                                    value={lifestyleData.sleep}
                                    onChange={(e) => setLifestyleData({ ...lifestyleData, sleep: Number(e.target.value) })}
                                    style={{ width: '100%', accentColor: '#0EA5A4' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                                    <span>Daily Exercise</span>
                                    <span style={{ fontWeight: 700, color: '#6366F1' }}>{lifestyleData.exercise} mins</span>
                                </label>
                                <input
                                    type="range" min={0} max={120} step={5}
                                    value={lifestyleData.exercise}
                                    onChange={(e) => setLifestyleData({ ...lifestyleData, exercise: Number(e.target.value) })}
                                    style={{ width: '100%', accentColor: '#6366F1' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                            <button onClick={handleSimulation} className="btn-gradient" style={{ flex: 1, padding: '12px', borderRadius: 12 }}>
                                Run Scenario Analysis
                            </button>
                        </div>
                    </div>

                    {/* Risk Predicitons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[
                            { label: 'Diabetes Risk', value: risks.diabetes, color: '#EF4444' },
                            { label: 'Hypertension', value: risks.hypertension, color: '#F59E0B' },
                            { label: 'Heart Disease', value: risks.heart_disease, color: '#EF4444' },
                            { label: 'Stroke Probability', value: risks.stroke, color: '#F59E0B' },
                        ].map((risk, i) => (
                            <div key={i} className="card" style={{ padding: 20, borderLeft: `4px solid ${risk.color}` }}>
                                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>{risk.label}</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: risk.color }}>{risk.value}%</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: '#22C55E', fontWeight: 600 }}>
                                    <TrendingDown size={14} /> -12% vs prior month
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Long-term Prediction Chart */}
                    <div className="card" style={{ padding: 24, flex: 1 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 20 }}>10-Year Wellness Trajectory</h3>
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[
                                    { year: '2025', current: 85, simulated: 85 },
                                    { year: '2027', current: 82, simulated: 88 },
                                    { year: '2029', current: 78, simulated: 92 },
                                    { year: '2031', current: 75, simulated: 94 },
                                    { year: '2033', current: 70, simulated: 95 },
                                    { year: '2035', current: 65, simulated: 96 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="year" fontSize={12} axisLine={false} tickLine={false} />
                                    <YAxis domain={[50, 100]} fontSize={12} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="simulated" stroke="#0EA5A4" strokeWidth={3} dot={{ r: 4, fill: '#0EA5A4' }} />
                                    <Line type="monotone" dataKey="current" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 16, textAlign: 'center' }}>
                            Solid line represents projected wellness with optimized lifestyle changes.
                        </p>
                    </div>

                </div>
            </div>

            <style jsx>{`
                .pulse-dot {
                    width: 12px;
                    height: 12px;
                    background: #22C55E;
                    border-radius: 50%;
                    box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
            `}</style>
        </div>
    );
}
