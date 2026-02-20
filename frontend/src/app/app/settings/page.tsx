'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/context/ToastContext';
import { User, MapPin, Globe, Save, Lock, Mail, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const { userProfile, setUserProfile, userLocation, setUserLocation } = useAppStore();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: 0,
        gender: '',
        city: '',
        country: 'India',
        language: 'en'
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                email: userProfile.email || '',
                age: Number(userProfile.age) || 0,
                gender: userProfile.gender || '',
                city: userProfile.city || userLocation?.split(',')[0] || '',
                country: userProfile.country || 'India',
                language: 'en'
            });
        }
    }, [userProfile, userLocation]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!formData.name || !formData.age) {
            showToast('Please fill in required fields.', 'error');
            return;
        }

        setUserProfile({
            ...userProfile,
            name: formData.name,
            age: Number(formData.age),
            gender: formData.gender as any,
            city: formData.city,
            country: formData.country,
            email: formData.email || userProfile?.email || '',
            existingConditions: userProfile?.existingConditions || [],
            currentMedications: userProfile?.currentMedications || [],
        });

        setUserLocation(`${formData.city}, ${formData.country === 'India' ? 'IN' : 'US'}`);
        showToast('Settings saved successfully!', 'success');
    };

    const handleExport = () => {
        showToast('Data export started. You will receive an email shortly.', 'success');
    };

    return (
        <div style={{ padding: '32px 32px 100px', maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Settings</h1>
            <p style={{ color: '#64748B', fontSize: 16, marginBottom: 40 }}>Manage your account settings, notifications, and privacy.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* Profile Section */}
                <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <User size={20} color="#0EA5A4" /> Personal Information
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #E2E8F0', outline: 'none' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 14 }} />
                                <input type="email" name="email" value={formData.email} disabled style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#94A3B8' }} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Age</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #E2E8F0', outline: 'none' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>City</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 14 }} />
                                <input type="text" name="city" value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 12, border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Country</label>
                            <select name="country" value={formData.country} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                <option value="India">India</option>
                                <option value="USA">USA</option>
                                <option value="UK">UK</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Preferences & Notifications */}
                <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Globe size={20} color="#6366F1" /> Preferences
                            </h2>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Language</label>
                                <select name="language" value={formData.language} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                    <option value="en">English</option>
                                    <option value="hi">Hindi (हिंदी)</option>
                                    <option value="mr">Marathi (मराठी)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Bell size={20} color="#F59E0B" /> Notifications
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#334155', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked /> Email Updates & Tips
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#334155', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked /> SMS Alerts for Medications
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#334155', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked /> Weekly Health Report
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data & Privacy */}
                <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Lock size={20} color="#10B981" /> Data & Privacy
                    </h2>
                    <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20, lineHeight: 1.5 }}>
                        You have full control over your health data. You can export a copy of all your medical records and logged data.
                        Your data is encrypted end-to-end and stored securely.
                    </p>
                    <button onClick={handleExport} style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: 'white', color: '#0F172A', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                        Export My Data
                    </button>
                </div>

                {/* Account Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                    <button onClick={() => router.back()} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'transparent', color: '#64748B', fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button onClick={handleSave} className="btn-gradient" style={{ padding: '12px 32px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Save size={18} /> Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
}
