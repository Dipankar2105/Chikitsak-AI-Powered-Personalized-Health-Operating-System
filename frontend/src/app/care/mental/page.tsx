'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronDown, Activity, AlertTriangle, ShieldCheck, Pill, Stethoscope, Utensils, Brain, Zap } from 'lucide-react';
import Link from 'next/link';

const sections = [
    {
        title: 'Mood & Emotional Disorders', icon: Brain, color: '#F43F5E',
        items: [
            {
                name: 'Major Depressive Disorder',
                description: 'A mood disorder that causes a persistent feeling of sadness and loss of interest, affecting how you feel, think, and behave.',
                symptoms: ['Persistent sad, anxious, or "empty" mood', 'Loss of interest in hobbies and activities', 'Decreased energy or fatigue', 'Difficulty sleeping or oversleeping', 'Thoughts of death or suicide'],
                riskFactors: ['Personal or family history of depression', 'Major life changes, trauma, or stress', 'Certain physical illnesses and medications'],
                diagnosis: ['Physical examination to rule out underlying conditions', 'Psychiatric evaluation (questionnaires like PHQ-9)', 'DSM-5 criteria assessment'],
                treatment: ['Psychotherapy (Talk Therapy)', 'Medication management', 'Brain stimulation therapies (in severe cases)'],
                medications: ['Selective Serotonin Reuptake Inhibitors (SSRIs) like Sertraline or Fluoxetine', 'Serotonin-Norepinephrine Reuptake Inhibitors (SNRIs)', 'Atypical antidepressants (Bupropion)', 'Tricyclic antidepressants (TCAs)'],
                therapies: ['Cognitive Behavioral Therapy (CBT) to reframe negative thinking', 'Interpersonal Therapy (IPT)', 'Dialectical Behavior Therapy (DBT)', 'Electroconvulsive Therapy (ECT) for severe treatment-resistant depression'],
                dietRecommendations: ['Omega-3 fatty acids (salmon, walnuts) for brain health', 'Folate-rich foods (spinach, lentils)', 'Avoid heavy alcohol consumption, which acts as a depressant', 'Limit highly processed foods and refined sugars'],
                prevention: ['Build a strong social support network', 'Learn and practice stress management techniques', 'Maintain regular sleep and exercise routines'],
                lifestyle: ['Engage in at least 30 minutes of exercise most days (boosts endorphins)', 'Practice mindfulness or meditation', 'Stick to a consistent sleep schedule (7-9 hours)'],
                whenToConsult: 'If feelings of sadness or loss of interest last for more than two weeks and interfere with daily functioning.',
                emergencyWarningSigns: ['Active thoughts or plans of suicide or self-harm', 'Severe psychotic symptoms (hallucinations or delusions)', 'Complete inability to eat, drink, or care for basic self-needs']
            },
            {
                name: 'Generalized Anxiety Disorder (GAD)',
                description: 'Characterized by persistent and excessive worry about a number of different things, which is difficult to control and interferes with daily life.',
                symptoms: ['Feeling restless, wound-up, or on edge', 'Being easily fatigued', 'Difficulty concentrating', 'Irritability', 'Muscle tension'],
                riskFactors: ['Family history of anxiety', 'Prolonged exposure to stressful environments', 'Certain personality traits (timid, negative)'],
                diagnosis: ['Psychological evaluation (questionnaires like GAD-7)', 'Physical exam to rule out hyperthyroidism or heart conditions'],
                treatment: ['Cognitive behavioral therapy', 'Anti-anxiety medications', 'Stress-reduction techniques'],
                medications: ['SSRIs or SNRIs as a first-line long-term treatment', 'Buspirone (an anti-anxiety specific medication)', 'Benzodiazepines (Alprazolam, Clonazepam) strictly for short-term severe relief due to addiction risk', 'Beta-blockers (Propranolol) for physical symptoms like rapid heart rate'],
                therapies: ['Cognitive Behavioral Therapy (CBT)', 'Exposure therapy (if specific phobias are involved)'],
                dietRecommendations: ['Limit or eliminate caffeine (can trigger panic or mimic anxiety symptoms)', 'Stay hydrated', 'Complex carbohydrates to boost serotonin'],
                prevention: ['Seek help early when anxiety starts to feel unmanageable', 'Keep a journal to identify triggers'],
                lifestyle: ['Avoid alcohol and recreational drugs', 'Practice deep breathing exercises, box breathing, or progressive muscle relaxation', 'Cut back on over-scheduling'],
                whenToConsult: 'If excessive worry is difficult to control and causes distress or impairment for six months or more.',
                emergencyWarningSigns: ['Experiencing a severe panic attack causing chest pain that mimics a heart attack', 'Feeling completely detached from reality (severe depersonalization)']
            }
        ],
    }
];

export default function MentalHealthPage() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
            <Link href="/#solutions" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0EA5A4', fontWeight: 500, fontSize: 14, textDecoration: 'none', marginBottom: 24 }}>
                <ChevronLeft size={16} /> Back to Solutions
            </Link>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: '#0F172A' }}>🧠 Mental Health</h1>
            <p style={{ color: '#64748B', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
                Support and guidance for psychological well-being. Explore detailed condition profiles including symptoms, <strong>medications</strong>, <strong>therapies</strong>, <strong>diet recommendations</strong>, and emergency protocols.
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
                                                        <strong style={{ fontSize: 13, color: '#8B5CF6', display: 'block', marginBottom: 8 }}>💆‍♀️ Therapies & Treatments</strong>
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
