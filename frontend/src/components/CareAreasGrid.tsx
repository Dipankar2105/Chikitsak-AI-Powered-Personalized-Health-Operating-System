'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Heart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const areas = [
    {
        key: 'women',
        title: "Women's Health",
        desc: 'Hormonal, reproductive, preventive care.',
        img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
        route: '/care/women',
        requiresAuth: false,
    },
    {
        key: 'men',
        title: "Men's Health",
        desc: 'Testosterone, heart health, preventive screenings.',
        img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
        route: '/care/men',
        requiresAuth: false,
    },
    {
        key: 'child',
        title: "Child Health",
        desc: 'Growth, vaccination, common childhood conditions.',
        img: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=800&q=80',
        route: '/care/child',
        requiresAuth: false,
    },
    {
        key: 'senior',
        title: "Senior Care",
        desc: 'Geriatric health, mobility, chronic care.',
        img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
        route: '/care/senior',
        requiresAuth: false,
    },
    {
        key: 'pregnancy',
        title: "Pregnancy & Baby",
        desc: 'Trimester tracking, fetal growth, post-partum.',
        img: 'https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?auto=format&fit=crop&w=800&q=80',
        route: '/care/pregnancy',
        requiresAuth: false,
    },
    {
        key: 'sexual',
        title: "Sexual Health",
        desc: 'Confidential advice, STIs, reproductive health.',
        img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
        route: '/care/sexual-health',
        requiresAuth: false,
    },
    {
        key: 'nutrition',
        title: "Nutrition & Diet",
        desc: 'Personalized meal tracking and insights.',
        img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
        route: '/app/nutrition',
        requiresAuth: true,
    },
    {
        key: 'mental',
        title: "Mental Health",
        desc: 'Stress, anxiety, mood support.',
        img: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80',
        route: '/app/mental-health',
        requiresAuth: true,
    }
];

export default function CareAreasGrid() {
    const router = useRouter();
    const { isAuthenticated } = useAppStore();

    const handleCardClick = (area: typeof areas[0]) => {
        if (area.requiresAuth && !isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(area.route)}`);
        } else {
            router.push(area.route);
        }
    };

    return (
        <section style={{ padding: '80px 24px', maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 99, background: '#F0FDF4', color: '#16A34A', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                    <Heart size={14} fill="#16A34A" /> Holistic Healthcare
                </div>
                <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, color: '#0F172A', letterSpacing: '-1px' }}>
                    Specialized Care for Everyone
                </h2>
                <p style={{ color: '#64748B', fontSize: 18, maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
                    Expert-curated health modules designed to provide precise guidance for every stage of life.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 28,
            }}>
                {areas.map((area) => (
                    <div key={area.key} onClick={() => handleCardClick(area)} style={{
                        background: 'white',
                        borderRadius: 20,
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid #F1F5F9',
                        display: 'flex', flexDirection: 'column',
                    }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.boxShadow = '0 16px 32px -8px rgba(14, 165, 164, 0.15)';
                            const img = e.currentTarget.querySelector('.card-img') as HTMLElement;
                            if (img) img.style.transform = 'scale(1.06)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                            const img = e.currentTarget.querySelector('.card-img') as HTMLElement;
                            if (img) img.style.transform = 'scale(1)';
                        }}
                    >
                        <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                            <div style={{
                                position: 'absolute', inset: 0, zIndex: 1,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 60%)',
                            }} />
                            <img
                                className="card-img"
                                src={area.img}
                                alt={area.title}
                                loading="lazy"
                                style={{
                                    width: '100%', height: '100%', objectFit: 'cover',
                                    transition: 'transform 0.4s ease',
                                }}
                            />
                        </div>
                        <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
                                {area.title}
                            </h3>
                            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, flex: 1 }}>
                                {area.desc}
                            </p>
                            <div style={{
                                marginTop: 16, paddingTop: 14, borderTop: '1px solid #F8FAFC',
                                color: '#0EA5A4', fontWeight: 600, fontSize: 13,
                                textTransform: 'uppercase', letterSpacing: '0.5px',
                            }}>
                                Explore Module →
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
