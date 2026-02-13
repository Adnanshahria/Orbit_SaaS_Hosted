import { motion, useInView } from 'framer-motion';
import { ShoppingCart, GraduationCap, Palette, Building2 } from 'lucide-react';
import { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';

const icons = [ShoppingCart, GraduationCap, Palette, Building2];

const cardVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: i % 2 === 0 ? -60 : 60,
    scale: 0.92,
  }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 70,
      damping: 18,
      delay: i * 0.15,
    },
  }),
};

export function ServicesSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-80px' });

  return (
    <section id="services" aria-label="Web Development Services" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,92,231,0.06),transparent_70%)]" />
      <div className="max-w-6xl mx-auto relative" ref={ref}>
        {/* Header — scale + fade */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">{t.services.title}</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t.services.subtitle}</p>
        </motion.div>

        {/* Cards — alternate entrance from left/right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.services.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <motion.article
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                whileHover={{
                  y: -6,
                  boxShadow: '0 20px 40px rgba(108, 92, 231, 0.12)',
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="glass-effect rounded-2xl p-8 h-full group hover:border-primary/40 transition-colors duration-300 cursor-default"
              >
                <motion.div
                  className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5"
                  whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
                >
                  <Icon className="w-7 h-7 text-primary" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
