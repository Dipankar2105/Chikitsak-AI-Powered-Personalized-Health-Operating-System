'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import {
    Search, X, ChevronRight, ChevronLeft, AlertTriangle,
    Activity, Clock, ArrowRight, Bot
} from 'lucide-react';

/* ── Body Region Data ────────────────────────── */
const bodyRegions: Record<string, { label: string; symptoms: string[] }> = {
    head: {
        label: 'Head',
        symptoms: ['Headache', 'Dizziness', 'Hair loss', 'Forehead bumps', 'Vision problems', 'Nausea', 'Ear pain', 'Sinus pain', 'Facial muscle pain', 'Scalp tenderness'],
    },
    chest: {
        label: 'Chest',
        symptoms: ['Chest pain', 'Shortness of breath', 'Heart palpitations', 'Chest tightness', 'Wheezing', 'Cough', 'Rib pain', 'Heartburn'],
    },
    abdomen: {
        label: 'Abdomen',
        symptoms: ['Stomach pain', 'Bloating', 'Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Loss of appetite', 'Acid reflux', 'Cramps'],
    },
    arms: {
        label: 'Arms & Hands',
        symptoms: ['Wrist pain', 'Pain when moving wrist', 'Pain in hand or fingers', 'Pain in one finger', 'Nail pain', 'Elbow pain', 'Shoulder pain', 'Numbness', 'Tingling', 'Swelling'],
    },
    legs: {
        label: 'Legs & Feet',
        symptoms: ['Knee pain', 'Ankle pain', 'Foot pain', 'Leg cramp', 'Swollen legs', 'Hip pain', 'Thigh pain', 'Toe pain', 'Numbness in feet'],
    },
    throat: {
        label: 'Throat & Neck',
        symptoms: ['Sore throat', 'Difficulty swallowing', 'Neck pain', 'Swollen lymph nodes', 'Hoarse voice', 'Neck stiffness', 'Lump in throat'],
    },
    back: {
        label: 'Back',
        symptoms: ['Lower back pain', 'Upper back pain', 'Spine pain', 'Muscle spasm', 'Stiffness', 'Sciatica', 'Pain when bending'],
    },
    skin: {
        label: 'Skin',
        symptoms: ['Rash', 'Itching', 'Dry skin', 'Skin redness', 'Hives', 'Acne', 'Skin discoloration', 'Bruising', 'Wound not healing'],
    },
    general: {
        label: 'General',
        symptoms: ['Fever', 'Fatigue', 'Weight loss', 'Weight gain', 'Night sweats', 'Chills', 'Weakness', 'Insomnia', 'Anxiety', 'Depression'],
    },
};

const allSymptoms = Object.values(bodyRegions).flatMap(r => r.symptoms);
const uniqueSymptoms = [...new Set(allSymptoms)];

const levelOfCareOptions = [
    'Doing nothing',
    'Self-care',
    'Primary care',
    'Specialist care',
    'Allied health care (dietitian/therapist)',
    'Urgent care',
    'Going to Emergency Room',
    'Calling an ambulance',
    'Not sure',
];

/* ── Analysis Data ─────────────────────────────── */
function getAnalysis(symptoms: string[]) {
    const txt = symptoms.join(' ').toLowerCase();
    if (txt.includes('chest pain') || txt.includes('shortness of breath')) {
        return {
            conditions: [
                { name: 'Acute Coronary Syndrome', probability: 35, risk: 'high' as const },
                { name: 'Costochondritis', probability: 25, risk: 'medium' as const },
                { name: 'Anxiety/Panic Attack', probability: 20, risk: 'low' as const },
                { name: 'GERD', probability: 20, risk: 'low' as const },
            ],
            triage: 'urgent' as const,
            confidence: 62,
        };
    }
    if (txt.includes('headache') || txt.includes('fever')) {
        return {
            conditions: [
                { name: 'Viral Infection', probability: 40, risk: 'medium' as const },
                { name: 'Tension Headache', probability: 30, risk: 'low' as const },
                { name: 'Sinusitis', probability: 20, risk: 'low' as const },
                { name: 'Migraine', probability: 10, risk: 'low' as const },
            ],
            triage: 'primary' as const,
            confidence: 72,
        };
    }
    return {
        conditions: [
            { name: 'Common Cold', probability: 35, risk: 'low' as const },
            { name: 'Seasonal Allergies', probability: 25, risk: 'low' as const },
            { name: 'Viral Infection', probability: 25, risk: 'medium' as const },
            { name: 'Stress Response', probability: 15, risk: 'low' as const },
        ],
        triage: 'self-care' as const,
        confidence: 58,
    };
}

/* ── Component ─────────────────────────────────── */
export default function SymptomStartPage() {
    const router = useRouter();
    const { selectedSymptoms, addSymptom, removeSymptom, clearSymptoms } = useAppStore();
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeRegion, setActiveRegion] = useState<string | null>(null);
    const [levelOfCare, setLevelOfCare] = useState<string | null>(null);
    const [severity, setSeverity] = useState(5);
    const [duration, setDuration] = useState<string | null>(null);
    const [contextAnswers, setContextAnswers] = useState<Record<string, boolean>>({});

    const filteredSymptoms = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return uniqueSymptoms.filter(s =>
            s.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !selectedSymptoms.includes(s)
        ).slice(0, 8);
    }, [searchQuery, selectedSymptoms]);

    const analysis = useMemo(() => getAnalysis(selectedSymptoms), [selectedSymptoms]);
    const triageColors = { 'self-care': '#22C55E', primary: '#3B82F6', urgent: '#F59E0B', emergency: '#EF4444' };

    /* Context questions based on symptoms */
    const contextQuestions = useMemo(() => {
        const qs: string[] = [];
        const syms = selectedSymptoms.join(' ').toLowerCase();
        if (syms.includes('headache')) { qs.push('Is it one-sided?', 'Sensitivity to light?', 'Throbbing pain?'); }
        if (syms.includes('fever')) { qs.push('Body temperature above 39°C?', 'Fever present for more than 3 days?'); }
        if (syms.includes('cough')) { qs.push('Is the cough dry?', 'Producing mucus/phlegm?', 'Coughing blood?'); }
        if (syms.includes('chest pain')) { qs.push('Does it radiate to the arm?', 'Does it worsen with breathing?'); }
        if (syms.includes('stomach pain')) { qs.push('Pain after eating?', 'Pain in upper or lower abdomen?'); }
        if (qs.length === 0) { qs.push('Is this your first time experiencing these symptoms?', 'Any recent travel?', 'Any known allergies?'); }
        return qs;
    }, [selectedSymptoms]);

    const progressPct = (step / 4) * 100;

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
            {/* Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Symptoms</span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>Step {step} of 4</span>
            </div>
            <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, marginBottom: 32, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${progressPct}%`, borderRadius: 3,
                    background: 'linear-gradient(90deg, #0EA5A4, #6366F1)',
                    transition: 'width 0.4s ease',
                }} />
            </div>

            {/* ──────── STEP 1: Anatomy + Search ──────── */}
            {step === 1 && (
                <>
                    {step > 1 && (
                        <button onClick={() => setStep(step - 1)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#0EA5A4', fontWeight: 500, fontSize: 14, marginBottom: 16 }}>
                            <ChevronLeft size={16} /> Back
                        </button>
                    )}
                    <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Add your symptoms</h2>

                    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                        {/* Left: Search + Tags */}
                        <div style={{ flex: 1 }}>
                            {/* Search */}
                            <div style={{ position: 'relative', marginBottom: 16 }}>
                                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} />
                                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search, e.g., headache"
                                    style={{
                                        width: '100%', padding: '12px 16px 12px 42px',
                                        border: '1.5px solid #E2E8F0', borderRadius: 14,
                                        fontSize: 14, outline: 'none', background: 'white',
                                    }} />
                                {filteredSymptoms.length > 0 && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                                        background: 'white', borderRadius: 12, border: '1px solid #E2E8F0',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)', marginTop: 4, maxHeight: 240, overflowY: 'auto',
                                    }}>
                                        {filteredSymptoms.map(s => (
                                            <button key={s} onClick={() => { addSymptom(s); setSearchQuery(''); }}
                                                style={{
                                                    display: 'block', width: '100%', padding: '11px 16px',
                                                    border: 'none', background: 'transparent', textAlign: 'left',
                                                    cursor: 'pointer', fontSize: 14, color: '#0F172A',
                                                }}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected tags */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                                {selectedSymptoms.map(s => (
                                    <span key={s} style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '8px 14px', borderRadius: 20,
                                        background: '#0EA5A4', color: 'white',
                                        fontSize: 13, fontWeight: 500,
                                    }}>
                                        {s}
                                        <button onClick={() => removeSymptom(s)} style={{
                                            background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '50%',
                                            width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: 'white', padding: 0,
                                        }}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Region Modal */}
                            {activeRegion && bodyRegions[activeRegion] && (
                                <div style={{
                                    background: 'white', borderRadius: 16, border: '1px solid #E2E8F0',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: 20, marginBottom: 16,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <h3 style={{ fontWeight: 600, fontSize: 16 }}>{bodyRegions[activeRegion].label}</h3>
                                        <button onClick={() => setActiveRegion(null)} style={{
                                            background: 'transparent', border: 'none', cursor: 'pointer',
                                        }}>
                                            <X size={20} color="#64748B" />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 280, overflowY: 'auto' }}>
                                        {bodyRegions[activeRegion].symptoms.map(s => (
                                            <button key={s} onClick={() => { addSymptom(s); }}
                                                disabled={selectedSymptoms.includes(s)}
                                                style={{
                                                    padding: '10px 14px', border: 'none',
                                                    background: selectedSymptoms.includes(s) ? '#F0FDFA' : 'transparent',
                                                    textAlign: 'left', borderRadius: 8, cursor: 'pointer',
                                                    fontSize: 14, color: selectedSymptoms.includes(s) ? '#0EA5A4' : '#0F172A',
                                                    fontWeight: selectedSymptoms.includes(s) ? 500 : 400,
                                                }}>
                                                {s} {selectedSymptoms.includes(s) && '✓'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button onClick={() => setStep(2)} disabled={selectedSymptoms.length === 0}
                                className="btn-gradient"
                                style={{
                                    padding: '14px 32px', fontSize: 15,
                                    opacity: selectedSymptoms.length === 0 ? 0.4 : 1,
                                    cursor: selectedSymptoms.length === 0 ? 'not-allowed' : 'pointer',
                                }}>
                                Next <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Right: Interactive Body */}
                        <div style={{ width: 280, flexShrink: 0, textAlign: 'center' }}>
                            <svg viewBox="0 0 200 420" style={{ width: '100%', maxWidth: 200 }}>
                                {/* Body outline */}
                                <ellipse cx="100" cy="30" rx="22" ry="26" fill="none" stroke="#93C5FD" strokeWidth="1.5"
                                    onClick={() => setActiveRegion('head')} style={{ cursor: 'pointer' }}
                                    opacity={activeRegion === 'head' ? 1 : 0.6} />
                                <rect x="85" y="56" width="30" height="25" rx="8" fill="none" stroke="#93C5FD" strokeWidth="1.5"
                                    onClick={() => setActiveRegion('throat')} style={{ cursor: 'pointer' }}
                                    opacity={activeRegion === 'throat' ? 1 : 0.6} />
                                <rect x="65" y="80" width="70" height="80" rx="12" fill="none" stroke="#93C5FD" strokeWidth="1.5"
                                    onClick={() => setActiveRegion('chest')} style={{ cursor: 'pointer' }}
                                    opacity={activeRegion === 'chest' ? 1 : 0.6} />
                                <rect x="70" y="160" width="60" height="60" rx="10" fill="none" stroke="#93C5FD" strokeWidth="1.5"
                                    onClick={() => setActiveRegion('abdomen')} style={{ cursor: 'pointer' }}
                                    opacity={activeRegion === 'abdomen' ? 1 : 0.6} />
                                {/* Arms */}
                                <rect x="20" y="85" width="40" height="90" rx="12" fill="none" stroke="#93C5FD" strokeWidth="1.5"
                                    onClick={() => setActiveRegion('arms')} style={{ cursor: 'pointer' }}
                                    opacity={activeRegion === 'arms' ? 1 : 0.6} />
                                <rect x="140" y="85" width="40" height="90" rx="12" fill="none" stroke="#93C5FD" strokeWidth="1.5"
                                    onClick={() => setActiveRegion('arms')} style={{ cursor: 'pointer' }}
                                    opacity={activeRegion === 'arms' ? 1 : 0.6} />
                                {/* Legs */}
                                <rect x="68" y="225" width="28" height="120" rx="10" fill="none" stroke="#93C5FD" strokeWidth="1.5"
                                    onClick={() => setActiveRegion('legs')} style={{ cursor: 'pointer' }}
                                    opacity={activeRegion === 'legs' ? 1 : 0.6} />
                                <rect x="104" y="225" width="28" height="120" rx="10" fill="none" stroke="#93C5FD" strokeWidth="1.5"
                                    onClick={() => setActiveRegion('legs')} style={{ cursor: 'pointer' }}
                                    opacity={activeRegion === 'legs' ? 1 : 0.6} />
                                {/* Labels */}
                                <text x="100" y="30" textAnchor="middle" fontSize="9" fill="#3B82F6" fontWeight="500">Head</text>
                                <text x="100" y="120" textAnchor="middle" fontSize="9" fill="#3B82F6" fontWeight="500">Chest</text>
                                <text x="100" y="192" textAnchor="middle" fontSize="9" fill="#3B82F6" fontWeight="500">Abdomen</text>
                                <text x="40" y="140" textAnchor="middle" fontSize="8" fill="#3B82F6" fontWeight="500">Arm</text>
                                <text x="160" y="140" textAnchor="middle" fontSize="8" fill="#3B82F6" fontWeight="500">Arm</text>
                                <text x="82" y="295" textAnchor="middle" fontSize="8" fill="#3B82F6" fontWeight="500">Leg</text>
                                <text x="118" y="295" textAnchor="middle" fontSize="8" fill="#3B82F6" fontWeight="500">Leg</text>
                            </svg>
                            {/* Extra region buttons */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 12 }}>
                                {['back', 'skin', 'general'].map(r => (
                                    <button key={r} onClick={() => setActiveRegion(r)} style={{
                                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                                        border: activeRegion === r ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
                                        background: activeRegion === r ? '#EFF6FF' : 'white',
                                        color: activeRegion === r ? '#3B82F6' : '#64748B',
                                        cursor: 'pointer',
                                    }}>
                                        {bodyRegions[r].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ──────── STEP 2: Level of Care ──────── */}
            {step === 2 && (
                <>
                    <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#0EA5A4', fontWeight: 500, fontSize: 14, marginBottom: 20 }}>
                        <ChevronLeft size={16} /> Back
                    </button>
                    <div style={{ maxWidth: 600, margin: '0 auto' }}>
                        <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
                            We&apos;re sorry you&apos;re feeling unwell. Before we ask more about your health, please share what <strong>level of care</strong> you&apos;re considering at the moment.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {levelOfCareOptions.map(opt => (
                                <button key={opt} onClick={() => setLevelOfCare(opt)} style={{
                                    padding: '14px 20px', borderRadius: 14, textAlign: 'left',
                                    border: levelOfCare === opt ? '2px solid #0EA5A4' : '1.5px solid #E2E8F0',
                                    background: levelOfCare === opt ? '#F0FDFA' : 'white',
                                    cursor: 'pointer', fontSize: 14,
                                    fontWeight: levelOfCare === opt ? 600 : 400,
                                    color: levelOfCare === opt ? '#0EA5A4' : '#0F172A',
                                    transition: 'all 0.2s',
                                }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(3)} disabled={!levelOfCare}
                            className="btn-gradient"
                            style={{
                                marginTop: 24, padding: '14px 32px', fontSize: 15,
                                opacity: !levelOfCare ? 0.4 : 1,
                                cursor: !levelOfCare ? 'not-allowed' : 'pointer',
                            }}>
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </>
            )}

            {/* ──────── STEP 3: Severity + Duration + Context ──────── */}
            {step === 3 && (
                <>
                    <button onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#0EA5A4', fontWeight: 500, fontSize: 14, marginBottom: 20 }}>
                        <ChevronLeft size={16} /> Back
                    </button>
                    <div style={{ maxWidth: 600, margin: '0 auto' }}>
                        {/* Severity */}
                        <div style={{ marginBottom: 32 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Activity size={18} color="#0EA5A4" /> Severity
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <input type="range" min={0} max={10} value={severity}
                                    onChange={e => setSeverity(parseInt(e.target.value))}
                                    style={{ flex: 1, accentColor: '#0EA5A4' }} />
                                <span style={{
                                    width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20, fontWeight: 700,
                                    background: severity < 4 ? '#F0FDF4' : severity < 7 ? '#FEF3C7' : '#FEE2E2',
                                    color: severity < 4 ? '#22C55E' : severity < 7 ? '#F59E0B' : '#EF4444',
                                }}>{severity}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                                <span>No pain</span><span>Mild</span><span>Moderate</span><span>Severe</span><span>Worst</span>
                            </div>
                        </div>

                        {/* Duration */}
                        <div style={{ marginBottom: 32 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Clock size={18} color="#6366F1" /> Duration
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {['< 24 hours', '1–3 days', '3–7 days', '> 1 week'].map(d => (
                                    <button key={d} onClick={() => setDuration(d)} style={{
                                        padding: '14px 16px', borderRadius: 12, textAlign: 'center',
                                        border: duration === d ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                                        background: duration === d ? '#EEF2FF' : 'white',
                                        cursor: 'pointer', fontSize: 14, fontWeight: duration === d ? 600 : 400,
                                        color: duration === d ? '#6366F1' : '#0F172A',
                                    }}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Context Questions */}
                        <div style={{ marginBottom: 32 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                                Additional Questions
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {contextQuestions.map((q, i) => (
                                    <label key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 16px', borderRadius: 12,
                                        background: contextAnswers[q] ? '#F0FDFA' : '#F8FAFC',
                                        border: contextAnswers[q] ? '1.5px solid #0EA5A4' : '1px solid #E2E8F0',
                                        cursor: 'pointer', fontSize: 14,
                                    }}>
                                        <input type="checkbox" checked={!!contextAnswers[q]}
                                            onChange={e => setContextAnswers({ ...contextAnswers, [q]: e.target.checked })}
                                            style={{ accentColor: '#0EA5A4' }} />
                                        {q}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => setStep(4)} disabled={!duration}
                            className="btn-gradient"
                            style={{
                                padding: '14px 32px', fontSize: 15,
                                opacity: !duration ? 0.4 : 1,
                                cursor: !duration ? 'not-allowed' : 'pointer',
                            }}>
                            Analyze Symptoms <ArrowRight size={16} />
                        </button>
                    </div>
                </>
            )}

            {/* ──────── STEP 4: Analysis Results ──────── */}
            {step === 4 && (
                <>
                    <button onClick={() => setStep(3)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#0EA5A4', fontWeight: 500, fontSize: 14, marginBottom: 20 }}>
                        <ChevronLeft size={16} /> Back
                    </button>
                    <div style={{ maxWidth: 640, margin: '0 auto' }}>
                        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Analysis Results</h2>

                        {/* Triage */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
                            padding: '16px 20px', borderRadius: 16,
                            background: `${triageColors[analysis.triage]}15`,
                            border: `1.5px solid ${triageColors[analysis.triage]}40`,
                        }}>
                            <AlertTriangle size={20} color={triageColors[analysis.triage]} />
                            <div>
                                <span style={{ fontWeight: 600, color: triageColors[analysis.triage], fontSize: 14 }}>
                                    Triage Level: {analysis.triage.charAt(0).toUpperCase() + analysis.triage.slice(1).replace('-', ' ')}
                                </span>
                                <br />
                                <span style={{ fontSize: 12, color: '#64748B' }}>
                                    Based on {selectedSymptoms.length} symptoms reported
                                </span>
                            </div>
                        </div>

                        {/* Conditions */}
                        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Possible Conditions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {analysis.conditions.map((c, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</span>
                                            <span style={{
                                                fontSize: 12, fontWeight: 600,
                                                color: c.risk === 'high' ? '#EF4444' : c.risk === 'medium' ? '#F59E0B' : '#22C55E',
                                            }}>{c.probability}%</span>
                                        </div>
                                        <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', borderRadius: 4, width: `${c.probability}%`,
                                                background: c.risk === 'high' ? '#EF4444' : c.risk === 'medium' ? '#F59E0B' : '#22C55E',
                                                transition: 'width 1s ease',
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Confidence Circle */}
                        <div className="card" style={{ padding: 24, marginBottom: 24, textAlign: 'center' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>AI Confidence</h3>
                            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto' }}>
                                <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, transform: 'rotate(-90deg)' }}>
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#0EA5A4" strokeWidth="8"
                                        strokeDasharray={`${analysis.confidence * 2.64} ${264 - analysis.confidence * 2.64}`}
                                        strokeLinecap="round" />
                                </svg>
                                <div style={{
                                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#0EA5A4',
                                }}>{analysis.confidence}%</div>
                            </div>
                        </div>

                        {/* CTA */}
                        <button onClick={() => router.push('/app/workspace')}
                            className="btn-gradient"
                            style={{ width: '100%', justifyContent: 'center', padding: '16px 32px', fontSize: 15 }}>
                            <Bot size={18} /> Start Detailed AI Chat
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
