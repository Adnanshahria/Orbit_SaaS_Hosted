import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Type, ShoppingCart, Users, FolderOpen,
    MessageCircle, Globe, Shield, LogOut, Menu, X,
    Lightbulb, Phone, FileText, Cpu
} from 'lucide-react';

const navItems = [
    { label: 'Hero', path: '/admin/hero', icon: Type },
    { label: 'Services', path: '/admin/services', icon: ShoppingCart },
    { label: 'Tech Stack', path: '/admin/tech-stack', icon: Cpu },
    { label: 'Why Us', path: '/admin/why-us', icon: Lightbulb },
    { label: 'Projects', path: '/admin/projects', icon: FolderOpen },
    { label: 'Leadership', path: '/admin/leadership', icon: Users },
    { label: 'Contact', path: '/admin/contact', icon: Phone },
    { label: 'Footer', path: '/admin/footer', icon: FileText },
    { label: 'Chatbot', path: '/admin/chatbot', icon: MessageCircle },
    { label: 'Navbar', path: '/admin/navbar', icon: Globe },
    { label: 'SEO', path: '/admin/seo', icon: Shield },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) navigate('/admin/login');
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                        <span className="font-display font-bold text-foreground">Admin Panel</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`
                            }
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-border space-y-1">
                    <a
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        View Site
                    </a>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-h-screen">
                {/* Top bar (mobile) */}
                <div className="lg:hidden sticky top-0 z-30 bg-card/90 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="text-foreground cursor-pointer">
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-display font-bold text-foreground text-sm">Admin Panel</span>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 sm:p-6 lg:p-8 max-w-4xl"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}
