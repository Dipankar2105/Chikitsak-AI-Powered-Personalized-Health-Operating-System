'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import PlanGuard from '@/components/PlanGuard';
import api, { getErrorMessage } from '@/lib/api';
import { ImageAnalysisResponse } from '@/types/api';
import {
    ImageIcon, Upload, Search, Activity, ShieldCheck,
    AlertCircle, CheckCircle2, Loader2, X, Camera
} from 'lucide-react';

export default function ImageAnalysisPage() {
    return (
        <PlanGuard requireTier="pro">
            <ImageAnalysisContent />
        </PlanGuard>
    );
}

function ImageAnalysisContent() {
    const { t } = useTranslation();
    const [image, setImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [type, setType] = useState<'xray' | 'mri' | 'skin' | 'food'>('xray');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => setImage(ev.target?.result as string);
        reader.readAsDataURL(file);

        setError(null);
        setResult(null);
    };

    const runAnalysis = async () => {
        if (!image) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(image);
            const blob = await res.blob();
            const file = new File([blob], fileName || 'upload.png', { type: blob.type });

            const formData = new FormData();
            formData.append('file', file);

            const endpoint = `/predict/${type}`;
            const response = await api.post<ImageAnalysisResponse>(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'success') {
                setResult(response.data.data);
            } else {
                setError(response.data.message || 'Analysis failed');
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                    AI Image Analysis
                </h1>
                <p style={{ color: '#64748B' }}>
                    Upload X-Rays, MRIs, or Skin images for instant clinical-grade AI insights.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                {/* Left: Upload Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            height: 300, border: '2px dashed #E2E8F0', borderRadius: 24,
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: 16, cursor: 'pointer',
                            background: image ? '#F8FAFC' : 'white', overflow: 'hidden',
                            transition: 'all 0.2s', position: 'relative'
                        }}
                    >
                        {image ? (
                            <>
                                <img src={image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <button
                                    onClick={(e) => { e.stopPropagation(); setImage(null); setFileName(null); }}
                                    style={{
                                        position: 'absolute', top: 12, right: 12, padding: 8,
                                        borderRadius: '50%', background: 'rgba(0,0,0,0.5)',
                                        color: 'white', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0EA5A4' }}>
                                    <Camera size={28} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 600, color: '#0F172A' }}>Click to upload image</div>
                                    <div style={{ fontSize: 13, color: '#64748B' }}>Supports JPG, PNG, DICOM</div>
                                </div>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} hidden onChange={handleUpload} accept="image/*" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        {(['xray', 'mri', 'skin', 'food'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                style={{
                                    padding: '12px 8px', borderRadius: 12, border: '1px solid #E2E8F0',
                                    background: type === t ? '#F0FDFA' : 'white',
                                    color: type === t ? '#0EA5A4' : '#64748B',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {t === 'xray' ? 'X-Ray' : t.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={runAnalysis}
                        disabled={!image || loading}
                        className="btn-gradient"
                        style={{
                            padding: '16px', borderRadius: 16, fontWeight: 700, fontSize: 16,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Activity size={20} />}
                        {loading ? 'Analyzing...' : 'Run AI Analysis'}
                    </button>

                    {error && (
                        <div style={{ padding: 16, borderRadius: 12, background: '#FEF2F2', color: '#DC2626', fontSize: 13, display: 'flex', gap: 8 }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                </div>

                {/* Right: Results Area */}
                <div style={{
                    background: 'white', border: '1px solid #F1F5F9', borderRadius: 24,
                    padding: 24, display: 'flex', flexDirection: 'column', gap: 20
                }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Search size={20} color="#0EA5A4" /> Analysis results
                    </h3>

                    {!result && !loading && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', gap: 12 }}>
                            <ImageIcon size={48} opacity={0.3} />
                            <p>Upload and run analysis to see insights</p>
                        </div>
                    )}

                    {loading && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                            <div style={{ width: 100, height: 100, position: 'relative' }}>
                                <div style={{ width: '100%', height: '100%', border: '4px solid #F0FDFA', borderTopColor: '#0EA5A4', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#0EA5A4' }}>
                                    <Bot size={32} />
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 600, color: '#0F172A' }}>Scanning Image...</div>
                                <div style={{ fontSize: 13, color: '#64748B' }}>Our AI is detecting abnormalities</div>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.5s' }}>
                            <div style={{ padding: 20, borderRadius: 20, background: '#F0FDFA', border: '1px solid #CCFBF1' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#0EA5A4', textTransform: 'uppercase', marginBottom: 8 }}>Primary Finding</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{result.prediction || result.result}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                                    <div style={{ height: 6, flex: 1, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.round(result.confidence * 100)}%`, height: '100%', background: '#0EA5A4' }} />
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>{Math.round(result.confidence * 100)}% Confidence</span>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <ShieldCheck size={16} color="#6366F1" /> Recommendation
                                </h4>
                                <div style={{ padding: 16, borderRadius: 16, background: '#F8FAFC', color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
                                    {result.recommendation}
                                </div>
                            </div>

                            <div style={{ padding: 16, borderRadius: 16, border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 12, height: 12, borderRadius: '50%',
                                    background: result.risk_level?.toLowerCase().includes('high') ? '#EF4444' : '#F59E0B'
                                }} />
                                <span style={{ fontWeight: 600, color: '#1E293B' }}>Risk Level: {result.risk_level}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const Bot = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
);
