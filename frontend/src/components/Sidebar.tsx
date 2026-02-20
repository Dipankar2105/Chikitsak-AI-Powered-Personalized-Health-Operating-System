'use client';

import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutDashboard, Bot, Brain, Apple, BookOpen,
    MapPin, FolderHeart, Settings,
    ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';

const menuItems = [
    { key: 'dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
    { key: 'workspace', icon: Bot, path: '/app/workspace' },
    { key: 'mentalHealth', icon: Brain, path: '/app/mental-health' },
    { key: 'nutrition', icon: Apple, path: '/app/nutrition' },
    { key: 'conditions', icon: BookOpen, path: '/app/conditions' },
    { key: 'locationHealth', icon: MapPin, path: '/app/location-health' },
    { key: 'myHealth', icon: FolderHeart, path: '/app/records' },
    { key: 'settings', icon: Settings, path: '/app/settings' },
];

export default function Sidebar() {
    const { t } = useTranslation();
    const { sidebarCollapsed, collapseSidebar, expandSidebar, setActivePage, setAuthenticated } = useAppStore();
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

            {/* Logo */}
            <div style={{
                height: 64, display: 'flex', alignItems: 'center',
                padding: sidebarCollapsed ? '0 16px' : '0 20px',
                borderBottom: '1px solid #F1F5F9', gap: 10,
            }}>
                <Image
                    src="/logo.png"
                    alt="Chikitsak"
                    width={sidebarCollapsed ? 34 : 140}
                    height={34}
                    style={{ borderRadius: 8, flexShrink: 0, objectFit: 'contain' }}
                />
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
                    onClick={() => { setAuthenticated(false); router.push('/'); }}
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
