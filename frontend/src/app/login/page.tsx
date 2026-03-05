'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import api, { getErrorMessage } from '@/lib/api';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuthenticated, setAccessToken, setRefreshToken, setUserProfile } = useAppStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    const redirectPath = searchParams.get('redirect') || '/app/workspace';

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 6;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailValid) { setError('Please enter a valid email address.'); return; }
        if (!passwordValid) { setError('Password must be at least 6 characters.'); return; }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const result = response.data?.data;

            if (result?.access_token) {
                setAccessToken(result.access_token);
                setRefreshToken(result.refresh_token || null);
                setAuthenticated(true);
                if (result.user) {
                    setUserProfile({
                        name: result.user.name || '',
                        email: result.user.email || email,
                        age: result.user.age || '',
                        gender: result.user.gender || '',
                        city: result.user.city || '',
                        country: result.user.country || '',
                        existingConditions: result.user.existing_conditions || [],
                        currentMedications: result.user.current_medications || [],
                        planTier: result.user.plan_tier || 'free',
                    });
                }
                router.push(redirectPath);
            } else {
                setError('Unexpected response from server. Please try again.');
                setLoading(false);
            }
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError('Account not found. Please create an account first.');
                setTimeout(() => router.push(`/signup?redirect=${redirectPath}`), 2000);
            } else {
                setError(getErrorMessage(err));
            }
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left — Illustration Side */}
            <div className="login-left-panel">
                {/* Blobs */}
                <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, background: '#0EA5A4', opacity: 0.2, filter: 'blur(80px)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -60, right: -60, width: 250, height: 250, background: '#6366F1', opacity: 0.15, filter: 'blur(60px)', borderRadius: '50%' }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
                        Welcome to the Future of Preventive Healthcare
                    </h2>
                    <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 32 }}>
                        AI-driven medical intelligence providing symptom analysis, personalized health insights, and evidence-based guidance.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {['AI Symptom Analysis', 'Preventive Health Monitoring', 'Personalized Treatment Insights', 'Secure & Private Data'].map(item => (
                            <div key={item} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500,
                            }}>
                                <span style={{ color: '#4ADE80', fontSize: 18 }}>✔</span> {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Form Side */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '48px 40px', background: 'white',
            }}>
                <div style={{ maxWidth: 400, width: '100%' }}>
                    <div style={{ marginBottom: 36 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Sign In</h1>
                        <p style={{ color: '#64748B', fontSize: 15 }}>
                            Access your personalized health dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Email */}
                        <div>
                            <label htmlFor="email-input" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} aria-hidden="true" />
                                <input
                                    id="email-input"
                                    type="email" required value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    placeholder="you@example.com"
                                    aria-label="Email address"
                                    aria-invalid={email && !emailValid ? 'true' : 'false'}
                                    aria-describedby={email && !emailValid ? 'email-error' : undefined}
                                    style={{
                                        width: '100%', padding: '12px 12px 12px 44px', borderRadius: 12,
                                        border: `1px solid ${email && !emailValid ? '#EF4444' : '#E2E8F0'}`,
                                        fontSize: 15, outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#0EA5A4'}
                                    onBlur={(e) => e.target.style.borderColor = email && !emailValid ? '#EF4444' : '#E2E8F0'}
                                />
                            </div>
                            {email && !emailValid && (
                                <span id="email-error" style={{ fontSize: 12, color: '#EF4444', marginTop: 4, display: 'block' }} role="alert">Enter a valid email address</span>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password-input" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} aria-hidden="true" />
                                <input
                                    id="password-input"
                                    type={showPassword ? "text" : "password"} required value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    placeholder="••••••••"
                                    aria-label="Password"
                                    aria-invalid={password && !passwordValid ? 'true' : 'false'}
                                    aria-describedby={password && !passwordValid ? 'password-error' : undefined}
                                    style={{
                                        width: '100%', padding: '12px 44px 12px 44px', borderRadius: 12,
                                        border: `1px solid ${password && !passwordValid ? '#EF4444' : '#E2E8F0'}`,
                                        fontSize: 15, outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#0EA5A4'}
                                    onBlur={(e) => e.target.style.borderColor = password && !passwordValid ? '#EF4444' : '#E2E8F0'}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    style={{ position: 'absolute', right: 14, top: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                                </button>
                            </div>
                            {password && !passwordValid && (
                                <span id="password-error" style={{ fontSize: 12, color: '#EF4444', marginTop: 4, display: 'block' }} role="alert">Password must be at least 6 characters</span>
                            )}
                        </div>

                        {error && (
                            <div role="alert" style={{
                                color: '#EF4444', fontSize: 13, textAlign: 'center',
                                padding: '10px 14px', background: '#FEF2F2', borderRadius: 10,
                                border: '1px solid #FECACA',
                            }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-gradient"
                            style={{
                                padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                marginTop: 4, opacity: loading ? 0.7 : 1,
                            }}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign In <ArrowRight size={18} /></>}
                        </button>

                        <div style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 12 }}>
                            <Link href="/reset-password" style={{ color: '#0EA5A4', fontWeight: 500, textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </div>
                    </form>



                    {/* Disclaimer — Collapsible */}
                    <div style={{ marginTop: 24 }}>
                        <button
                            onClick={() => setShowDisclaimer(!showDisclaimer)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 14px', borderRadius: 10, border: '1px solid #F1F5F9',
                                background: '#FAFBFC', cursor: 'pointer', fontSize: 12, color: '#64748B', fontWeight: 500,
                            }}
                        >
                            <span>⚕️ Medical Disclaimer</span>
                            {showDisclaimer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {showDisclaimer && (
                            <div style={{
                                padding: '12px 14px', fontSize: 12, color: '#64748B', lineHeight: 1.6,
                                border: '1px solid #F1F5F9', borderTop: 'none', borderRadius: '0 0 10px 10px',
                                background: '#FAFBFC',
                            }}>
                                Chikitsak provides AI-generated health information for educational purposes only. It does not replace professional medical advice, diagnosis, or treatment.
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#64748B' }}>
                        Don&apos;t have an account?{' '}
                        <Link href={`/signup?redirect=${redirectPath}`} style={{ color: '#0EA5A4', fontWeight: 600, textDecoration: 'none' }}>
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
