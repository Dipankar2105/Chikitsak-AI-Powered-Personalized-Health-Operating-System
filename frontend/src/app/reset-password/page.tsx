'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [step, setStep] = useState<'request' | 'reset'>(!token ? 'request' : 'reset');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess('Password reset link sent to your email');
            setStep('request');
        } catch (err: any) {
            setError('Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/auth/reset-password', {
                token: token,
                new_password: newPassword,
            });
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to reset password. Token may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left — Illustration Side */}
            <div style={{
                flex: '0 0 40%', background: 'linear-gradient(135deg, #0EA5A4, #4F46E5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px', color: 'white', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: -60, right: -60, width: 250, height: 250, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(60px)' }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 350 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Secure Password Reset</h2>
                    <p style={{ fontSize: 15, opacity: 0.9, lineHeight: 1.6 }}>
                        Your account security is important to us. Reset your password safely and regain access.
                    </p>
                </div>
            </div>

            {/* Right — Form Side */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '48px 40px', background: 'white',
            }}>
                <div style={{ maxWidth: 400, width: '100%' }}>
                    {step === 'request' ? (
                        <>
                            <div style={{ marginBottom: 36 }}>
                                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Forgot Password?</h1>
                                <p style={{ color: '#64748B', fontSize: 15 }}>Enter your email and we'll send a reset link.</p>
                            </div>

                            <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} />
                                        <input
                                            type="email" required value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                            placeholder="you@example.com"
                                            style={{
                                                width: '100%', padding: '12px 12px 12px 44px', borderRadius: 12,
                                                border: '1px solid #E2E8F0', fontSize: 15, outline: 'none',
                                            }}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div role="alert" style={{ color: '#EF4444', fontSize: 13, padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div style={{ color: '#10B981', fontSize: 13, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <CheckCircle size={16} /> {success}
                                    </div>
                                )}

                                <button type="submit" disabled={loading} style={{
                                    padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    background: loading ? '#E2E8F0' : 'linear-gradient(135deg, #0EA5A4, #4F46E5)',
                                    color: 'white', border: 'none', cursor: loading ? 'default' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                }}>
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send Reset Link <ArrowRight size={18} /></>}
                                </button>
                            </form>

                            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#64748B' }}>
                                Remember your password?{' '}
                                <Link href="/login" style={{ color: '#0EA5A4', fontWeight: 600, textDecoration: 'none' }}>
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ marginBottom: 36 }}>
                                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Reset Password</h1>
                                <p style={{ color: '#64748B', fontSize: 15 }}>Enter your new password below.</p>
                            </div>

                            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} />
                                        <input
                                            type={showPassword ? "text" : "password"} required value={newPassword}
                                            onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                            placeholder="Min 8 chars"
                                            style={{ width: '100%', padding: '12px 44px 12px 44px', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 15, outline: 'none' }}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: 14, top: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Confirm Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} />
                                        <input
                                            type={showPassword ? "text" : "password"} required value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                            placeholder="Confirm password"
                                            style={{ width: '100%', padding: '12px 44px 12px 44px', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 15, outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div role="alert" style={{ color: '#EF4444', fontSize: 13, padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div style={{ color: '#10B981', fontSize: 13, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <CheckCircle size={16} /> {success}
                                    </div>
                                )}

                                <button type="submit" disabled={loading} style={{
                                    padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    background: loading ? '#E2E8F0' : 'linear-gradient(135deg, #0EA5A4, #4F46E5)',
                                    color: 'white', border: 'none', cursor: loading ? 'default' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                }}>
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Reset Password <ArrowRight size={18} /></>}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
