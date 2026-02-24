import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from 'framer-motion';
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
  const [showEmailBar, setShowEmailBar] = useState(true);

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

  // Hide email bar when user scrolls past hero on mobile
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setShowEmailBar(v < 0.15);
  });

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

  // Loading Sequence for Hero Title
  const [isHeroLoaded, setIsHeroLoaded] = useState(false);
  useEffect(() => {
    // Show the dice loader for 3.2 seconds, then reveal text
    const timer = setTimeout(() => {
      setIsHeroLoaded(true);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-0 pb-24 sm:pt-20 sm:pb-0"
    >


      <motion.div
        style={{ y: contentY }}
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="px-4 sm:px-14 py-[3dvh] sm:py-10 flex flex-col justify-between items-center min-h-[55dvh] sm:min-h-0">
          {/* Badge — slides down with spring */}
          {t.hero.tagline && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 3.0 }}
              className="inline-flex items-center gap-3 px-6 sm:px-5 py-3 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-[14px] sm:text-sm font-playfair italic font-bold mb-[2dvh] sm:mb-6 tracking-wide w-auto max-w-[95%] text-left md:text-center shrink-0 min-w-0 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              style={{ color: taglineColor }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
              />
              {t.hero.tagline}
            </motion.div>
          )}

          <div className="text-foreground leading-[1] mb-[2.5dvh] sm:mb-10 min-h-[20dvh] sm:min-h-[180px] flex flex-col items-center justify-center relative">
            <AnimatePresence mode="wait">
              {!isHeroLoaded ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 2, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="dice-container">
                    <div className="dice">
                      <div className="dice-face dice-face-front">O</div>
                      <div className="dice-face dice-face-back">R</div>
                      <div className="dice-face dice-face-right">B</div>
                      <div className="dice-face dice-face-left">I</div>
                      <div className="dice-face dice-face-top">T</div>
                      <div className="dice-face dice-face-bottom">S</div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="hero-text"
                  initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                  className="flex flex-col items-center"
                >
                  <span className="block text-[clamp(2.5rem,13vw,4.5rem)] leading-[1] sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.5rem] font-poppins font-black tracking-tight whitespace-nowrap">
                    <span className="inline-block animate-text-shimmer-orbit drop-shadow-lg pb-1">ORBIT</span>{' '}
                    <span className="inline-block animate-text-shimmer-saas drop-shadow-lg pb-1">SaaS</span>
                  </span>
                  <motion.span
                    className="block mt-2 sm:mt-6 text-[1.25rem] leading-[1.2] sm:text-3xl md:text-4xl lg:text-[3rem] xl:text-5xl font-lobster tracking-normal px-1 sm:px-4"
                    style={{ color: titleColor }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.2 }}
                  >
                    {t.hero.title}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtitle — word-by-word reveal */}
          <motion.p className="text-muted-foreground text-xs sm:text-base md:text-lg max-w-3xl mx-auto mb-[2.5dvh] sm:mb-12 leading-relaxed flex flex-wrap justify-center gap-x-[0.35em] font-medium">
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
            className="flex flex-row gap-4 sm:gap-10 justify-center items-center px-2 sm:px-0"
          >
            {/* Relative Container for Dropdown */}
            <div className="relative w-auto sm:w-auto">
              <motion.button
                id="hero-book-appointment"
                onClick={() => setIsCtaOpen(!isCtaOpen)}
                whileHover={{ scale: 1.04, boxShadow: `0 8px 30px ${ctaGradientStart}44` }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="inline-flex items-center gap-1.5 px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-full font-bold text-primary-foreground shadow-lg gentle-animation cursor-pointer justify-center text-sm sm:text-base"
                style={{ background: `linear-gradient(to right, ${ctaGradientStart}, ${ctaGradientEnd})` }}
              >
                {t.hero.cta}
                <div className="ml-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-white/20 border border-white/10 shadow-inner group-hover:bg-white/30 transition-colors">
                  <ChevronDown strokeWidth={2.5} className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${isCtaOpen ? 'rotate-180' : ''}`} />
                </div>
              </motion.button>

              <AnimatePresence>
                {isCtaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-4 w-full sm:w-[240px] z-30 flex flex-col gap-2"
                  >
                    <motion.a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsCtaOpen(false)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-4 px-4 py-3 bg-secondary border border-border rounded-xl shadow-xl hover:border-primary/50 transition-colors text-foreground font-semibold group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
                        <MessageCircle className="w-5 h-5 text-[#25D366]" />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm">WhatsApp</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Contact directly</span>
                      </div>
                    </motion.a>

                    <motion.a
                      href="mailto:contact@orbitsaas.cloud"
                      onClick={() => setIsCtaOpen(false)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-4 px-4 py-3 bg-secondary border border-border rounded-xl shadow-xl hover:border-primary/50 transition-colors text-foreground font-semibold group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm">Email Us</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Send a detailed inquiry</span>
                      </div>
                    </motion.a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.a
              href="#services"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="inline-flex items-center gap-1.5 px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-full font-bold glass-effect text-foreground cursor-pointer justify-center text-sm sm:text-base"
            >
              {t.hero.learnMore}
            </motion.a>
          </motion.div>
          {/* Newsletter Subscribe — Desktop block (inside card for relative flow) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showEmailBar ? (isCtaOpen ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1, y: 0 }) : { opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 60, damping: 16, delay: showEmailBar ? 0 : 0 }}
            className={`hidden sm:block relative mt-6 w-[450px] max-w-full mx-auto px-0 z-[100] ${(!showEmailBar || isCtaOpen) ? 'pointer-events-none' : 'pointer-events-auto'}`}
          >
            <form onSubmit={handleSubscribe} className="relative flex justify-center w-full">
              <input
                type="email"
                placeholder={lang === 'bn' ? 'আপনার ইমেইল...' : 'Enter your email...'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="w-full bg-secondary/80 border border-border rounded-full py-3.5 pl-6 pr-[150px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-lg text-foreground"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="inline">{lang === 'bn' ? 'যুক্ত হোন' : "Let's Build"}</span>
              </button>
            </form>
            {status === 'success' && (
              <p className="text-green-500 text-xs mt-3 text-center animate-in fade-in slide-in-from-bottom-2 font-medium">
                {lang === 'bn' ? 'আমাদের এক্সক্লুসিভ ওয়েটলিস্টে স্বাগতম!' : 'Welcome to the exclusive waitlist!'}
              </p>
            )}
          </motion.div>
        </div>{/* End Hero Container Card */}
      </motion.div>

      {/* Newsletter Subscribe — Mobile block (fixed to viewport, outside transform) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={showEmailBar ? (isCtaOpen ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1, y: 0 }) : { opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 60, damping: 16, delay: showEmailBar ? 0 : 0 }}
        className={`fixed bottom-[15dvh] left-4 right-[112px] z-[100] sm:hidden ${(!showEmailBar || isCtaOpen) ? 'pointer-events-none' : 'pointer-events-auto'}`}
      >
        <form onSubmit={handleSubscribe} className="relative flex justify-center w-full">
          <input
            type="email"
            placeholder={lang === 'bn' ? 'আপনার ইমেইল...' : 'Enter your email...'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            className="w-full bg-background/95 border border-neon-purple/40 rounded-full py-3 pl-5 pr-[120px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-lg text-foreground"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-full bg-primary text-primary-foreground font-semibold text-[12px] flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="inline">{lang === 'bn' ? 'যুক্ত হোন' : "Let's Build"}</span>
          </button>
        </form>
        {status === 'success' && (
          <p className="text-green-500 text-xs mt-3 text-center animate-in fade-in slide-in-from-bottom-2 font-medium">
            {lang === 'bn' ? 'আমাদের এক্সক্লুসিভ ওয়েটলিস্টে স্বাগতম!' : 'Welcome to the exclusive waitlist!'}
          </p>
        )}
      </motion.div>


      {/* Scroll indicator — hidden on mobile, shown on desktop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: baseDelay + 2.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
          <ChevronDown className="w-6 h-6 text-muted-foreground opacity-50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
