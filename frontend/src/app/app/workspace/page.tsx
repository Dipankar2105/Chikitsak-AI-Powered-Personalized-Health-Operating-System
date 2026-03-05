'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import api, { getErrorMessage } from '@/lib/api';
import ChatHistory from '@/components/ChatHistory';
import LiveInsightsPanel from '@/components/LiveInsightsPanel';
import { ChatResponse, ImageAnalysisResponse } from '@/types/api';
import {
    Send, Plus, Mic, MicOff, Bot, MessageCircle, Stethoscope, FileText, Pill,
    PanelRightOpen, PanelRightClose, Image as ImageIcon, X, Loader2, Heart
} from 'lucide-react';

/* ── Typing indicator ── */
function TypingIndicator() {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #0EA5A4, #6366F1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Bot size={16} color="white" />
            </div>
            <div style={{
                padding: '14px 18px', borderRadius: 18, borderTopLeftRadius: 4,
                background: 'white', border: '1px solid #F1F5F9',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex', gap: 5, alignItems: 'center',
            }}>
                {[0, 1, 2].map(i => (
                    <span key={i} style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#CBD5E1',
                        animation: `typingBounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                ))}
            </div>
        </div>
    );
}

/* ── Main Workspace ── */
function WorkspaceContent() {
    const {
        chatSessions, activeChatId, chatMode, setChatMode, addMessage, userProfile,
        setInsights, triggerEmergency, rightPanelOpen, toggleRightPanel
    } = useAppStore();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [attachedLab, setAttachedLab] = useState<boolean>(false);
    const [attachedWearable, setAttachedWearable] = useState<boolean>(false);
    const [imageAnalysisType, setImageAnalysisType] = useState<'xray' | 'mri' | 'skin'>('xray');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeChat = chatSessions.find(c => c.id === activeChatId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [activeChat?.messages, isTyping]);

    const router = useRouter();
    const searchParams = useSearchParams();
    const queryParam = searchParams.get('q');
    const modeParam = searchParams.get('mode');
    const processedRef = useRef(false);

    useEffect(() => {
        if (modeParam && !processedRef.current) {
            if (modeParam === 'lab') setChatMode('lab' as any);
            if (modeParam === 'medication') setChatMode('medication' as any);
            if (modeParam === 'image') setChatMode('image');
        }
    }, [modeParam]);

    const normalizeTriageLevel = (triage: string | null | undefined): 'self-care' | 'primary' | 'urgent' | 'emergency' => {
        const value = (triage || '').toLowerCase();
        if (value.includes('emergency') || value.includes('critical') || value.includes('high')) return 'emergency';
        if (value.includes('urgent') || value.includes('moderate')) return 'urgent';
        if (value.includes('primary') || value.includes('consult')) return 'primary';
        return 'self-care';
    };

    useEffect(() => {
        if (queryParam && !processedRef.current) {
            processedRef.current = true;
            if (activeChatId) {
                setTimeout(() => {
                    addMessage(activeChatId, {
                        id: Date.now().toString(),
                        role: 'user',
                        content: queryParam,
                        timestamp: new Date(),
                    });
                    processAIResponse(queryParam);
                    router.replace('/app/workspace');
                }, 500);
            }
        }
    }, [queryParam, activeChatId]);

    const processAIResponse = async (text: string) => {
        setIsTyping(true);
        setChatError(null);

        try {
            const backendMode = chatMode === 'mental' ? 'mental' : 'health';
            const lang = useAppStore.getState().language || 'en';
            const response = await api.post<ChatResponse>('/chat', {
                message: text,
                mode: backendMode,
                language: lang,
                session_id: activeChatId || undefined,
            });

            const apiData = response.data as ChatResponse;
            const payload = apiData?.data;

            if (apiData?.status === 'success' && payload) {
                const aiResponse = payload.response || apiData?.message || 'Analysis complete.';
                const confidence = Number(payload.confidence || 0);
                const riskFlags = Array.isArray(payload.risk_flags) ? payload.risk_flags : [];
                const triageLevel = normalizeTriageLevel(payload.triage);
                const nextSteps = Array.isArray(payload.next_steps) ? payload.next_steps : [];
                const causesRaw = Array.isArray(payload.causes) ? payload.causes : [];
                const causes = causesRaw.map((c) => ({
                    name: c?.name || 'Unspecified',
                    probability: Number(c?.probability ?? 0),
                    confidence: Number(c?.confidence ?? Math.round(confidence * 100)),
                    risk: (c?.risk === 'high' || c?.risk === 'medium' || c?.risk === 'low') ? c.risk : 'medium',
                }));

                if (activeChatId) {
                    addMessage(activeChatId, {
                        id: (Date.now() + 1).toString(),
                        role: 'ai',
                        content: aiResponse,
                        timestamp: new Date(),
                    });

                    const insightUpdate = {
                        aiConfidence: Math.round(confidence * 100),
                        redFlags: riskFlags,
                        triageLevel,
                        ...(causes.length > 0 && { causes }),
                        ...(nextSteps.length > 0 && { nextSteps }),
                    };
                    setInsights(insightUpdate);
                }

                if (riskFlags.some((f: string) => f.toLowerCase().includes('emergency') || f.toLowerCase().includes('crisis'))) {
                    triggerEmergency();
                }
            } else {
                const message = payload?.message || apiData?.message || 'Sorry, I encountered an error processing your request.';
                if (activeChatId) {
                    addMessage(activeChatId, {
                        id: (Date.now() + 1).toString(),
                        role: 'ai',
                        content: `⚠️ ${message}`,
                        timestamp: new Date(),
                    });
                }
                setChatError(message);
            }
        } catch (err) {
            const message = getErrorMessage(err);
            if (activeChatId) {
                addMessage(activeChatId, {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    content: `⚠️ ${message}`,
                    timestamp: new Date(),
                });
            }
            setChatError(message);
        }

        setIsTyping(false);
    };
    const handleSend = () => {
        if (!input.trim() && !(chatMode === 'image' && uploadedImage)) return;
        if (!activeChatId) return;

        if (chatMode === 'image') {
            if (!uploadedImage) {
                setChatError('Please upload an image for analysis.');
                return;
            }
            addMessage(activeChatId, {
                id: Date.now().toString(),
                role: 'user',
                content: `[Image uploaded: ${uploadedFileName || 'image'}]`,
                timestamp: new Date(),
            });
            setInput('');
            handleImageAnalysis();
            return;
        }

        const content = input.trim();
        addMessage(activeChatId, {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        });

        setInput('');
        setAttachedLab(false);
        setAttachedWearable(false);
        processAIResponse(content);
    };

    const handleImageAnalysis = async () => {
        if (!uploadedImage || !activeChatId) return;

        setIsTyping(true);
        setChatError(null);
        try {
            const endpointByType: Record<'xray' | 'mri' | 'skin', string> = {
                xray: '/predict/xray',
                mri: '/predict/mri',
                skin: '/predict/skin',
            };
            const endpoint = endpointByType[imageAnalysisType];

            const res = await fetch(uploadedImage);
            const blob = await res.blob();
            const file = new File([blob], uploadedFileName || 'upload.png', { type: blob.type || 'image/png' });
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post<ImageAnalysisResponse>(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const apiData = response.data as ImageAnalysisResponse;
            const payload = apiData?.data;

            if (apiData.status === 'success' && payload) {
                const confidence = Number(payload.confidence ?? apiData?.message ? 0 : 0.8);
                const triageLevel = normalizeTriageLevel(payload.risk_level);
                addMessage(activeChatId, {
                    id: Date.now().toString(),
                    role: 'ai',
                    content: `Analysis Result:\n\nType: ${imageAnalysisType.toUpperCase()}\nPrediction: ${payload.prediction || payload.result || 'N/A'}\nRisk: ${payload.risk_level || 'N/A'}\nRecommendation: ${payload.recommendation || 'N/A'}\nConfidence: ${Math.round(confidence * 100)}%`,
                    timestamp: new Date(),
                });
                setInsights({
                    aiConfidence: Math.round(confidence * 100),
                    triageLevel,
                    causes: [
                        {
                            name: payload.prediction || 'Image finding',
                            probability: Math.round(confidence * 100),
                            confidence: Math.round(confidence * 100),
                            risk: triageLevel === 'emergency' || triageLevel === 'urgent' ? 'high' : 'medium',
                        },
                    ],
                    nextSteps: payload.recommendation ? [payload.recommendation] : [],
                });
            } else {
                const message = apiData?.message || 'Image analysis failed.';
                addMessage(activeChatId, {
                    id: Date.now().toString(),
                    role: 'ai',
                    content: `⚠️ ${message}`,
                    timestamp: new Date(),
                });
                setChatError(message);
            }
        } catch (err) {
            const message = getErrorMessage(err);
            addMessage(activeChatId, {
                id: Date.now().toString(),
                role: 'ai',
                content: `⚠️ Image analysis failed: ${message}`,
                timestamp: new Date(),
            });
            setChatError(message);
        }

        setIsTyping(false);
        setUploadedImage(null);
        setUploadedFileName(null);
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
                setInput(prev => prev + (prev ? ' ' : '') + transcript);
            }
        };
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    const validateImageFile = (file: File): string | null => {
        const maxSize = 5 * 1024 * 1024; // 5MB max
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/dicom'];

        if (file.size > maxSize) {
            return 'Image is too large. Maximum size is 5 MB.';
        }

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|tiff|dcm)$/i)) {
            return 'Please upload a valid image (JPG, PNG, WebP, TIFF, or DICOM).';
        }

        return null;
    };

    const handleImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateImageFile(file);
        if (validationError) {
            setVoiceError(validationError);
            setTimeout(() => setVoiceError(null), 5000);
            e.target.value = '';
            return;
        }

        setUploadedFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setUploadedImage(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const modes = [
        { key: 'symptom' as const, label: 'Symptom', icon: Stethoscope },
        { key: 'lab' as const, label: 'Lab Report', icon: FileText },
        { key: 'medication' as const, label: 'Medication', icon: Pill },
        { key: 'mental' as const, label: 'Mental Health', icon: MessageCircle },
        { key: 'image' as const, label: 'Image Analysis', icon: ImageIcon },
    ];

    const placeholders: Record<string, string> = {
        symptom: 'Describe your symptoms here...',
        lab: 'Paste lab report values or describe your results...',
        medication: 'Enter medication name to check interactions...',
        mental: 'Share how you are feeling...',
        image: 'Upload an image, choose X-Ray/MRI/Skin, then send.',
    };

    const userName = userProfile?.name || 'User';

    return (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Hidden file input for image upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {/* Left: Chat History */}
            <ChatHistory />

            {/* Center: Chat Conversation */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Chat Header */}
                <div style={{
                    height: 60, borderBottom: '1px solid #F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 20px', background: 'white', flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0EA5A4, #6366F1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Bot size={14} color="white" />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>
                            {activeChat?.title || 'AI Workspace'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Mode Tabs */}
                        <div style={{
                            display: 'flex', borderRadius: 10, overflow: 'hidden',
                            border: '1px solid #E2E8F0',
                        }}>
                            {modes.map((mode, i) => (
                                <button key={mode.key} onClick={() => setChatMode(mode.key)} style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '6px 12px', border: 'none', cursor: 'pointer',
                                    background: chatMode === mode.key ? '#F0FDFA' : 'white',
                                    color: chatMode === mode.key ? '#0EA5A4' : '#64748B',
                                    fontWeight: chatMode === mode.key ? 600 : 500, fontSize: 12,
                                    borderLeft: i > 0 ? '1px solid #E2E8F0' : 'none',
                                    transition: 'all 0.15s',
                                }}>
                                    <mode.icon size={14} /> {mode.label}
                                </button>
                            ))}
                        </div>

                        {/* Image Upload Button */}
                        {chatMode === 'image' && (
                            <button
                                onClick={handleImageUpload}
                                title="Upload medical image"
                                style={{
                                    padding: '6px 10px', borderRadius: 8,
                                    border: '1px solid #E2E8F0', cursor: 'pointer',
                                    background: uploadedImage ? '#F0FDFA' : 'white',
                                    color: uploadedImage ? '#0EA5A4' : '#64748B',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    fontSize: 12, fontWeight: 500,
                                }}
                            >
                                <ImageIcon size={14} /> Image
                            </button>
                        )}

                        {/* Toggle Right Panel */}
                        <button onClick={toggleRightPanel} style={{
                            padding: 7, background: rightPanelOpen ? '#F1F5F9' : 'transparent',
                            borderRadius: 8, border: 'none', cursor: 'pointer', color: '#64748B',
                        }}>
                            {rightPanelOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
                        </button>
                    </div>
                </div>

                {chatMode === 'image' && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        borderBottom: '1px solid #F1F5F9',
                        background: '#FFFFFF',
                    }}>
                        {(['xray', 'mri', 'skin'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setImageAnalysisType(type)}
                                style={{
                                    padding: '6px 10px',
                                    borderRadius: 8,
                                    border: '1px solid #E2E8F0',
                                    cursor: 'pointer',
                                    background: imageAnalysisType === type ? '#F0FDFA' : '#FFFFFF',
                                    color: imageAnalysisType === type ? '#0EA5A4' : '#64748B',
                                    fontSize: 12,
                                    fontWeight: 600,
                                }}
                            >
                                {type === 'xray' ? 'X-Ray' : type === 'mri' ? 'MRI' : 'Skin'}
                            </button>
                        ))}
                    </div>
                )}

                {/* Messages */}
                <div
                    role="log"
                    aria-label="Chat messages"
                    aria-live="polite"
                    aria-atomic="false"
                    style={{
                        flex: 1, overflowY: 'auto', padding: '24px 20px',
                        display: 'flex', flexDirection: 'column', gap: 16,
                        background: '#FAFBFC',
                    }}>
                    {activeChat?.messages.map((msg) => (
                        <div key={msg.id} style={{
                            display: 'flex',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            alignItems: 'flex-start', gap: 10,
                        }}>
                            {/* Avatar */}
                            {msg.role === 'ai' ? (
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg, #0EA5A4, #6366F1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Bot size={16} color="white" />
                                </div>
                            ) : (
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                    overflow: 'hidden', border: '2px solid #E2E8F0',
                                }}>
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${userName}&background=0EA5A4&color=fff&bold=true&size=32`}
                                        alt="You"
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </div>
                            )}

                            {/* Bubble */}
                            <div style={{
                                maxWidth: '75%', padding: '12px 16px',
                                borderRadius: 16,
                                borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                                borderTopLeftRadius: msg.role === 'ai' ? 4 : 16,
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg, #0EA5A4, #4F46E5)'
                                    : 'white',
                                color: msg.role === 'user' ? 'white' : '#1E293B',
                                boxShadow: msg.role === 'ai'
                                    ? '0 1px 3px rgba(0,0,0,0.06)'
                                    : '0 4px 12px rgba(14, 165, 164, 0.2)',
                                border: msg.role === 'ai' ? '1px solid #F1F5F9' : 'none',
                                fontSize: 14, lineHeight: 1.6,
                            }}>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                <div style={{
                                    fontSize: 10, marginTop: 6,
                                    color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : '#94A3B8',
                                    textAlign: msg.role === 'user' ? 'right' : 'left',
                                }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && <TypingIndicator />}

                    <div ref={messagesEndRef} />
                </div>

                {/* Attachments Preview */}
                <div style={{ display: 'flex', gap: 12, padding: (uploadedImage || attachedLab || attachedWearable) ? '10px 20px' : '0 20px', flexWrap: 'wrap' }}>
                    {uploadedImage && (
                        <div style={{
                            padding: '6px 12px 6px 6px', background: '#F0FDFA', borderRadius: 99,
                            border: '1px solid #CCFBF1', display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
                                <img src={uploadedImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <span style={{ fontSize: 13, color: '#0F766E' }}>{uploadedFileName}</span>
                            <button onClick={() => { setUploadedImage(null); setUploadedFileName(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={14} color="#94A3B8" /></button>
                        </div>
                    )}
                    {attachedLab && (
                        <div style={{
                            padding: '6px 12px', background: '#EFF6FF', borderRadius: 99,
                            border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <FileText size={16} color="#2563EB" />
                            <span style={{ fontSize: 13, color: '#1E40AF', fontWeight: 500 }}>Latest Lab Panel</span>
                            <button onClick={() => setAttachedLab(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={14} color="#94A3B8" /></button>
                        </div>
                    )}
                    {attachedWearable && (
                        <div style={{
                            padding: '6px 12px', background: '#FEF2F2', borderRadius: 99,
                            border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <Heart size={16} color="#DC2626" />
                            <span style={{ fontSize: 13, color: '#991B1B', fontWeight: 500 }}>Apple Watch Vitals</span>
                            <button onClick={() => setAttachedWearable(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={14} color="#94A3B8" /></button>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', background: 'white' }}>
                    {voiceError && (
                        <div style={{
                            background: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B',
                            padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 12,
                        }}>
                            ⚠️ {voiceError}
                        </div>
                    )}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#F8FAFC', padding: '6px 6px 6px 14px', borderRadius: 16,
                        border: '1px solid #E2E8F0',
                    }}>
                        {/* Multimodal Attachments */}
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button
                                onClick={handleImageUpload}
                                aria-label="Upload medical image"
                                title="Attach Image"
                                style={{
                                    padding: 7, borderRadius: 8, border: 'none',
                                    background: uploadedImage ? '#F0FDFA' : 'white',
                                    cursor: 'pointer', color: uploadedImage ? '#0EA5A4' : '#64748B',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <ImageIcon size={18} aria-hidden="true" />
                            </button>
                            <button
                                onClick={() => setAttachedLab(!attachedLab)}
                                aria-label="Attach latest lab report"
                                title="Attach Labs"
                                style={{
                                    padding: 7, borderRadius: 8, border: 'none',
                                    background: attachedLab ? '#EFF6FF' : 'white',
                                    cursor: 'pointer', color: attachedLab ? '#2563EB' : '#64748B',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <FileText size={18} aria-hidden="true" />
                            </button>
                            <button
                                onClick={() => setAttachedWearable(!attachedWearable)}
                                aria-label="Sync wearable data"
                                title="Attach Vitals"
                                style={{
                                    padding: 7, borderRadius: 8, border: 'none',
                                    background: attachedWearable ? '#FEF2F2' : 'white',
                                    cursor: 'pointer', color: attachedWearable ? '#DC2626' : '#64748B',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <Heart size={18} aria-hidden="true" />
                            </button>
                        </div>
                        {/* Text Input */}
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder={placeholders[chatMode] || 'Type your message...'}
                            aria-label={`Enter your ${chatMode} query`}
                            style={{
                                flex: 1, border: 'none', background: 'transparent',
                                fontSize: 14, outline: 'none', color: '#1E293B',
                            }}
                        />

                        {/* Voice Input */}
                        <button
                            onClick={handleVoiceInput}
                            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                            aria-pressed={isListening}
                            style={{
                                padding: 7, borderRadius: 8, border: 'none',
                                background: isListening ? '#FEE2E2' : 'transparent',
                                cursor: 'pointer',
                                color: isListening ? '#EF4444' : '#64748B',
                                animation: isListening ? 'pulse 1.5s infinite' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            {isListening ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
                        </button>

                        {/* Send Button */}
                        <button onClick={handleSend}
                            aria-label="Send message"
                            disabled={!input.trim() && !(chatMode === 'image' && uploadedImage)}
                            style={{
                                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                                background: (input.trim() || (chatMode === 'image' && uploadedImage))
                                    ? 'linear-gradient(135deg, #0EA5A4, #4F46E5)'
                                    : '#E2E8F0',
                                border: 'none',
                                cursor: (input.trim() || (chatMode === 'image' && uploadedImage)) ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', transition: 'all 0.2s',
                                boxShadow: (input.trim() || (chatMode === 'image' && uploadedImage)) ? '0 4px 12px rgba(14,165,164,0.25)' : 'none',
                            }}>
                            <Send size={16} aria-hidden="true" />
                        </button>
                    </div>
                    {chatError && (
                        <div style={{ marginTop: 8, fontSize: 12, color: '#DC2626' }}>
                            {chatError}
                        </div>
                    )}
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                        <p style={{ fontSize: 11, color: '#94A3B8' }}>
                            AI can make mistakes. Please verify important medical information.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Live Insights Panel */}
            {rightPanelOpen && (
                <div style={{
                    width: 320, borderLeft: '1px solid #F1F5F9',
                    background: 'white', overflowY: 'auto',
                }}>
                    <LiveInsightsPanel />
                </div>
            )}
        </div>
    );
}

export default function WorkspacePage() {
    return (
        <Suspense fallback={
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#64748B' }}>
                <Loader2 size={20} className="animate-spin" /> Loading Workspace...
            </div>
        }>
            <WorkspaceContent />
        </Suspense>
    );
}


