'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronDown, Activity, AlertTriangle, ShieldCheck, Pill, Stethoscope, Utensils, Heart, Brain } from 'lucide-react';
import Link from 'next/link';

const sections = [
    {
        title: 'Cognitive & Neurological Health', icon: Brain, color: '#8B5CF6',
        items: [
            {
                name: 'Alzheimer\'s Disease & Dementia',
                description: 'A progressive neurologic disorder that causes the brain to shrink and brain cells to die, leading to a continuous decline in thinking, behavioral, and social skills.',
                symptoms: ['Memory loss affecting daily life', 'Difficulty planning or solving problems', 'Confusion with time or place', 'Changes in mood and personality'],
                riskFactors: ['Advancing age', 'Family history and genetics', 'Down syndrome', 'Severe head trauma', 'Poor cardiovascular health'],
                diagnosis: ['Neurological exams', 'Cognitive and memory tests', 'Brain imaging (MRI, CT, PET)'],
                treatment: ['Medications to temporarily improve symptoms', 'Creating a safe and supportive environment', 'Caregiver support'],
                medications: ['Cholinesterase inhibitors (Donepezil, Rivastigmine)', 'Memantine (to regulate glutamate)', 'Antidepressants (if depression is co-occurring)', 'Sleep medications (if sleep cycle is disturbed)'],
                therapies: ['Cognitive stimulation therapy', 'Music and art therapy', 'Occupational therapy to adapt living spaces'],
                dietRecommendations: ['MIND diet (Mediterranean-DASH Intervention for Neurodegenerative Delay)', 'Rich in leafy greens, berries, nuts, and fish', 'Limit red meat, butter, cheese, and fried foods'],
                prevention: ['Engage in lifelong learning and social activity', 'Control cardiovascular risk factors (BP, cholesterol)', 'Stay physically active'],
                lifestyle: ['Establish routines to minimize confusion', 'Use calendars and reminders', 'Secure the home to prevent wandering and falls'],
                whenToConsult: 'If you or a loved one experiences noticeable memory loss or confusion that disrupts daily life.',
                emergencyWarningSigns: ['Sudden inability to recognize surroundings or family', 'Wandering behavior resulting in getting lost', 'Sudden, severe changes in aggression or agitation']
            }
        ],
    },
    {
        title: 'Bone & Joint Health', icon: Activity, color: '#F59E0B',
        items: [
            {
                name: 'Osteoporosis',
                description: 'A disease in which bone density and quality are reduced, leading to weakness of the skeleton and increased risk of fracture, particularly of the spine, wrist, and hip.',
                symptoms: ['Often symptomless until a fracture occurs', 'Back pain caused by a fractured or collapsed vertebra', 'Loss of height over time', 'A stooped posture'],
                riskFactors: ['Older age', 'Being female (especially post-menopausal)', 'Low calcium intake', 'Sedentary lifestyle', 'Tobacco and alcohol use'],
                diagnosis: ['Bone Mineral Density (BMD) test (DEXA scan)'],
                treatment: ['Medications to build or maintain bone mass', 'Fall prevention strategies', 'Dietary modifications'],
                medications: ['Bisphosphonates (Alendronate, Risedronate)', 'Denosumab (Prolia)', 'Hormone-related therapy', 'Teriparatide (bone-building agent)'],
                therapies: ['Physical therapy to improve posture, balance, and core strength'],
                dietRecommendations: ['High-calcium foods (dairy, fortified milks, leafy greens)', 'Vitamin D supplementation', 'Adequate protein intake'],
                prevention: ['Build strong bones in youth', 'Ensure lifelong adequate calcium and vitamin D intake', 'Regular weight-bearing exercise'],
                lifestyle: ['Engage in weight-bearing exercises (walking, dancing, stair climbing)', 'Remove tripping hazards at home (loose rugs, cords)', 'Install grab bars in bathrooms'],
                whenToConsult: 'If you went through early menopause, took corticosteroids for several months, or have a family history of hip fractures.',
                emergencyWarningSigns: ['Sudden, severe back pain', 'Inability to move after a minor fall', 'Apparent deformity in a limb after trauma']
            }
        ]
    }
];

export default function SeniorHealthPage() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
            <Link href="/#solutions" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0EA5A4', fontWeight: 500, fontSize: 14, textDecoration: 'none', marginBottom: 24 }}>
                <ChevronLeft size={16} /> Back to Solutions
            </Link>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: '#0F172A' }}>🧓 Senior Health</h1>
            <p style={{ color: '#64748B', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
                Expert geriatric health resources. Explore detailed condition profiles including symptoms, <strong>medications</strong>, <strong>therapies</strong>, <strong>diet recommendations</strong>, and emergency protocols.
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
