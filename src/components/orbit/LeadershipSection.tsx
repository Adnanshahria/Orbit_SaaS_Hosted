import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';

const colors = ['from-neon-purple to-neon-blue', 'from-neon-cyan to-neon-purple', 'from-neon-pink to-neon-purple'];

export function LeadershipSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="leadership" className="py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      <div className="max-w-5xl mx-auto relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t.leadership.title}</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t.leadership.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.leadership.members.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="glass-effect rounded-2xl p-8 text-center group hover:border-neon-purple/40 gentle-animation"
            >
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 bg-gradient-to-br ${colors[i]} flex items-center justify-center text-3xl font-bold text-primary-foreground font-display`}>
                {member.name.charAt(0)}
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-1">{member.name}</h3>
              <p className="text-neon-cyan text-sm font-medium">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
