'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle2, Stethoscope, HelpCircle } from 'lucide-react';

const conditionsData: Record<string, any> = {
    diabetes: {
        name: 'Type 2 Diabetes',
        overview: 'Type 2 diabetes is a chronic condition that affects the way your body processes blood sugar (glucose). With type 2 diabetes, your body either doesn\'t produce enough insulin, or it resists insulin.',
        symptoms: ['Increased thirst', 'Frequent urination', 'Increased hunger', 'Unintended weight loss', 'Fatigue', 'Blurred vision'],
        causes: ['Overweight/Obesity', 'Physical inactivity', 'Genes and family history', 'Insulin resistance'],
        whenToSeeDoctor: 'If you notice unexplained symptoms like persistent thirst, fatigue, or blurry vision, consult your doctor immediately.'
    },
    // Fallback for demo
};

export default function ConditionDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.slug as string;

    // In a real app, fetch data based on id
    const condition = conditionsData[id] || {
        name: id ? id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ') : 'Condition Not Found',
        overview: 'Detailed information for this condition is currently being updated in our medical database.',
        symptoms: ['Symptom data pending...'],
        causes: ['Cause data pending...'],
        whenToSeeDoctor: 'Please consult a healthcare professional for advice on this condition.'
    };

    return (
        <div style={{ padding: '40px 32px', maxWidth: 1000, margin: '0 auto' }}>
            <button
                onClick={() => router.back()}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'transparent', border: 'none', color: '#64748B',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 32
                }}
            >
                <ArrowLeft size={18} /> Back to Library
            </button>

            <div style={{ background: 'white', borderRadius: 24, padding: 40, boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }}>
                <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', marginBottom: 24 }}>{condition.name}</h1>

                <p style={{ fontSize: 18, lineHeight: 1.7, color: '#334155', marginBottom: 40 }}>
                    {condition.overview}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>

                    {/* Symptoms */}
                    <div style={{ background: '#FFF7ED', borderRadius: 16, padding: 24, border: '1px solid #FFEDD5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: '#9A3412', fontWeight: 700, fontSize: 18 }}>
                            <AlertCircle size={20} /> Common Symptoms
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {condition.symptoms.map((s: string, i: number) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, color: '#7C2D12', fontSize: 15 }}>
                                    <span style={{ minWidth: 6, height: 6, borderRadius: '50%', background: '#F97316', marginTop: 8 }} />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Causes */}
                    <div style={{ background: '#F0F9FF', borderRadius: 16, padding: 24, border: '1px solid #E0F2FE' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: '#0369A1', fontWeight: 700, fontSize: 18 }}>
                            <HelpCircle size={20} /> Causes & Risk Factors
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {condition.causes.map((c: string, i: number) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, color: '#075985', fontSize: 15 }}>
                                    <span style={{ minWidth: 6, height: 6, borderRadius: '50%', background: '#0EA5E9', marginTop: 8 }} />
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* When to see doctor */}
                <div style={{ marginTop: 32, background: '#F0FDF4', borderRadius: 16, padding: 24, border: '1px solid #DCFCE7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: '#166534', fontWeight: 700, fontSize: 18 }}>
                        <Stethoscope size={20} /> When to see a doctor
                    </div>
                    <p style={{ color: '#14532D', fontSize: 15, lineHeight: 1.6 }}>
                        {condition.whenToSeeDoctor}
                    </p>
                </div>
            </div>
        </div>
    );
}
