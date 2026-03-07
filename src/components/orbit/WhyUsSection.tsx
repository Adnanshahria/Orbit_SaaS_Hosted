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

/* ── Reverse marquee keyframes (injected once) ── */
const marqueeReverseStyleId = 'whyus-marquee-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(marqueeReverseStyleId)) {
  const style = document.createElement('style');
  style.id = marqueeReverseStyleId;
  style.textContent = `
    @keyframes marquee-scroll-reverse {
      0%   { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
}

function WhyUsCard({ item, index }: { item: any; index: number }) {
  const currentIconName = item.icon || DEFAULT_ICONS[index % DEFAULT_ICONS.length] || 'Zap';
  const CurrentIcon = ICON_MAP[currentIconName] || Zap;
  const accent = item.color || '#6366f1';

  return (
    <article
      className="relative rounded-xl sm:rounded-2xl p-5 sm:p-8 group cursor-default premium-card-sub overflow-hidden transition-all duration-300 flex flex-col bg-card/60 backdrop-blur-md sm:hover:-translate-y-1 sm:hover:shadow-[0_4px_24px_rgba(16,185,129,0.10)] flex-shrink-0"
      style={{ width: 'clamp(340px, 34vw, 440px)' }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 0%, ${accent}18, transparent 65%)`,
        }}
      />

      {/* Row 1: Icon + Title */}
      <div className="relative z-10 flex items-center gap-3 sm:gap-4 mb-3">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}
        >
          <CurrentIcon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: accent }} />
        </div>
        <h3 className="text-[1rem] sm:text-[1.15rem] font-bold text-foreground leading-snug">
          {item.title}
        </h3>
      </div>

      {/* Row 2: Description — full width */}
      <p className="relative z-10 text-muted-foreground text-[0.8rem] sm:text-[0.85rem] leading-[1.7] opacity-80 group-hover:opacity-100 transition-opacity duration-300">
        {item.desc}
      </p>

      {/* Subtle bottom accent line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-40 transition-opacity duration-500"
        style={{ backgroundColor: accent }}
      />
    </article>
  );
}

export function WhyUsSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const items: any[] = t.whyUs.items;
  const duration = Math.max(items.length * 5, 20);

  return (
    <section id="why-us" className="py-10 sm:py-24 px-3 sm:px-6 lg:px-8 relative scroll-mt-12">

      <div className="w-full mx-auto relative" ref={ref}>
        <div className="rounded-2xl sm:rounded-3xl premium-card bg-white/[0.02] backdrop-blur-xl px-0 sm:px-0 py-5 sm:py-10 shadow-[0_0_40px_rgba(108,92,231,0.08)]">
          <div className="text-center mb-6 sm:mb-10 px-4 sm:px-14">
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
                    className={`inline-block ${isOrbit ? 'text-[#6366f1]' : ''}`}
                  >
                    {word}
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

          {/* ── Marquee (reverse direction) ── */}
          <div
            className="overflow-hidden relative"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
            }}
          >
            <div
              className="flex gap-4 sm:gap-5 w-max"
              style={{
                animation: `marquee-scroll-reverse ${duration}s linear infinite`,
                willChange: 'transform',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'; }}
            >
              {/* Original set */}
              {items.map((item, i) => (
                <WhyUsCard key={`a-${i}`} item={item} index={i} />
              ))}
              {/* Duplicate set for seamless loop */}
              {items.map((item, i) => (
                <WhyUsCard key={`b-${i}`} item={item} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

