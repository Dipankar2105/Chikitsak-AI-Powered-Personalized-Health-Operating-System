'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Eye, EyeOff, Lock, Mail, User, MapPin, Globe, Activity, Pill, ArrowRight, Loader2, CheckSquare, Square } from 'lucide-react';
import DisclaimerModal from '@/components/DisclaimerModal';

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuthenticated, setUserProfile, acceptDisclaimer } = useAppStore();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Basic, 2: Personalization
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', age: '', gender: '', city: '', country: 'India',
        conditions: '', medications: ''
    });
    const [disclaimerChecked, setDisclaimerChecked] = useState(false);
    const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

    const redirectPath = searchParams.get('redirect') || '/app/workspace';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API delay
        setTimeout(() => {
            setUserProfile({
                name: formData.name,
                email: formData.email,
                age: Number(formData.age),
                gender: formData.gender as any,
                city: formData.city,
                country: formData.country,
                existingConditions: formData.conditions.split(',').map(s => s.trim()).filter(Boolean),
                currentMedications: formData.medications.split(',').map(s => s.trim()).filter(Boolean)
            });
            setAuthenticated(true);
            setLoading(false);
            setShowDisclaimerModal(true); // Show modal after signup success
        }, 1500);
    };

    const handleDisclaimerAccept = () => {
        acceptDisclaimer();
        setShowDisclaimerModal(false);
        router.push(redirectPath);
    };

    return (
        <div style={{ maxWidth: 500, width: '100%' }}>

            {showDisclaimerModal && <DisclaimerModal onAccept={handleDisclaimerAccept} />}

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Create Account</h1>
                <p style={{ color: '#64748B', fontSize: 16 }}>
                    Join Chikitsak for personalized AI health guidance.
                </p>
            </div>

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label className="input-label">Full Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input required name="name" value={formData.name} onChange={handleInputChange}
                                        placeholder="John Doe" className="input-field" />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Age</label>
                                <div className="input-wrapper">
                                    <Activity size={18} className="input-icon" />
                                    <input required type="number" name="age" value={formData.age} onChange={handleInputChange}
                                        placeholder="30" className="input-field" min="1" max="120" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Gender</label>
                            <div className="input-wrapper">
                                <select required name="gender" value={formData.gender} onChange={handleInputChange} className="input-field" style={{ paddingLeft: 12 }}>
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label className="input-label">City</label>
                                <div className="input-wrapper">
                                    <MapPin size={18} className="input-icon" />
                                    <input required name="city" value={formData.city} onChange={handleInputChange}
                                        placeholder="Mumbai" className="input-field" />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Country</label>
                                <div className="input-wrapper">
                                    <Globe size={18} className="input-icon" />
                                    <input required name="country" value={formData.country} onChange={handleInputChange}
                                        placeholder="India" className="input-field" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                                    placeholder="you@example.com" className="input-field" />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input required type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange}
                                    placeholder="••••••••" className="input-field" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="button" onClick={() => setStep(2)} className="btn-gradient" style={{ marginTop: 8 }}>
                            Next: Personalize <ArrowRight size={18} />
                        </button>
                    </>
                )}

                {/* Step 2: Personalization */}
                {step === 2 && (
                    <>
                        <div style={{ background: '#F0FDFA', padding: 16, borderRadius: 12, marginBottom: 8, fontSize: 14, color: '#0F766E' }}>
                            ⚡ Providing this information helps our AI give significantly better health insights.
                        </div>

                        <div>
                            <label className="input-label">Existing Conditions (Optional)</label>
                            <div className="input-wrapper">
                                <Activity size={18} className="input-icon" />
                                <input name="conditions" value={formData.conditions} onChange={handleInputChange}
                                    placeholder="e.g. Diabetes, Hypertension, Asthma" className="input-field" />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Current Medications (Optional)</label>
                            <div className="input-wrapper">
                                <Pill size={18} className="input-icon" />
                                <input name="medications" value={formData.medications} onChange={handleInputChange}
                                    placeholder="e.g. Metformin 500mg, Paracetamol" className="input-field" />
                            </div>
                        </div>

                        <div
                            onClick={() => setDisclaimerChecked(!disclaimerChecked)}
                            style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', padding: 12, background: 'white', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                            <div style={{ marginTop: 2, color: disclaimerChecked ? '#0EA5A4' : '#94A3B8' }}>
                                {disclaimerChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                            </div>
                            <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
                                I understand that Chikitsak is an AI tool for educational purposes only and does not replace professional medical advice. I agree to the <Link href="/terms" style={{ color: '#0EA5A4' }}>Terms</Link> and <Link href="/privacy" style={{ color: '#0EA5A4' }}>Privacy Policy</Link>.
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: 12, borderRadius: 10, background: '#F1F5F9', color: '#475569', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                Back
                            </button>
                            <button type="submit" disabled={loading || !disclaimerChecked} className="btn-gradient" style={{ flex: 2, opacity: (!disclaimerChecked || loading) ? 0.7 : 1 }}>
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                            </button>
                        </div>
                    </>
                )}

            </form>

            <style jsx>{`
                .input-label { display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 8px; }
                .input-wrapper { position: relative; }
                .input-icon { position: absolute; left: 14px; top: 14px; color: #94A3B8; }
                .input-field { width: 100%; padding: 12px 12px 12px 48px; border-radius: 12px; border: 1px solid #E2E8F0; font-size: 15px; outline: none; transition: border-color 0.2s; }
                .input-field:focus { border-color: #0EA5A4; }
                .password-toggle { position: absolute; right: 14px; top: 14px; background: none; border: none; cursor: pointer; color: #94A3B8; }
                .btn-gradient { width: 100%; padding: 14px; border-radius: 12px; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8; background: linear-gradient(135deg, #0EA5A4, #2563EB); color: white; border: none; cursor: pointer; }
            `}</style>

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 15, color: '#64748B' }}>
                Already have an account? <Link href={`/login?redirect=${redirectPath}`} style={{ color: '#0EA5A4', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#F8FAFC' }}>
            <Suspense fallback={<div style={{ textAlign: 'center', color: '#64748B' }}>Loading Signup...</div>}>
                <SignupForm />
            </Suspense>
        </div>
    );
}
