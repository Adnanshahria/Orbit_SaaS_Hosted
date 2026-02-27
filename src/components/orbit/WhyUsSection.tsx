import { motion, useInView } from 'framer-motion';
import React, { useRef, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';

import { Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud, Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase, Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette, Brain, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
  Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
  Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette,
  Brain, Wrench
};
const DEFAULT_ICONS = ['Brain', 'Wrench', 'Zap', 'Shield', 'Target', 'Rocket'];

// ─── Falling Icons Background Effect ───
const PARTICLE_COUNT = 22;
const FALL_ICON_NAMES = Object.keys(ICON_MAP);
const FALL_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#22d3ee'];

function FallingIcons() {
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const iconName = FALL_ICON_NAMES[Math.floor(Math.random() * FALL_ICON_NAMES.length)];
      const Icon = ICON_MAP[iconName] || Zap;
      const size = 14 + Math.random() * 18; // 14-32px
      const left = Math.random() * 100;      // 0-100%
      const delay = Math.random() * 12;      // 0-12s stagger
      const duration = 10 + Math.random() * 14; // 10-24s fall time
      const drift = -30 + Math.random() * 60;   // horizontal sway
      const rotation = Math.random() * 360;
      const opacity = 0.06 + Math.random() * 0.1; // very subtle: 0.06-0.16
      const color = FALL_COLORS[Math.floor(Math.random() * FALL_COLORS.length)];

      return { Icon, size, left, delay, duration, drift, rotation, opacity, color, key: i };
    }), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      <style>{`
        @keyframes iconFall {
          0%   { transform: translateY(-60px) translateX(0px) rotate(0deg); opacity: 0; }
          10%  { opacity: var(--particle-opacity); }
          90%  { opacity: var(--particle-opacity); }
          100% { transform: translateY(calc(100vh + 60px)) translateX(var(--drift)) rotate(var(--end-rotation)); opacity: 0; }
        }
      `}</style>
      {particles.map(({ Icon, size, left, delay, duration, drift, rotation, opacity, color, key }) => (
        <div
          key={key}
          className="absolute"
          style={{
            left: `${left}%`,
            top: '-40px',
            animation: `iconFall ${duration}s ${delay}s linear infinite`,
            ['--drift' as any]: `${drift}px`,
            ['--end-rotation' as any]: `${rotation + 180}deg`,
            ['--particle-opacity' as any]: opacity,
          }}
        >
          <Icon
            style={{ width: size, height: size, color, opacity: 1, transform: `rotate(${rotation}deg)` }}
          />
        </div>
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 70,
      damping: 16,
    },
  },
};

export function WhyUsSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="why-us" className="py-10 sm:py-24 px-3 sm:px-6 lg:px-8 relative scroll-mt-12 overflow-hidden">
      {/* Background falling icons */}
      <FallingIcons />


      <div className="w-full mx-auto relative z-10" ref={ref}>
        <div className="rounded-2xl sm:rounded-3xl premium-card bg-white/[0.02] backdrop-blur-xl px-4 sm:px-14 py-5 sm:py-10 shadow-[0_0_40px_rgba(108,92,231,0.08)]">
          <div className="text-center mb-6 sm:mb-10">
            <motion.h2
              className="inline-flex px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-neon-emerald/25 bg-neon-emerald/5 text-[clamp(1.8rem,3vw,2.4rem)] font-bold text-foreground mb-3 flex-wrap justify-center gap-[0.3em]"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.05 },
                },
              }}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              {t.whyUs.title.split(' ').map((word: string, i: number) => {
                const isOrbit = word.includes('ORBIT');
                return (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
                      },
                    }}
                    className={`inline-block ${isOrbit ? 'text-[#6366f1] relative' : ''}`}
                  >
                    {word}
                    {isOrbit && (
                      <motion.div
                        className="absolute -inset-1 bg-[#6366f1]/20 blur-xl rounded-full -z-10"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                        transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                      />
                    )}
                  </motion.span>
                );
              })}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
              className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto"
            >
              {t.whyUs.subtitle}
            </motion.p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full"
          >
            {t.whyUs.items.map((item: any, i: number) => {
              const currentIconName = item.icon || DEFAULT_ICONS[i % DEFAULT_ICONS.length] || 'Zap';
              const CurrentIcon = ICON_MAP[currentIconName] || Zap;
              const accentColor = item.color || '#6366f1';
              const bgColor = item.bg || `${accentColor}10`; // fallback to 10% opacity of accent
              const borderColor = item.border || 'border-border';

              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{
                    y: -4,
                    boxShadow: `0 12px 40px ${accentColor}25`,
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  className={`bg-card/60 backdrop-blur-md premium-card-sub rounded-2xl p-5 sm:pt-9 sm:px-7 sm:pb-8 text-center transition-all duration-300 group`}
                  style={{ backgroundImage: item.bg?.includes('gradient') || item.bg?.includes('url') ? item.bg : undefined }}
                >
                  <div
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 transition-transform group-hover:scale-110 duration-300"
                    style={{
                      backgroundColor: item.bg?.includes('gradient') || item.bg?.includes('url') ? 'transparent' : bgColor,
                      border: `1px solid ${accentColor}30`
                    }}
                  >
                    <CurrentIcon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: accentColor }} />
                  </div>
                  <h3 className="text-[0.95rem] sm:text-[1.05rem] font-bold text-foreground mb-1.5 sm:mb-2.5 leading-tight">{item.title}</h3>
                  <p className="text-[0.75rem] sm:text-[0.875rem] text-muted-foreground leading-[1.5] sm:leading-[1.65]">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
