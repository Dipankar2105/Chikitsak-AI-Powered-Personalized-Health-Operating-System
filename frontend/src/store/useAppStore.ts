import { create } from 'zustand';

/* ── Types ────────────────────────────────────── */
export interface UserProfile {
    name: string;
    email: string;
    age: number | string;
    gender: 'male' | 'female' | 'other' | '';
    city: string;
    country: string;
    existingConditions: string[];
    currentMedications: string[];
    planTier: 'free' | 'pro' | 'medical_plus';
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    mode: 'symptom' | 'lab' | 'medication' | 'mental' | 'image';
    createdAt: Date;
}

export interface InsightCause {
    name: string;
    probability: number;
    risk: 'low' | 'medium' | 'high';
    confidence: number;
}

export interface Insights {
    causes: InsightCause[];
    triageLevel: 'self-care' | 'primary' | 'urgent' | 'emergency';
    redFlags: string[];
    nextSteps: string[];
    aiConfidence: number;
}

interface AppState {
    /* Auth */
    isAuthenticated: boolean;
    setAuthenticated: (v: boolean) => void;
    accessToken: string | null;
    refreshToken: string | null;
    setAccessToken: (t: string | null) => void;
    setRefreshToken: (t: string | null) => void;
    clearAuth: () => void;

    /* User Profile */
    userProfile: UserProfile | null;
    setUserProfile: (p: UserProfile) => void;
    planTier: 'free' | 'pro' | 'medical_plus';
    setPlanTier: (t: 'free' | 'pro' | 'medical_plus') => void;
    ruralMode: boolean;
    setRuralMode: (v: boolean) => void;

    /* Disclaimer */
    disclaimerAccepted: boolean;
    showDisclaimer: boolean;
    acceptDisclaimer: () => void;
    setShowDisclaimer: (v: boolean) => void;

    /* Location */
    userLocation: string | null;
    setUserLocation: (l: string) => void;

    /* Sidebar */
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;
    activePage: string;
    toggleSidebar: () => void;
    collapseSidebar: () => void;
    expandSidebar: () => void;
    setActivePage: (p: string) => void;

    /* Language */
    language: string;
    setLanguage: (l: string) => void;

    /* Chat */
    chatSessions: ChatSession[];
    activeChatId: string | null;
    chatMode: 'symptom' | 'lab' | 'medication' | 'mental' | 'image';
    setChatMode: (m: 'symptom' | 'lab' | 'medication' | 'mental' | 'image') => void;
    setActiveChatId: (id: string | null) => void;
    addChatSession: (s: ChatSession) => void;
    addMessage: (chatId: string, msg: ChatMessage) => void;
    deleteChatSession: (id: string) => void;

    /* Insights */
    insights: Insights;
    setInsights: (i: Partial<Insights>) => void;

    /* Emergency */
    emergencyActive: boolean;
    triggerEmergency: () => void;
    dismissEmergency: () => void;

    /* Right Panel */
    rightPanelOpen: boolean;
    toggleRightPanel: () => void;

    /* Symptom Wizard */
    selectedSymptoms: string[];
    addSymptom: (s: string) => void;
    removeSymptom: (s: string) => void;
    clearSymptoms: () => void;
    symptomWizardStep: number;
    setSymptomWizardStep: (n: number) => void;
    levelOfCare: string | null;
    setLevelOfCare: (l: string) => void;
    symptomSeverity: number;
    setSymptomSeverity: (n: number) => void;
    symptomDuration: string | null;
    setSymptomDuration: (d: string) => void;
}

/* ── Helpers ───────────────────────────────────── */
function loadToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('chikitsak-access-token');
}
function loadRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('chikitsak-refresh-token');
}
function loadProfile(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('chikitsak-profile');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}
function loadAuth(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('chikitsak-access-token');
}
function loadChatSessions(): ChatSession[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = sessionStorage.getItem('chikitsak-chat-sessions');
        if (!raw) return [];
        const sessions = JSON.parse(raw) as ChatSession[];
        // Restore Date objects
        return sessions.map(s => ({
            ...s,
            createdAt: new Date(s.createdAt),
            messages: s.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
    } catch { return []; }
}
function saveChatSessions(sessions: ChatSession[]): void {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('chikitsak-chat-sessions', JSON.stringify(sessions));
    }
}

/* ── Default empty insights ───────────────────── */
const emptyInsights: Insights = {
    causes: [],
    triageLevel: 'self-care',
    redFlags: [],
    nextSteps: [],
    aiConfidence: 0,
};

/* ── Initial chat session ─────────────────────── */
const initialSession: ChatSession = {
    id: '1',
    title: 'New Chat',
    mode: 'symptom',
    createdAt: new Date(),
    messages: [
        { id: '1a', role: 'ai', content: 'Hello! I\'m your AI Health Companion. How can I help you today?', timestamp: new Date() },
    ],
};

/* ── Store ─────────────────────────────────────── */
export const useAppStore = create<AppState>((set) => ({
    isAuthenticated: loadAuth(),
    setAuthenticated: (v) => set({ isAuthenticated: v }),

    accessToken: loadToken(),
    refreshToken: loadRefreshToken(),
    setAccessToken: (t) => {
        if (typeof window !== 'undefined') {
            if (t) localStorage.setItem('chikitsak-access-token', t);
            else localStorage.removeItem('chikitsak-access-token');
        }
        set({ accessToken: t });
    },
    setRefreshToken: (t) => {
        if (typeof window !== 'undefined') {
            if (t) localStorage.setItem('chikitsak-refresh-token', t);
            else localStorage.removeItem('chikitsak-refresh-token');
        }
        set({ refreshToken: t });
    },
    clearAuth: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('chikitsak-access-token');
            localStorage.removeItem('chikitsak-refresh-token');
            localStorage.removeItem('chikitsak-profile');
        }
        set({
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            userProfile: null,
        });
    },

    userProfile: loadProfile(),
    setUserProfile: (p) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('chikitsak-profile', JSON.stringify(p));
        }
        set({ userProfile: p, planTier: p.planTier || 'free' });
    },

    planTier: loadProfile()?.planTier || 'free',
    setPlanTier: (t) => set({ planTier: t }),

    ruralMode: typeof window !== 'undefined' ? localStorage.getItem('chikitsak-rural') === 'true' : false,
    setRuralMode: (v) => {
        if (typeof window !== 'undefined') localStorage.setItem('chikitsak-rural', v ? 'true' : 'false');
        set({ ruralMode: v });
    },

    disclaimerAccepted: false,
    showDisclaimer: false,
    acceptDisclaimer: () => set({ disclaimerAccepted: true, showDisclaimer: false }),
    setShowDisclaimer: (v) => set({ showDisclaimer: v }),

    userLocation: null,
    setUserLocation: (l) => set({ userLocation: l }),

    sidebarOpen: true,
    sidebarCollapsed: false,
    activePage: 'dashboard',
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    collapseSidebar: () => set({ sidebarCollapsed: true }),
    expandSidebar: () => set({ sidebarCollapsed: false }),
    setActivePage: (p) => set({ activePage: p }),

    language: typeof window !== 'undefined' ? localStorage.getItem('chikitsak-lang') || 'en' : 'en',
    setLanguage: (l) => {
        if (typeof window !== 'undefined') localStorage.setItem('chikitsak-lang', l);
        set({ language: l });
    },

    chatSessions: loadChatSessions().length > 0 ? loadChatSessions() : [initialSession],
    activeChatId: '1',
    chatMode: 'symptom',
    setChatMode: (m) => set({ chatMode: m }),
    setActiveChatId: (id) => set({ activeChatId: id }),
    addChatSession: (s) => set((st) => {
        const newSessions = [s, ...st.chatSessions];
        saveChatSessions(newSessions);
        return { chatSessions: newSessions, activeChatId: s.id };
    }),
    addMessage: (chatId, msg) =>
        set((s) => {
            const newSessions = s.chatSessions.map((c) =>
                c.id === chatId ? { ...c, messages: [...c.messages, msg] } : c
            );
            saveChatSessions(newSessions);
            return { chatSessions: newSessions };
        }),
    deleteChatSession: (id) =>
        set((s) => {
            const newSessions = s.chatSessions.filter((c) => c.id !== id);
            saveChatSessions(newSessions);
            return {
                chatSessions: newSessions,
                activeChatId: s.activeChatId === id ? null : s.activeChatId,
            };
        }),

    insights: emptyInsights,
    setInsights: (i) => set((s) => ({ insights: { ...s.insights, ...i } })),

    emergencyActive: false,
    triggerEmergency: () => set({ emergencyActive: true }),
    dismissEmergency: () => set({ emergencyActive: false }),

    rightPanelOpen: true,
    toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),

    /* Symptom Wizard */
    selectedSymptoms: [],
    addSymptom: (s) => set((st) => ({
        selectedSymptoms: st.selectedSymptoms.includes(s) ? st.selectedSymptoms : [...st.selectedSymptoms, s],
    })),
    removeSymptom: (s) => set((st) => ({
        selectedSymptoms: st.selectedSymptoms.filter((x) => x !== s),
    })),
    clearSymptoms: () => set({ selectedSymptoms: [], symptomWizardStep: 0, levelOfCare: null, symptomSeverity: 5, symptomDuration: null }),
    symptomWizardStep: 0,
    setSymptomWizardStep: (n) => set({ symptomWizardStep: n }),
    levelOfCare: null,
    setLevelOfCare: (l) => set({ levelOfCare: l }),
    symptomSeverity: 5,
    setSymptomSeverity: (n) => set({ symptomSeverity: n }),
    symptomDuration: null,
    setSymptomDuration: (d) => set({ symptomDuration: d }),
}));
