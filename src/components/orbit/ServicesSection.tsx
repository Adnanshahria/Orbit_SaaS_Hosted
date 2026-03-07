import { motion, useInView } from 'framer-motion';
import { Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud, Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase, Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette } from 'lucide-react';
import { useRef, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
  Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
  Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette
};
const DEFAULT_ICONS = [Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket];

/* ── Marquee keyframes (injected once) ── */
const marqueeStyleId = 'services-marquee-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(marqueeStyleId)) {
  const style = document.createElement('style');
  style.id = marqueeStyleId;
  style.textContent = `
    @keyframes marquee-scroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;
  document.head.appendChild(style);
}

function ServiceCard({
  item,
  iconColor,
  cardBorder,
  index,
}: {
  item: any;
  iconColor: string;
  cardBorder: string;
  index: number;
}) {
  const Icon =
    item.icon && ICON_MAP[item.icon]
      ? ICON_MAP[item.icon]
      : DEFAULT_ICONS[index % DEFAULT_ICONS.length];
  const accent = item.color || iconColor;

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
          style={{ backgroundColor: `${accent}15` }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: accent }} />
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

export function ServicesSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  // Theme from admin
  const titleColor = (t.services as any).titleColor || '';
  const subtitleColor = (t.services as any).subtitleColor || '';
  const cardBorder = (t.services as any).cardBorder || '';
  const iconColor = (t.services as any).iconColor || '#6c5ce7';

  const subtitle = t.services.subtitle || '';
  const words = useMemo(() => subtitle.split(' '), [subtitle]);

  const items: any[] = t.services.items;
  // Speed: ~30s per full cycle — adjust as needed
  const duration = Math.max(items.length * 5, 20);

  return (
    <section id="services" className="py-10 sm:py-20 px-3 sm:px-6 lg:px-8 relative scroll-mt-12" style={{ contain: 'none' }}>

      <div className="w-full mx-auto relative" ref={ref}>
        <div className="rounded-2xl sm:rounded-3xl premium-card bg-white/[0.02] backdrop-blur-xl px-0 sm:px-0 py-4 sm:py-8 shadow-[0_0_40px_rgba(108,92,231,0.08)]">
          {/* Section Header */}
          <div className="text-center mb-5 sm:mb-8 px-4 sm:px-14">
            <motion.h2
              initial={{ opacity: 0, y: -16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-neon-emerald/25 bg-neon-emerald/5 text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 tracking-tight text-foreground"
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

          {/* ── Marquee ── */}
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
                animation: `marquee-scroll ${duration}s linear infinite`,
                willChange: 'transform',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'; }}
            >
              {/* Original set */}
              {items.map((item, i) => (
                <ServiceCard key={`a-${i}`} item={item} iconColor={iconColor} cardBorder={cardBorder} index={i} />
              ))}
              {/* Duplicate set for seamless loop */}
              {items.map((item, i) => (
                <ServiceCard key={`b-${i}`} item={item} iconColor={iconColor} cardBorder={cardBorder} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
