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
    mode: 'symptom' | 'lab' | 'medication';
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
    setAccessToken: (t: string | null) => void;

    /* User Profile */
    userProfile: UserProfile | null;
    setUserProfile: (p: UserProfile) => void;

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
    chatMode: 'symptom' | 'lab' | 'medication';
    setChatMode: (m: 'symptom' | 'lab' | 'medication') => void;
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

/* ── Demo data ────────────────────────────────── */
const demoSessions: ChatSession[] = [
    {
        id: '1',
        title: 'Headache & Fever',
        mode: 'symptom',
        createdAt: new Date(),
        messages: [
            { id: '1a', role: 'ai', content: 'Hello! I\'m your AI Health Companion. How can I help you today?', timestamp: new Date() },
        ],
    },
];

const defaultInsights: Insights = {
    causes: [
        { name: 'Common Cold', probability: 45, risk: 'low', confidence: 72 },
        { name: 'Seasonal Allergies', probability: 30, risk: 'low', confidence: 55 },
        { name: 'Viral Infection', probability: 25, risk: 'medium', confidence: 48 },
    ],
    triageLevel: 'self-care',
    redFlags: [],
    nextSteps: ['Monitor symptoms', 'Stay hydrated', 'Rest well'],
    aiConfidence: 65,
};

/* ── Store ─────────────────────────────────────── */
export const useAppStore = create<AppState>((set) => ({
    isAuthenticated: false,
    setAuthenticated: (v) => set({ isAuthenticated: v }),

    accessToken: null,
    setAccessToken: (t) => set({ accessToken: t }),

    userProfile: null,
    setUserProfile: (p) => set({ userProfile: p }),

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

    chatSessions: demoSessions,
    activeChatId: '1',
    chatMode: 'symptom',
    setChatMode: (m) => set({ chatMode: m }),
    setActiveChatId: (id) => set({ activeChatId: id }),
    addChatSession: (s) => set((st) => ({ chatSessions: [s, ...st.chatSessions], activeChatId: s.id })),
    addMessage: (chatId, msg) =>
        set((s) => ({
            chatSessions: s.chatSessions.map((c) =>
                c.id === chatId ? { ...c, messages: [...c.messages, msg] } : c
            ),
        })),
    deleteChatSession: (id) =>
        set((s) => ({
            chatSessions: s.chatSessions.filter((c) => c.id !== id),
            activeChatId: s.activeChatId === id ? null : s.activeChatId,
        })),

    insights: defaultInsights,
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
