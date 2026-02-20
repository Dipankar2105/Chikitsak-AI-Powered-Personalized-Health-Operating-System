'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SymptomsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <div style={{ minHeight: 'calc(100vh - 70px)', background: '#F8FAFC' }}>
                {children}
            </div>
            <Footer />
        </>
    );
}
