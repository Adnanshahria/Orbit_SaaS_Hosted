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
    // Simple inView check — no scroll listener needed
    const inView = useInView(ref, { margin: '-10px' });

    const enStats = (content.en as any).stats;
    const bnStats = (content.bn as any).stats;
    const statsData = lang === 'bn' && bnStats ? bnStats : enStats;

    const items = statsData?.items && statsData.items.length === 4
        ? statsData.items
        : DEFAULT_STATS.map((d, i) => ({
            ...d,
            label: lang === 'bn' ? BN_LABELS[i] : d.label,
        }));

    return (
        <div ref={ref} className="py-2 sm:py-4 px-4 sm:px-6 relative z-[100] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="pointer-events-none rounded-2xl sm:rounded-full px-4 sm:px-6 py-3 sm:py-2.5 border border-transparent relative overflow-hidden"
                style={{
                    background: 'linear-gradient(#0a0a12, #0a0a12) padding-box, linear-gradient(135deg, #10b981, #f59e0b, #10b981) border-box',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'transparent',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.08), 0 0 40px rgba(245, 158, 11, 0.05)',
                }}
            >
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 whitespace-nowrap">
                    {items.map((stat: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 sm:gap-3 justify-center sm:justify-start">
                            {i !== 0 && <span className="text-white/50 text-[8px] sm:text-[10px]">✦</span>}
                            <div className="flex items-center gap-1 sm:gap-1.5">
                                <span className="text-sm sm:text-base font-bold text-foreground font-poppins tabular-nums">
                                    <AnimatedCounter target={Number(stat.value) || 0} active={inView} />
                                    <span className="text-primary">{stat.suffix || '+'}</span>
                                </span>
                                <span className="text-[10px] sm:text-xs font-medium tracking-wide opacity-80 uppercase text-muted-foreground">
                                    {stat.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
