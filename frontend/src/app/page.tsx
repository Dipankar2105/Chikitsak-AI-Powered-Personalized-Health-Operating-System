'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CareAreasGrid from '@/components/CareAreasGrid';
import TestimonialsSection from '@/components/TestimonialsSection';
import CommunityReviews from '@/components/CommunityReviews';
import { ArrowRight, CheckCircle2, Bot, Activity, ShieldCheck, Brain, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Navbar />
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
                <Bot size={18} /> About Chikitsak
              </div>
              <h2 style={{ fontSize: 42, fontWeight: 800, color: '#0F172A', marginBottom: 20, lineHeight: 1.2 }}>
                Your Personal <br />
                <span style={{ color: '#0EA5A4' }}>AI Health Assistant</span>
              </h2>
              <p style={{ fontSize: 18, color: '#64748B', lineHeight: 1.7, marginBottom: 32 }}>
                Experience the future of healthcare with our advanced AI triage engine.
                Get instant analysis of your symptoms, personalized care plans, and
                real-time health insights — all in one platform.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40, listStyle: 'none', padding: 0 }}>
                {['Instant Symptom Triage', 'Personalized Health Score', 'Smart Medication Reminders'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#334155', fontWeight: 500 }}>
                    <CheckCircle2 size={20} color="#0EA5A4" /> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => router.push('/app/workspace')} className="btn-gradient"
                style={{ padding: '16px 32px', fontSize: 16, borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                Try AI Workspace <ArrowRight size={20} />
              </button>
            </div>

            <div style={{ order: 0, position: 'relative' }}>
              <div style={{
                position: 'relative', borderRadius: 24, overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #E2E8F0',
              }}>
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
                  alt="AI Dashboard Interface"
                  style={{ width: '100%', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', bottom: 40, left: -20,
                  background: 'white', padding: 20, borderRadius: 16,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #F1F5F9',
                  display: 'flex', alignItems: 'center', gap: 16,
                  maxWidth: 260
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
              <Zap size={14} /> Platform Features
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
              Everything You Need for Better Health
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', maxWidth: 600, margin: '0 auto 56px', lineHeight: 1.6 }}>
              Powered by AI, designed with care. Explore our comprehensive healthcare features.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {[
                { icon: Bot, title: 'AI Symptom Checker', desc: 'Describe symptoms and get instant AI triage with severity assessment and recommended next steps.', color: '#0EA5A4' },
                { icon: Activity, title: 'Health Dashboard', desc: 'Track your vitals, health score, and trends over time with beautiful visualizations.', color: '#6366F1' },
                { icon: ShieldCheck, title: 'Drug Interaction Check', desc: 'Check medication interactions, dosages, and food guidelines with AI precision.', color: '#F59E0B' },
                { icon: Brain, title: 'Mental Wellness', desc: 'Mood tracking, guided meditation, CBT exercises, and a supportive chatbot companion.', color: '#EC4899' },
                { icon: CheckCircle2, title: 'Lab Report Analysis', desc: 'Upload lab reports for instant AI interpretation with flagged abnormalities and trends.', color: '#22C55E' },
                { icon: Zap, title: 'Location Health Alerts', desc: 'Real-time AQI, trending illnesses, and seasonal health risks based on your city.', color: '#EF4444' },
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
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{feature.title}</h3>
                    <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Community Reviews */}
        <CommunityReviews />

        {/* 6. Testimonials */}
        <TestimonialsSection />

      </main>
      <Footer />
    </>
  );
}
