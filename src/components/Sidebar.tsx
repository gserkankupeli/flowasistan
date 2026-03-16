import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    MessageSquare,
    Phone,
    Users,
    Calendar,
    BarChart3,
    Settings,
    Bell,
    LogOut,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Genel Bakış', href: '/' },
    { icon: MessageSquare, label: 'Chatbot', href: '/chatbot' },
    { icon: Phone, label: 'Sesli Asistan', href: '/voice-agent' },
    { icon: Users, label: 'Müşteriler', href: '/customers' },
    { icon: Calendar, label: 'Takvim', href: '/calendar' },
    { icon: BarChart3, label: 'Raporlar', href: '/reports' },
    { icon: Settings, label: 'Ayarlar', href: '/settings' },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, signOut } = useAuth();

    return (
        <motion.div
            initial={{ width: 256 }}
            animate={{ width: collapsed ? 80 : 256 }}
            className="relative flex h-screen flex-col justify-between border-r border-gray-200 bg-white shadow-xl z-20"
        >
            {/* Collapse Toggle Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-8 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50 transition-colors"
            >
                {collapsed ? <ChevronRight className="h-4 w-4 text-gray-600" /> : <ChevronLeft className="h-4 w-4 text-gray-600" />}
            </button>

            <div>
                {/* Logo Section */}
                <div className="flex h-20 items-center justify-center border-b border-gray-100/50 bg-gradient-to-b from-white to-gray-50/50">
                    {collapsed ? (
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
                            <img src="/logo.svg" alt="FlowAsistan Logo" className="h-6 w-6 object-contain" />
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20">
                                <img src="/logo.svg" alt="FlowAsistan Logo" className="h-6 w-6 object-contain" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                FlowAsistan
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="flex flex-col gap-2 p-4">
                    {sidebarItems.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out',
                                    isActive
                                        ? 'text-blue-600'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active-bg"
                                            className="absolute inset-0 rounded-xl bg-blue-50"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}
                                    <item.icon className={cn("relative z-10 transition-transform duration-300 group-hover:scale-110", collapsed ? "h-6 w-6 mx-auto" : "h-5 w-5")} />
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="relative z-10"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                    {isActive && !collapsed && (
                                        <motion.div
                                            layoutId="sidebar-active-pill"
                                            className="absolute left-0 h-8 w-1 rounded-r-full bg-blue-600"
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Footer Section - With User Info */}
            <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                {!collapsed && user && (
                    <div className="mb-4 flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-gray-900 truncate">
                                {user.user_metadata?.full_name || 'Kullanıcı'}
                            </span>
                            <span className="text-xs text-gray-500 truncate" title={user.email}>
                                {user.email}
                            </span>
                        </div>
                    </div>
                )}

                <NavLink
                    to="/notifications"
                    className={({ isActive }) =>
                        cn(
                            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white hover:shadow-sm',
                            isActive ? 'text-blue-600 bg-white shadow-sm' : 'text-gray-500'
                        )
                    }
                >
                    <Bell className={cn("transition-transform duration-300 group-hover:rotate-12", collapsed ? "h-6 w-6 mx-auto" : "h-5 w-5")} />
                    {!collapsed && <span>Bildirimler</span>}
                </NavLink>

                <button
                    onClick={signOut}
                    className="mt-2 w-full group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className={cn("transition-transform duration-300 group-hover:-translate-x-1", collapsed ? "h-6 w-6 mx-auto" : "h-5 w-5")} />
                    {!collapsed && <span>Çıkış Yap</span>}
                </button>
            </div>
        </motion.div>
    );
}
