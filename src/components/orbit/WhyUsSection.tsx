import { motion, useInView } from 'framer-motion';
import { Handshake, Lightbulb, Wrench } from 'lucide-react';
import { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';

const icons = [Handshake, Lightbulb, Wrench];

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
  const inView = useInView(ref, { once: true, margin: '-80px' });

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
          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">{t.whyUs.title}</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">{t.whyUs.subtitle}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {t.whyUs.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  boxShadow: '0 20px 40px rgba(0, 245, 255, 0.1)',
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="glass-effect rounded-2xl p-8 text-center group hover:border-primary/40 transition-colors duration-300"
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5, transition: { type: 'spring', stiffness: 300, damping: 12 } }}
                >
                  <Icon className="w-8 h-8 text-neon-cyan" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
