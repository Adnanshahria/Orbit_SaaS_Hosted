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

  // Theme Customization from admin
  const titleColor = (t.services as any).titleColor || '#ffffff';
  const subtitleColor = (t.services as any).subtitleColor || '#94a3b8';
  const cardBg = (t.services as any).cardBg || 'rgba(15, 23, 42, 0.3)';
  const cardBorder = (t.services as any).cardBorder || 'rgba(255, 255, 255, 0.1)';
  const iconColor = (t.services as any).iconColor || '#6c5ce7';

  return (
    <section id="services" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,92,231,0.06),transparent_70%)]" />
      <div className="max-w-6xl mx-auto relative" ref={ref}>
        {/* Header — scale + fade */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2
            className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4"
            style={{ color: titleColor }}
          >
            {t.services.title}
          </h2>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: subtitleColor }}
          >
            {t.services.subtitle}
          </p>
        </motion.div>

        {/* Cards — 3 columns grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.services.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.article
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                whileHover={{
                  y: -8,
                  boxShadow: `0 20px 40px ${iconColor}22`,
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="rounded-2xl p-8 h-full group transition-all duration-300 cursor-default border"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <motion.div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors"
                  style={{ backgroundColor: `${iconColor}15` }}
                  whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
                >
                  <Icon className="w-7 h-7" style={{ color: iconColor }} />
                </motion.div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base opacity-90 group-hover:opacity-100 transition-opacity">
                  {item.desc}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
