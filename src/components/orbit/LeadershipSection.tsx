import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { parseRichText } from '@/lib/utils';
import { Cpu, Crown, Target, User } from 'lucide-react';

const fallbackStyles = [
  { icon: Cpu, gradient: 'linear-gradient(135deg, #6c5ce7, #3b82f6)', shadow: '0 8px 30px rgba(108, 92, 231, 0.35)' },
  { icon: Crown, gradient: 'linear-gradient(135deg, #0891b2, #6c5ce7)', shadow: '0 8px 30px rgba(8, 145, 178, 0.35)' },
  { icon: Target, gradient: 'linear-gradient(135deg, #d946a8, #6c5ce7)', shadow: '0 8px 30px rgba(217, 70, 168, 0.35)' },
];

// Animations removed to prevent mobile scroll layout shifting

const FALLBACK_MEMBERS = [
  { name: 'Adnan Shahria', role: 'Founder & CEO', image: '' },
  { name: 'Lead Developer', role: 'Full Stack Engineer', image: '' },
  { name: 'AI Engineer', role: 'AI & Automation Lead', image: '' },
  { name: 'Design Lead', role: 'UI/UX Designer', image: '' },
];

export function LeadershipSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const rawMembers: any[] = t.leadership.members || [];
  const members = rawMembers.length > 0 ? rawMembers : FALLBACK_MEMBERS;
  const sortedMembers = [...members].sort(
    (a: any, b: any) => (a.order ?? 999) - (b.order ?? 999)
  );

  const tagline = t.leadership.tagline;

  return (
    <section id="leadership" className="py-16 sm:py-20 px-3 sm:px-6 relative scroll-mt-12">

      <div className="w-full mx-auto relative" ref={ref}>
        <div className="px-4 sm:px-14 py-4 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="text-center mb-5 sm:mb-8"
          >
            <h2 className="inline-block px-6 sm:px-8 py-1.5 sm:py-2 rounded-full border-[0.5px] border-[#8B5A2B]/50 bg-[#8B5A2B]/10 text-[#FFE5B4] text-2xl sm:text-3xl lg:text-4xl font-display italic tracking-wide mb-2 sm:mb-3 shadow-[0_4px_20px_rgba(139,90,43,0.15)]">{t.leadership.title}</h2>
            <p className="text-[#10b981] text-[12.5px] sm:text-base md:text-lg lg:text-xl max-w-xl mx-auto flex flex-wrap justify-center gap-x-[0.4em] gap-y-[0.4rem] sm:gap-y-2 tracking-wide italic leading-relaxed pt-2">
              {parseRichText(t.leadership.subtitle).map((seg, i) => {
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {sortedMembers.map((member: any, i: number) => {
              const style = fallbackStyles[i % fallbackStyles.length];
              const hasImage = !!member.image;

              return (
                <div
                  key={i}
                  className="rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center group transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                >

                  {/* Circular photo or fallback icon */}
                  <motion.div
                    className="w-24 h-24 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full mx-auto mb-4 sm:mb-6 lg:mb-8 overflow-hidden flex items-center justify-center bg-secondary/30 relative z-10"
                    style={
                      hasImage
                        ? { boxShadow: style.shadow }
                        : { background: style.gradient, boxShadow: style.shadow }
                    }
                    whileHover={{ scale: 1.05, boxShadow: '0 15px 40px rgba(245,158,11,0.25)', transition: { type: 'spring', stiffness: 300, damping: 15 } }}
                  >
                    {hasImage ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" strokeWidth={1} />
                    )}
                    <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-normal text-[#FFE5B4] mb-2 sm:mb-3 leading-tight transition-colors drop-shadow-sm">{member.name}</h3>
                  <div className="inline-block mt-2">
                    <p className="text-white/90 text-xs sm:text-sm lg:text-base font-medium tracking-wide uppercase italic drop-shadow-sm">{member.role}</p>
                  </div>

                  {/* Subtle background glow effect on hover instead of a card border */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />
                </div>
              );
            })}
          </div>

          {/* Optional Tagline Card below members */}
          {tagline && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, type: 'spring', stiffness: 60 }}
              className="mt-12 sm:mt-16 max-w-4xl mx-auto"
            >
              <div className="glass-effect rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 text-center bg-gradient-to-b from-[#8B5A2B]/5 to-transparent border-t-[0.5px] border-[#8B5A2B]/30 backdrop-blur-md transition-colors duration-500">
                <p className="text-lg sm:text-2xl lg:text-3xl font-medium text-foreground leading-relaxed italic relative z-10">
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
