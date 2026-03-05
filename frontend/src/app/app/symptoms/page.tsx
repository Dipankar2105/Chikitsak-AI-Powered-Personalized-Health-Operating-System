'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import api from '@/lib/api';
import { ChatResponse } from '@/types/api';
import {
    Stethoscope, Send, Bot, User, Loader2,
    AlertTriangle, ShieldCheck, Activity, Info
} from 'lucide-react';

export default function SymptomCheckerPage() {
    const { t } = useTranslation();
    const { language } = useAppStore();
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!query.trim() || loading) return;

        const userMsg = query;
        setQuery('');
        setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post<ChatResponse>('/chat', {
                message: userMsg,
                mode: 'health',
                language: language || 'en'
            });

            if (res.data.status === 'success') {
                const aiResponse = res.data.data?.response || res.data.message || "I've analyzed your symptoms.";
                setHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
            }
        } catch (err) {
            setHistory(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble analyzing that symptom right now. Please try again or consult a professional." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 8, borderRadius: 12, background: '#F0FDFA', color: '#0EA5A4' }}>
                        <Stethoscope size={24} />
                    </div>
                    Symptom Checker
                </h1>
                <p style={{ color: '#64748B', marginTop: 8 }}>
                    Describe your symptoms in detail for a clinical-grade AI analysis (CDSS).
                </p>
            </div>

            <div style={{
                flex: 1, background: 'white', borderRadius: 24, border: '1px solid #F1F5F9',
                display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
                {/* Chat History */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {history.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                            <Bot size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#475569' }}>How can I help you today?</h3>
                            <p style={{ fontSize: 14, maxWidth: 300, margin: '8px auto' }}>Example: "I have a sharp pain in my upper chest and I've been feeling nauseous since morning."</p>
                        </div>
                    )}

                    {history.map((msg, i) => (
                        <div key={i} style={{
                            display: 'flex', gap: 16,
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            animation: 'slideUp 0.3s ease-out'
                        }}>
                            {msg.role === 'assistant' && (
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0EA5A4', flexShrink: 0 }}>
                                    <Bot size={20} />
                                </div>
                            )}
                            <div style={{
                                maxWidth: '80%', padding: '14px 18px', borderRadius: 20,
                                background: msg.role === 'user' ? 'linear-gradient(135deg, #0EA5A4, #4F46E5)' : '#F8FAFC',
                                color: msg.role === 'user' ? 'white' : '#1E293B',
                                border: msg.role === 'user' ? 'none' : '1px solid #F1F5F9',
                                fontSize: 15, lineHeight: 1.6,
                                borderBottomRightRadius: msg.role === 'user' ? 4 : 20,
                                borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 20
                            }}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', flexShrink: 0 }}>
                                    <User size={20} />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0EA5A4', flexShrink: 0 }}>
                                <Loader2 size={20} className="animate-spin" />
                            </div>
                            <div style={{ background: '#F8FAFC', padding: '12px 20px', borderRadius: 20, borderBottomLeftRadius: 4, display: 'flex', gap: 6 }}>
                                <span className="dot-pulse"></span>
                                <span className="dot-pulse" style={{ animationDelay: '0.2s' }}></span>
                                <span className="dot-pulse" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div style={{ padding: 20, borderTop: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                    <div style={{
                        display: 'flex', gap: 12, background: 'white', padding: 8, borderRadius: 16,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0'
                    }}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Describe your symptoms..."
                            style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 12px', fontSize: 15 }}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!query.trim() || loading}
                            style={{
                                width: 44, height: 44, borderRadius: 12, border: 'none',
                                background: query.trim() ? '#0EA5A4' : '#F1F5F9',
                                color: 'white', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <ShieldCheck size={12} /> HIPAA Compliant • AI Analysis Only • Not a medical diagnosis
                    </div>
                </div>
            </div>
        </div>
    );
}
