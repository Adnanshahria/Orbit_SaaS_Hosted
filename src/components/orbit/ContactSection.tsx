import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';

export function ContactSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-80px' });

  // Dynamic WhatsApp URL from admin settings
  const whatsappNumber = (t.contact as any).whatsapp || '';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  return (
    <section id="contact" className="py-10 sm:py-20 px-3 sm:px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,92,231,0.12),transparent_60%)] rounded-2xl" />
      <div className="max-w-5xl mx-auto text-center relative" ref={ref}>
        <div className="rounded-2xl sm:rounded-3xl border sm:border-2 border-neon-purple/30 bg-white/[0.02] backdrop-blur-xl px-4 sm:px-14 py-5 sm:py-10 shadow-[0_0_40px_rgba(108,92,231,0.08)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: 'spring', stiffness: 70, damping: 16 }}
          >
            <motion.h2
              className="inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-neon-purple/25 bg-neon-purple/5 font-display text-xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4"
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={inView ? { opacity: 1, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t.contact.title}
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {t.contact.subtitle}
            </motion.p>
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.5 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 12px 35px rgba(108, 92, 231, 0.3)',
                transition: { type: 'spring', stiffness: 400, damping: 15 },
              }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg text-primary-foreground bg-primary shadow-lg cursor-pointer"
            >
              {t.contact.cta}
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
