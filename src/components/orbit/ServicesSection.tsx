import { motion, useInView } from 'framer-motion';
import { Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud, Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase, Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette } from 'lucide-react';
import { useRef, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { parseRichText } from '@/lib/utils';
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
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
          style={{ backgroundColor: `${accent}1A`, border: `0.5px solid ${accent}40` }}
        >
          <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: accent }} />
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
        <div className="px-0 sm:px-0 py-4 sm:py-8">
          {/* Section Header */}
          <div className="text-center mb-5 sm:mb-8 px-4 sm:px-14">
            <motion.h2
              initial={{ opacity: 0, y: -16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block px-6 sm:px-8 py-1.5 sm:py-2 rounded-full border-[0.5px] border-[#8B5A2B]/50 bg-[#8B5A2B]/10 text-[#FFE5B4] text-2xl sm:text-3xl lg:text-4xl font-display italic tracking-wide mb-2 shadow-[0_4px_20px_rgba(139,90,43,0.15)]"
              style={titleColor ? { color: titleColor } : undefined}
            >
              {t.services.title}
            </motion.h2>

            <motion.p
              className="text-[12.5px] sm:text-base md:text-lg lg:text-xl max-w-xl mx-auto flex flex-wrap justify-center gap-x-[0.4em] gap-y-[0.4rem] sm:gap-y-2 text-muted-foreground tracking-wide italic leading-relaxed pt-2"
              style={subtitleColor ? { color: subtitleColor } : undefined}
            >
              {(() => {
                let wordIndex = 0;
                return parseRichText(t.services.subtitle).map((seg, i) => {
                  if (!seg.bold && !seg.card && !seg.whiteCard && !seg.color && !seg.greenCard) {
                    return seg.text.split(' ').filter(Boolean).map((word) => {
                      const wi = wordIndex++;
                      return (
                        <motion.span
                          key={`w-${i}-${wi}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={inView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.35, delay: 0.25 + wi * 0.035, ease: 'easeOut' }}
                          className="inline-block align-middle"
                        >
                          {word}
                        </motion.span>
                      );
                    });
                  }
                  const wi = wordIndex++;
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
                    <motion.span
                      key={`s-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.35, delay: 0.25 + wi * 0.035, ease: 'easeOut' }}
                      className={`${cls} inline-block align-middle`}
                    >
                      {seg.text}
                    </motion.span>
                  );
                });
              })()}
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
