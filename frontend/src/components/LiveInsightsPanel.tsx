'use client';

import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { AlertTriangle, ArrowRight, Activity, Shield, TrendingUp, ChevronRight } from 'lucide-react';

const triageColors = {
    emergency: { bg: '#FEE2E2', color: '#DC2626', border: '#EF4444' },
    urgent: { bg: '#FEF3C7', color: '#D97706', border: '#F59E0B' },
    primary: { bg: '#DBEAFE', color: '#2563EB', border: '#3B82F6' },
    'self-care': { bg: '#DCFCE7', color: '#16A34A', border: '#22C55E' },
};

const riskColors = {
    low: { bg: '#DCFCE7', color: '#166534' },
    medium: { bg: '#FEF3C7', color: '#92400E' },
    high: { bg: '#FEE2E2', color: '#991B1B' },
};

export default function LiveInsightsPanel() {
    const { t } = useTranslation();
    const { insights, emergencyActive } = useAppStore();
    const tc = triageColors[insights.triageLevel];

    return (
        <div style={{
            width: 320, borderLeft: '1px solid #F1F5F9',
            background: '#FAFBFC', overflowY: 'auto',
            padding: '20px 16px', flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: 16,
        }}>
            {/* Emergency Banner */}
            {insights.triageLevel === 'emergency' && (
                <div className="animate-glow" style={{
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    borderRadius: 16, padding: 20, color: 'white',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <AlertTriangle size={20} />
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{t('insights.emergency')}</span>
                    </div>
                    <p style={{ fontSize: 13, opacity: 0.9 }}>Seek immediate medical attention</p>
                </div>
            )}

            {/* Possible Causes */}
            <div className="card" style={{ padding: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={15} />
                    {t('insights.possibleCauses')}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {insights.causes.map((cause, i) => {
                        const rc = riskColors[cause.risk];
                        return (
                            <div key={i} style={{
                                padding: 12, borderRadius: 12,
                                border: `1px solid ${rc.bg}`,
                                background: `${rc.bg}33`,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{cause.name}</span>
                                    <span className="badge" style={{
                                        background: rc.bg, color: rc.color, fontSize: 11,
                                    }}>
                                        {cause.risk.toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B' }}>
                                    <span>Probability: {cause.probability}%</span>
                                    <span>Confidence: {cause.confidence}%</span>
                                </div>
                                <div className="progress-bar" style={{ marginTop: 8 }}>
                                    <div className="progress-fill" style={{ width: `${cause.probability}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Triage Level */}
            <div className="card" style={{
                padding: 16,
                borderLeft: `4px solid ${tc.border}`,
            }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={15} />
                    {t('insights.triageLevel')}
                </h3>
                <div style={{
                    padding: '14px 16px', borderRadius: 12,
                    background: tc.bg, color: tc.color,
                    fontWeight: 700, fontSize: 15, textAlign: 'center',
                    textTransform: 'capitalize',
                }}>
                    {insights.triageLevel === 'self-care' ? t('insights.selfCare') :
                        insights.triageLevel === 'primary' ? t('insights.primaryCare') :
                            t(`insights.${insights.triageLevel}`)}
                </div>
            </div>

            {/* Red Flags */}
            {insights.redFlags.length > 0 && (
                <div className="card" style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={15} />
                        {t('insights.redFlags')}
                    </h3>
                    {insights.redFlags.map((flag, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 12px', borderRadius: 8,
                            background: '#FEF2F2', marginBottom: 6,
                            fontSize: 13, color: '#991B1B',
                        }}>
                            <span>⚠️</span> {flag}
                        </div>
                    ))}
                </div>
            )}

            {/* Next Steps */}
            <div className="card" style={{ padding: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowRight size={15} />
                    {t('insights.nextSteps')}
                </h3>
                {insights.nextSteps.map((step, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 0', fontSize: 13, color: '#475569',
                        borderBottom: i < insights.nextSteps.length - 1 ? '1px solid #F1F5F9' : 'none',
                    }}>
                        <ChevronRight size={14} color="#0EA5A4" />
                        {step}
                    </div>
                ))}
            </div>

            {/* AI Confidence */}
            <div className="card" style={{ padding: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={15} />
                    {t('insights.aiConfidence')}
                </h3>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: 32, fontWeight: 700,
                        background: 'linear-gradient(135deg, #0EA5A4, #6366F1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: 8,
                    }}>
                        {insights.aiConfidence}%
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${insights.aiConfidence}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
