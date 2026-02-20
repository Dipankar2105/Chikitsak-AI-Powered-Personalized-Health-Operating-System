'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import {
    Menu, X, Globe, ChevronDown, Bell, LogOut, Settings, User, Home,
    Info, Sparkles, LayoutGrid
} from 'lucide-react';

const NAV_LINKS = [
    { key: 'home', href: '/', hash: 'home', icon: Home },
    { key: 'about', href: '/#about', hash: 'about', icon: Info },
    { key: 'features', href: '/#features', hash: 'features', icon: Sparkles },
    { key: 'solutions', href: '/#solutions', hash: 'solutions', icon: LayoutGrid },
];

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { isAuthenticated, userProfile, setAuthenticated, language, setLanguage } = useAppStore();

    const langRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (langRef.current && !langRef.current.contains(event.target as Node)) setLangOpen(false);
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        setLanguage(lang);
        setLangOpen(false);
    };

    const handleLogout = () => {
        setAuthenticated(false);
        router.push('/');
        setProfileOpen(false);
        setMobileOpen(false);
    };

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    const handleNavClick = (e: React.MouseEvent, link: { key: string; href: string; hash: string; icon: any }) => {
        e.preventDefault();
        if (link.hash) {
            // If already on homepage, scroll to section
            if (window.location.pathname === '/') {
                const el = document.getElementById(link.hash);
                if (el) { el.scrollIntoView({ behavior: 'smooth' }); }
            } else {
                // Navigate to home then scroll
                router.push(link.href);
            }
        } else {
            router.push(link.href);
        }
        setMobileOpen(false);
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">

                    {/* ── Left: Logo ── */}
                    <Link href="/" className="navbar-brand">
                        <Image
                            src="/logo.png"
                            alt="Chikitsak"
                            width={160}
                            height={36}
                            style={{ borderRadius: 8, objectFit: 'contain' }}
                            priority
                        />
                    </Link>

                    {/* ── Center: Nav Links ── */}
                    <div className="navbar-center">
                        {NAV_LINKS.map(link => (
                            <a key={link.href} href={link.href} className="navbar-link"
                                onClick={(e) => handleNavClick(e, link)} style={{ cursor: 'pointer' }}>
                                {t(`nav.${link.key}`)}
                            </a>
                        ))}
                    </div>

                    {/* ── Right: Actions ── */}
                    <div className="navbar-right">

                        {/* Language Dropdown */}
                        <div ref={langRef} style={{ position: 'relative' }}>
                            <button
                                className="lang-pill"
                                onClick={() => setLangOpen(!langOpen)}
                            >
                                <Globe size={15} />
                                {currentLang.label}
                                <ChevronDown size={13} style={{
                                    transition: 'transform 0.2s',
                                    transform: langOpen ? 'rotate(180deg)' : 'rotate(0)'
                                }} />
                            </button>

                            {langOpen && (
                                <div className="dropdown-menu" style={{ width: 180, padding: 4 }}>
                                    {LANGUAGES.map(l => (
                                        <button
                                            key={l.code}
                                            className={`dropdown-item ${language === l.code ? 'active' : ''}`}
                                            onClick={() => changeLanguage(l.code)}
                                        >
                                            <span>{l.flag}</span>
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {isAuthenticated ? (
                            <>
                                {/* Notifications */}
                                <div ref={notifRef} style={{ position: 'relative' }}>
                                    <button className="icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                                        <Bell size={20} />
                                        <span className="notif-dot" />
                                    </button>
                                    {notifOpen && (
                                        <div className="dropdown-menu" style={{ width: 300, padding: 0 }}>
                                            <div style={{
                                                padding: '14px 18px', borderBottom: '1px solid #F1F5F9',
                                                fontWeight: 600, fontSize: 14, color: '#0F172A'
                                            }}>
                                                {t('nav.notifications') || 'Notifications'}
                                            </div>
                                            <div style={{
                                                padding: '28px 18px', textAlign: 'center',
                                                color: '#94A3B8', fontSize: 13
                                            }}>
                                                {t('nav.noNotifications') || 'No new notifications'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Dropdown */}
                                <div ref={profileRef} style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        style={{
                                            padding: 0, border: 'none', background: 'transparent',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: 38, height: 38, borderRadius: '50%', overflow: 'hidden',
                                            border: '2px solid #E2E8F0',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                                        }}>
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=0EA5A4&color=fff&bold=true`}
                                                alt="Profile"
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </div>
                                    </button>

                                    {profileOpen && (
                                        <div className="dropdown-menu" style={{ width: 200, padding: 4 }}>
                                            <Link
                                                href="/app/settings"
                                                className="dropdown-item"
                                                onClick={() => setProfileOpen(false)}
                                            >
                                                <Settings size={16} /> {t('settings.title') || 'Settings'}
                                            </Link>
                                            <button className="dropdown-item danger" onClick={handleLogout}>
                                                <LogOut size={16} /> {t('nav.signOut') || 'Sign Out'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <button className="btn-login" onClick={() => router.push('/login')}>
                                    {t('nav.login')}
                                </button>
                                <button className="btn-signup" onClick={() => router.push('/signup')}>
                                    {t('nav.signup')}
                                </button>
                            </>
                        )}

                        {/* Hamburger */}
                        <button className="hamburger-btn" onClick={() => setMobileOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Mobile Nav Overlay ── */}
            {mobileOpen && (
                <>
                    <div className="mobile-nav-overlay open" onClick={() => setMobileOpen(false)} />
                    <div className="mobile-nav-panel">
                        <div className="mobile-nav-header">
                            <Link href="/" className="navbar-brand" onClick={() => setMobileOpen(false)}>
                                <Image src="/logo.png" alt="Chikitsak" width={120} height={32} style={{ borderRadius: 8, objectFit: 'contain' }} />
                            </Link>
                            <button className="icon-btn" onClick={() => setMobileOpen(false)}>
                                <X size={22} />
                            </button>
                        </div>

                        <div className="mobile-nav-body">
                            {NAV_LINKS.map(link => {
                                const Icon = link.icon;
                                return (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="mobile-nav-link"
                                        onClick={(e) => handleNavClick(e, link)}
                                    >
                                        <Icon size={18} color="#64748B" />
                                        {t(`nav.${link.key}`)}
                                    </a>
                                );
                            })}

                            <div style={{
                                height: 1, background: '#F1F5F9',
                                margin: '8px 16px'
                            }} />

                            <div style={{ padding: '8px 16px' }}>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                                    letterSpacing: 1, color: '#94A3B8', marginBottom: 8
                                }}>
                                    {t('nav.language') || 'Language'}
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {LANGUAGES.map(l => (
                                        <button
                                            key={l.code}
                                            onClick={() => changeLanguage(l.code)}
                                            style={{
                                                flex: 1, padding: '9px 0',
                                                borderRadius: 10, border: 'none', cursor: 'pointer',
                                                background: language === l.code ? '#F0FDFA' : '#F8FAFC',
                                                color: language === l.code ? '#0EA5A4' : '#64748B',
                                                fontWeight: language === l.code ? 600 : 500,
                                                fontSize: 12,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {l.flag} {l.code.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mobile-nav-footer">
                            {isAuthenticated ? (
                                <button
                                    className="mobile-nav-link"
                                    style={{ color: '#EF4444' }}
                                    onClick={handleLogout}
                                >
                                    <LogOut size={18} /> {t('nav.signOut') || 'Sign Out'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="btn-signup"
                                        style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
                                        onClick={() => { router.push('/signup'); setMobileOpen(false); }}
                                    >
                                        {t('nav.signup')}
                                    </button>
                                    <button
                                        className="btn-login"
                                        style={{ width: '100%', textAlign: 'center' }}
                                        onClick={() => { router.push('/login'); setMobileOpen(false); }}
                                    >
                                        {t('nav.login')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
