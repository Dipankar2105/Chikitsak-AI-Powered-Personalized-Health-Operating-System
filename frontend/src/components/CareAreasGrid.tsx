'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Heart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const areas = [
    {
        key: 'women',
        title: "Women's Health",
        desc: 'Hormonal, reproductive, preventive care.',
        img: '/images/care/female-baldness-treatment_mumbai.webp',
        route: '/care/women',
        requiresAuth: false,
    },
    {
        key: 'men',
        title: "Men's Health",
        desc: 'Testosterone, heart health, preventive screenings.',
        img: '/images/care/average-height-in-men-in-india_900.jpg',
        route: '/care/men',
        requiresAuth: false,
    },
    {
        key: 'child',
        title: "Child Health",
        desc: 'Growth, vaccination, common childhood conditions.',
        img: '/images/care/istockphoto-1667682801-612x612.jpg',
        route: '/care/child',
        requiresAuth: false,
    },
    {
        key: 'senior',
        title: "Senior Care",
        desc: 'Geriatric health, mobility, chronic care.',
        img: '/images/care/istockphoto-1463691216-612x612.jpg',
        route: '/care/senior',
        requiresAuth: false,
    },
    {
        key: 'adult',
        title: "Adult Health",
        desc: 'Preventive care, chronic disease management.',
        img: '/images/care/download.jpg',
        route: '/care/adult',
        requiresAuth: false,
    },
    {
        key: 'sexual',
        title: "Sexual Health",
        desc: 'Confidential advice, STIs, reproductive health.',
        img: '/images/care/indian-couple-embracing-romantic-young-outdoors-39596408.webp',
        route: '/care/sexual',
        requiresAuth: false,
    },
    {
        key: 'nutrition',
        title: "Nutrition & Diet",
        desc: 'Personalized meal tracking and insights.',
        img: '/images/care/image-011.jpg',
        route: '/care/nutrition',
        requiresAuth: false,
    },
    {
        key: 'mental',
        title: "Mental Health",
        desc: 'Stress, anxiety, mood support.',
        img: '/images/care/Getty_anxiety_1200.jpg',
        route: '/care/mental',
        requiresAuth: false,
    }
];

export default function CareAreasGrid() {
    const router = useRouter();
    const { t } = useTranslation();
    const { isAuthenticated } = useAppStore();

    const handleCardClick = (area: typeof areas[0]) => {
        if (area.requiresAuth && !isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(area.route)}`);
        } else {
            router.push(area.route);
        }
    };

    return (
        <section className="care-areas-section" style={{ padding: '80px 24px', maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 99, background: '#F0FDF4', color: '#16A34A', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                    <Heart size={14} fill="#16A34A" /> {t('careAreas.holisticBadge')}
                </div>
                <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, color: '#0F172A', letterSpacing: '-1px' }}>
                    {t('careAreas.title')}
                </h2>
                <p style={{ color: '#64748B', fontSize: 18, maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
                    {t('careAreas.subtitle')}
                </p>
            </div>

            <div className="care-areas-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 32,
            }}>
                {areas.map((area) => (
                    <div key={area.key} onClick={() => handleCardClick(area)} className="care-card shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="care-card-img-wrapper" style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                            <div className="care-card-img-overlay" />
                            <img
                                className="care-card-img"
                                src={area.img}
                                alt={area.title}
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div className="care-card-content" style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 className="care-card-title" style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>
                                {t(`careAreas.items.${area.key}.title`)}
                            </h3>

                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.5px' }}>Common Concerns</div>
                                <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
                                    {t(`careAreas.items.${area.key}.problems`).split(', ').map((p, i) => (
                                        <span key={i} style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{p}</span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#0EA5A4', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.5px' }}>AI-Driven Approach</div>
                                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>
                                    {t(`careAreas.items.${area.key}.solutions`)}
                                </p>
                            </div>

                            <div style={{
                                marginTop: 'auto', padding: '12px', background: '#F8FAFC', borderRadius: 12,
                                fontSize: 11, color: '#94A3B8', border: '1px solid #F1F5F9', fontStyle: 'italic'
                            }}>
                                ⚕️ Disclaimer: Evidence-based guidance for educational purposes only.
                            </div>

                            <div className="care-card-footer" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F8FAFC', color: '#0EA5A4', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                {t('common.exploreModule')} <ArrowRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
