import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';


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
  // Triple the items for a seamless infinite loop
  const itemsList = category.items || [];
  const tripled = [...itemsList, ...itemsList, ...itemsList];
  const items = reverse ? [...tripled].reverse() : tripled;

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
      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div
          className="flex w-max gap-4 py-1"
          style={{
            animation: `marquee ${reverse ? '50s' : '45s'} linear infinite ${reverse ? 'reverse' : ''}`,
            willChange: 'transform',
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-full px-5 py-2.5 border border-border/50 bg-card/70 backdrop-blur-sm hover:border-foreground/25 gentle-animation whitespace-nowrap group cursor-default"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 group-hover:scale-125 gentle-animation"
                style={{
                  backgroundColor: category.color,
                  boxShadow: `0 0 6px ${category.color}50`,
                }}
              />
              <span className="font-display font-medium text-foreground/85 text-sm group-hover:text-foreground gentle-animation">
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
  const inView = useInView(ref, { once: false, margin: '-100px' });

  // Use dynamic categories from content, fallback to empty array
  const dynamicCategories = (t.techStack as any).categories || [];

  return (
    <section id="tech-stack" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t.techStack.title}</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t.techStack.subtitle}</p>
        </motion.div>
      </div>

      <div className="space-y-2">
        {dynamicCategories.map((cat: any, i: number) => (
          <MarqueeRow key={cat.name || i} category={cat} reverse={i % 2 !== 0} />
        ))}
      </div>
    </section>
  );
}
