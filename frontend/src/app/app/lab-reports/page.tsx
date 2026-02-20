'use client';

import { Upload, FileText, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', value: 180 },
    { name: 'Feb', value: 172 },
    { name: 'Mar', value: 160 },
    { name: 'Apr', value: 165 },
    { name: 'May', value: 155 },
    { name: 'Jun', value: 140 },
];

export default function LabReportsPage() {
    return (
        <div style={{ padding: '32px 32px 100px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Lab Reports</h1>
                    <p style={{ color: '#64748B', fontSize: 16 }}>Upload and analyze your medical reports.</p>
                </div>
                <button className="btn-gradient" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 99 }}>
                    <Upload size={18} /> Upload New Report
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 32 }}>

                {/* Drag & Drop Area */}
                <div style={{
                    border: '2px dashed #CBD5E1', borderRadius: 24, padding: 48,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: '#F8FAFC', minHeight: 400
                }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7', marginBottom: 24 }}>
                        <FileText size={40} />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>Upload Report</h3>
                    <p style={{ color: '#64748B', textAlign: 'center', maxWidth: 300, marginBottom: 32 }}>
                        Drag and drop your PDF or Image file here, or click to browse. We support blood tests, X-rays, and prescriptions.
                    </p>
                    <button style={{ padding: '12px 32px', background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, fontWeight: 600, color: '#0F172A' }}>
                        Browse Files
                    </button>
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
                                <span style={{ fontWeight: 700, color: '#1E293B' }}>Cholesterol Trend</span>
                            </div>
                            <span style={{ fontSize: 12, color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: 99 }}>Last 6 Months</span>
                        </div>
                        <div style={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
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
                        </div>
                    </div>

                    {/* Recent Reports List */}
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #F1F5F9' }}>
                        <h4 style={{ fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>Recent Analysis</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid #F8FAFC' }}>
                                <div style={{ padding: 10, background: '#E0E7FF', borderRadius: 12, color: '#4F46E5' }}><FileText size={20} /></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: 14 }}>Blood Count (CBC)</div>
                                    <div style={{ fontSize: 12, color: '#64748B' }}>Analyzed on June 12, 2026</div>
                                </div>
                                <div style={{ color: '#16A34A' }}><CheckCircle size={18} /></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ padding: 10, background: '#FFEDD5', borderRadius: 12, color: '#EA580C' }}><FileText size={20} /></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: 14 }}>Lipid Profile</div>
                                    <div style={{ fontSize: 12, color: '#64748B' }}>Analyzed on May 10, 2026</div>
                                </div>
                                <div style={{ color: '#16A34A' }}><CheckCircle size={18} /></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
