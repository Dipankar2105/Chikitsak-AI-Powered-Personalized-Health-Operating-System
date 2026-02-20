'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Priya Sharma',
        role: 'Patient',
        content: 'Chikitsak helped me understand my lab reports instantly. The AI analysis was incredibly accurate and the recommendations were very helpful.',
        rating: 5,
    },
    {
        name: 'Rahul Verma',
        role: 'Healthcare Worker',
        content: 'As a healthcare worker, I recommend Chikitsak to patients for initial symptom assessment. The triage system is remarkably well-designed.',
        rating: 5,
    },
    {
        name: 'Maria Garcia',
        role: 'Mother of Two',
        content: 'The child health module gave me peace of mind during flu season. I could track symptoms and get instant guidance on when to visit a doctor.',
        rating: 5,
    },
    {
        name: 'Amit Patel',
        role: 'Senior Citizen',
        content: 'The medication interaction checker saved me from a potentially dangerous drug combination. This app is a lifesaver!',
        rating: 5,
    },
];

export default function TestimonialSlider() {
    const { t } = useTranslation();
    const [current, setCurrent] = useState(0);

    const next = () => setCurrent((c) => (c + 1) % testimonials.length);
    const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

    return (
        <section style={{
            padding: '80px 24px',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)',
        }}>
            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
                    {t('testimonials.title')}
                </h2>
                <p style={{ color: '#64748B', fontSize: 16, marginBottom: 48 }}>
                    {t('testimonials.subtitle')}
                </p>

                <div style={{ position: 'relative' }}>
                    <div className="card" style={{
                        padding: 40,
                        minHeight: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 20,
                    }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                                <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
                            ))}
                        </div>
                        <p style={{
                            fontSize: 16, lineHeight: 1.7, color: '#475569',
                            fontStyle: 'italic', maxWidth: 520,
                        }}>
                            &ldquo;{testimonials[current].content}&rdquo;
                        </p>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: '#0F172A' }}>
                                {testimonials[current].name}
                            </div>
                            <div style={{ fontSize: 13, color: '#94A3B8' }}>
                                {testimonials[current].role}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24,
                    }}>
                        <button onClick={prev} style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'white', border: '1px solid #E2E8F0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#64748B',
                        }}>
                            <ChevronLeft size={18} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {testimonials.map((_, i) => (
                                <div key={i} style={{
                                    width: i === current ? 24 : 8, height: 8, borderRadius: 4,
                                    background: i === current ? '#0EA5A4' : '#CBD5E1',
                                    transition: 'all 0.3s',
                                }} />
                            ))}
                        </div>
                        <button onClick={next} style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'white', border: '1px solid #E2E8F0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#64748B',
                        }}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
