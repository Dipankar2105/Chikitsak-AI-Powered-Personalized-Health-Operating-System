import { Activity, Brain, Shield, Sparkles, Zap, HeartPulse } from 'lucide-react';

interface HealthScoreProps {
    score: number;
    breakdown: {
        nutrition: number;
        sleep: number;
        activity: number;
        mental_health: number;
        medical_risk: number;
    };
}

export default function HealthScore({ score, breakdown }: HealthScoreProps) {

    const getScoreColor = (value: number) => {
        if (value >= 80) return '#22C55E'; // Green
        if (value >= 60) return '#F59E0B'; // Yellow
        return '#EF4444'; // Red
    };

    const categories = [
        { label: 'Nutrition', icon: <Sparkles size={16} />, value: breakdown.nutrition, desc: 'Diet quality & timing' },
        { label: 'Sleep', icon: <Zap size={16} />, value: breakdown.sleep, desc: 'Duration & deep sleep' },
        { label: 'Activity', icon: <Activity size={16} />, value: breakdown.activity, desc: 'Movement & exercise' },
        { label: 'Mental Health', icon: <Brain size={16} />, value: breakdown.mental_health, desc: 'Stress levels & mood' },
        { label: 'Medical Risk', icon: <Shield size={16} />, value: breakdown.medical_risk, desc: 'Vitals & symptom history' },
    ];

    return (
        <div style={{
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            borderRadius: 24,
            padding: 32,
            color: 'white',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24
        }}>
            {/* Header / Main Score */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <HeartPulse color="#0EA5A4" size={24} />
                        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AI Preventive Health Score</h2>
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: 14, margin: 0, maxWidth: 350 }}>
                        Real-time evaluation of your holistic well-being based on multi-dimensional data models.
                    </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: 64,
                        fontWeight: 800,
                        lineHeight: 1,
                        color: getScoreColor(score),
                        textShadow: `0 0 40px ${getScoreColor(score)}40`
                    }}>
                        {score}<span style={{ fontSize: 24, color: '#64748B' }}>/100</span>
                    </div>
                    <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: getScoreColor(score),
                        marginTop: 4,
                        background: `${getScoreColor(score)}15`,
                        padding: '4px 12px',
                        borderRadius: 99,
                        display: 'inline-block'
                    }}>
                        {score >= 80 ? 'Optimal' : score >= 60 ? 'Fair' : 'Needs Attention'}
                    </div>
                </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', width: '100%' }} />

            {/* Breakdown */}
            <div>
                <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', marginBottom: 16 }}>
                    Category Breakdown
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                    {categories.map((cat, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 16,
                            padding: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>
                                <div style={{ color: getScoreColor(cat.value) }}>{cat.icon}</div>
                                {cat.label}
                            </div>

                            <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>
                                {cat.value}<span style={{ fontSize: 12, color: '#64748B', marginLeft: 2 }}>/100</span>
                            </div>

                            {/* Mini progress bar */}
                            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{
                                    width: `${cat.value}%`,
                                    height: '100%',
                                    background: getScoreColor(cat.value),
                                    borderRadius: 2
                                }} />
                            </div>

                            <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>
                                {cat.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
