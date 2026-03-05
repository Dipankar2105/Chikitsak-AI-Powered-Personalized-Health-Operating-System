'use client';

import { useState } from 'react';
import { Pill, AlertTriangle, CheckCircle, Clock, Plus, Search, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    nextDose: string;
    missed: boolean;
    takenToday: boolean;
    type: 'Pill' | 'Liquid' | 'Injection';
}

const mockMeds: Medication[] = [
    { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', nextDose: '08:00 AM', missed: false, takenToday: false, type: 'Pill' },
    { id: '2', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily (Evening)', nextDose: '08:00 PM', missed: true, takenToday: false, type: 'Pill' },
    { id: '3', name: 'Vitamin D3', dosage: '1000 IU', frequency: 'Once daily (Morning)', nextDose: '09:00 AM', missed: false, takenToday: true, type: 'Pill' },
];

export default function MedicationsPage() {
    const { t } = useTranslation();
    const [meds, setMeds] = useState<Medication[]>(mockMeds);
    const [interactions, setInteractions] = useState<{ med1: string, med2: string, severity: string, desc: string } | null>(null);

    const checkInteractions = () => {
        // Simulate checking interactions
        setInteractions({
            med1: 'Metformin',
            med2: 'Atorvastatin',
            severity: 'Moderate',
            desc: 'May increase risk of muscle-related side effects. Monitor for muscle pain or weakness.'
        });
    };

    const markTaken = (id: string) => {
        setMeds(meds.map(m => m.id === id ? { ...m, takenToday: true, missed: false } : m));
    };

    return (
        <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Pill color="#0EA5A4" size={32} /> Smart Medication Adherence
                    </h1>
                    <p style={{ color: '#64748B', marginTop: 8 }}>Track your daily doses, get reminders, and check for drug interactions automatically.</p>
                </div>
                <button className="btn-gradient" style={{ padding: '12px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                    <Plus size={20} /> Add Medication
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>

                {/* Left: Schedule & Tracking */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={20} color="#6366F1" /> Today's Schedule
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {meds.map((med) => (
                                <div key={med.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: 20, borderRadius: 16,
                                    background: med.takenToday ? '#F0FDFA' : med.missed ? '#FEF2F2' : '#F8FAFC',
                                    border: `1px solid ${med.takenToday ? '#CCFBF1' : med.missed ? '#FEE2E2' : '#F1F5F9'}`
                                }}>
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 12,
                                            background: med.takenToday ? '#14B8A6' : med.missed ? '#EF4444' : '#E2E8F0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                        }}>
                                            <Pill size={24} color={med.takenToday || med.missed ? 'white' : '#64748B'} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{med.name} <span style={{ color: '#64748B', fontWeight: 500, marginLeft: 8 }}>{med.dosage}</span></div>
                                            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Clock size={14} color={med.missed ? '#EF4444' : '#64748B'} />
                                                {med.missed ? <span style={{ color: '#EF4444', fontWeight: 600 }}>Missed · Was {med.nextDose}</span> : med.nextDose} · {med.frequency}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {med.takenToday ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0EA5A4', fontWeight: 700, fontSize: 14, padding: '8px 16px', background: 'white', borderRadius: 99 }}>
                                                <CheckCircle size={18} /> Taken
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => markTaken(med.id)}
                                                style={{ padding: '8px 24px', borderRadius: 99, border: 'none', background: '#0F172A', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                                                className="hover:bg-slate-800"
                                            >
                                                Log Dose
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertTriangle size={20} color="#F59E0B" /> Interaction Checker
                            </h2>
                            <button onClick={checkInteractions} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', color: '#0F172A', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                Scan My List
                            </button>
                        </div>

                        {interactions ? (
                            <div style={{ background: '#FFFBEB', borderLeft: '4px solid #F59E0B', borderRadius: 12, padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#B45309', marginBottom: 8 }}>
                                    <AlertTriangle size={16} /> {interactions.severity} Interaction Detected
                                </div>
                                <div style={{ fontSize: 14, color: '#1E293B', fontWeight: 600, marginBottom: 4 }}>
                                    {interactions.med1} + {interactions.med2}
                                </div>
                                <div style={{ fontSize: 13, color: '#44403C' }}>
                                    {interactions.desc}
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', border: '2px dashed #F1F5F9', borderRadius: 16 }}>
                                Click 'Scan My List' to check your active medications for potential clashes.
                            </div>
                        )}
                    </div>

                </div>

                {/* Right: Insights & Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    <div style={{ background: 'linear-gradient(135deg, #0EA5A4, #2563EB)', borderRadius: 24, padding: 24, color: 'white' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>Weekly Adherence</div>
                        <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>86%</div>
                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.9 }}>
                            <Info size={14} /> Missed 2 doses this week
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                            Prescription Refills
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>Vitamin D3</div>
                                    <div style={{ fontSize: 12, color: '#EF4444' }}>5 days supply left</div>
                                </div>
                                <button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', fontSize: 12, fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}>Order</button>
                            </div>
                            <div style={{ height: 1, background: '#F1F5F9' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>Metformin</div>
                                    <div style={{ fontSize: 12, color: '#64748B' }}>14 days supply left</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
