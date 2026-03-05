'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FileText, TrendingUp, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api, { getErrorMessage, postFormData } from '@/lib/api';
import PlanGuard from '@/components/PlanGuard';

interface LabHistoryItem {
    id: number;
    report_name: string;
    summary: string | null;
    abnormal_count: number;
    timestamp: string | null;
}

export default function LabReportsPage() {
    return (
        <PlanGuard requireTier="pro">
            <LabReportsContent />
        </PlanGuard>
    );
}

function LabReportsContent() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState<Record<string, unknown> | null>(null);
    const [history, setHistory] = useState<LabHistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        api.get('/lab/history')
            .then(res => {
                const data = res.data?.data || res.data;
                if (Array.isArray(data)) setHistory(data);
            })
            .catch(() => { })
            .finally(() => setLoadingHistory(false));
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setSelectedFile(file); setError(''); setAnalysisResult(null); }
        e.target.value = '';
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) { setSelectedFile(file); setError(''); setAnalysisResult(null); }
    }, []);

    const handleAnalyze = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setError('');
        try {
            const form = new FormData();
            form.append('file', selectedFile);
            const { data } = await postFormData('/lab/analyze', form);
            setAnalysisResult(data as Record<string, unknown>);
        } catch (err) {
            setError(getErrorMessage(err));
        }
        setUploading(false);
    };

    return (
        <div style={{ padding: '32px 32px 100px', maxWidth: 1200, margin: '0 auto' }}>
            <input ref={fileInputRef} type="file" accept=".csv,.pdf,.jpg,.png" onChange={handleFileSelect} style={{ display: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Lab Reports</h1>
                    <p style={{ color: '#64748B', fontSize: 16 }}>Upload and analyze your medical reports.</p>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="btn-gradient" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 99 }}>
                    <Upload size={18} /> Upload New Report
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 32 }}>

                {/* Drag & Drop Area */}
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                        border: `2px dashed ${selectedFile ? '#0EA5A4' : '#CBD5E1'}`, borderRadius: 24, padding: 48,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: selectedFile ? '#F0FDFA' : '#F8FAFC', minHeight: 400, transition: 'all 0.2s',
                    }}>
                    {selectedFile ? (
                        <>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', marginBottom: 16 }}>
                                <FileText size={32} />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>{selectedFile.name}</h3>
                            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={handleAnalyze} disabled={uploading} className="btn-gradient" style={{ padding: '10px 24px', borderRadius: 12, fontSize: 14, opacity: uploading ? 0.7 : 1 }}>
                                    {uploading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : 'Analyze Report'}
                                </button>
                                <button onClick={() => { setSelectedFile(null); setAnalysisResult(null); }} style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', color: '#64748B' }}>
                                    <X size={16} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7', marginBottom: 24 }}>
                                <FileText size={40} />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>Upload Report</h3>
                            <p style={{ color: '#64748B', textAlign: 'center', maxWidth: 300, marginBottom: 32 }}>
                                Drag and drop your CSV file here, or click to browse. We support blood tests, lab values, and prescriptions.
                            </p>
                            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '12px 32px', background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}>
                                Browse Files
                            </button>
                        </>
                    )}

                    {error && (
                        <div style={{ marginTop: 16, padding: '10px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, color: '#DC2626', fontSize: 13 }}>
                            {error}
                        </div>
                    )}

                    {analysisResult && (
                        <div style={{ marginTop: 20, width: '100%', padding: 20, background: 'white', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                            <h4 style={{ fontWeight: 700, color: '#1E293B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CheckCircle size={16} color="#16A34A" /> Analysis Results
                            </h4>
                            <pre style={{ fontSize: 13, color: '#334155', background: '#F8FAFC', padding: 14, borderRadius: 8, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                                {JSON.stringify(analysisResult, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div style={{ marginTop: 24, fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertCircle size={14} /> Your data is encrypted and secure.
                    </div>
                </div>

                {/* Analysis & Trends */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Trend Chart */}
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ padding: 8, background: '#DCFCE7', borderRadius: 8, color: '#16A34A' }}><TrendingUp size={18} /></div>
                                <span style={{ fontWeight: 700, color: '#1E293B' }}>Lab Abnormalities Over Time</span>
                            </div>
                        </div>
                        <div style={{ height: 200 }}>
                            {history.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history.slice().reverse().map(h => ({
                                        name: h.timestamp ? new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short' }) : '?',
                                        value: h.abnormal_count,
                                    }))}>
                                        <defs>
                                            <linearGradient id="colorChol" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorChol)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontSize: 14 }}>
                                    No historical data yet. Upload lab reports to see trends.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Reports List */}
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9' }}>
                        <h4 style={{ fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>Recent Analysis</h4>
                        {loadingHistory ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94A3B8', fontSize: 14 }}>
                                <Loader2 size={16} className="animate-spin" /> Loading history...
                            </div>
                        ) : history.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {history.map((report, i) => (
                                    <div key={report.id} style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: i < history.length - 1 ? 16 : 0, borderBottom: i < history.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                                        <div style={{ padding: 10, background: report.abnormal_count > 0 ? '#FFEDD5' : '#E0E7FF', borderRadius: 12, color: report.abnormal_count > 0 ? '#EA580C' : '#4F46E5' }}><FileText size={20} /></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: '#1E293B', fontSize: 14 }}>{report.report_name}</div>
                                            <div style={{ fontSize: 12, color: '#64748B' }}>
                                                {report.timestamp ? new Date(report.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown date'}
                                                {report.summary && ` — ${report.summary}`}
                                            </div>
                                        </div>
                                        <div style={{ color: report.abnormal_count > 0 ? '#F59E0B' : '#16A34A' }}>
                                            {report.abnormal_count > 0 ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>No reports analyzed yet. Upload a CSV to get started.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
