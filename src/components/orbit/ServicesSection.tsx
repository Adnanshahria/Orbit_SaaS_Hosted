import { motion, useInView } from 'framer-motion';
import { ShoppingCart, GraduationCap, Palette, Building2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';

const icons = [ShoppingCart, GraduationCap, Palette, Building2];

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -15;
    const ry = ((x / rect.width) - 0.5) * 15;
    setTransform(`perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`);
  };

  const handleLeave = () => setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`gentle-animation ${className}`}
      style={{ transform, transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

export function ServicesSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="services" className="py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,92,231,0.06),transparent_70%)]" />
      <div className="max-w-6xl mx-auto relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t.services.title}</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t.services.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.services.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <TiltCard>
                  <div className="glass-effect rounded-2xl p-8 h-full group hover:border-neon-purple/40 gentle-animation">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:neon-glow gentle-animation">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
