import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/contexts/LanguageContext';

export function LeadMagnetPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const { lang } = useLang();

    useEffect(() => {
        // Only show once per session
        if (sessionStorage.getItem('leadMagnetDismissed')) return;

        // 1. Time-based trigger (15 seconds)
        const timerId = setTimeout(() => {
            if (!sessionStorage.getItem('leadMagnetDismissed')) {
                setIsOpen(true);
            }
        }, 15000);

        // 2. Exit-intent trigger
        const handleMouseLeave = (e: MouseEvent) => {
            // If cursor moves above the top of the viewport
            if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
                if (!sessionStorage.getItem('leadMagnetDismissed')) {
                    setIsOpen(true);
                }
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            clearTimeout(timerId);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('leadMagnetDismissed', 'true');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            toast.error(lang === 'bn' ? 'দয়া করে সঠিক ইমেইল দিন' : 'Please enter a valid email address');
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch('/api/submit-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'Exit Intent Popup' })
            });

            if (res.ok) {
                setStatus('success');
                toast.success(
                    lang === 'bn'
                        ? 'ধন্যবাদ! আপনি ওয়েটলিস্টে যুক্ত হয়েছেন।'
                        : 'Thank you! You have joined the waitlist.'
                );
                setTimeout(handleClose, 3000);
            } else {
                throw new Error('Failed to submit');
            }
        } catch (err) {
            console.error(err);
            toast.error(lang === 'bn' ? 'দুঃখিত, আবার চেষ্টা করুন' : 'Something went wrong. Please try again.');
            setStatus('idle');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] bg-background/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 z-[260] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors z-10 p-1 bg-background/50 rounded-full cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Gradient Header Pattern */}
                        <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,198,255,0.1),transparent_50%)]" />
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                        </div>

                        <div className="px-6 pb-8 pt-0 relative z-10 -mt-12 text-center">
                            <div className="w-20 h-20 mx-auto bg-card border border-border shadow-lg rounded-2xl flex items-center justify-center mb-5 relative group">
                                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                                <BookOpen className="w-10 h-10 text-primary relative z-10" />
                            </div>

                            <h2 className="font-display text-2xl font-bold mb-2">
                                {lang === 'bn' ? 'ওয়েটলিস্টে যুক্ত হোন' : 'Join The Waitlist'}
                            </h2>
                            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                {lang === 'bn'
                                    ? 'আমাদের এক্সক্লুসিভ আপডেটের জন্য ওয়েটলিস্টে যুক্ত হোন।'
                                    : 'Join our exclusive waitlist to get early access and modern AI insights.'
                                }
                            </p>

                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl p-4 font-semibold flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    {lang === 'bn' ? 'যুক্ত হওয়া সম্পন্ন হয়েছে!' : 'Successfully joined!'}
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                    <input
                                        type="email"
                                        required
                                        placeholder={lang === 'bn' ? 'আপনার সেরা ইমেইল' : 'Enter your best email address'}
                                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-center"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={status === 'loading'}
                                    />
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(0,198,255,0.3)] disabled:opacity-50 cursor-pointer"
                                    >
                                        {status === 'loading' ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {lang === 'bn' ? 'ওয়েটলিস্টে যুক্ত হোন' : 'Join Waitlist'}
                                                <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[10px] text-muted-foreground mt-2">
                                        {lang === 'bn' ? 'আমরা স্প্যাম করি না। শুধুমাত্র প্রয়োজনীয় আপডেট।' : '100% free. No spam. Unsubscribe anytime.'}
                                    </p>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
