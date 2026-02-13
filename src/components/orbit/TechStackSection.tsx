import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';

const techItems = [
  { label: 'React.js', category: 'Frontend' },
  { label: 'Next.js 14', category: 'Frontend' },
  { label: 'TypeScript', category: 'Frontend' },
  { label: 'Tailwind CSS', category: 'Frontend' },
  { label: 'Django', category: 'Backend' },
  { label: 'Python', category: 'Backend' },
  { label: 'Node.js', category: 'Backend' },
  { label: 'Scalable Microservices', category: 'Backend' },
  { label: 'Cloud-Native Architecture', category: 'Infrastructure' },
  { label: 'AWS / Google Cloud', category: 'Infrastructure' },
  { label: 'CI/CD Pipelines', category: 'Infrastructure' },
  { label: 'PostgreSQL', category: 'Backend' },
];

const doubled = [...techItems, ...techItems];

export function TechStackSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

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

      {/* Marquee row */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex marquee w-max gap-6 py-4">
          {doubled.map((item, i) => (
            <div
              key={i}
              className="glass-effect rounded-xl px-6 py-4 flex flex-col items-center min-w-[180px] hover:border-neon-cyan/40 gentle-animation group"
            >
              <span className="text-xs text-neon-cyan font-medium uppercase tracking-wider mb-1 opacity-70">{item.category}</span>
              <span className="font-display font-semibold text-foreground text-base group-hover:text-neon-cyan gentle-animation">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Second row, reversed */}
      <div className="relative w-full overflow-hidden mt-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex w-max gap-6 py-4" style={{ animation: 'marquee 40s linear infinite reverse' }}>
          {[...doubled].reverse().map((item, i) => (
            <div
              key={i}
              className="glass-effect rounded-xl px-6 py-4 flex flex-col items-center min-w-[180px] hover:border-neon-purple/40 gentle-animation group"
            >
              <span className="text-xs text-neon-purple font-medium uppercase tracking-wider mb-1 opacity-70">{item.category}</span>
              <span className="font-display font-semibold text-foreground text-base group-hover:text-neon-purple gentle-animation">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
