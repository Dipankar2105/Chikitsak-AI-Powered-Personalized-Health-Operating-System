'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Syringe, BookOpen, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';

const sections = [
    {
        title: 'The Basics',
        icon: Syringe,
        color: '#0EA5A4',
        items: [
            { name: 'Vaccinations', desc: 'Recommended childhood immunization schedules, vaccine types, and timing guidelines.' },
            { name: 'After Vaccines', desc: 'Normal reactions, side effects to watch for, and when to contact your pediatrician.' },
            { name: 'Learning Disabilities', desc: 'Early signs of ADHD, dyslexia, autism spectrum, and developmental milestones.' },
        ],
    },
    {
        title: 'Common Symptoms',
        icon: Activity,
        color: '#F59E0B',
        items: [
            { name: 'Cough', desc: 'Causes of cough in children — dry, wet, barking cough, and nighttime coughing patterns.' },
            { name: 'Cold', desc: 'Common cold in children, nasal congestion, runny nose, and home remedies.' },
            { name: 'Fever', desc: 'Normal temperature ranges, when fever is dangerous, and fever management.' },
            { name: 'Diarrhea', desc: 'Causes of diarrhea, dehydration prevention, ORS, and dietary guidance.' },
        ],
    },
    {
        title: 'Common Conditions',
        icon: BookOpen,
        color: '#6366F1',
        items: [
            { name: 'Croup', desc: 'Viral infection causing barking cough, symptoms, treatment, and when to seek emergency care.' },
            { name: 'Whooping Cough', desc: 'Pertussis symptoms, stages, vaccination importance, and treatment options.' },
            { name: 'Fifth Disease', desc: 'Parvovirus B19 infection, "slapped cheek" rash, and management.' },
            { name: 'Hand-Foot-Mouth', desc: 'Coxsackievirus symptoms, blister management, contagion, and recovery timeline.' },
        ],
    },
    {
        title: 'Chronic Conditions',
        icon: ShieldCheck,
        color: '#EF4444',
        items: [
            { name: 'Asthma', desc: 'Triggers, inhaler use, action plans, exercise-induced asthma, and long-term management.' },
            { name: 'Cerebral Palsy', desc: 'Types, early diagnosis, physical therapy, assistive devices, and support resources.' },
            { name: 'Cystic Fibrosis', desc: 'Genetic testing, respiratory care, nutrition management, and life expectancy advances.' },
            { name: 'Down Syndrome', desc: 'Health monitoring, developmental support, educational programs, and community resources.' },
        ],
    },
];

export default function ChildHealthPage() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0EA5A4', fontWeight: 500, fontSize: 14, textDecoration: 'none', marginBottom: 24 }}>
                <ChevronLeft size={16} /> Back to Home
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>👶 Child Health</h1>
            <p style={{ color: '#64748B', fontSize: 15, marginBottom: 40 }}>
                Comprehensive guide for parents — vaccinations, common illnesses, chronic conditions, and developmental basics.
            </p>

            {sections.map((sec) => {
                const Icon = sec.icon;
                return (
                    <div key={sec.title} style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                background: `${sec.color}15`,
                            }}>
                                <Icon size={18} color={sec.color} />
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 600 }}>{sec.title}</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                            {sec.items.map((item) => (
                                <button key={item.name} onClick={() => setExpanded(expanded === item.name ? null : item.name)}
                                    style={{
                                        textAlign: 'left', padding: '18px 20px', borderRadius: 16,
                                        border: expanded === item.name ? `2px solid ${sec.color}` : '1.5px solid #E2E8F0',
                                        background: expanded === item.name ? `${sec.color}08` : 'white',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expanded === item.name ? 10 : 0 }}>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{item.name}</span>
                                        <ChevronRight size={16} color="#94A3B8"
                                            style={{ transform: expanded === item.name ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </div>
                                    {expanded === item.name && (
                                        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                                            {item.desc}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}

            <div style={{
                padding: '16px 20px', borderRadius: 12, background: '#FEF3C7',
                border: '1px solid #FDE68A', fontSize: 13, color: '#92400E', marginTop: 16,
                display: 'flex', alignItems: 'center', gap: 10,
            }}>
                <AlertTriangle size={18} />
                This information is for educational purposes only. Always consult your pediatrician for medical advice specific to your child.
            </div>
        </div>
    );
}
