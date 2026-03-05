'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import api from '@/lib/api';
import { ChatResponse } from '@/types/api';
import {
    Search, Mic, MicOff, Send, Upload, FileText, Pill,
    Stethoscope, Image as ImageIcon, Loader2, ChevronDown
} from 'lucide-react';

export default function HeroSection() {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'symptom' | 'lab' | 'med' | 'image'>('symptom');
    const [isFocused, setIsFocused] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageType, setImageType] = useState<'xray' | 'mri' | 'skin' | 'food'>('xray');
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const [demoCount, setDemoCount] = useState<number>(0);
    const [showUpgradeCta, setShowUpgradeCta] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { t } = useTranslation();
    const router = useRouter();
    const { isAuthenticated } = useAppStore();

    // Load demo count for guests
    useEffect(() => {
        if (!isAuthenticated) {
            const stored = localStorage.getItem('chikitsak-demo-count');
            if (stored) setDemoCount(parseInt(stored));
        }
    }, [isAuthenticated]);

    const handleSearchSubmit = async () => {
        if (!query.trim() && activeTab !== 'image') return;

        // If not authenticated, allow 3 demo uses then redirect
        if (!isAuthenticated) {
            if (demoCount >= 3) {
                const redirectUrl = `/app/workspace${activeTab !== 'symptom' ? `?mode=${activeTab === 'med' ? 'medication' : activeTab}&q=${encodeURIComponent(query)}` : `?q=${encodeURIComponent(query)}`}`;
                router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}&source=limit_reached`);
                return;
            }

            // Increment demo count
            const nextCount = demoCount + 1;
            setDemoCount(nextCount);
            localStorage.setItem('chikitsak-demo-count', nextCount.toString());

            if (nextCount >= 3) setShowUpgradeCta(true);

            // Guest demo is just a redirect to workspace with the query (demo mode will handle it there)
            // But user said 'basic AI demo' before login. Let's make it a limited preview.
            // For now, redirect to workspace where they'll be asked to login or see limited results.
            const redirectUrl = `/app/workspace${activeTab !== 'symptom' ? `?mode=${activeTab === 'med' ? 'medication' : activeTab}&q=${encodeURIComponent(query)}` : `?q=${encodeURIComponent(query)}`}`;
            router.push(redirectUrl);
            return;
        }

        setIsLoading(true);
        try {
            if (activeTab === 'symptom') {
                const res = await api.post<ChatResponse>('/chat', {
                    message: query,
                    mode: 'health',
                    language: 'en'
                });
                const apiData = res.data as ChatResponse;
                router.push(`/app/workspace?session_id=${apiData.session_id || ''}`);
            }
            else if (activeTab === 'lab') {
                router.push(`/app/workspace?mode=lab&q=${encodeURIComponent(query)}`);
            }
            else if (activeTab === 'med') {
                router.push(`/app/workspace?mode=medication&q=${encodeURIComponent(query)}`);
            }
        } catch (error) {
            console.error('Action failed:', error);
            router.push('/app/workspace');
        } finally {
            setIsLoading(false);
        }
    };

    const validateFile = (file: File, isImageTab: boolean): string | null => {
        const maxSize = isImageTab ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for labs
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
        const allowedLabTypes = ['application/pdf', 'text/csv', 'text/plain', 'application/dicom'];

        if (file.size > maxSize) {
            return `File is too large. Maximum size is ${isImageTab ? '5' : '10'} MB.`;
        }

        const allowedTypes = isImageTab ? allowedImageTypes : allowedLabTypes;
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|tiff|pdf|csv|txt|dcm)$/i)) {
            return isImageTab ? 'Please upload a valid image (JPG, PNG, WebP, or TIFF).' : 'Please upload a valid lab file (PDF, CSV, or TXT).';
        }

        return null;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isAuthenticated) {
            if (!isAuthenticated) router.push('/login?redirect=/app/workspace');
            return;
        }

        const isImageTab = activeTab === 'image';
        const validationError = validateFile(file, isImageTab);

        if (validationError) {
            setVoiceError(validationError); // Reusing VoiceError state for upload errors
            setTimeout(() => setVoiceError(null), 5000);
            e.target.value = '';
            return;
        }

        setIsLoading(true);
        const formData = new FormData();

        try {
            if (activeTab === 'lab') {
                formData.append('file', file);
                await api.post('/lab/analyze', formData);
                router.push('/app/workspace?mode=lab');
            } else if (activeTab === 'image') {
                formData.append('file', file);
                await api.post(`/predict/${imageType}`, formData);
                router.push(`/app/workspace?mode=image&type=${imageType}`);
            }
        } catch (error) {
            setVoiceError('Upload failed. Please try again.');
            setTimeout(() => setVoiceError(null), 5000);
            console.error('Upload failed:', error);
        } finally {
            setIsLoading(false);
            e.target.value = '';
        }
    };

    const handleVoiceInput = () => {
        setVoiceError(null);
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setVoiceError('Voice input is not supported in this browser. Please try Chrome or Edge.');
            setTimeout(() => setVoiceError(null), 5000);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            setIsListening(false);
            setVoiceError(`Voice error: ${event.error || 'Unknown error'}`);
            setTimeout(() => setVoiceError(null), 5000);
        };
        recognition.onresult = (event: any) => {
            if (event.results && event.results[0]) {
                const transcript = event.results[0][0].transcript;
                setQuery(prev => prev + (prev ? ' ' : '') + transcript);
            }
        };

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
        }
    };

    const tabs = [
        { id: 'symptom' as const, label: 'hero.pills.symptom', icon: Stethoscope },
        { id: 'lab' as const, label: 'hero.pills.lab', icon: FileText },
        { id: 'med' as const, label: 'hero.pills.medication', icon: Pill },
        { id: 'image' as const, label: 'hero.imageAnalysis', icon: ImageIcon },
    ];

    const placeholders: Record<string, string> = {
        symptom: 'hero.placeholders.symptom',
        lab: 'hero.placeholders.lab',
        med: 'hero.placeholders.med',
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
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: demoCount >= 3 ? '#EF4444' : '#22C55E', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                        {!isAuthenticated && demoCount > 0 ? `Free AI Demo (${demoCount}/3 used)` : t('hero.activeStatus')}
                    </span>
                </div>

                {/* Heading — Fixed text */}
                <h1 style={{
                    fontSize: 52, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 24, lineHeight: 1.15,
                    color: '#0F172A',
                }}>
                    {t('hero.titlePrefix')}{' '}
                    <span className="gradient-text">{t('hero.titleGradient')}</span>
                </h1>

                <p style={{ fontSize: 18, color: '#64748B', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>
                    {t('hero.subtitle')}
                </p>

                {/* Error notification */}
                {voiceError && (
                    <div style={{
                        background: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B',
                        padding: '12px 16px', borderRadius: 12, marginBottom: 24, fontSize: 14,
                        maxWidth: 560, margin: '0 auto 24px'
                    }}>
                        ⚠️ {voiceError}
                    </div>
                )}

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
                                    <Icon size={16} /> {t(tab.label)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Input Area */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px' }}>
                        <Search size={20} color={isFocused ? '#0EA5A4' : '#94A3B8'} style={{ flexShrink: 0 }} />

                        {(activeTab as string) === 'image' ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    flex: 1, padding: '12px 0', color: '#64748B', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 10, fontSize: 15,
                                }}
                            >
                                <Upload size={18} />
                                <span>{t('hero.clickToUploadImage')}</span>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    onChange={handleFileUpload}
                                    accept={activeTab === 'lab' ? '.csv' : 'image/*'}
                                />

                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <select
                                        value={imageType}
                                        onChange={(e) => setImageType(e.target.value as any)}
                                        style={{
                                            padding: '4px 8px', borderRadius: 8, border: '1px solid #E2E8F0',
                                            fontSize: 12, background: '#F8FAFC', outline: 'none'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="xray">X-Ray</option>
                                        <option value="mri">MRI</option>
                                        <option value="skin">Skin</option>
                                        <option value="food">Food</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                placeholder={t(placeholders[activeTab])}
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
                                    disabled={isLoading}
                                    style={{
                                        width: 46, height: 46, borderRadius: 16, flexShrink: 0,
                                        background: query.trim() && !isLoading
                                            ? 'linear-gradient(135deg, #0EA5A4, #4F46E5)'
                                            : '#E2E8F0',
                                        border: 'none',
                                        cursor: query.trim() && !isLoading ? 'pointer' : 'default',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white',
                                        boxShadow: query.trim() && !isLoading ? '0 4px 12px rgba(14,165,164,0.3)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        activeTab === 'lab' ? <Upload size={20} /> : <Send size={20} />
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </section>
    );
}
