'use client';

import Link from 'next/link';
import Image from 'next/image';

/* Clean SVG social icons */
function TwitterIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.768-6.768M17.5 4l-6.768 6.768" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    );
}

function GitHubIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
        </svg>
    );
}

const SOCIAL_LINKS = [
    { Icon: TwitterIcon, href: '#', label: 'Twitter' },
    { Icon: LinkedInIcon, href: '#', label: 'LinkedIn' },
    { Icon: InstagramIcon, href: '#', label: 'Instagram' },
    { Icon: GitHubIcon, href: '#', label: 'GitHub' },
];

const QUICK_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/#features' },
    { label: 'AI Workspace', href: '/app/workspace' },
    { label: 'Dashboard', href: '/app/dashboard' },
    { label: 'Health Insights', href: '/app/health-insights' },
];

const LEGAL_LINKS = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Medical Disclaimer', href: '/disclaimer' },
    { label: 'Cookie Policy', href: '/cookies' },
];

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-inner">

                {/* Grid */}
                <div className="footer-grid">

                    {/* Brand Column */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Image
                                src="/logo.png"
                                alt="Chikitsak"
                                width={160}
                                height={36}
                                style={{ borderRadius: 8, objectFit: 'contain' }}
                            />
                        </div>
                        <p className="footer-brand-text">
                            Your advanced AI health companion. Providing accessible,
                            accurate, and personalized healthcare guidance for everyone.
                        </p>
                        <div className="footer-social-row">
                            {SOCIAL_LINKS.map(social => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="footer-social-icon"
                                    title={social.label}
                                    aria-label={social.label}
                                >
                                    <social.Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="footer-heading">Quick Links</h3>
                        {QUICK_LINKS.map(link => (
                            <Link key={link.href} href={link.href} className="footer-link">
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="footer-heading">Legal</h3>
                        {LEGAL_LINKS.map(link => (
                            <Link key={link.href} href={link.href} className="footer-link">
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Contact & Support */}
                    <div>
                        <h3 className="footer-heading">Support</h3>
                        <Link href="/contact" className="footer-link">Contact Us</Link>
                        <Link href="/faq" className="footer-link">FAQ</Link>
                        <Link href="/help" className="footer-link">Help Center</Link>
                        <Link href="/feedback" className="footer-link">Feedback</Link>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="footer-disclaimer">
                    <strong>Medical Disclaimer:</strong> Chikitsak is an AI-powered educational tool and does not provide medical diagnosis or treatment. Always consult a qualified healthcare professional. In emergencies, call your local emergency services immediately.
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <span>© 2026 Chikitsak Health AI. All rights reserved.</span>
                    <span>Made with ❤️ for better healthcare</span>
                </div>

            </div>
        </footer>
    );
}
