'use client';

import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CareAreasGrid from '@/components/CareAreasGrid';
import FeedbackSection from '@/components/FeedbackSection';
import ContactSection from '@/components/ContactSection';
import { ArrowRight, CheckCircle2, Bot, Activity, ShieldCheck, Brain, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated } = useAppStore();
  // Redirect to dashboard if logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/app/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <main style={{ background: '#F8FAFC' }}>
        {/* 1. Hero Section */}
        <div id="home">
          <HeroSection />
        </div>

        {/* 2. Health Domain Cards — "Our Solutions" */}
        <div id="solutions">
          <CareAreasGrid />
        </div>

        {/* 3. About Section */}
        <section id="about" style={{ padding: '100px 24px', background: 'white' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', alignItems: 'center', gap: 64 }}>
            <div style={{ order: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 99, background: '#F0FDFA', color: '#0EA5A4',
                fontSize: 14, fontWeight: 600, marginBottom: 24, border: '1px solid #CCFBF1'
              }}>
                <Bot size={18} /> {t('about.badge')}
              </div>
              <h2 style={{ fontSize: 42, fontWeight: 800, color: '#0F172A', marginBottom: 20, lineHeight: 1.2 }}>
                {t('about.titlePart1')} <br />
                <span style={{ color: '#0EA5A4' }}>{t('about.titlePart2')}</span>
              </h2>
              <p style={{ fontSize: 18, color: '#64748B', lineHeight: 1.7, marginBottom: 32 }}>
                {t('about.description')}
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40, listStyle: 'none', padding: 0 }}>
                {[
                  'about.features.triage',
                  'about.features.score',
                  'about.features.meds'
                ].map(key => (
                  <li key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#334155', fontWeight: 500 }}>
                    <CheckCircle2 size={20} color="#0EA5A4" /> {t(key)}
                  </li>
                ))}
              </ul>
              <button onClick={() => router.push('/app/workspace')} className="btn-gradient"
                style={{ padding: '16px 32px', fontSize: 16, borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                {t('about.cta')} <ArrowRight size={20} />
              </button>
            </div>

            <div style={{ order: 0, position: 'relative' }}>
              <div style={{
                position: 'relative', borderRadius: 24, overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC'
              }}>
                <img
                  src="/images/about_hero.png"
                  alt="Professional doctor using AI diagnostic system"
                  style={{ width: '100%', display: 'block', minHeight: 400, objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', bottom: 40, left: 20,
                  background: 'white', padding: 20, borderRadius: 16,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #F1F5F9',
                  display: 'flex', alignItems: 'center', gap: 16,
                  maxWidth: 260, zIndex: 2
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#DEF7EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity color="#0EA5A4" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#64748B' }}>Health Score</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>98/100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Features Section */}
        <section id="features" style={{ padding: '100px 24px', background: '#F8FAFC' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 99,
              background: '#EEF2FF', color: '#6366F1',
              fontSize: 13, fontWeight: 600, marginBottom: 20,
            }}>
              <Zap size={14} /> {t('features.badge')}
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
              {t('features.title')}
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', maxWidth: 600, margin: '0 auto 56px', lineHeight: 1.6 }}>
              {t('features.subtitle')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {[
                { key: 'symptom', icon: Bot, color: '#0EA5A4' },
                { key: 'dashboard', icon: Activity, color: '#6366F1' },
                { key: 'meds', icon: ShieldCheck, color: '#F59E0B' },
                { key: 'mental', icon: Brain, color: '#EC4899' },
                { key: 'lab', icon: CheckCircle2, color: '#22C55E' },
                { key: 'location', icon: Zap, color: '#EF4444' },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} style={{
                    background: 'white', borderRadius: 20, padding: 28,
                    border: '1px solid #F1F5F9', textAlign: 'left',
                    transition: 'all 0.3s', cursor: 'default',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `${feature.color}12`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                    }}>
                      <Icon size={24} color={feature.color} />
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{t(`features.items.${feature.key}.title`)}</h3>
                    <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{t(`features.items.${feature.key}.desc`)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Feedback Section */}
        <FeedbackSection />

        {/* 6. Contact Section */}
        <ContactSection />

      </main>
      <Footer />
    </>
  );
}
