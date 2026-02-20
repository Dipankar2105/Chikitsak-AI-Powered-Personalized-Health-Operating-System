'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const sections = [
    {
        title: 'Prostate & Urological', icon: ShieldCheck, color: '#3B82F6',
        items: [
            { name: 'Prostate Health', desc: 'PSA testing, benign prostatic hyperplasia, prostate cancer screening, and age-based guidelines.' },
            { name: 'Urinary Health', desc: 'UTI in men, urinary incontinence, kidney stones, and hydration guidelines.' },
            { name: 'Erectile Dysfunction', desc: 'Causes, cardiovascular link, treatment options, and when to consult a urologist.' },
        ],
    },
    {
        title: 'Heart & Cardiovascular', icon: Heart, color: '#EF4444',
        items: [
            { name: 'Heart Disease', desc: 'Risk factors, cholesterol management, blood pressure monitoring, and lifestyle changes.' },
            { name: 'Stroke Risk', desc: 'Warning signs (FAST), risk reduction, blood thinners, and rehabilitation.' },
            { name: 'Exercise & Heart', desc: 'Optimal exercise types, intensity guidelines, and cardiac fitness benchmarks.' },
        ],
    },
    {
        title: 'Hormones & Hair', icon: Activity, color: '#F59E0B',
        items: [
            { name: 'Testosterone', desc: 'Low-T symptoms, testing, TRT options, natural boosters, and side effects.' },
            { name: 'Hair Loss', desc: 'Male pattern baldness, DHT blockers, minoxidil, PRP therapy, and transplant options.' },
            { name: 'Muscle & Bone', desc: 'Sarcopenia prevention, bone density, weight training benefits, and protein needs.' },
        ],
    },
    {
        title: 'Sexual & Mental Health', icon: ShieldCheck, color: '#8B5CF6',
        items: [
            { name: 'Sexual Health', desc: 'STI screening, safe practices, fertility considerations, and vasectomy info.' },
            { name: 'Mental Health', desc: 'Depression signs in men, anger management, substance abuse, and help-seeking.' },
            { name: 'Stress Management', desc: 'Work-life balance, cortisol impact, mindfulness techniques, and sleep hygiene.' },
        ],
    },
];

export default function MenHealthPage() {
    const [expanded, setExpanded] = useState<string | null>(null);
    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0EA5A4', fontWeight: 500, fontSize: 14, textDecoration: 'none', marginBottom: 24 }}>
                <ChevronLeft size={16} /> Back to Home
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>👨 Men&apos;s Health</h1>
            <p style={{ color: '#64748B', fontSize: 15, marginBottom: 40 }}>Prostate, cardiovascular, hormonal, and mental health guidance tailored for men.</p>

            {sections.map((sec) => {
                const Icon = sec.icon;
                return (
                    <div key={sec.title} style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${sec.color}15` }}><Icon size={18} color={sec.color} /></div>
                            <h2 style={{ fontSize: 18, fontWeight: 600 }}>{sec.title}</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                            {sec.items.map((item) => (
                                <button key={item.name} onClick={() => setExpanded(expanded === item.name ? null : item.name)} style={{ textAlign: 'left', padding: '18px 20px', borderRadius: 16, border: expanded === item.name ? `2px solid ${sec.color}` : '1.5px solid #E2E8F0', background: expanded === item.name ? `${sec.color}08` : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expanded === item.name ? 10 : 0 }}>
                                        <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</span>
                                        <ChevronRight size={16} color="#94A3B8" style={{ transform: expanded === item.name ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </div>
                                    {expanded === item.name && <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
            <div style={{ padding: '16px 20px', borderRadius: 12, background: '#FEF3C7', border: '1px solid #FDE68A', fontSize: 13, color: '#92400E', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} /> Always consult a qualified healthcare provider for medical advice specific to your condition.
            </div>
        </div>
    );
}
