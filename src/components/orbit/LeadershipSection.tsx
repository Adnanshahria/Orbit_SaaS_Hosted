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
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const members = t.leadership.members || [];
  const sortedMembers = [...members].sort(
    (a: any, b: any) => (a.order ?? 999) - (b.order ?? 999)
  );

  const tagline = t.leadership.tagline;

  return (
    <section id="leadership" className="py-10 sm:py-24 px-3 sm:px-6 relative">


      <div className="max-w-7xl mx-auto relative" ref={ref}>
        <div className="rounded-2xl sm:rounded-3xl border sm:border-2 border-neon-purple/30 bg-white/[0.02] backdrop-blur-xl px-4 sm:px-14 py-5 sm:py-10 shadow-[0_0_40px_rgba(108,92,231,0.08)]">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
            animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="text-center mb-6 sm:mb-10"
          >
            <h2 className="inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-neon-purple/25 bg-neon-purple/5 font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">{t.leadership.title}</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">{t.leadership.subtitle}</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6"
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
                    boxShadow: '0 20px 40px rgba(108, 92, 231, 0.15)',
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  className="glass-effect bg-card/40 backdrop-blur-md rounded-xl sm:rounded-2xl sm:rounded-[2.5rem] p-3 sm:p-6 lg:p-8 text-center group hover:border-primary/40 transition-colors duration-300"
                >
                  {/* Circular photo or fallback icon */}
                  <motion.div
                    className="w-20 h-20 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full mx-auto mb-3 sm:mb-6 lg:mb-8 overflow-hidden flex items-center justify-center bg-secondary/30 border-2 sm:border-4 border-background shadow-xl lg:shadow-2xl relative"
                    style={
                      hasImage
                        ? { boxShadow: style.shadow }
                        : { background: style.gradient, boxShadow: style.shadow }
                    }
                    whileHover={{ scale: 1.08, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
                  >
                    {hasImage ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" strokeWidth={1} />
                    )}
                    <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
                  </motion.div>
                  <h3 className="font-display text-sm sm:text-xl lg:text-2xl font-bold text-foreground mb-0.5 sm:mb-1.5 leading-tight">{member.name}</h3>
                  <p className="text-neon-cyan text-[10px] sm:text-sm lg:text-base font-bold tracking-wide uppercase">{member.role}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Optional Tagline Card below members */}
          {tagline && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, type: 'spring', stiffness: 60 }}
              className="mt-12 sm:mt-16 max-w-4xl mx-auto"
            >
              <div className="glass-effect rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 text-center border border-border bg-card/40 backdrop-blur-md hover:border-primary/30 transition-colors duration-500">
                <p className="text-lg sm:text-2xl lg:text-3xl font-display font-medium text-foreground leading-relaxed italic relative z-10">
                  <span className="text-primary/40 text-4xl leading-none absolute -top-4 -left-2 sm:-left-6">"</span>
                  {tagline}
                  <span className="text-primary/40 text-4xl leading-none absolute -bottom-4 -right-2 sm:-right-6">"</span>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
