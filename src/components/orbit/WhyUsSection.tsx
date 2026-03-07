import { motion, useInView } from 'framer-motion';
import React, { useRef, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { parseRichText } from '@/lib/utils';
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
      className="relative p-5 sm:p-8 group cursor-default overflow-hidden transition-all duration-300 flex flex-col flex-shrink-0"
      style={{ width: 'clamp(340px, 34vw, 440px)' }}
    >
      {/* Removed top border and card background */}

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 10% 50%, ${accent}15, transparent 65%)`,
        }}
      />

      {/* Row 1: Icon + Title */}
      <div className="relative z-10 flex items-center gap-3 sm:gap-4 mb-3">
        <div
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
          style={{ backgroundColor: `${accent}1A`, border: `0.5px solid ${accent}40` }}
        >
          <CurrentIcon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: accent }} />
        </div>
        <h3 className="text-[1.3rem] sm:text-[1.5rem] font-display font-normal text-[#FFE5B4] group-hover:text-white transition-colors leading-snug">
          {item.title}
        </h3>
      </div>

      {/* Row 2: Description — full width */}
      <p className="relative z-10 text-muted-foreground text-[0.8rem] sm:text-[0.85rem] leading-[1.7] opacity-80 group-hover:opacity-100 transition-opacity duration-300">
        {item.desc}
      </p>

      {/* Left accent line instead of bottom line for editorial look */}
      <div
        className="absolute top-8 bottom-8 left-0 w-px opacity-20 group-hover:opacity-60 transition-opacity duration-500"
        style={{ background: `linear-gradient(to bottom, transparent, ${accent}, transparent)` }}
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
        <div className="px-0 sm:px-0 py-5 sm:py-10">
          <div className="text-center mb-6 sm:mb-10 px-4 sm:px-14">
            <motion.h2
              className="inline-flex px-6 sm:px-8 py-2 sm:py-3 rounded-full border-[0.5px] border-[#8B5A2B]/50 bg-[#8B5A2B]/10 text-[clamp(1.8rem,3vw,2.4rem)] text-[#FFE5B4] font-display italic tracking-wide mb-3 flex-wrap justify-center gap-[0.3em] shadow-[0_4px_20px_rgba(139,90,43,0.15)]"
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
              className="text-[#10b981] text-[12.5px] sm:text-base md:text-lg lg:text-xl max-w-xl mx-auto flex flex-wrap justify-center gap-x-[0.4em] gap-y-[0.4rem] sm:gap-y-2 tracking-wide italic leading-relaxed pt-2"
            >
              {parseRichText(t.whyUs.subtitle).map((seg, i) => {
                if (!seg.bold && !seg.card && !seg.whiteCard && !seg.color && !seg.greenCard) {
                  return seg.text.split(' ').filter(Boolean).map((word, wi) => (
                    <span key={`w-${i}-${wi}`} className="inline-block align-middle">{word}</span>
                  ));
                }
                const cls = [
                  seg.bold && !seg.color ? 'font-bold text-white' : '',
                  seg.bold && seg.color ? 'font-bold' : '',
                  seg.card ? 'word-card' : '',
                  seg.whiteCard ? 'word-card-white' : '',
                  seg.greenCard ? 'word-card-green' : '',
                  seg.color === 'green' ? '!text-emerald-400' : '',
                  seg.color === 'gold' ? '!text-amber-500' : '',
                  seg.color === 'white' ? '!text-white' : '',
                ].filter(Boolean).join(' ');
                return (
                  <span key={`s-${i}`} className={`${cls} inline-block align-middle`}>
                    {seg.text}
                  </span>
                );
              })}
            </motion.div>
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

