'use client';

import { useState, useRef, useEffect } from 'react';
import { Phone, AlertTriangle, Send, Mic, Bot, User, Search } from 'lucide-react';

const emojis = [
    { emoji: '😢', label: 'Very Low', value: 1, color: '#EF4444' },
    { emoji: '😞', label: 'Low', value: 2, color: '#F97316' },
    { emoji: '😐', label: 'Okay', value: 3, color: '#EAB308' },
    { emoji: '🙂', label: 'Good', value: 4, color: '#22C55E' },
    { emoji: '😄', label: 'Great', value: 5, color: '#10B981' },
];

const resources = [
    { title: 'Guided Meditation', desc: '10-minute sessions to reduce stress.', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80' },
    { title: 'Sleep Stories', desc: 'Calming narratives to help you drift off.', img: 'https://images.unsplash.com/photo-1541781777631-fa95375dd068?auto=format&fit=crop&w=400&q=80' },
    { title: 'CBT Exercises', desc: 'Tools to manage anxiety and negative thoughts.', img: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&w=400&q=80' },
];

export default function MentalHealthPage() {
    const [moodValue, setMoodValue] = useState(3);
    const [searchQuery, setSearchQuery] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: "Hello! I'm your mental wellness companion. How can I help you today? You can ask about coping strategies, mindfulness, anxiety, or anything mental health related." }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

    const handleChatSend = () => {
        if (!chatInput.trim()) return;
        const userMsg = chatInput.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setIsTyping(true);

        setTimeout(() => {
            let response = '';
            const lower = userMsg.toLowerCase();
            if (lower.includes('anxious') || lower.includes('anxiety')) {
                response = "I hear you. Anxiety can feel overwhelming, but there are effective strategies:\n\n**Immediate Relief:**\n• Try the 4-7-8 breathing technique: Inhale 4s, hold 7s, exhale 8s\n• Ground yourself: Name 5 things you see, 4 you touch, 3 you hear\n\n**Long-term:**\n• Regular exercise (even 20-min walks)\n• Limit caffeine and screen time\n• Consider talking to a professional\n\nWould you like me to guide you through a breathing exercise?";
            } else if (lower.includes('sleep') || lower.includes('insomnia')) {
                response = "Sleep difficulties can really impact your well-being. Here are some evidence-based tips:\n\n• **Set a consistent sleep schedule** — same time every day\n• **Create a wind-down routine** — dim lights 1h before bed\n• **Avoid screens** 30 min before sleep\n• **Keep your room cool** (18-20°C is optimal)\n• **Try progressive muscle relaxation** before bed\n\nShall I start a Sleep Story to help you relax?";
            } else if (lower.includes('stress') || lower.includes('overwhelm')) {
                response = "Stress management is crucial for your health. Let me suggest a few approaches:\n\n**Quick Stress Busters:**\n• Take 5 deep breaths right now\n• Step outside for a short walk\n• Write down 3 things you're grateful for\n\n**Ongoing Strategies:**\n• Break tasks into smaller pieces\n• Set boundaries — it's okay to say no\n• Schedule 'me time' daily, even 10 minutes\n\nYour current mood suggests you might benefit from a guided meditation. Want to try one?";
            } else {
                response = `Thank you for sharing. Your feelings are valid and important.\n\nBased on your current mood level (${emojis[moodValue - 1].label}), I'd recommend:\n• Taking a moment for mindful breathing\n• Engaging in an activity you enjoy\n• Reaching out to someone you trust\n\nIs there anything specific you'd like guidance on? I'm here to help.`;
            }

            setMessages(prev => [...prev, { role: 'ai', text: response }]);
            setIsTyping(false);
        }, 1200);
    };

    const currentEmoji = emojis[moodValue - 1];

    return (
        <div style={{ padding: '24px 32px', overflowY: 'auto', maxHeight: '100vh' }}>

            {/* Crisis Alert */}
            <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16, padding: 18,
                marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14,
            }}>
                <div style={{ minWidth: 40, height: 40, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                    <AlertTriangle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, color: '#991B1B', fontWeight: 600 }}>In crisis? </span>
                    <span style={{ fontSize: 14, color: '#B91C1C' }}>You're not alone. Reach out for immediate help.</span>
                </div>
                <button style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                    background: '#DC2626', color: 'white', borderRadius: 99, border: 'none',
                    fontWeight: 600, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap',
                }}>
                    <Phone size={14} /> Call 112
                </button>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 28 }}>Mental Wellness</h1>

            {/* Mood Selector (Emoji Slider) */}
            <div style={{
                background: 'white', borderRadius: 20, padding: 28,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 24, textAlign: 'center',
            }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>How are you feeling today?</h2>
                <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Slide to select your current mood</p>

                {/* Big Emoji Display */}
                <div style={{ fontSize: 64, marginBottom: 8, transition: 'all 0.3s' }}>{currentEmoji.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: currentEmoji.color, marginBottom: 20 }}>{currentEmoji.label}</div>

                {/* Slider */}
                <div style={{ maxWidth: 360, margin: '0 auto', position: 'relative' }}>
                    <input
                        type="range" min={1} max={5} step={1}
                        value={moodValue}
                        onChange={e => setMoodValue(parseInt(e.target.value))}
                        style={{
                            width: '100%', height: 8,
                            appearance: 'none', WebkitAppearance: 'none',
                            background: `linear-gradient(90deg, #EF4444, #EAB308, #10B981)`,
                            borderRadius: 99, outline: 'none', cursor: 'pointer',
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                        {emojis.map(e => (
                            <span key={e.value} style={{ fontSize: 20, opacity: moodValue === e.value ? 1 : 0.4, cursor: 'pointer', transition: '0.2s' }}
                                onClick={() => setMoodValue(e.value)}>
                                {e.emoji}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: 24, position: 'relative' }}>
                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: 16, top: 14 }} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search mental health topics, exercises, resources..."
                    style={{
                        width: '100%', padding: '12px 16px 12px 44px', borderRadius: 99,
                        border: '1px solid #E2E8F0', fontSize: 14, outline: 'none',
                        background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                    }}
                />
            </div>

            {/* Resources (filtered) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
                {resources.filter(r => !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                    <div key={r.title} style={{
                        background: 'white', borderRadius: 16, overflow: 'hidden',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'transform 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ height: 120 }}>
                            <img src={r.img} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: 16 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>{r.title}</h3>
                            <p style={{ fontSize: 13, color: '#64748B' }}>{r.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chatbot Interface */}
            <div style={{
                background: 'white', borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9',
            }}>
                <div style={{
                    padding: '14px 20px', borderBottom: '1px solid #F1F5F9',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'linear-gradient(135deg, #F0FDFA, #EEF2FF)',
                }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0EA5A4, #6366F1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Bot size={16} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>Wellness Companion</div>
                        <div style={{ fontSize: 11, color: '#22C55E' }}>● Online</div>
                    </div>
                </div>

                {/* Messages */}
                <div style={{ height: 320, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                background: msg.role === 'ai' ? 'linear-gradient(135deg, #0EA5A4, #6366F1)' : '#E2E8F0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {msg.role === 'ai' ? <Bot size={14} color="white" /> : <User size={14} color="#64748B" />}
                            </div>
                            <div style={{
                                maxWidth: '75%', padding: '10px 14px', borderRadius: 14,
                                borderTopLeftRadius: msg.role === 'ai' ? 4 : 14,
                                borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
                                background: msg.role === 'user' ? 'linear-gradient(135deg, #0EA5A4, #4F46E5)' : '#F8FAFC',
                                color: msg.role === 'user' ? 'white' : '#1E293B',
                                fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #0EA5A4, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={14} color="white" />
                            </div>
                            <div style={{ padding: '10px 14px', borderRadius: 14, borderTopLeftRadius: 4, background: '#F8FAFC', display: 'flex', gap: 4 }}>
                                {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1', animation: `typingBounce 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                        placeholder="Ask about coping strategies, mindfulness..."
                        style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }}
                    />
                    <button onClick={handleChatSend} style={{
                        width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: chatInput.trim() ? 'linear-gradient(135deg, #0EA5A4, #4F46E5)' : '#E2E8F0',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
