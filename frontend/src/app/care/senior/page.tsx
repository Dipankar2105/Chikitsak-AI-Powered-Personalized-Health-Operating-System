'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Activity, AlertTriangle, ShieldCheck, Brain } from 'lucide-react';
import Link from 'next/link';

const sections = [
    {
        title: 'Cardiovascular & Diabetes', icon: Heart, color: '#EF4444',
        items: [
            { name: 'Hypertension', desc: 'Blood pressure monitoring, medication adherence, salt intake, and lifestyle modifications.' },
            { name: 'Diabetes Management', desc: 'Blood sugar monitoring, HbA1c goals, dietary management, foot care, and complication prevention.' },
            { name: 'Heart Failure', desc: 'Symptoms, fluid management, medication compliance, and activity guidelines.' },
        ],
    },
    {
        title: 'Musculoskeletal', icon: Activity, color: '#F59E0B',
        items: [
            { name: 'Arthritis', desc: 'Osteoarthritis vs rheumatoid, pain management, joint replacement, and physical therapy.' },
            { name: 'Fall Prevention', desc: 'Home safety assessment, balance exercises, vision checks, medication review, and assistive devices.' },
            { name: 'Osteoporosis', desc: 'Bone density testing (DEXA), calcium/vitamin D, weight-bearing exercise, and fracture prevention.' },
        ],
    },
    {
        title: 'Memory & Cognitive', icon: Brain, color: '#8B5CF6',
        items: [
            { name: 'Memory Concerns', desc: 'Normal aging vs dementia signs, cognitive screening tools, and brain-healthy lifestyle.' },
            { name: 'Alzheimer\'s Disease', desc: 'Early signs, diagnosis process, caregiver support, and available treatments.' },
            { name: 'Depression in Seniors', desc: 'Unique presentation, social isolation, medication considerations, and therapy options.' },
        ],
    },
    {
        title: 'Medication & Safety', icon: ShieldCheck, color: '#0EA5A4',
        items: [
            { name: 'Polypharmacy', desc: 'Managing multiple medications, interaction risks, deprescribing, and medication review tools.' },
            { name: 'Sleep Disorders', desc: 'Insomnia management, sleep apnea, medication effects, and sleep hygiene for seniors.' },
            { name: 'Nutrition Needs', desc: 'Protein requirements, micronutrient deficiencies, hydration, and meal planning for older adults.' },
        ],
    },
];

export default function SeniorHealthPage() {
    const [expanded, setExpanded] = useState<string | null>(null);
    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0EA5A4', fontWeight: 500, fontSize: 14, textDecoration: 'none', marginBottom: 24 }}>
                <ChevronLeft size={16} /> Back to Home
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>👴 Senior Care</h1>
            <p style={{ color: '#64748B', fontSize: 15, marginBottom: 40 }}>Health guidance for adults 60+ — cardiovascular, musculoskeletal, cognitive health, and medication safety.</p>

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
