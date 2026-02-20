'use client';

import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Trash2, MessageSquare } from 'lucide-react';

export default function ChatHistory() {
    const { t } = useTranslation();
    const { chatSessions, activeChatId, setActiveChatId, addChatSession, deleteChatSession } = useAppStore();

    const createNewChat = () => {
        const newSession = {
            id: Date.now().toString(),
            title: 'New Conversation',
            messages: [],
            mode: 'symptom' as const,
            createdAt: new Date(),
        };
        addChatSession(newSession);
    };

    const today = chatSessions.filter(s => {
        const d = new Date(s.createdAt);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    });

    const yesterday = chatSessions.filter(s => {
        const d = new Date(s.createdAt);
        const now = new Date();
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        return d.toDateString() === y.toDateString();
    });

    const older = chatSessions.filter(s => {
        const d = new Date(s.createdAt);
        const now = new Date();
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        return d < y && d.toDateString() !== now.toDateString();
    });

    const renderGroup = (label: string, sessions: typeof chatSessions) => {
        if (sessions.length === 0) return null;
        return (
            <div style={{ marginBottom: 20 }}>
                <div style={{
                    fontSize: 11, fontWeight: 600, color: '#94A3B8',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    padding: '0 12px', marginBottom: 8,
                }}>
                    {label}
                </div>
                {sessions.map(session => (
                    <div
                        key={session.id}
                        onClick={() => setActiveChatId(session.id)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                            background: activeChatId === session.id ? '#F0FDFA' : 'transparent',
                            marginBottom: 2,
                            transition: 'background 0.2s',
                        }}
                    >
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            flex: 1, minWidth: 0,
                        }}>
                            <MessageSquare size={16} color={activeChatId === session.id ? '#0EA5A4' : '#94A3B8'} />
                            <span style={{
                                fontSize: 13,
                                fontWeight: activeChatId === session.id ? 600 : 400,
                                color: activeChatId === session.id ? '#0EA5A4' : '#475569',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                                {session.title}
                            </span>
                        </div>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            deleteChatSession(session.id);
                        }} style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: '#CBD5E1', padding: 4, borderRadius: 6,
                            display: 'flex', alignItems: 'center',
                            opacity: 0.5, transition: 'opacity 0.2s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{
            width: 250, borderRight: '1px solid #F1F5F9',
            background: '#FAFBFC', display: 'flex', flexDirection: 'column',
            flexShrink: 0, overflow: 'hidden',
        }}>
            <div style={{
                padding: '16px 12px', borderBottom: '1px solid #F1F5F9',
            }}>
                <button onClick={createNewChat} style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    padding: '10px', borderRadius: 12,
                    border: '1px dashed #CBD5E1', background: 'white',
                    cursor: 'pointer', color: '#64748B', fontSize: 13, fontWeight: 500,
                    transition: 'all 0.2s',
                }}>
                    <Plus size={16} />
                    {t('chat.newChat')}
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
                {renderGroup(t('chat.today'), today)}
                {renderGroup(t('chat.yesterday'), yesterday)}
                {renderGroup(t('chat.lastWeek'), older)}
            </div>
        </div>
    );
}
