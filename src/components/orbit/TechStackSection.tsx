import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { parseRichText } from '@/lib/utils';


interface Category {
  name: string;
  color: string;
  items: string[];
}

function MarqueeRow({
  category,
  reverse = false,
}: {
  category: Category;
  reverse?: boolean;
}) {
  // Double items on mobile (saves DOM nodes), triple on desktop for seamless loop
  const itemsList = category.items || [];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const repeated = isMobile
    ? [...itemsList, ...itemsList]
    : [...itemsList, ...itemsList, ...itemsList];
  const items = reverse ? [...repeated].reverse() : repeated;

  return (
    <div className="mb-6">
      {/* Category label with decorative lines */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="h-px w-16 sm:w-24" style={{ background: `linear-gradient(to right, transparent, ${category.color}40)` }} />
        <p
          className="text-xs font-bold tracking-[0.25em]"
          style={{ color: category.color }}
        >
          {category.name}
        </p>
        <div className="h-px w-16 sm:w-24" style={{ background: `linear-gradient(to left, transparent, ${category.color}40)` }} />
      </div>

      {/* Scrolling pills */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      >
        <div
          className="flex w-max gap-4 sm:gap-6 py-2"
          style={{
            animation: `marquee ${reverse ? '50s' : '45s'} linear infinite ${reverse ? 'reverse' : ''}`,
            willChange: 'transform',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'; }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-full px-5 py-3 border-[0.5px] border-[#8B5A2B]/30 bg-card/30 hover:bg-card/60 hover:border-[#F59E0B]/50 transition-all duration-300 whitespace-nowrap group cursor-default shadow-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 group-hover:scale-125 gentle-animation"
                style={{
                  backgroundColor: category.color,
                  boxShadow: `0 0 6px ${category.color}50`,
                }}
              />
              <span className="font-medium text-foreground/85 text-sm group-hover:text-foreground gentle-animation">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TechStackSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  // Use dynamic categories from content, fallback to empty array
  const dynamicCategories = (t.techStack as any).categories || [];

  return (
    <section id="tech-stack" className="py-14 sm:py-24 px-3 sm:px-6 lg:px-8 relative scroll-mt-12" style={{ contain: 'none' }}>


      <div className="w-full mx-auto relative" ref={ref}>
        <div className="px-4 sm:px-14 py-5 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-8"
          >
            <h2 className="inline-block px-6 sm:px-8 py-2 sm:py-3 rounded-full border-[0.5px] border-[#8B5A2B]/50 bg-[#8B5A2B]/10 text-[#FFE5B4] text-3xl sm:text-4xl lg:text-5xl font-display italic tracking-wide mb-4 shadow-[0_4px_20px_rgba(139,90,43,0.15)]">{t.techStack.title}</h2>
            <p className="text-[#10b981] text-[12.5px] sm:text-base md:text-lg lg:text-xl max-w-xl mx-auto flex flex-wrap justify-center gap-x-[0.4em] gap-y-[0.4rem] sm:gap-y-2 tracking-wide italic leading-relaxed">
              {parseRichText(t.techStack.subtitle).map((seg, i) => {
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
            </p>
          </motion.div>

          <div className="space-y-2">
            {dynamicCategories.map((cat: any, i: number) => (
              <MarqueeRow key={cat.name || i} category={cat} reverse={i % 2 !== 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
