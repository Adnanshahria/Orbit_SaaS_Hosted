import { motion, useInView } from 'framer-motion';
import React, { useRef } from 'react';
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
  const inView = useInView(ref, { once: false, margin: '-80px' });

  return (
    <section id="why-us" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,245,255,0.05),transparent_70%)]" />
      <div className="max-w-6xl mx-auto relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-[clamp(1.8rem,3vw,2.4rem)] font-bold text-foreground mb-3">
            {t.whyUs.title.split('ORBIT').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && <span className="text-[#6366f1]">ORBIT</span>}
              </React.Fragment>
            ))}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">{t.whyUs.subtitle}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full"
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
                className={`bg-card border ${borderColor} rounded-2xl p-5 sm:pt-9 sm:px-7 sm:pb-8 text-center transition-all duration-300 group`}
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
    </section>
  );
}
