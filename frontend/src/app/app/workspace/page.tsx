'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import ChatHistory from '@/components/ChatHistory';
import LiveInsightsPanel from '@/components/LiveInsightsPanel';
import {
    Send, Plus, Mic, MicOff, Bot, User, Stethoscope, FileText, Pill,
    PanelRightOpen, PanelRightClose, Image as ImageIcon, Upload, X, Loader2
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
    const { t } = useTranslation();
    const {
        chatSessions, activeChatId, chatMode, setChatMode, addMessage, userProfile,
        insights, setInsights, triggerEmergency, rightPanelOpen, toggleRightPanel
    } = useAppStore();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
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
            if (modeParam === 'image') setChatMode('symptom');
        }
    }, [modeParam]);

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

        try {
            const token = useAppStore.getState().accessToken;
            // Map frontend chatMode to backend mode
            const backendMode = chatMode === 'symptom' ? 'health' : chatMode === 'lab' ? 'health' : chatMode === 'medication' ? 'health' : 'health';

            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    message: text,
                    mode: backendMode,
                    language: useAppStore.getState().language || 'en',
                }),
            });

            const json = await res.json();

            if (res.ok && json.data?.response) {
                const aiResponse = json.data.response;
                const confidence = json.data.confidence || 0;
                const riskFlags = json.data.risk_flags || [];

                if (activeChatId) {
                    addMessage(activeChatId, {
                        id: (Date.now() + 1).toString(),
                        role: 'ai',
                        content: aiResponse,
                        timestamp: new Date(),
                    });
                    setInsights({
                        aiConfidence: Math.round(confidence * 100),
                        redFlags: riskFlags,
                    });
                }

                // Check for emergency flags
                if (riskFlags.some((f: string) => f.toLowerCase().includes('emergency') || f.toLowerCase().includes('crisis'))) {
                    triggerEmergency();
                }
            } else {
                // API returned an error
                if (activeChatId) {
                    addMessage(activeChatId, {
                        id: (Date.now() + 1).toString(),
                        role: 'ai',
                        content: `⚠️ ${json.message || json.error || 'Sorry, I encountered an error processing your request. Please try again.'}`,
                        timestamp: new Date(),
                    });
                }
            }
        } catch {
            // Backend unreachable — use fallback response
            if (activeChatId) {
                addMessage(activeChatId, {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    content: 'I\'m currently unable to reach the health analysis server. Please make sure the backend is running at http://localhost:8000 and try again.',
                    timestamp: new Date(),
                });
            }
        }

        setIsTyping(false);
    };

    const handleSend = () => {
        if (!input.trim() && !uploadedImage) return;
        if (!activeChatId) return;

        const content = uploadedImage
            ? `📷 [Image uploaded: ${uploadedFileName}]\n${input.trim() || 'Please analyze this medical image.'}`
            : input.trim();

        addMessage(activeChatId, {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        });

        setInput('');
        setUploadedImage(null);
        setUploadedFileName(null);

        const userInput = content.toLowerCase();

        // Symptom Wizard Logic
        if (chatMode === 'symptom') {
            const currentStep = useAppStore.getState().symptomWizardStep;

            if (currentStep === 0 && (userInput.includes('hi') || userInput.includes('hello'))) {
                setIsTyping(true);
                setTimeout(() => {
                    addMessage(activeChatId, {
                        id: Date.now().toString(),
                        role: 'ai',
                        content: "Hello! I'm here to help. Could you tell me what main symptom you are experiencing today?",
                        timestamp: new Date(),
                    });
                    useAppStore.setState({ symptomWizardStep: 1 });
                    setIsTyping(false);
                }, 800);
                return;
            }

            if (currentStep === 1) {
                useAppStore.getState().addSymptom(input);
                processWizardStep(2, "Got it. How long have you been experiencing this? (e.g., 2 days, 1 week)");
                return;
            }
            if (currentStep === 2) {
                useAppStore.getState().setSymptomDuration(input);
                processWizardStep(3, "Understood. On a scale of 1-10, how severe is the pain or discomfort?");
                return;
            }
            if (currentStep === 3) {
                const severity = parseInt(input.match(/\d+/)?.[0] || '5');
                useAppStore.getState().setSymptomSeverity(severity);
                processWizardStep(4, "Noted. Are you experiencing any other symptoms like fever, nausea, or dizziness?");
                return;
            }
            if (currentStep === 4) {
                useAppStore.setState({ symptomWizardStep: 0 });
                processAIResponse(userInput);
                return;
            }
        }

        processAIResponse(userInput);
    };

    const processWizardStep = (nextStep: number, question: string) => {
        setIsTyping(true);
        setTimeout(() => {
            useAppStore.setState({ symptomWizardStep: nextStep });
            if (activeChatId) {
                addMessage(activeChatId, {
                    id: Date.now().toString(),
                    role: 'ai',
                    content: question,
                    timestamp: new Date(),
                });
            }
            setIsTyping(false);
        }, 800);
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
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
        };
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    const handleImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
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
    ];

    const placeholders: Record<string, string> = {
        symptom: 'Describe your symptoms here...',
        lab: 'Paste lab report values or describe your results...',
        medication: 'Enter medication name to check interactions...',
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

                        {/* Toggle Right Panel */}
                        <button onClick={toggleRightPanel} style={{
                            padding: 7, background: rightPanelOpen ? '#F1F5F9' : 'transparent',
                            borderRadius: 8, border: 'none', cursor: 'pointer', color: '#64748B',
                        }}>
                            {rightPanelOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div style={{
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

                {/* Image Preview */}
                {uploadedImage && (
                    <div style={{
                        padding: '10px 20px', background: '#F0FDFA',
                        borderTop: '1px solid #CCFBF1',
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 10, overflow: 'hidden',
                            border: '2px solid #0EA5A4', flexShrink: 0,
                        }}>
                            <img src={uploadedImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, fontSize: 13, color: '#0F766E' }}>
                            📎 {uploadedFileName}
                        </div>
                        <button
                            onClick={() => { setUploadedImage(null); setUploadedFileName(null); }}
                            style={{
                                padding: 6, borderRadius: 8, border: 'none',
                                background: 'white', cursor: 'pointer', color: '#94A3B8',
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Input Area */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', background: 'white' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#F8FAFC', padding: '6px 6px 6px 14px', borderRadius: 16,
                        border: '1px solid #E2E8F0',
                    }}>
                        {/* Attachment */}
                        <button
                            onClick={handleImageUpload}
                            style={{
                                padding: 7, borderRadius: 8, border: 'none',
                                background: 'white', cursor: 'pointer', color: '#64748B',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Plus size={16} />
                        </button>

                        {/* Text Input */}
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder={placeholders[chatMode] || 'Type your message...'}
                            style={{
                                flex: 1, border: 'none', background: 'transparent',
                                fontSize: 14, outline: 'none', color: '#1E293B',
                            }}
                        />

                        {/* Voice Input */}
                        <button
                            onClick={handleVoiceInput}
                            style={{
                                padding: 7, borderRadius: 8, border: 'none',
                                background: isListening ? '#FEE2E2' : 'transparent',
                                cursor: 'pointer',
                                color: isListening ? '#EF4444' : '#64748B',
                                animation: isListening ? 'pulse 1.5s infinite' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>

                        {/* Send Button */}
                        <button onClick={handleSend} style={{
                            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                            background: (input.trim() || uploadedImage)
                                ? 'linear-gradient(135deg, #0EA5A4, #4F46E5)'
                                : '#E2E8F0',
                            border: 'none',
                            cursor: (input.trim() || uploadedImage) ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', transition: 'all 0.2s',
                            boxShadow: (input.trim() || uploadedImage) ? '0 4px 12px rgba(14,165,164,0.25)' : 'none',
                        }}>
                            <Send size={16} />
                        </button>
                    </div>
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
