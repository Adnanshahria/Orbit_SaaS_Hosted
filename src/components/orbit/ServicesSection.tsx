import { motion, useInView } from 'framer-motion';
import { Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud, Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase, Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette } from 'lucide-react';
import { useRef } from 'react';
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
  const titleColor = (t.services as any).titleColor || '#ffffff';
  const subtitleColor = (t.services as any).subtitleColor || '#94a3b8';
  const cardBg = (t.services as any).cardBg || 'rgba(15, 23, 42, 0.45)';
  const cardBorder = (t.services as any).cardBorder || 'rgba(255, 255, 255, 0.08)';
  const iconColor = (t.services as any).iconColor || '#6c5ce7';

  const subtitle = t.services.subtitle || '';
  const words = subtitle.split(' ');

  return (
    <section id="services" className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(108,92,231,0.08),transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative" ref={ref}>
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: -16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight"
            style={{ color: titleColor }}
          >
            {t.services.title}
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg max-w-xl mx-auto flex flex-wrap justify-center gap-x-[0.3em]"
            style={{ color: subtitleColor }}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.services.items.map((item: any, i: number) => {
            // Dynamic icon: use stored icon name, fall back to cycling default
            const Icon = (item.icon && ICON_MAP[item.icon]) ? ICON_MAP[item.icon] : DEFAULT_ICONS[i % DEFAULT_ICONS.length];
            const accent = item.color || iconColor;
            const bg = item.bg || cardBg;
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
                className="relative rounded-2xl p-6 sm:p-7 group cursor-default border overflow-hidden transition-shadow duration-300"
                style={{
                  backgroundColor: bg,
                  borderColor: border,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 30% 0%, ${accent}12, transparent 60%)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon + Title Row */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${accent}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>

                    <h3 className="font-display text-[1.05rem] font-bold text-foreground leading-snug pt-2">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed opacity-75 group-hover:opacity-100 transition-opacity duration-300 pl-0">
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
    </section>
  );
}
