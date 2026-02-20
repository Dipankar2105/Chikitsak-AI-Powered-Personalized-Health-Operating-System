'use client';

import { useState } from 'react';
import { Search, ChevronRight, Stethoscope, X } from 'lucide-react';

const conditions = [
    {
        id: 'diabetes', name: 'Type 2 Diabetes', category: 'Endocrine',
        desc: 'A chronic condition that affects the way the body processes blood sugar.',
        img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80',
        detail: {
            overview: 'Type 2 diabetes is a chronic metabolic disorder characterized by insulin resistance and relative insulin deficiency. It is the most common form of diabetes and often develops in adults over 45, though it is increasingly seen in younger populations.',
            symptoms: ['Increased thirst and frequent urination', 'Unexplained weight loss', 'Blurred vision', 'Slow-healing cuts and bruises', 'Fatigue and irritability', 'Numbness or tingling in hands/feet'],
            causes: ['Obesity and excess body fat', 'Physical inactivity', 'Family history and genetics', 'Age (risk increases after 45)', 'Polycystic ovary syndrome (PCOS)', 'High blood pressure or high cholesterol'],
            treatment: ['Metformin (first-line medication)', 'Lifestyle changes — diet and exercise', 'Blood sugar monitoring', 'Insulin therapy if needed', 'Regular A1C testing every 3-6 months'],
            prevention: ['Maintain a healthy weight', 'Exercise at least 150 min/week', 'Eat a balanced diet rich in whole grains', 'Limit sugar and processed foods', 'Regular health check-ups'],
        }
    },
    {
        id: 'hypertension', name: 'Hypertension', category: 'Cardiovascular',
        desc: 'High blood pressure, a condition that can lead to severe health complications.',
        img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80',
        detail: {
            overview: 'Hypertension occurs when blood pressure remains consistently elevated above 130/80 mmHg. Often called "the silent killer," it significantly increases risk of heart disease, stroke, and kidney disease.',
            symptoms: ['Often asymptomatic (silent killer)', 'Severe headaches (in extreme cases)', 'Nosebleeds', 'Shortness of breath', 'Chest pain', 'Dizziness or vision problems'],
            causes: ['High sodium diet', 'Obesity', 'Chronic stress', 'Smoking and alcohol', 'Family history', 'Chronic kidney disease'],
            treatment: ['ACE inhibitors or ARBs', 'Calcium channel blockers', 'Diuretics', 'Beta-blockers', 'Regular blood pressure monitoring', 'DASH diet adoption'],
            prevention: ['Reduce salt intake to <2300mg/day', 'Exercise regularly', 'Maintain healthy weight', 'Limit alcohol', 'Manage stress', 'Regular screening after age 40'],
        }
    },
    {
        id: 'migraine', name: 'Migraine', category: 'Neurological',
        desc: 'A headache of varying intensity, often accompanied by nausea and sensitivity to light.',
        img: 'https://images.unsplash.com/photo-1616012480717-fd9867059ca0?auto=format&fit=crop&w=400&q=80',
        detail: {
            overview: 'Migraines are a neurological condition causing intense, debilitating headaches, typically on one side of the head. They can last 4-72 hours and are often preceded by visual disturbances known as auras.',
            symptoms: ['Intense throbbing or pulsing headache', 'Nausea and vomiting', 'Sensitivity to light and sound', 'Visual aura (flashing lights, zigzag lines)', 'Neck stiffness', 'Fatigue and mood changes before onset'],
            causes: ['Hormonal changes (estrogen)', 'Stress and anxiety', 'Certain foods (aged cheese, wine, processed foods)', 'Irregular sleep patterns', 'Weather changes', 'Genetic predisposition'],
            treatment: ['Triptans for acute attacks', 'NSAIDs (ibuprofen, naproxen)', 'Anti-nausea medications', 'Preventive medications (beta-blockers, antidepressants)', 'Botox injections for chronic migraine', 'CGRP monoclonal antibodies'],
            prevention: ['Identify and avoid triggers', 'Maintain regular sleep schedule', 'Stay hydrated', 'Regular exercise', 'Stress management techniques', 'Keep a migraine diary'],
        }
    },
    {
        id: 'anxiety', name: 'Generalized Anxiety Disorder', category: 'Mental Health',
        desc: 'Severe, ongoing anxiety that interferes with daily activities.',
        img: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=400&q=80',
        detail: {
            overview: 'GAD involves persistent and excessive worry about everyday situations. It is one of the most common anxiety disorders, affecting approximately 6.8 million adults. Symptoms often coexist with depression.',
            symptoms: ['Persistent worrying or anxiety', 'Restlessness or feeling on edge', 'Difficulty concentrating', 'Muscle tension', 'Sleep disturbances', 'Irritability'],
            causes: ['Brain chemistry (GABA, serotonin imbalance)', 'Genetics', 'Trauma or stressful life events', 'Chronic medical conditions', 'Substance abuse', 'Personality factors (perfectionism)'],
            treatment: ['CBT (Cognitive Behavioral Therapy)', 'SSRIs (sertraline, escitalopram)', 'Buspirone', 'Benzodiazepines (short-term)', 'Mindfulness-based stress reduction', 'Regular psychotherapy sessions'],
            prevention: ['Regular physical activity', 'Mindfulness and meditation practice', 'Adequate sleep (7-9 hours)', 'Limit caffeine and alcohol', 'Build a strong social support network', 'Learn time management skills'],
        }
    },
    {
        id: 'gerd', name: 'GERD', category: 'Digestive',
        desc: 'Gastroesophageal reflux disease, or chronic acid reflux.',
        img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80',
        detail: {
            overview: 'GERD is a chronic digestive disorder where stomach acid frequently flows back into the esophagus. This acid reflux can irritate the lining of the esophagus, leading to discomfort and potential complications.',
            symptoms: ['Heartburn (burning in chest after eating)', 'Regurgitation of food or sour liquid', 'Difficulty swallowing', 'Chronic cough', 'Laryngitis', 'Disrupted sleep'],
            causes: ['Weakened lower esophageal sphincter', 'Obesity', 'Hiatal hernia', 'Pregnancy', 'Smoking', 'Certain medications (NSAIDs, blood pressure drugs)'],
            treatment: ['Antacids (Tums, Maalox)', 'H2 blockers (famotidine)', 'PPIs (omeprazole, esomeprazole)', 'Lifestyle modifications', 'Surgery (fundoplication) for severe cases', 'Dietary changes'],
            prevention: ['Avoid trigger foods (spicy, fatty, citrus)', 'Eat smaller, more frequent meals', 'Don\'t lie down after eating (wait 3h)', 'Elevate head of bed 6-8 inches', 'Maintain healthy weight', 'Quit smoking'],
        }
    },
];

export default function ConditionsLibrary() {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filtered = conditions.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()));
    const selected = conditions.find(c => c.id === selectedId);

    return (
        <div style={{ padding: '32px', overflowY: 'auto', maxHeight: '100vh' }}>
            {/* Detail View */}
            {selected ? (
                <div>
                    <button onClick={() => setSelectedId(null)} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                        borderRadius: 10, border: '1px solid #E2E8F0', background: 'white',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 24,
                    }}>
                        ← Back to Library
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'start' }}>
                        <div>
                            <img src={selected.img} alt={selected.name} style={{ width: '100%', borderRadius: 16, marginBottom: 16 }} />
                            <span style={{ padding: '4px 12px', borderRadius: 99, background: '#F0FDFA', color: '#0F766E', fontSize: 12, fontWeight: 600 }}>{selected.category}</span>
                        </div>

                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>{selected.name}</h1>
                            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 28 }}>{selected.detail.overview}</p>

                            {[
                                { title: 'Common Symptoms', items: selected.detail.symptoms, color: '#EF4444' },
                                { title: 'Causes & Risk Factors', items: selected.detail.causes, color: '#F59E0B' },
                                { title: 'Treatment Options', items: selected.detail.treatment, color: '#0EA5A4' },
                                { title: 'Prevention', items: selected.detail.prevention, color: '#22C55E' },
                            ].map(section => (
                                <div key={section.title} style={{ marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ width: 4, height: 20, borderRadius: 2, background: section.color }} />
                                        {section.title}
                                    </h3>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, margin: 0, listStyle: 'none' }}>
                                        {section.items.map((item, i) => (
                                            <li key={i} style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, paddingLeft: 20, position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 0, top: 8, width: 6, height: 6, borderRadius: '50%', background: section.color + '40' }} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Library View */}
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Medical Conditions Library</h1>
                        <p style={{ color: '#64748B', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
                            Reliable information on common health conditions, symptoms, and treatments.
                        </p>
                    </div>

                    <div style={{ maxWidth: 600, margin: '0 auto 48px', position: 'relative' }}>
                        <Search size={20} color="#94A3B8" style={{ position: 'absolute', left: 16, top: 15 }} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by condition name or category..."
                            style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: 99, border: '1px solid #E2E8F0', fontSize: 15, outline: 'none', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                        {filtered.map(c => (
                            <div key={c.id} onClick={() => setSelectedId(c.id)} style={{
                                background: 'white', borderRadius: 16, overflow: 'hidden',
                                border: '1px solid #F1F5F9', cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; }}
                            >
                                <div style={{ height: 140 }}>
                                    <img src={c.img} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: 20 }}>
                                    <span style={{ padding: '3px 10px', borderRadius: 99, background: '#F0FDFA', color: '#0F766E', fontSize: 11, fontWeight: 600 }}>{c.category}</span>
                                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1E293B', margin: '10px 0 6px' }}>{c.name}</h3>
                                    <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 14 }}>{c.desc}</p>
                                    <div style={{ color: '#0EA5A4', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        Learn More <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
