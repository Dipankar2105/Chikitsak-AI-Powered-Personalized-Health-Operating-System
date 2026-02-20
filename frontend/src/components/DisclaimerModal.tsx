'use client';

import { useState } from 'react';
import { ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface DisclaimerModalProps {
    onAccept: () => void;
}

export default function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24
        }}>
            <div style={{
                background: 'white', borderRadius: 20, maxWidth: 480, width: '100%',
                overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'slideUp 0.3s ease-out',
                maxHeight: '90vh', overflowY: 'auto',
            }}>
                {/* Header */}
                <div style={{ background: '#FEF2F2', padding: '20px 24px', textAlign: 'center', borderBottom: '1px solid #FECACA' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%', background: '#FEE2E2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                        color: '#DC2626'
                    }}>
                        <ShieldAlert size={24} />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#991B1B', marginBottom: 4 }}>Medical Disclaimer</h2>
                    <p style={{ color: '#B91C1C', fontSize: 13 }}>Please read before proceeding.</p>
                </div>

                {/* Content */}
                <div style={{ padding: '20px 24px', color: '#334155', lineHeight: 1.6, fontSize: 14 }}>
                    <p style={{ marginBottom: 12 }}>
                        <strong>Chikitsak is an AI-powered educational tool.</strong> It is not a substitute for professional medical advice.
                    </p>

                    {/* Collapsible details */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: '#0EA5A4', fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 12,
                        }}
                    >
                        {expanded ? 'Show Less' : 'Read More'}
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {expanded && (
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                            {[
                                'This system does NOT provide medical diagnosis or treatment.',
                                'Always consult a qualified healthcare provider for any medical concerns.',
                                'In case of a medical emergency, call your local emergency services immediately.'
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#475569' }}>
                                    <span style={{ minWidth: 5, height: 5, borderRadius: '50%', background: '#CBD5E1', marginTop: 7 }} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onAccept}
                        className="btn-gradient"
                        style={{
                            padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'linear-gradient(135deg, #0EA5A4, #2563EB)', color: 'white', border: 'none', cursor: 'pointer',
                        }}
                    >
                        <CheckCircle2 size={18} /> I Understand & Accept
                    </button>
                </div>
            </div>
            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
