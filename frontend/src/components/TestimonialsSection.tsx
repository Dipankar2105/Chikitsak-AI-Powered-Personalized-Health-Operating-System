'use client';

import { MessageSquareQuote } from 'lucide-react';

export default function TestimonialsSection() {
    return (
        <section style={{ padding: '80px 24px', background: '#F8FAFC' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 64, height: 64, borderRadius: '50%', background: '#E0F2FE', color: '#0284C7',
                    marginBottom: 24
                }}>
                    <MessageSquareQuote size={32} />
                </div>

                <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                    Community Reviews
                </h2>

                <p style={{ fontSize: 18, color: '#64748B', maxWidth: 500, margin: '0 auto 48px' }}>
                    See what others are saying about their health journey with Chikitsak.
                </p>

                {/* Empty State / Clean Layout */}
                <div style={{
                    background: 'white', borderRadius: 24, padding: '64px 24px',
                    border: '2px dashed #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                }}>
                    <div style={{ color: '#94A3B8', fontSize: 16, fontWeight: 500 }}>
                        User reviews will appear here soon.
                    </div>
                </div>
            </div>
        </section>
    );
}
