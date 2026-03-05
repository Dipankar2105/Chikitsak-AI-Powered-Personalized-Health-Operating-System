'use client';

import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutDashboard, Bot, Brain, Apple, BookOpen, Stethoscope, ImageIcon, Sparkles, Pill,
    MapPin, FolderHeart, Settings, Users,
    ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';

const menuItems = [
    { key: 'dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
    { key: 'symptoms', icon: Stethoscope, path: '/app/symptoms' },
    { key: 'medications', icon: Pill, path: '/app/medications' },
    { key: 'workspace', icon: Bot, path: '/app/workspace' },
    { key: 'imageAnalysis', icon: ImageIcon, path: '/app/image-analysis' },
    { key: 'healthTwin', icon: Sparkles, path: '/app/health-twin' },
    { key: 'mentalHealth', icon: Brain, path: '/app/mental-health' },
    { key: 'nutrition', icon: Apple, path: '/app/nutrition' },
    { key: 'conditions', icon: BookOpen, path: '/app/conditions' },
    { key: 'locationHealth', icon: MapPin, path: '/app/location-health' },
    { key: 'population', icon: Users, path: '/app/population' },
    { key: 'myHealth', icon: FolderHeart, path: '/app/records' },
    { key: 'settings', icon: Settings, path: '/app/settings' },
];

export default function Sidebar() {
    const { t } = useTranslation();
    const { sidebarCollapsed, collapseSidebar, expandSidebar, setActivePage, clearAuth } = useAppStore();
    const router = useRouter();
    const pathname = usePathname();

    const handleNav = (key: string, path: string) => {
        setActivePage(key);
        if (key === 'workspace') {
            collapseSidebar();
        }
        router.push(path);
    };

    const width = sidebarCollapsed ? 70 : 240;

    return (
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ width }}>

            {/* Sidebar Toggle/Branding (Minimal) */}
            <div style={{
                height: 72, display: 'flex', alignItems: 'center',
                padding: sidebarCollapsed ? '0 12px' : '0 20px',
                borderBottom: '1px solid #F1F5F9',
                justifyContent: 'center'
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, #0EA5A4, #2563EB)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: 20
                }}>
                    C
                </div>
            </div>

            {/* Navigation */}
            <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                    return (
                        <button
                            key={item.key}
                            onClick={() => handleNav(item.key, item.path)}
                            className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                            style={{
                                padding: sidebarCollapsed ? '11px 0' : '11px 14px',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                            }}
                        >
                            {isActive && <div className="active-bar" />}
                            <Icon size={19} />
                            {!sidebarCollapsed && (
                                <span style={{ whiteSpace: 'nowrap' }}>
                                    {t(`sidebar.${item.key}`)}
                                </span>
                            )}
                            {sidebarCollapsed && (
                                <span className="sidebar-tooltip">
                                    {t(`sidebar.${item.key}`)}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Bottom Controls */}
            <div style={{ padding: '10px 8px', borderTop: '1px solid #F1F5F9' }}>
                <button
                    onClick={() => sidebarCollapsed ? expandSidebar() : collapseSidebar()}
                    style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        gap: 10, padding: '10px 14px', borderRadius: 12,
                        border: 'none', cursor: 'pointer', background: '#F8FAFC',
                        color: '#94A3B8', fontSize: 12, fontWeight: 500, marginBottom: 4,
                    }}
                >
                    {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    {!sidebarCollapsed && 'Collapse'}
                </button>
                <button
                    onClick={() => { clearAuth(); router.push('/'); }}
                    style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        gap: 10, padding: '10px 14px', borderRadius: 12,
                        border: 'none', cursor: 'pointer', background: 'transparent',
                        color: '#EF4444', fontSize: 12, fontWeight: 500,
                    }}
                >
                    <LogOut size={16} />
                    {!sidebarCollapsed && 'Logout'}
                </button>
            </div>
        </aside>
    );
}
