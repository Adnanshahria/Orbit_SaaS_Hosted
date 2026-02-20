import { motion, useInView } from 'framer-motion';
import React, { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';

const emojis = ['🧠', '🔧', '⚡', '🛡️'];

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
  const inView = useInView(ref, { once: false, margin: '-80px' });

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
          <h2 className="text-[clamp(1.8rem,3vw,2.4rem)] font-bold text-foreground mb-3">
            {t.whyUs.title.split('ORBIT').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && <span className="text-[#6366f1]">ORBIT</span>}
              </React.Fragment>
            ))}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">{t.whyUs.subtitle}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1080px] mx-auto"
        >
          {t.whyUs.items.map((item, i) => {
            const Emoji = emojis[i % emojis.length];
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{
                  y: -4,
                  boxShadow: '0 12px 40px rgba(99,102,241,0.12)',
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="bg-card border border-border rounded-2xl pt-9 px-7 pb-8 text-center transition-all duration-200 cursor-default"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[26px]"
                  style={{ backgroundColor: item.bg || '#eef2ff' }}
                >
                  {Emoji}
                </div>
                <h3 className="text-[1.05rem] font-bold text-foreground mb-2.5">{item.title}</h3>
                <p className="text-[0.875rem] text-muted-foreground leading-[1.65]">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
