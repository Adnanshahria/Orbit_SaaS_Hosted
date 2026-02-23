import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Send, Loader2, Mail, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { toast } from 'sonner';



/* ── Hero component ───────────────────────────────────────────── */
export function HeroSection() {
  const { t, lang } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const [isCtaOpen, setIsCtaOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(lang === 'bn' ? 'সঠিক ইমেইল দিন' : 'Please enter a valid email');
      return;
    }
    setStatus('loading');
    const API_BASE = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${API_BASE}/api/submit-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'Hero Section' })
      });
      if (res.ok) {
        setStatus('success');
        localStorage.setItem('orbit_chatbot_email_provided', 'true');
        toast.success(lang === 'bn' ? 'ওয়েটলিস্টে যুক্ত হয়েছেন!' : 'Joined waitlist successfully!');
        setEmail('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error('Failed');
      }
    } catch {
      toast.error(lang === 'bn' ? 'ত্রুটি হয়েছে' : 'Something went wrong');
      setStatus('idle');
    }
  };
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], ['0%', '15%']);

  // Staggered word animation for the subtitle
  const subtitle = t.hero.subtitle || '';
  const words = subtitle.split(' ');

  // Loader sync: Only delay if this is the absolute first visit (loader runs for 3.5s)
  const [isFirstVisit] = useState(!sessionStorage.getItem('orbit_has_visited'));
  const baseDelay = isFirstVisit ? 3.6 : 0;

  // Theme Customization from admin
  const taglineColor = (t.hero as any).taglineColor || '#00F5FF';
  const titleColor = (t.hero as any).titleColor || '#FF00A8';
  const ctaGradientStart = (t.hero as any).ctaGradientStart || '#6c5ce7';
  const ctaGradientEnd = (t.hero as any).ctaGradientEnd || '#3b82f6';

  // Dynamic WhatsApp URL from admin settings
  const whatsappNumber = (t.contact as any).whatsapp || '';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-20 pb-32 sm:pt-20 sm:pb-0"
    >
      {/* Parallax background layers */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-gradient-to-br from-transparent via-secondary/10 to-transparent" />
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(108,92,231,0.12),transparent_60%)]" />
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,245,255,0.08),transparent_60%)]" />
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="rounded-3xl border-2 border-neon-purple/40 bg-white/[0.05] backdrop-blur-xl px-8 sm:px-14 py-6 sm:py-10 shadow-[0_0_50px_rgba(108,92,231,0.12)]">
          {/* Badge — slides down with spring */}
          {t.hero.tagline && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: baseDelay + 0.2 }}
              className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-effect text-[11px] sm:text-sm font-playfair italic font-medium mb-4 sm:mb-6 tracking-wide w-auto max-w-[95%] text-left md:text-center shrink-0 min-w-0"
              style={{ color: taglineColor }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
              />
              {t.hero.tagline}
            </motion.div>
          )}

          {/* Title — "ORBIT SaaS" scales up dramatically */}
          <motion.h1 className="text-foreground leading-[1] mb-10 sm:mb-16">
            <motion.span
              className="block text-[3.5rem] leading-[1.1] sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-poppins font-black tracking-tight"
              initial={{ opacity: 0, scale: 0.7, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 80, damping: 18, delay: baseDelay + 0.4 }}
            >
              ORBIT <span className="text-primary">SaaS</span>
            </motion.span>
            <motion.span
              className="block mt-4 sm:mt-10 text-[2rem] leading-[1.2] sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-lobster tracking-normal px-2 sm:px-4"
              style={{ color: titleColor }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 18, delay: baseDelay + 0.7 }}
            >
              {t.hero.title}
            </motion.span>
          </motion.h1>

          {/* Subtitle — word-by-word reveal */}
          <motion.p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-12 sm:mb-16 leading-relaxed flex flex-wrap justify-center gap-x-[0.35em] font-medium">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: baseDelay + 0.9 + i * 0.04,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.p>

          {/* CTA buttons — slide up with spring */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 60, damping: 16, delay: baseDelay + 1.6 }}
            className="flex flex-col sm:flex-row gap-3.5 sm:gap-6 justify-center items-center px-2 sm:px-0"
          >
            {/* Relative Container for Dropdown */}
            <div className="relative w-full sm:w-auto">
              <motion.button
                id="hero-book-appointment"
                onClick={() => setIsCtaOpen(!isCtaOpen)}
                whileHover={{ scale: 1.04, boxShadow: `0 8px 30px ${ctaGradientStart}44` }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="inline-flex items-center gap-2 px-6 sm:px-10 py-3.5 sm:py-5 rounded-[1.5rem] sm:rounded-full font-bold text-primary-foreground shadow-lg gentle-animation cursor-pointer w-full sm:w-auto justify-center text-lg sm:text-lg"
                style={{ background: `linear-gradient(to right, ${ctaGradientStart}, ${ctaGradientEnd})` }}
              >
                {t.hero.cta}
                <ChevronDown className={`w-5 h-5 ml-1 transition-transform duration-300 ${isCtaOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isCtaOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-3 w-full sm:w-[220px] bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-30 flex flex-col"
                  >
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsCtaOpen(false)}
                      className="flex items-center justify-center sm:justify-start gap-3 px-5 py-3.5 hover:bg-secondary transition-colors text-foreground font-semibold active:bg-secondary/80"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      </div>
                      WhatsApp
                    </a>
                    <div className="h-px bg-border/50 w-full" />
                    <a
                      href="mailto:contact@orbitsaas.cloud"
                      onClick={() => setIsCtaOpen(false)}
                      className="flex items-center justify-center sm:justify-start gap-3 px-5 py-3.5 hover:bg-secondary transition-colors text-foreground font-semibold active:bg-secondary/80"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      Email Us
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.a
              href="#services"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="inline-flex items-center gap-2 px-6 sm:px-10 py-3.5 sm:py-5 rounded-[1.5rem] sm:rounded-full font-bold glass-effect text-foreground cursor-pointer w-full sm:w-auto justify-center text-base sm:text-lg"
            >
              {t.hero.learnMore}
            </motion.a>
          </motion.div>
        </div>{/* End Hero Container Card */}

        {/* Newsletter Subscribe — outside the card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 16, delay: baseDelay + 1.8 }}
          className="mt-8 sm:mt-10 w-full max-w-md mx-auto px-4 sm:px-0"
        >
          <form onSubmit={handleSubscribe} className="relative flex justify-center w-full">
            <input
              type="email"
              placeholder={lang === 'bn' ? 'আপনার ইমেইল...' : 'Enter your email...'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className="w-full bg-secondary/80 border border-border backdrop-blur-md rounded-full py-3.5 pl-6 pr-[130px] sm:pr-[150px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-lg text-foreground"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 sm:px-6 rounded-full bg-primary text-primary-foreground font-semibold text-[13px] sm:text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="inline">{lang === 'bn' ? 'যুক্ত হোন' : 'Join Waitlist'}</span>
            </button>
          </form>
          {status === 'success' && (
            <p className="text-green-500 text-xs mt-3 text-center animate-in fade-in slide-in-from-bottom-2 font-medium">
              {lang === 'bn' ? 'আমাদের এক্সক্লুসিভ ওয়েটলিস্টে স্বাগতম!' : 'Welcome to the exclusive waitlist!'}
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll indicator — gentle bounce */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: baseDelay + 2.5 }}
        className="absolute bottom-12 sm:bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
          <ChevronDown className="w-6 h-6 text-muted-foreground opacity-50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
