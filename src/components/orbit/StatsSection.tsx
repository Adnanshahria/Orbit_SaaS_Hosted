import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { useLang } from '@/contexts/LanguageContext';

const DEFAULT_STATS = [
    { value: 24, suffix: '+', label: 'Live Projects' },
    { value: 5, suffix: '+', label: 'Countries' },
    { value: 120, suffix: '+', label: 'Users Served' },
    { value: 3, suffix: '+', label: 'Years Experience' },
];

const BN_LABELS = ['লাইভ প্রজেক্ট', 'দেশ', 'ব্যবহারকারী', 'বছরের অভিজ্ঞতা'];

function AnimatedCounter({ target, active }: { target: number; active: boolean }) {
    const [count, setCount] = useState(0);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!active) return;
        hasAnimated.current = true;
        let start = 0;
        const step = Math.max(1, Math.ceil(target / 60));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [active, target]);

    return <span>{count}</span>;
}

export function StatsSection() {
    const { content } = useContent();
    const { lang } = useLang();
    const ref = useRef(null);
    const inView = useInView(ref, { margin: '-10px' });
    const [isScrolled, setIsScrolled] = useState(false);

    // Show only when user starts scrolling
    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY > 200) {
                setIsScrolled(true);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const enStats = (content.en as any).stats;
    const bnStats = (content.bn as any).stats;
    const statsData = lang === 'bn' && bnStats ? bnStats : enStats;

    const items = statsData?.items && statsData.items.length === 4
        ? statsData.items
        : DEFAULT_STATS.map((d, i) => ({
            ...d,
            label: lang === 'bn' ? BN_LABELS[i] : d.label,
        }));

    const show = isScrolled && inView;

    return (
        <div ref={ref} className={`py-3 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-[100] transition-all duration-700 ease-out ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 max-w-4xl mx-auto">
                {items.map((stat: any, i: number) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
                        className="rounded-xl px-3 py-3 sm:px-4 sm:py-4 border border-transparent text-center relative overflow-hidden group hover:scale-[1.03] transition-transform duration-300"
                        style={{
                            background: 'linear-gradient(#0a0a12, #0a0a12) padding-box, linear-gradient(135deg, #10b981, #f59e0b, #10b981) border-box',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: 'transparent',
                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.05)',
                        }}
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/5 to-amber-500/5 pointer-events-none" />
                        <div className="relative z-10">
                            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tabular-nums">
                                <AnimatedCounter target={Number(stat.value) || 0} active={show} />
                                <span className="text-primary">{stat.suffix || '+'}</span>
                            </span>
                            <p className="text-[9px] sm:text-[11px] font-semibold tracking-wider opacity-70 uppercase text-muted-foreground mt-1">
                                {stat.label}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
