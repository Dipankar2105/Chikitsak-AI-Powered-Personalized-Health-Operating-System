'use client';

import { useState } from 'react';
import { WifiOff, Search, Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export default function RuralDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const [offlineQueue, setOfflineQueue] = useState([
        { id: '1', patient: 'Ramesh Singh', symptoms: 'Fever, Cough', status: 'Pending Sync', date: '10:05 AM' }
    ]);

    const handleNewPatient = () => {
        const newRecord = {
            id: String(Date.now()),
            patient: 'Unknown (Quick Entry)',
            symptoms: 'Logged via offline tool',
            status: 'Draft',
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setOfflineQueue([newRecord, ...offlineQueue]);
    };

    return (
        <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto', fontFamily: 'monospace' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #E2E8F0' }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 12 }}>
                        Chikitsak VHW Mode
                    </h1>
                    <p style={{ color: '#64748B', marginTop: 4, fontSize: 13 }}>Optimized for Low Bandwidth</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F59E0B', fontSize: 13, fontWeight: 600, background: '#FFFBEB', padding: '6px 12px', border: '1px solid #FCD34D', borderRadius: 8 }}>
                    <WifiOff size={16} /> Offline Ready
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 250px', gap: 24 }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button
                        onClick={handleNewPatient}
                        style={{
                            padding: '16px', background: '#0F172A', color: 'white', border: 'none', borderRadius: 8,
                            fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
                        }}
                    >
                        <FileText size={20} /> New Patient Triage (Offline)
                    </button>

                    <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ background: '#F8FAFC', padding: '12px 16px', borderBottom: '1px solid #E2E8F0', fontWeight: 600, color: '#334155' }}>
                            Recent Triage Logs
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {offlineQueue.map((q) => (
                                <div key={q.id} style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1E293B', fontSize: 15 }}>{q.patient}</div>
                                        <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>{q.symptoms}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: q.status === 'Draft' ? '#64748B' : '#F59E0B', fontSize: 12, fontWeight: 600 }}>
                                            <Clock size={12} /> {q.status}
                                        </div>
                                        <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{q.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px 0', color: '#334155' }}>Network Status</h3>
                        <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                            Currently operating offline. Submitting data will save locally and sync when connection restores.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/app/settings')}
                        style={{ padding: '12px', background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#64748B' }}
                    >
                        Disable Rural Mode
                    </button>
                </div>

            </div>

        </div>
    );
}
