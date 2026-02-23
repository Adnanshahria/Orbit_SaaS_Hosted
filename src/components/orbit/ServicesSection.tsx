import { motion, useInView } from 'framer-motion';
import { Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud, Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase, Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
  Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
  Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette
};
const DEFAULT_ICONS = [Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket];

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: 'blur(8px)',
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 18,
      delay: i * 0.1,
    },
  }),
};

export function ServicesSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-60px' });

  // Theme from admin
  const titleColor = (t.services as any).titleColor || '';
  const subtitleColor = (t.services as any).subtitleColor || '';
  const cardBorder = (t.services as any).cardBorder || '';
  const iconColor = (t.services as any).iconColor || '#6c5ce7';

  // Dark mode detection to prevent bright pastel colors from blinding users in dark mode
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    // Check initial state
    setIsDark(document.documentElement.classList.contains('dark'));

    // Listen for changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const subtitle = t.services.subtitle || '';
  const words = subtitle.split(' ');

  return (
    <section id="services" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(108,92,231,0.08),transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative" ref={ref}>
        <div className="rounded-3xl border-2 border-neon-purple/30 bg-white/[0.02] backdrop-blur-xl px-8 sm:px-14 py-12 sm:py-20 shadow-[0_0_40px_rgba(108,92,231,0.08)]">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <motion.h2
              initial={{ opacity: 0, y: -16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-foreground"
              style={titleColor ? { color: titleColor } : undefined}
            >
              {t.services.title}
            </motion.h2>

            <motion.p
              className="text-base sm:text-lg max-w-xl mx-auto flex flex-wrap justify-center gap-x-[0.3em] text-muted-foreground"
              style={subtitleColor ? { color: subtitleColor } : undefined}
            >
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.35,
                    delay: 0.25 + i * 0.035,
                    ease: 'easeOut',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {t.services.items.map((item: any, i: number) => {
              const Icon = (item.icon && ICON_MAP[item.icon]) ? ICON_MAP[item.icon] : DEFAULT_ICONS[i % DEFAULT_ICONS.length];
              const accent = item.color || iconColor;
              const bg = item.bg || '';
              const border = item.border || cardBorder;

              return (
                <motion.article
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  whileHover={{
                    y: -4,
                    transition: { type: 'spring', stiffness: 400, damping: 25 },
                  }}
                  className={`relative rounded-2xl p-4 sm:p-7 group cursor-default border-2 overflow-hidden transition-shadow duration-300 flex flex-col bg-card/60 backdrop-blur-md hover:border-primary/50`}
                  style={{
                    borderColor: border?.startsWith('border-') ? undefined : (border || 'rgba(108, 92, 231, 0.4)'),
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 30% 0%, ${accent}18, transparent 65%)`,
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center h-full">
                    {/* Icon */}
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 mb-3 sm:mb-4"
                      style={{ backgroundColor: `${accent}15` }}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: accent }} />
                    </div>

                    {/* Title Row */}
                    <h3 className="font-display text-[0.95rem] sm:text-[1.1rem] font-bold text-foreground leading-snug mb-3">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-[0.8rem] sm:text-[0.85rem] leading-[1.6] opacity-85 sm:opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                      {item.desc}
                    </p>
                  </div>

                  {/* Subtle bottom accent line */}
                  <div
                    className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                    style={{ backgroundColor: accent }}
                  />
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
