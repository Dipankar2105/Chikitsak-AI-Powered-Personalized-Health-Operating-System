'use client';

import { useState } from 'react';
import { Activity, FileText, Pill, History, Download, Calendar, AlertCircle, TrendingUp, Clock, ChevronRight } from 'lucide-react';

const symptomHistory = [
    { date: '2026-02-18', symptoms: ['Headache', 'Mild fever'], diagnosis: 'Viral infection', severity: 'Medium', triageLevel: 'Primary Care' },
    { date: '2026-02-10', symptoms: ['Cough', 'Sore throat'], diagnosis: 'Upper respiratory infection', severity: 'Low', triageLevel: 'Self-Care' },
    { date: '2026-01-28', symptoms: ['Chest tightness', 'Shortness of breath'], diagnosis: 'Anxiety attack', severity: 'High', triageLevel: 'Urgent Care' },
    { date: '2026-01-15', symptoms: ['Abdominal pain', 'Nausea'], diagnosis: 'Gastritis', severity: 'Medium', triageLevel: 'Primary Care' },
];

const medicationLogs = [
    { name: 'Metformin 500mg', frequency: 'Twice daily', started: '2025-11-01', status: 'Active', prescriber: 'Dr. Patel' },
    { name: 'Amlodipine 5mg', frequency: 'Once daily', started: '2025-09-15', status: 'Active', prescriber: 'Dr. Sharma' },
    { name: 'Azithromycin 250mg', frequency: 'Once daily × 5 days', started: '2026-02-10', status: 'Completed', prescriber: 'Dr. Gupta' },
    { name: 'Pantoprazole 40mg', frequency: 'Once daily (before food)', started: '2026-01-16', status: 'Completed', prescriber: 'Dr. Patel' },
];

const labHistory = [
    { date: '2026-02-15', test: 'Complete Blood Count (CBC)', facility: 'Apollo Diagnostics', status: 'Normal', key: 'WBC: 7,200 | RBC: 4.8M | Hgb: 14.2' },
    { date: '2026-01-20', test: 'HbA1c', facility: 'Dr. Lal PathLabs', status: 'Borderline', key: 'HbA1c: 6.2% (Pre-diabetic range)' },
    { date: '2025-12-10', test: 'Lipid Panel', facility: 'SRL Diagnostics', status: 'Abnormal', key: 'LDL: 145 mg/dL (High) | HDL: 42 mg/dL' },
    { date: '2025-11-05', test: 'Thyroid Panel (TSH)', facility: 'Apollo Diagnostics', status: 'Normal', key: 'TSH: 2.8 mIU/L' },
];

const tabs = [
    { key: 'symptoms', label: 'Symptom History', icon: Activity },
    { key: 'medications', label: 'Medication Logs', icon: Pill },
    { key: 'labs', label: 'Lab History', icon: FileText },
];

function getSeverityColor(s: string) {
    if (s === 'High') return '#EF4444';
    if (s === 'Medium') return '#F59E0B';
    return '#22C55E';
}

function getStatusColor(s: string) {
    if (s === 'Normal') return '#22C55E';
    if (s === 'Borderline') return '#F59E0B';
    return '#EF4444';
}

export default function HealthRecordsPage() {
    const [activeTab, setActiveTab] = useState('symptoms');

    const handleDownload = () => {
        const sections = [
            '=== CHIKITSAK HEALTH RECORDS SUMMARY ===\nGenerated: ' + new Date().toLocaleDateString() + '\n',
            '--- SYMPTOM HISTORY ---',
            ...symptomHistory.map(s => `${s.date} | ${s.symptoms.join(', ')} → ${s.diagnosis} (${s.severity})`),
            '\n--- MEDICATION LOGS ---',
            ...medicationLogs.map(m => `${m.name} | ${m.frequency} | ${m.status} | By: ${m.prescriber}`),
            '\n--- LAB RESULTS ---',
            ...labHistory.map(l => `${l.date} | ${l.test} | ${l.status} | ${l.key}`),
            '\n⚕️ Disclaimer: This is an AI-generated summary. Consult your physician for medical decisions.'
        ];

        const blob = new Blob([sections.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chikitsak_health_records_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ padding: '32px', overflowY: 'auto', maxHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <History size={28} color="#0EA5A4" /> My Health Records
                </h1>
                <button onClick={handleDownload} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px',
                    borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #0EA5A4, #4F46E5)', color: 'white',
                    fontSize: 13, fontWeight: 600,
                }}>
                    <Download size={16} /> Download Summary
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderRadius: 12, background: '#F1F5F9', padding: 4 }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: activeTab === tab.key ? 'white' : 'transparent',
                            color: activeTab === tab.key ? '#0EA5A4' : '#64748B',
                            fontWeight: activeTab === tab.key ? 600 : 500, fontSize: 14,
                            boxShadow: activeTab === tab.key ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.2s',
                        }}>
                            <Icon size={18} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Symptom History */}
            {activeTab === 'symptoms' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {symptomHistory.map((entry, i) => (
                        <div key={i} style={{
                            background: 'white', borderRadius: 16, padding: 20,
                            border: '1px solid #F1F5F9', boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                            borderLeft: `4px solid ${getSeverityColor(entry.severity)}`,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Calendar size={14} color="#94A3B8" />
                                    <span style={{ fontSize: 13, color: '#64748B' }}>{new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${getSeverityColor(entry.severity)}15`, color: getSeverityColor(entry.severity) }}>
                                        {entry.severity}
                                    </span>
                                    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: '#F0FDFA', color: '#0F766E' }}>
                                        {entry.triageLevel}
                                    </span>
                                </div>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{entry.diagnosis}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {entry.symptoms.map(s => (
                                    <span key={s} style={{ padding: '4px 10px', borderRadius: 8, background: '#F8FAFC', fontSize: 12, color: '#475569', fontWeight: 500 }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Medication Logs */}
            {activeTab === 'medications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {medicationLogs.map((med, i) => (
                        <div key={i} style={{
                            background: 'white', borderRadius: 16, padding: 20,
                            border: '1px solid #F1F5F9', boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{med.name}</div>
                                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>{med.frequency} · Prescribed by {med.prescriber}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
                                    <Clock size={12} /> Started: {new Date(med.started).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                            <span style={{
                                padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                background: med.status === 'Active' ? '#F0FDF4' : '#F8FAFC',
                                color: med.status === 'Active' ? '#16A34A' : '#64748B',
                            }}>
                                {med.status === 'Active' ? '● Active' : '✓ Completed'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Lab History */}
            {activeTab === 'labs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {labHistory.map((lab, i) => (
                        <div key={i} style={{
                            background: 'white', borderRadius: 16, padding: 20,
                            border: '1px solid #F1F5F9', boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{lab.test}</div>
                                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{lab.facility} · {new Date(lab.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>
                                <span style={{
                                    padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                                    background: `${getStatusColor(lab.status)}15`, color: getStatusColor(lab.status),
                                }}>
                                    {lab.status}
                                </span>
                            </div>
                            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#F8FAFC', fontSize: 13, color: '#475569', fontFamily: 'monospace' }}>
                                {lab.key}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
