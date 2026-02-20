'use client';

import { useState } from 'react';
import { Activity, FileText, Pill, Apple, Brain, Watch, History as HistoryIcon, UserPlus, Heart, Thermometer, ShieldCheck, CheckCircle2 } from 'lucide-react';

/* --- Tab Components --- */

const OverviewTab = () => (
    <div style={{ padding: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Health Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ padding: 20, borderRadius: 16, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={14} color="#EF4444" /> Blood Pressure</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>120/80 <span style={{ fontSize: 14, fontWeight: 500, color: '#64748B' }}>mmHg</span></div>
                <div style={{ fontSize: 12, color: '#10B981', marginTop: 8 }}>✓ Normal</div>
            </div>
            <div style={{ padding: 20, borderRadius: 16, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Thermometer size={14} color="#F59E0B" /> Avg Body Temp</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>98.6 <span style={{ fontSize: 14, fontWeight: 500, color: '#64748B' }}>°F</span></div>
                <div style={{ fontSize: 12, color: '#10B981', marginTop: 8 }}>✓ Normal</div>
            </div>
            <div style={{ padding: 20, borderRadius: 16, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} color="#3B82F6" /> Immunity Score</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>85 <span style={{ fontSize: 14, fontWeight: 500, color: '#64748B' }}>/100</span></div>
                <div style={{ fontSize: 12, color: '#10B981', marginTop: 8 }}>✓ Good</div>
            </div>
        </div>
        <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>Recent Updates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                    { label: 'Logged a symptom: Mild Headache', time: '2 hours ago' },
                    { label: 'Uploaded new Complete Blood Count report', time: 'Yesterday' },
                    { label: 'Completed daily steps goal (10,000)', time: 'Yesterday' }
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: 14, color: '#334155' }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.time}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const HistoryTab = () => (
    <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Medical History</h2>
            <button style={{ padding: '8px 16px', borderRadius: 99, background: '#EEF2FF', color: '#4338CA', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ Add Record</button>
        </div>
        <div style={{ position: 'relative', borderLeft: '2px solid #E2E8F0', paddingLeft: 24, marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
                { year: '2023', title: 'Appendectomy', desc: 'Laparoscopic appendectomy performed at City Hospital.' },
                { year: '2021', title: 'COVID-19 Diagnosis', desc: 'Mild symptoms, recovered at home.' },
                { year: '2018', title: 'Asthma Diagnosis', desc: 'Diagnosed with mild allergic asthma.' }
            ].map((event, i) => (
                <div key={i} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: -31, top: 0, width: 12, height: 12, borderRadius: '50%', background: '#3B82F6', border: '3px solid white' }}></div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6', marginBottom: 4 }}>{event.year}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{event.title}</div>
                    <div style={{ fontSize: 14, color: '#64748B' }}>{event.desc}</div>
                </div>
            ))}
        </div>
    </div>
);

const FamilyHistoryTab = () => (
    <div style={{ padding: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Family History</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {[
                { relation: 'Father', conditions: ['Hypertension', 'Type 2 Diabetes'] },
                { relation: 'Mother', conditions: ['Hypothyroidism'] },
                { relation: 'Paternal Grandfather', conditions: ['Coronary Artery Disease'] }
            ].map((member, i) => (
                <div key={i} style={{ padding: 20, borderRadius: 16, background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>{member.relation}</div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: '#64748B', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {member.conditions.map((cond, idx) => <li key={idx}>{cond}</li>)}
                    </ul>
                </div>
            ))}
        </div>
    </div>
);

const WearableTab = () => {
    const [connected, setConnected] = useState(false);
    return (
        <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: connected ? '#D1FAE5' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, transition: 'all 0.3s' }}>
                <Watch size={40} color={connected ? '#10B981' : '#64748B'} />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
                {connected ? 'Device Connected' : 'Wearable Integration'}
            </h3>
            <p style={{ color: '#64748B', marginBottom: 32, maxWidth: 400 }}>
                {connected
                    ? 'Your Apple Watch is currently syncing biometric data to Chikitsak.'
                    : 'Sync your Apple Watch, Fitbit, or Garmin device to see real-time vitals and improve AI accuracy.'}
            </p>

            {connected ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 400 }}>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <CheckCircle2 color="#10B981" />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>Apple Watch Series 8</div>
                                <div style={{ fontSize: 12, color: '#64748B' }}>Synced 2 mins ago</div>
                            </div>
                        </div>
                        <button onClick={() => setConnected(false)} style={{ padding: '6px 12px', borderRadius: 99, border: '1px solid #E2E8F0', background: 'white', fontSize: 12, fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>Disconnect</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                        <div style={{ background: 'linear-gradient(135deg, #0EA5A4, #3B82F6)', padding: '24px', borderRadius: '50%', width: 120, height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 25px -5px rgba(14,165,164,0.4)' }}>
                            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.9 }}>Daily Score</div>
                            <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>92</div>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setConnected(true)}
                    style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5A4)', padding: '14px 32px', borderRadius: 99, color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 16, boxShadow: '0 10px 15px -3px rgba(37,99,235,0.3)' }}
                >
                    Connect Device
                </button>
            )}
        </div>
    );
};

export default function MyHealthPage() {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'history', label: 'Medical History', icon: HistoryIcon },
        { id: 'family', label: 'Family History', icon: UserPlus },
        { id: 'labs', label: 'Lab Reports', icon: FileText },
        { id: 'meds', label: 'Medications', icon: Pill },
        { id: 'nutrition', label: 'Nutrition', icon: Apple },
        { id: 'mental', label: 'Mental', icon: Brain },
        { id: 'wearable', label: 'Wearables', icon: Watch },
    ];

    return (
        <div style={{ padding: '32px 32px 100px', maxWidth: 1400, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 24 }}>My Health Records</h1>

            {/* Tabs Header */}
            <div style={{
                display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 24,
                borderBottom: '1px solid #E2E8F0', flexWrap: 'nowrap',
                scrollbarWidth: 'none' // For Firefox
            }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 16px', borderRadius: 99,
                                background: isActive ? '#0F172A' : '#F8FAFC',
                                color: isActive ? 'white' : '#64748B',
                                border: isActive ? '1px solid #0F172A' : '1px solid #E2E8F0',
                                cursor: 'pointer',
                                fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                boxShadow: isActive ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            <Icon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content Area */}
            <div style={{ background: 'white', borderRadius: 24, minHeight: 400, border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'history' && <HistoryTab />}
                {activeTab === 'family' && <FamilyHistoryTab />}
                {activeTab === 'labs' && (
                    <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                        <FileText size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <h3>Lab Reports Component</h3>
                        <p>Detailed view of lab trends goes here or link to /app/lab-report</p>
                    </div>
                )}
                {activeTab === 'meds' && (
                    <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                        <Pill size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <h3>Medications Component</h3>
                        <p>Detailed view of active prescriptions goes here or link to /app/medication</p>
                    </div>
                )}
                {activeTab === 'nutrition' && (
                    <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                        <Apple size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <h3>Nutrition Component</h3>
                        <p>Detailed view of diet logs goes here or link to /app/nutrition</p>
                    </div>
                )}
                {activeTab === 'mental' && (
                    <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                        <Brain size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <h3>Mental Health Component</h3>
                        <p>Detailed view of mood tracking goes here</p>
                    </div>
                )}
                {activeTab === 'wearable' && <WearableTab />}
            </div>
        </div>
    );
}
