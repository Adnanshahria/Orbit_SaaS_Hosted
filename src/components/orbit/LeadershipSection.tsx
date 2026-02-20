import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { Cpu, Crown, Target, User } from 'lucide-react';

const fallbackStyles = [
  { icon: Cpu, gradient: 'linear-gradient(135deg, #6c5ce7, #3b82f6)', shadow: '0 8px 30px rgba(108, 92, 231, 0.35)' },
  { icon: Crown, gradient: 'linear-gradient(135deg, #0891b2, #6c5ce7)', shadow: '0 8px 30px rgba(8, 145, 178, 0.35)' },
  { icon: Target, gradient: 'linear-gradient(135deg, #d946a8, #6c5ce7)', shadow: '0 8px 30px rgba(217, 70, 168, 0.35)' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const memberVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.85 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 70,
      damping: 15,
    },
  },
};

export function LeadershipSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-80px' });

  // Sort members by order field (if present), then by original index
  const members = t.leadership.members || [];
  const sortedMembers = [...members].sort(
    (a: any, b: any) => (a.order ?? 999) - (b.order ?? 999)
  );

  return (
    <section id="leadership" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      <div className="max-w-5xl mx-auto relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">{t.leadership.title}</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">{t.leadership.subtitle}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {sortedMembers.map((member: any, i: number) => {
            const style = fallbackStyles[i % fallbackStyles.length];
            const hasImage = !!member.image;

            return (
              <motion.div
                key={i}
                variants={memberVariants}
                whileHover={{
                  y: -8,
                  boxShadow: '0 20px 40px rgba(108, 92, 231, 0.12)',
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="glass-effect rounded-2xl p-8 text-center group hover:border-primary/40 transition-colors duration-300"
              >
                {/* Large photo or fallback icon */}
                <motion.div
                  className="w-48 h-48 sm:w-72 sm:h-72 rounded-3xl mx-auto mb-8 overflow-hidden flex items-center justify-center bg-secondary/30 border border-border/50"
                  style={
                    hasImage
                      ? { boxShadow: style.shadow }
                      : { background: style.gradient, boxShadow: style.shadow }
                  }
                  whileHover={{ scale: 1.05, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
                >
                  {hasImage ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-20 h-20 text-white" strokeWidth={1} />
                  )}
                </motion.div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-1.5">{member.name}</h3>
                <p className="text-neon-cyan text-base font-semibold">{member.role}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
