'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { Search, Mic, MicOff, Send, Upload, FileText, Pill, Stethoscope, Image as ImageIcon } from 'lucide-react';

export default function HeroSection() {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'symptom' | 'lab' | 'med' | 'image'>('symptom');
    const [isFocused, setIsFocused] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const { t } = useTranslation();
    const router = useRouter();
    const { isAuthenticated } = useAppStore();

    const getRedirectPath = () => {
        const encodedQuery = encodeURIComponent(query.trim());
        switch (activeTab) {
            case 'lab': return '/app/workspace?mode=lab';
            case 'med': return `/app/workspace?mode=medication&q=${encodedQuery}`;
            case 'image': return '/app/workspace?mode=image';
            default: return query.trim() ? `/app/workspace?q=${encodedQuery}` : '/app/workspace';
        }
    };

    const handleSearchSubmit = () => {
        if (activeTab !== 'image' && !query.trim()) return;
        const target = getRedirectPath();

        if (!isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(target)}`);
        } else {
            router.push(target);
        }
    };

    const handleImageUpload = () => {
        const target = '/app/workspace?mode=image';
        if (!isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(target)}`);
        } else {
            router.push(target);
        }
    };

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice input is not supported in this browser. Please try Chrome.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(prev => prev + (prev ? ' ' : '') + transcript);
        };

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
        }
    };

    const tabs = [
        { id: 'symptom' as const, label: 'Symptom Check', icon: Stethoscope },
        { id: 'lab' as const, label: 'Lab Report', icon: FileText },
        { id: 'med' as const, label: 'Medication', icon: Pill },
        { id: 'image' as const, label: 'Image Analysis', icon: ImageIcon },
    ];

    const placeholders: Record<string, string> = {
        symptom: 'Describe your symptoms, e.g. "I have a severe headache and fever..."',
        lab: 'Paste your lab report values or describe them...',
        med: 'Enter medication name, e.g. "Metformin 500mg"...',
        image: '',
    };

    return (
        <section style={{
            position: 'relative',
            padding: '80px 24px 100px',
            textAlign: 'center',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)'
        }}>
            {/* Background Blobs */}
            <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: '#0EA5A4', opacity: 0.08, filter: 'blur(100px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, background: '#6366F1', opacity: 0.08, filter: 'blur(80px)', borderRadius: '50%' }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>

                {/* Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', borderRadius: 99,
                    background: 'white', border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    marginBottom: 32
                }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>AI Health Companion Active</span>
                </div>

                {/* Heading — Fixed text */}
                <h1 style={{
                    fontSize: 52, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 24, lineHeight: 1.15,
                    color: '#0F172A',
                }}>
                    Your AI{' '}
                    <span className="gradient-text">Health Companion</span>
                </h1>

                <p style={{ fontSize: 18, color: '#64748B', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>
                    Tell me your symptoms, upload a lab report, or check medication interactions — all powered by intelligent AI.
                </p>

                {/* Pill-shaped Search Container */}
                <div style={{
                    background: 'white', borderRadius: 28,
                    boxShadow: isFocused
                        ? '0 20px 40px -10px rgba(14, 165, 164, 0.2)'
                        : '0 8px 30px -5px rgba(0, 0, 0, 0.08)',
                    padding: 8,
                    border: `2px solid ${isFocused ? '#0EA5A4' : 'transparent'}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    maxWidth: 680,
                    margin: '0 auto',
                }}>

                    {/* Mode Tabs */}
                    <div style={{ display: 'flex', gap: 4, padding: '0 8px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: 8 }}>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                                        background: isActive ? '#F0FDFA' : 'transparent',
                                        color: isActive ? '#0EA5A4' : '#64748B',
                                        fontWeight: isActive ? 600 : 500, fontSize: 13,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Icon size={16} /> {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Input Area */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px' }}>
                        <Search size={20} color={isFocused ? '#0EA5A4' : '#94A3B8'} style={{ flexShrink: 0 }} />

                        {activeTab === 'image' ? (
                            <div
                                onClick={handleImageUpload}
                                style={{
                                    flex: 1, padding: '12px 0', color: '#64748B', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 10, fontSize: 15,
                                }}
                            >
                                <Upload size={18} />
                                <span>Click to upload medical image for AI analysis...</span>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                placeholder={placeholders[activeTab]}
                                style={{
                                    flex: 1, border: 'none', outline: 'none', fontSize: 15,
                                    color: '#1E293B', background: 'transparent',
                                }}
                            />
                        )}

                        {activeTab !== 'image' && (
                            <>
                                {/* Voice Input */}
                                <button
                                    onClick={handleVoiceInput}
                                    style={{
                                        padding: 10, borderRadius: '50%', border: 'none',
                                        background: isListening ? '#FEE2E2' : '#F8FAFC',
                                        cursor: 'pointer',
                                        color: isListening ? '#EF4444' : '#64748B',
                                        transition: 'all 0.2s',
                                        animation: isListening ? 'pulse 1.5s infinite' : 'none',
                                    }}
                                    title="Voice input"
                                >
                                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                </button>

                                {/* Gradient Send Button */}
                                <button
                                    onClick={handleSearchSubmit}
                                    style={{
                                        width: 46, height: 46, borderRadius: 16, flexShrink: 0,
                                        background: query.trim()
                                            ? 'linear-gradient(135deg, #0EA5A4, #4F46E5)'
                                            : '#E2E8F0',
                                        border: 'none',
                                        cursor: query.trim() ? 'pointer' : 'default',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white',
                                        boxShadow: query.trim() ? '0 4px 12px rgba(14, 165, 164, 0.3)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {activeTab === 'lab' ? <Upload size={20} /> : <Send size={20} />}
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </section>
    );
}
