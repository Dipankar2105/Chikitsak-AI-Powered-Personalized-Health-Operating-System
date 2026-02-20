'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Activity, AlertTriangle, ShieldCheck, Baby, Thermometer } from 'lucide-react';
import Link from 'next/link';

const sections = [
    {
        title: 'Reproductive Health', icon: Heart, color: '#EC4899',
        items: [
            { name: 'Menstrual Health', desc: 'Normal cycle patterns, irregular periods, PMS, PMDD, and when to consult a gynecologist.' },
            { name: 'PCOS', desc: 'Polycystic ovary syndrome symptoms, hormonal imbalance, fertility impact, and lifestyle management.' },
            { name: 'Endometriosis', desc: 'Chronic pain, diagnosis challenges, hormonal treatments, and surgical options.' },
            { name: 'Cervical Health', desc: 'Pap smear guidelines, HPV vaccination, early detection, and cancer prevention.' },
        ],
    },
    {
        title: 'Hormones & Thyroid', icon: Activity, color: '#8B5CF6',
        items: [
            { name: 'Thyroid Disorders', desc: 'Hypo/hyperthyroidism symptoms, TSH testing, medication, and pregnancy considerations.' },
            { name: 'Hormonal Balance', desc: 'Estrogen, progesterone, testosterone levels and their impact on mood, energy, and weight.' },
            { name: 'Iron Deficiency', desc: 'Anemia symptoms, dietary iron sources, supplementation, and blood test interpretation.' },
        ],
    },
    {
        title: 'Pregnancy & Fertility', icon: Baby, color: '#0EA5A4',
        items: [
            { name: 'Pregnancy Care', desc: 'Trimester guidelines, nutrition, exercise, warning signs, and prenatal testing.' },
            { name: 'Fertility', desc: 'Ovulation tracking, fertility window, IVF options, and age-related considerations.' },
            { name: 'Postpartum', desc: 'Recovery timeline, breastfeeding, postpartum depression signs, and self-care.' },
        ],
    },
    {
        title: 'Breast Health & Menopause', icon: ShieldCheck, color: '#F59E0B',
        items: [
            { name: 'Breast Health', desc: 'Self-examination technique, mammogram schedules, fibrocystic changes, and warning signs.' },
            { name: 'Menopause', desc: 'Perimenopause symptoms, HRT options, bone health, cardiovascular risk, and lifestyle tips.' },
            { name: 'Osteoporosis', desc: 'Bone density testing, calcium & vitamin D, weight-bearing exercise, and fall prevention.' },
        ],
    },
];

export default function WomenHealthPage() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0EA5A4', fontWeight: 500, fontSize: 14, textDecoration: 'none', marginBottom: 24 }}>
                <ChevronLeft size={16} /> Back to Home
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>👩 Women&apos;s Health</h1>
            <p style={{ color: '#64748B', fontSize: 15, marginBottom: 40 }}>
                Comprehensive health guidance — reproductive health, hormonal balance, pregnancy, breast health, and menopause.
            </p>

            {sections.map((sec) => {
                const Icon = sec.icon;
                return (
                    <div key={sec.title} style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${sec.color}15` }}>
                                <Icon size={18} color={sec.color} />
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 600 }}>{sec.title}</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                            {sec.items.map((item) => (
                                <button key={item.name} onClick={() => setExpanded(expanded === item.name ? null : item.name)}
                                    style={{ textAlign: 'left', padding: '18px 20px', borderRadius: 16, border: expanded === item.name ? `2px solid ${sec.color}` : '1.5px solid #E2E8F0', background: expanded === item.name ? `${sec.color}08` : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expanded === item.name ? 10 : 0 }}>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{item.name}</span>
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
