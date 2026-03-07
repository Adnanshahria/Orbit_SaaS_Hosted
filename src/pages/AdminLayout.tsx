import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import {
    LayoutDashboard, Type, ShoppingCart, Users, FolderOpen,
    MessageCircle, Globe, Shield, LogOut, Menu, PanelLeftClose, PanelLeft,
    Lightbulb, Phone, FileText, Cpu, CloudUpload, Loader2, Link as LinkIcon,
    Database, Mail, BarChart3, Star, Trash2, CheckCircle2, XCircle, Bell
} from 'lucide-react';

const navItems = [
    { label: 'Hero', path: '/admin/hero', icon: Type },
    { label: 'Stats', path: '/admin/stats', icon: BarChart3 },
    { label: 'Services', path: '/admin/services', icon: ShoppingCart },
    { label: 'Tech Stack', path: '/admin/tech-stack', icon: Cpu },
    { label: 'Why Us', path: '/admin/why-us', icon: Lightbulb },
    { label: 'Projects', path: '/admin/project', icon: FolderOpen },
    { label: 'Leadership', path: '/admin/leadership', icon: Users },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Contact', path: '/admin/contact', icon: Phone },
    { label: 'Footer', path: '/admin/footer', icon: FileText },
    { label: 'Legal Pages', path: '/admin/legal', icon: Shield },
    { label: 'Chatbot', path: '/admin/chatbot', icon: MessageCircle },
    { label: 'Links', path: '/admin/links', icon: LinkIcon },
    { label: 'Navbar', path: '/admin/navbar', icon: Globe },
    { label: 'SEO', path: '/admin/seo', icon: Shield },
    { label: 'Leads', path: '/admin/leads', icon: Mail },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Backup', path: '/admin/backup', icon: Database },
];

// Progress toast renderer
function ProgressToast({ progress, label, color, doneMessage }: { progress: number; label: string; color: string; doneMessage?: string }) {
    const pct = Math.round(progress);
    const isDone = pct >= 100;
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color }} />}
                    {isDone && doneMessage ? doneMessage : label}
                </span>
                <span className="text-muted-foreground font-mono text-xs">{pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                        boxShadow: `0 0 8px ${color}66`,
                    }}
                />
            </div>
        </div>
    );
}

export default function AdminLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
    const [publishing, setPublishing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    // Read NDJSON stream and update toast with real progress
    const readProgressStream = useCallback(async (
        response: Response,
        toastId: string | number,
        color: string,
        fallbackLabel: string,
    ) => {
        const reader = response.body?.getReader();
        if (!reader) return null;

        const decoder = new TextDecoder();
        let buffer = '';
        let lastData: any = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // keep incomplete line in buffer

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const data = JSON.parse(line);
                    lastData = data;
                    const isDone = data.progress >= 100;
                    const doneMsg = isDone ? data.status : undefined;
                    toast.custom(
                        () => <ProgressToast progress={data.progress} label={data.status || fallbackLabel} color={color} doneMessage={doneMsg} />,
                        { id: toastId, duration: isDone ? 4000 : Infinity }
                    );
                } catch {
                    // skip bad lines
                }
            }
        }

        return lastData;
    }, []);

    const handlePublishCache = async () => {
        setPublishing(true);
        const toastId = toast.custom(
            () => <ProgressToast progress={0} label="Connecting..." color="#10b981" />,
            { duration: Infinity }
        );
        try {
            const token = localStorage.getItem('admin_token');
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_BASE}/api/admin?action=cache`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                toast.custom(
                    () => (
                        <div className="flex items-center gap-2 text-sm">
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span>Session expired. Please log in again.</span>
                        </div>
                    ),
                    { id: toastId, duration: 4000 }
                );
                handleLogout();
                return;
            }

            if (!res.ok) throw new Error('Cache publish failed');

            // Read the NDJSON stream — toast updates happen inside
            await readProgressStream(res, toastId, '#10b981', 'Publishing cache...');
        } catch (err) {
            console.error(err);
            toast.custom(
                () => (
                    <div className="flex items-center gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Failed to publish cache</span>
                    </div>
                ),
                { id: toastId, duration: 4000 }
            );
        } finally {
            setPublishing(false);
        }
    };

    const handleDeleteCache = async () => {
        if (!confirm('Are you sure you want to delete all cached content? The site will fall back to live DB queries until republished.')) return;
        setDeleting(true);
        const toastId = toast.custom(
            () => <ProgressToast progress={0} label="Connecting..." color="#f59e0b" />,
            { duration: Infinity }
        );
        try {
            const token = localStorage.getItem('admin_token');
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_BASE}/api/admin?action=cache`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                toast.custom(
                    () => (
                        <div className="flex items-center gap-2 text-sm">
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span>Session expired. Please log in again.</span>
                        </div>
                    ),
                    { id: toastId, duration: 4000 }
                );
                handleLogout();
                return;
            }

            if (!res.ok) throw new Error('Cache delete failed');

            await readProgressStream(res, toastId, '#f59e0b', 'Deleting cache...');
        } catch (err) {
            console.error(err);
            toast.custom(
                () => (
                    <div className="flex items-center gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Failed to delete cache</span>
                    </div>
                ),
                { id: toastId, duration: 4000 }
            );
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) navigate('/admin/login');
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-[100dvh] bg-background flex overflow-x-hidden">
            <Toaster position="top-right" theme="dark" richColors closeButton />
            <Helmet>
                <title>Admin Panel | Orbit SaaS</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-[100dvh] w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                        <span className="font-display font-bold text-foreground">Admin Panel</span>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setSidebarOpen(false);
                        }}
                        className="p-2 -mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 active:bg-secondary transition-colors lg:hidden relative z-50 flex items-center justify-center cursor-pointer"
                        aria-label="Collapse sidebar"
                        title="Collapse sidebar"
                    >
                        <PanelLeftClose className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 1024) setSidebarOpen(false);
                            }}
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
                    <button
                        onClick={handlePublishCache}
                        disabled={publishing}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors w-full cursor-pointer disabled:opacity-50"
                    >
                        {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                        {publishing ? 'Publishing...' : 'Publish Cache'}
                    </button>
                    <button
                        onClick={handleDeleteCache}
                        disabled={deleting}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-500 hover:bg-amber-500/10 transition-colors w-full cursor-pointer disabled:opacity-50"
                    >
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {deleting ? 'Deleting...' : 'Delete Cache'}
                    </button>
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
            <main className="flex-1 min-h-[100dvh] w-full lg:pl-64 flex flex-col relative z-10">
                {/* Mobile Top Bar (Fixed) */}
                <div className="sticky top-0 left-0 w-full z-30 bg-card/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between lg:hidden shadow-sm">
                    <div className="flex items-center gap-3 relative z-10">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSidebarOpen(true);
                            }}
                            className="p-2 -ml-2 rounded-lg text-foreground bg-secondary/30 hover:bg-secondary/80 active:bg-secondary transition-colors relative z-20 cursor-pointer flex items-center justify-center pointer-events-auto"
                            aria-label="Expand sidebar"
                            title="Expand sidebar"
                        >
                            <Menu className="w-6 h-6 pointer-events-none" />
                        </button>
                        <span className="font-display font-bold text-foreground text-lg pointer-events-none">Admin Panel</span>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 sm:p-5 lg:p-8 max-w-[1200px] mx-auto w-full relative z-0 flex-1"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}
