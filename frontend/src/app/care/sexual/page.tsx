'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronDown, Activity, AlertTriangle, ShieldCheck, Pill, Stethoscope, Utensils, Zap, Heart } from 'lucide-react';
import Link from 'next/link';

const sections = [
    {
        title: 'Reproductive & Sexual Function', icon: Zap, color: '#8B5CF6',
        items: [
            {
                name: 'Erectile Dysfunction (ED)',
                description: 'The inability to get or keep an erection firm enough to have sexual intercourse, which can be a sign of underlying emotional or physical conditions.',
                symptoms: ['Trouble getting an erection', 'Trouble keeping an erection', 'Reduced sexual desire'],
                riskFactors: ['Heart disease or high blood pressure', 'Diabetes', 'Obesity', 'Tobacco use', 'Stress, anxiety, or depression'],
                diagnosis: ['Physical exam', 'Blood tests (testosterone, lipids, blood sugar)', 'Urine tests', 'Psychological exam'],
                treatment: ['Addressing underlying health conditions', 'Oral medications', 'Counseling for psychological factors'],
                medications: ['Phosphodiesterase-5 (PDE5) inhibitors (Sildenafil/Viagra, Tadalafil/Cialis)', 'Alprostadil urethral suppository or injection', 'Testosterone replacement (if levels are low)'],
                therapies: ['Cognitive Behavioral Therapy (CBT) for performance anxiety', 'Couples counseling', 'Vacuum erection devices (penile pumps)'],
                dietRecommendations: ['Mediterranean diet (promotes cardiovascular health, vital for ED)', 'Foods high in L-arginine (nuts, seeds)', 'Limit sodium and saturated fats'],
                prevention: ['Manage chronic health conditions like diabetes and heart disease', 'Quit smoking and limit alcohol intake', 'Exercise regularly'],
                lifestyle: ['Reduce stress through mindfulness or yoga', 'Engage in regular aerobic exercise to improve blood flow', 'Maintain healthy communication with partner'],
                whenToConsult: 'If you have consistent trouble getting or keeping an erection, or if it is accompanied by other symptoms like pelvic pain.',
                emergencyWarningSigns: ['Prolonged, painful erection lasting more than 4 hours (Priapism)', 'Sudden onset of ED accompanied by chest pain or shortness of breath (could indicate cardiovascular event)']
            }
        ],
    },
    {
        title: 'STI & Infection Prevention', icon: ShieldCheck, color: '#10B981',
        items: [
            {
                name: 'Chlamydia & Gonorrhea',
                description: 'Common bacterial sexually transmitted infections that often present with no symptoms, but can lead to severe reproductive complications if left untreated.',
                symptoms: ['Painful urination', 'Abnormal discharge from vagina or penis', 'Pain during sexual intercourse', 'Often asymptomatic'],
                riskFactors: ['Unprotected sex', 'Multiple sexual partners', 'History of past STIs'],
                diagnosis: ['Urine test', 'Swab of the affected area (cervix, urethra, throat, or rectum)'],
                treatment: ['Antibiotic therapy for both the patient and their partner(s)'],
                medications: ['Azithromycin (single dose) or Doxycycline (multi-day course) for Chlamydia', 'Ceftriaxone (injection) for Gonorrhea', 'Pain relievers like Ibuprofen if needed'],
                therapies: ['No specific physical therapies; primary treatment is pharmacological'],
                dietRecommendations: ['Stay hydrated during antibiotic treatment', 'Probiotic-rich foods (yogurt, kefir) or supplements to protect gut flora during antibiotic course'],
                prevention: ['Use condoms consistently and correctly', 'Regular STI screenings', 'Monogamous partnerships'],
                lifestyle: ['Abstain from sexual contact until antibiotics are completed and symptoms have resolved', 'Ensure partners are also tested and treated'],
                whenToConsult: 'If you experience any unusual discharge, burning during urination, or if a partner tests positive for an STI.',
                emergencyWarningSigns: ['Severe pelvic pain with fever (could indicate Pelvic Inflammatory Disease)', 'Swelling or severe pain in testicles']
            }
        ]
    }
];

export default function SexualHealthPage() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
            <Link href="/#solutions" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0EA5A4', fontWeight: 500, fontSize: 14, textDecoration: 'none', marginBottom: 24 }}>
                <ChevronLeft size={16} /> Back to Solutions
            </Link>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: '#0F172A' }}>🔥 Sexual Health</h1>
            <p style={{ color: '#64748B', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
                Education and prevention for a healthy and safe sex life. Explore detailed condition profiles including symptoms, <strong>medications</strong>, <strong>therapies</strong>, <strong>diet recommendations</strong>, and emergency protocols.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                {sections.map((sec) => {
                    const Icon = sec.icon;
                    return (
                        <div key={sec.title}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${sec.color}15` }}>
                                    <Icon size={24} color={sec.color} />
                                </div>
                                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>{sec.title}</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {sec.items.map((item) => (
                                    <div key={item.name} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <button
                                            onClick={() => setExpanded(expanded === item.name ? null : item.name)}
                                            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: expanded === item.name ? '#F8FAFC' : 'white', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                        >
                                            <span style={{ fontSize: 18, fontWeight: 600, color: '#1E293B' }}>{item.name}</span>
                                            <ChevronDown size={20} color="#64748B" style={{ transform: expanded === item.name ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                        </button>

                                        {expanded === item.name && (
                                            <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid #E2E8F0' }}>
                                                <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginTop: 20, marginBottom: 32 }}>
                                                    {item.description}
                                                </p>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, marginBottom: 32 }}>
                                                    <div>
                                                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={16} color="#64748B" /> Diagnosis & Risks</h4>
                                                        <div style={{ marginBottom: 16 }}>
                                                            <strong style={{ fontSize: 13, color: '#64748B', display: 'block', marginBottom: 4 }}>Diagnosis Methods</strong>
                                                            <ul style={{ paddingLeft: 20, margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.5 }}>{item.diagnosis.map(d => <li key={d}>{d}</li>)}</ul>
                                                        </div>
                                                        <div>
                                                            <strong style={{ fontSize: 13, color: '#64748B', display: 'block', marginBottom: 4 }}>Risk Factors</strong>
                                                            <ul style={{ paddingLeft: 20, margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.5 }}>{item.riskFactors.map(r => <li key={r}>{r}</li>)}</ul>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={16} color="#64748B" /> Clinical Profile</h4>
                                                        <div style={{ marginBottom: 16 }}>
                                                            <strong style={{ fontSize: 13, color: '#64748B', display: 'block', marginBottom: 4 }}>Common Symptoms</strong>
                                                            <ul style={{ paddingLeft: 20, margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.5 }}>{item.symptoms.map(s => <li key={s}>{s}</li>)}</ul>
                                                        </div>
                                                        <div>
                                                            <strong style={{ fontSize: 13, color: '#64748B', display: 'block', marginBottom: 4 }}>Prevention Strategies</strong>
                                                            <ul style={{ paddingLeft: 20, margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.5 }}>{item.prevention.map(p => <li key={p}>{p}</li>)}</ul>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ height: 1, background: '#E2E8F0', margin: '32px 0' }} />

                                                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Stethoscope size={20} color="#0EA5A4" /> Comprehensive Care Plan
                                                </h4>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 32 }}>
                                                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #F1F5F9' }}>
                                                        <strong style={{ fontSize: 13, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Pill size={14} /> Medications</strong>
                                                        <ul style={{ paddingLeft: 16, margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.5 }}>{item.medications.map(m => <li key={m}>{m}</li>)}</ul>
                                                    </div>
                                                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #F1F5F9' }}>
                                                        <strong style={{ fontSize: 13, color: '#8B5CF6', display: 'block', marginBottom: 8 }}>💆‍♂️ Therapies & Treatments</strong>
                                                        <ul style={{ paddingLeft: 16, margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.5 }}>{item.treatment.map(t => <li key={t}>{t}</li>)}
                                                            {item.therapies.map(t => <li key={t}>{t}</li>)}</ul>
                                                    </div>
                                                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #F1F5F9' }}>
                                                        <strong style={{ fontSize: 13, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Utensils size={14} /> Diet & Lifestyle</strong>
                                                        <ul style={{ paddingLeft: 16, margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.5 }}>{item.dietRecommendations.map(d => <li key={d}>{d}</li>)}
                                                            {item.lifestyle.map(l => <li key={l}>{l}</li>)}</ul>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                                    <div style={{ padding: 16, background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: 12 }}>
                                                        <strong style={{ color: '#C2410C', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 8 }}><Activity size={16} /> When to Consult a Doctor</strong>
                                                        <span style={{ color: '#9A3412', fontSize: 14, lineHeight: 1.5 }}>{item.whenToConsult}</span>
                                                    </div>

                                                    <div style={{ padding: 16, background: '#FEF2F2', borderRadius: 12, border: '1px solid #FECACA' }}>
                                                        <strong style={{ color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 8 }}><AlertTriangle size={16} /> EMERGENCY WARNING SIGNS</strong>
                                                        <ul style={{ paddingLeft: 16, margin: 0, color: '#991B1B', fontSize: 14, lineHeight: 1.5 }}>
                                                            {item.emergencyWarningSigns.map(e => <li key={e}>{e}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>

                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
