'use client';

import { useState } from 'react';
import { Search, AlertTriangle, Pill, CheckCircle2, ChevronRight } from 'lucide-react';

export default function MedicationsPage() {
    const [search, setSearch] = useState('');

    return (
        <div style={{ padding: '32px 32px 100px', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Medication Assistant</h1>
                <p style={{ color: '#64748B', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
                    Check drug interactions, side effects, and strict food guidelines.
                </p>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 48 }}>
                <Search size={20} color="#94A3B8" style={{ position: 'absolute', left: 24, top: 18 }} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Enter medication name (e.g. Metformin, Dolonex)..."
                    style={{
                        width: '100%', padding: '18px 24px 18px 56px', borderRadius: 99,
                        border: '2px solid #E2E8F0', fontSize: 16, outline: 'none',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0EA5A4'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                />
            </div>

            {/* Content Placeholder or Result */}
            {search ? (
                <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ padding: 10, background: '#F0FDFA', borderRadius: 12, color: '#0EA5A4' }}><Pill size={24} /></div>
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>{search}</h2>
                            <div style={{ fontSize: 14, color: '#64748B' }}>NSAID / Pain Relief</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>

                        {/* Interactions */}
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#EF4444', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertTriangle size={18} /> Severe Interactions
                            </h3>
                            <div style={{ background: '#FEF2F2', borderRadius: 12, padding: 16, color: '#991B1B', fontSize: 14, lineHeight: 1.6 }}>
                                <strong>Avoid: </strong> Alcohol, Blood thinners (Warfarin). <br />
                                <em>Risk of stomach bleeding increased.</em>
                            </div>
                        </div>

                        {/* Food Guide */}
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#166534', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CheckCircle2 size={18} /> Food Guidelines
                            </h3>
                            <div style={{ background: '#F0FDF4', borderRadius: 12, padding: 16, color: '#14532D', fontSize: 14, lineHeight: 1.6 }}>
                                <strong>Take with food: </strong> Always take after a full meal to prevent acidity. <br />
                                <em>Avoid high-sodium foods if swelling occurs.</em>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Empty State / Popular
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#94A3B8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Often Searched</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {['Metformin', 'Paracetamol', 'Amoxicillin', 'Azithromycin', 'Pantoprazole'].map(med => (
                            <button key={med} onClick={() => setSearch(med)} style={{
                                padding: '10px 20px', borderRadius: 99, background: 'white', border: '1px solid #E2E8F0',
                                color: '#475569', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#0EA5A4'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                            >
                                {med}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
