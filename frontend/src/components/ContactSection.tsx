'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mail, User, MessageCircle, Phone } from 'lucide-react';
import api from '@/lib/api';

export default function ContactSection() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            await api.post('/support/contact', formData);
            setStatus({ type: 'success', msg: 'Message sent successfully!' });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setStatus({ type: 'error', msg: t('support.contact.form.error') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" style={{ padding: '100px 24px', background: '#F8FAFC' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '8px 16px', borderRadius: 99, background: '#EEF2FF', color: '#6366F1',
                        fontSize: 14, fontWeight: 600, marginBottom: 24, border: '1px solid #E0E7FF'
                    }}>
                        <Mail size={18} /> {t('navbar.contact')}
                    </div>
                    <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                        {t('support.contact.title')}
                    </h2>
                    <p style={{ fontSize: 16, color: '#64748B' }}>
                        {t('support.contact.subtitle')}
                    </p>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 48, alignItems: 'start'
                }}>
                    {/* Contact Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <div style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>{t('support.contact.infoTitle')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0EA5A4' }}>
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, color: '#64748B' }}>{t('support.contact.details.email')}</div>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
                                            <a href="mailto:dipankar.pimple@vit.edu.in" style={{ color: 'inherit', textDecoration: 'none' }}>dipankar.pimple@vit.edu.in</a>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, color: '#64748B' }}>{t('support.contact.details.phone')}</div>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
                                            <a href="tel:9860434255" style={{ color: 'inherit', textDecoration: 'none' }}>9860434255</a>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, color: '#64748B' }}>{t('support.contact.details.liveChat')}</div>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{t('support.contact.details.liveChatDesc')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} style={{
                        background: 'white', padding: 40, borderRadius: 24,
                        border: '1px solid #E2E8F0'
                    }}>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>{t('support.contact.form.title')}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>{t('support.contact.form.name')}</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder={t('support.contact.form.namePlaceholder')}
                                        style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>{t('support.contact.form.email')}</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder={t('support.contact.form.emailPlaceholder')}
                                        style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>{t('support.contact.form.subject')}</label>
                            <input
                                type="text"
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder={t('support.contact.form.subjectPlaceholder')}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>{t('support.contact.form.message')}</label>
                            <textarea
                                required
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder={t('support.contact.form.messagePlaceholder')}
                                style={{ width: '100%', minHeight: 120, padding: 16, borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>

                        {status && (
                            <div style={{
                                padding: 16, borderRadius: 10, marginBottom: 24,
                                background: status.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                                color: status.type === 'success' ? '#059669' : '#DC2626',
                                fontSize: 14, fontWeight: 500
                            }}>
                                {status.type === 'success' ? t('support.contact.form.success') : t('support.contact.form.error')}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gradient"
                            style={{
                                width: '100%', padding: '16px', borderRadius: 10,
                                fontSize: 16, fontWeight: 600, display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: 10,
                                opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? t('support.contact.form.sending') : t('support.contact.form.submit')} <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
