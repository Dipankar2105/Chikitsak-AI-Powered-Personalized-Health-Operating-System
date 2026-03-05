'use client';

import { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import api, { getErrorMessage } from '@/lib/api';
import { Eye, EyeOff, Lock, Mail, User, MapPin, Globe, Activity, Pill, ArrowRight, Loader2, CheckSquare, Square, Shield } from 'lucide-react';
import DisclaimerModal from '@/components/DisclaimerModal';

/* ── Password strength ─────────────────────── */
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
    if (score <= 2) return { score, label: 'Fair', color: '#F59E0B' };
    if (score <= 3) return { score, label: 'Good', color: '#3B82F6' };
    return { score, label: 'Strong', color: '#10B981' };
}

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuthenticated, setAccessToken, setRefreshToken, setUserProfile, acceptDisclaimer } = useAppStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        age: '', gender: '', city: '', country: 'India',
        conditions: '', medications: ''
    });
    const [disclaimerChecked, setDisclaimerChecked] = useState(false);
    const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const redirectPath = searchParams.get('redirect') || '/app/workspace';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
        setError('');
    };

    const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

    const validateStep1 = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.age || Number(formData.age) < 1 || Number(formData.age) > 120) errors.age = 'Enter a valid age (1-120)';
        if (!formData.gender) errors.gender = 'Select your gender';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.country.trim()) errors.country = 'Country is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email';
        if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) setStep(2);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!disclaimerChecked) { setError('Please accept the medical disclaimer to continue.'); return; }

        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            if (data?.access_token) {
                setAccessToken(data.access_token);
                setRefreshToken(data.refresh_token || null);
                setUserProfile({
                    name: formData.name,
                    email: formData.email,
                    age: Number(formData.age),
                    gender: formData.gender as 'male' | 'female' | 'other' | '',
                    city: formData.city,
                    country: formData.country,
                    existingConditions: formData.conditions.split(',').map(s => s.trim()).filter(Boolean),
                    currentMedications: formData.medications.split(',').map(s => s.trim()).filter(Boolean),
                    planTier: 'free',
                });
                setAuthenticated(true);
                setShowDisclaimerModal(true);
            } else {
                setError('Unexpected response from server.');
                setLoading(false);
            }
        } catch (err) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    };

    const handleDisclaimerAccept = () => {
        acceptDisclaimer();
        setShowDisclaimerModal(false);
        router.push(redirectPath);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {showDisclaimerModal && <DisclaimerModal onAccept={handleDisclaimerAccept} />}

            {/* Left Panel — Brand */}
            <div className="login-left-panel">
                <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, background: '#0EA5A4', opacity: 0.2, filter: 'blur(80px)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -60, right: -60, width: 250, height: 250, background: '#6366F1', opacity: 0.15, filter: 'blur(60px)', borderRadius: '50%' }} />
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
                    <Image src="/logo.png" alt="Chikitsak" width={200} height={48} style={{ borderRadius: 12, marginBottom: 28, objectFit: 'contain' }} />
                    <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
                        Join Chikitsak AI
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 32 }}>
                        Create your account to get AI-powered health insights, symptom analysis, and personalized guidance.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {['End-to-End Encrypted', 'HIPAA-Compliant Architecture', 'Your Data Never Sold'].map(item => (
                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500 }}>
                                <Shield size={16} color="#4ADE80" /> {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 40px', background: 'white', overflowY: 'auto' }}>
                <div style={{ maxWidth: 520, width: '100%' }}>
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Create Account</h1>
                        <p style={{ color: '#64748B', fontSize: 15 }}>
                            {step === 1 ? 'Fill in your details to get started.' : 'Help us personalize your experience.'}
                        </p>
                        {/* Step indicator */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            {[1, 2].map(s => (
                                <div key={s} style={{
                                    flex: 1, height: 4, borderRadius: 2,
                                    background: step >= s ? 'linear-gradient(90deg, #0EA5A4, #4F46E5)' : '#E2E8F0',
                                    transition: 'background 0.3s',
                                }} />
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {step === 1 && (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <FormField label="Full Name" name="name" icon={<User size={18} />} value={formData.name} onChange={handleInputChange} error={fieldErrors.name} placeholder="John Doe" />
                                    <FormField label="Age" name="age" type="number" icon={<Activity size={18} />} value={formData.age} onChange={handleInputChange} error={fieldErrors.age} placeholder="30" />
                                </div>
                                <FormSelect label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} error={fieldErrors.gender}
                                    options={[{ value: '', label: 'Select Gender' }, { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <FormField label="City" name="city" icon={<MapPin size={18} />} value={formData.city} onChange={handleInputChange} error={fieldErrors.city} placeholder="Mumbai" />
                                    <FormField label="Country" name="country" icon={<Globe size={18} />} value={formData.country} onChange={handleInputChange} error={fieldErrors.country} placeholder="India" />
                                </div>
                                <FormField label="Email Address" name="email" type="email" icon={<Mail size={18} />} value={formData.email} onChange={handleInputChange} error={fieldErrors.email} placeholder="you@example.com" />
                                <div>
                                    <FormField label="Password" name="password" type={showPassword ? 'text' : 'password'} icon={<Lock size={18} />} value={formData.password} onChange={handleInputChange} error={fieldErrors.password} placeholder="••••••••"
                                        rightAction={<button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
                                    {formData.password && (
                                        <div style={{ marginTop: 8 }}>
                                            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= passwordStrength.score ? passwordStrength.color : '#E2E8F0', transition: 'background 0.2s' }} />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: 11, color: passwordStrength.color, fontWeight: 600 }}>{passwordStrength.label}</span>
                                        </div>
                                    )}
                                </div>
                                <FormField label="Confirm Password" name="confirmPassword" type={showPassword ? 'text' : 'password'} icon={<Lock size={18} />} value={formData.confirmPassword} onChange={handleInputChange} error={fieldErrors.confirmPassword} placeholder="••••••••" />

                                {error && <ErrorBanner message={error} />}

                                <button type="button" onClick={handleNext} className="btn-gradient" style={{ marginTop: 4 }}>
                                    Next: Personalize <ArrowRight size={18} />
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div style={{ background: '#F0FDFA', padding: 14, borderRadius: 12, fontSize: 13, color: '#0F766E', lineHeight: 1.6 }}>
                                    ⚡ Providing this information helps our AI give significantly better health insights. These fields are optional.
                                </div>
                                <FormField label="Existing Conditions (Optional)" name="conditions" icon={<Activity size={18} />} value={formData.conditions} onChange={handleInputChange} placeholder="e.g. Diabetes, Hypertension, Asthma" />
                                <FormField label="Current Medications (Optional)" name="medications" icon={<Pill size={18} />} value={formData.medications} onChange={handleInputChange} placeholder="e.g. Metformin 500mg, Paracetamol" />

                                <div onClick={() => setDisclaimerChecked(!disclaimerChecked)} style={{
                                    display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer',
                                    padding: 14, background: 'white', borderRadius: 12, border: '1px solid #E2E8F0',
                                }}>
                                    <div style={{ marginTop: 2, color: disclaimerChecked ? '#0EA5A4' : '#94A3B8', flexShrink: 0 }}>
                                        {disclaimerChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
                                        I understand that Chikitsak is an AI tool for educational purposes only and does not replace professional medical advice. I agree to the <Link href="/terms" style={{ color: '#0EA5A4' }}>Terms</Link> and <Link href="/privacy" style={{ color: '#0EA5A4' }}>Privacy Policy</Link>.
                                    </div>
                                </div>

                                {error && <ErrorBanner message={error} />}

                                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                    <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: 13, borderRadius: 12, background: '#F1F5F9', color: '#475569', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 15 }}>
                                        Back
                                    </button>
                                    <button type="submit" disabled={loading || !disclaimerChecked} className="btn-gradient" style={{ flex: 2, opacity: (!disclaimerChecked || loading) ? 0.6 : 1 }}>
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>

                    <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#64748B' }}>
                        Already have an account? <Link href={`/login?redirect=${redirectPath}`} style={{ color: '#0EA5A4', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Reusable Form Field ─────────────────────── */
function FormField({ label, name, type = 'text', icon, value, onChange, error, placeholder, rightAction }: {
    label: string; name: string; type?: string; icon?: React.ReactNode; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string; placeholder?: string; rightAction?: React.ReactNode;
}) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>{label}</label>
            <div style={{ position: 'relative' }}>
                {icon && <div style={{ position: 'absolute', left: 14, top: 14, color: '#94A3B8', display: 'flex' }}>{icon}</div>}
                <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
                    style={{
                        width: '100%', padding: icon ? '12px 12px 12px 44px' : '12px 14px', borderRadius: 12,
                        border: `1px solid ${error ? '#EF4444' : '#E2E8F0'}`, fontSize: 15, outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0EA5A4'}
                    onBlur={(e) => e.target.style.borderColor = error ? '#EF4444' : '#E2E8F0'}
                />
                {rightAction}
            </div>
            {error && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4, display: 'block' }}>{error}</span>}
        </div>
    );
}

function FormSelect({ label, name, value, onChange, error, options }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; error?: string;
    options: { value: string; label: string }[];
}) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>{label}</label>
            <select name={name} value={value} onChange={onChange}
                style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: `1px solid ${error ? '#EF4444' : '#E2E8F0'}`, fontSize: 15, outline: 'none',
                    background: 'white', transition: 'border-color 0.2s', color: value ? '#1E293B' : '#94A3B8',
                }}>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {error && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4, display: 'block' }}>{error}</span>}
        </div>
    );
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <div style={{
            color: '#EF4444', fontSize: 13, textAlign: 'center',
            padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA',
        }}>
            {message}
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>Loading...</div>}>
            <SignupForm />
        </Suspense>
    );
}
