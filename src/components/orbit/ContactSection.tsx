import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';

export function ContactSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-80px' });

  // Dynamic WhatsApp URL from admin settings
  const whatsappNumber = (t.contact as any).whatsapp || '8801853452264';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  return (
    <section id="contact" className="py-12 sm:py-20 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,92,231,0.12),transparent_60%)] rounded-2xl" />
      <div className="max-w-3xl mx-auto text-center relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 40 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 70, damping: 16 }}
        >
          <motion.h2
            className="font-display text-xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4"
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
    </section>
  );
}
