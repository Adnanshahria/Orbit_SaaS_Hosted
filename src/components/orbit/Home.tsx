import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Send, Loader2, Mail, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { toast } from 'sonner';



/* ── Home component ───────────────────────────────────────────── */
export function Home() {
  const { t, lang } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const [isCtaOpen, setIsCtaOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const emailBarRef = useRef<HTMLDivElement>(null);
  const [isNewsletterFocused, setIsNewsletterFocused] = useState(false);
  const mobileEmailBarRef = useRef<HTMLDivElement>(null);

  // Track scroll position to hide email bar — uses refs to avoid React re-renders
  useEffect(() => {
    let wasVisible = true;
    const onScroll = () => {
      const hero = sectionRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, -rect.top / (rect.height || 1)));
      const shouldShow = ratio < 0.15;
      if (shouldShow === wasVisible) return; // no change, skip DOM work
      wasVisible = shouldShow;
      // Toggle visibility via CSS classes directly — zero React re-renders
      if (emailBarRef.current) {
        emailBarRef.current.style.opacity = shouldShow ? '1' : '0';
        emailBarRef.current.style.visibility = shouldShow ? 'visible' : 'hidden';
        emailBarRef.current.style.pointerEvents = shouldShow ? 'auto' : 'none';
        emailBarRef.current.style.transform = shouldShow ? 'translateY(0)' : 'translateY(16px)';
      }
      // The mobileEmailBarRef is now controlled by Framer Motion's animate prop for position and size,
      // and its style prop for opacity/visibility based on isCtaOpen.
      // The scroll-based visibility for the mobile bar is no longer handled here.
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        toast.success(lang === 'bn' ? 'ওয়েটলিস্টে যুক্ত হয়েছেন!' : 'Joined waitlist successfully!');
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


  // Staggered word animation for the subtitle (memoized to prevent re-splits)
  const subtitle = t.hero.subtitle || '';
  const words = useMemo(() => subtitle.split(' '), [subtitle]);
  const isLowPerf = useMemo(() => document.documentElement.classList.contains('low-perf'), []);

  // Always play the loading animation on every page load
  const isFirstVisit = true;
  const baseDelay = 4.2;

  // Theme Customization: Forcing Emerald & Gold for this redesign
  const taglineColor = '#10b981'; // Emerald
  const titleColor = '#f59e0b';   // Amber/Gold
  const ctaGradientStart = '#10b981';
  const ctaGradientEnd = '#14b8a6';

  // Dynamic WhatsApp URL from admin settings
  const whatsappNumber = (t.contact as any).whatsapp || '';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  // ─── Loading Sequence: Holographic Ring Portal ────────────────
  const letters = ['O', 'R', 'B', 'I', 'T'];

  // On return visits, skip loading sequence entirely
  const [step, setStep] = useState(isFirstVisit ? 0 : letters.length + 1);
  const [isHeroLoaded, setIsHeroLoaded] = useState(!isFirstVisit);
  const [ringDissolved, setRingDissolved] = useState(!isFirstVisit);

  const revealedCount = Math.min(step, letters.length);
  const showRing = step > 0 && step <= letters.length;
  const showSaaS = step > letters.length;

  useEffect(() => {
    if (!isFirstVisit) return; // Skip loading sequence on return visits
    // step 1-5: each letter materializes, step 6: SaaS, step 7: hero loaded
    const timings = [500, 1000, 1500, 2100, 2700, 3300, 4100];
    const timers: ReturnType<typeof setTimeout>[] = [];
    timings.forEach((ms, i) => {
      timers.push(setTimeout(() => {
        if (i < letters.length) setStep(i + 1);
        else if (i === letters.length) {
          setStep(letters.length + 1);
          setRingDissolved(true);
        }
        else setIsHeroLoaded(true);
      }, ms));
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Force exactly the screen height ONCE to prevent shrinking when mobile keyboard opens
  const [heroHeight, setHeroHeight] = useState('100vh');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHeroHeight(`${window.innerHeight}px`);
    }
  }, []);

  // Rigorous body scroll lock when newsletter is focused to prevent browser from auto-scrolling hero content upwards
  useEffect(() => {
    if (isNewsletterFocused && window.innerWidth < 768) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isNewsletterFocused]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex items-center justify-center overflow-x-hidden pt-0 pb-24 sm:pt-20 sm:pb-0"
      style={{ minHeight: heroHeight }}
    >

      <div
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        style={{ contain: 'none' }}
      >
        <div className="px-4 sm:px-14 py-8 sm:py-10 flex flex-col justify-between items-center min-h-[550px] sm:min-h-0">
          {/* Badge — slides down with spring */}
          {t.hero.tagline && (() => {
            const line1 = t.hero.tagline;
            const line2 = (t.hero as any).tagline2 || '';
            return (
              <>
                {/* Desktop: single pill (combines both if tagline2 exists) */}
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: baseDelay + 0.3 }}
                  className="hidden sm:inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-sm font-playfair italic font-bold mb-6 tracking-wide w-auto max-w-[95%] md:text-center shrink-0 min-w-0 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  style={{ color: taglineColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  {line2 ? `${line1} ${line2}` : line1}
                </motion.div>

                {/* Mobile: two overlapping rectangles, offset like chain links */}
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: baseDelay + 0.3 }}
                  className="flex sm:hidden flex-col items-center w-full max-w-[95%] mx-auto mb-4 -mt-4 font-playfair italic font-bold text-[14px] tracking-wide relative"
                >
                  {/* Fusion Glow Effect (behind intersection) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: baseDelay + 0.8, duration: 0.8 }}
                    viewport={{ once: true }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-10 bg-gradient-to-r from-emerald-500/40 to-amber-500/40 blur-xl z-[8] mix-blend-screen pointer-events-none"
                  />

                  {/* Row 1 — slightly left, skewed parallelogram */}
                  <motion.div
                    initial={{ opacity: 0, x: -80, skewX: -24 }}
                    animate={{ opacity: 1, x: -40, skewX: -24 }}
                    transition={{ type: "spring", stiffness: 120, damping: 15, delay: baseDelay + 0.4 }}
                    viewport={{ once: true }}
                    className="relative z-10 flex items-center justify-center gap-2 px-10 py-2 backdrop-blur-md shadow-lg"
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1.5px solid rgba(16, 185, 129, 0.6)',
                      color: taglineColor,
                      borderRadius: '0px',
                    }}
                  >
                    <div style={{ transform: 'skewX(24deg)' }} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] shrink-0" />
                      <span>{line1}</span>
                    </div>
                  </motion.div>
                  {/* Row 2 — slightly right, skewed parallelogram, overlapping row 1 */}
                  {line2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 80, skewX: -24 }}
                      animate={{ opacity: 1, x: 40, skewX: -24 }}
                      transition={{ type: "spring", stiffness: 120, damping: 15, delay: baseDelay + 0.6 }}
                      viewport={{ once: true }}
                      className="relative z-[5] flex items-center justify-center gap-2 px-10 py-2 backdrop-blur-md shadow-lg"
                      style={{
                        marginTop: '-0px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1.5px solid rgba(245, 158, 11, 0.6)',
                        color: '#f59e0b',
                        borderRadius: '0px',
                      }}
                    >
                      <div style={{ transform: 'skewX(24deg)' }} className="flex items-center gap-2">
                        <span>{line2}</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </>
            );
          })()}

          <div className="text-foreground leading-[1] mb-10 sm:mb-10 min-h-[200px] sm:min-h-[180px] flex flex-col items-center justify-center relative">

            {/* ─── Holographic Ring Portal ────────────────── */}
            <AnimatePresence>
              {showRing && !ringDissolved && (
                <motion.div
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.8, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 60,
                    damping: 14,
                    mass: 0.8,
                    opacity: { duration: 0.6, ease: 'easeOut' },
                  }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 will-change-transform"
                >
                  <div className="orbit-ring-portal" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ORBIT SaaS title — letters materialize inside the ring */}
            <div className="flex items-center justify-center flex-wrap relative z-10">
              {/* Materialized letters */}
              {letters.map((letter, i) => (
                revealedCount > i && (
                  <motion.span
                    key={letter}
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="text-[clamp(2rem,13vw,4.5rem)] sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.5rem] font-poppins font-black tracking-tight inline-block will-change-transform animate-text-shimmer-orbit pb-1"
                  >
                    {letter}
                  </motion.span>
                )
              ))}

              {/* "SaaS" materializes after ring dissolves */}
              {showSaaS && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85, x: -6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-[clamp(2rem,13vw,4.5rem)] sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.5rem] font-poppins font-black tracking-tight inline-block ml-2 sm:ml-4 animate-text-shimmer-saas pb-1"
                >
                  SaaS
                </motion.span>
              )}
            </div>

            {/* Subtitle — smoothly appears after loading completes */}
            <AnimatePresence>
              {isHeroLoaded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 1.2,
                    ease: 'easeOut',
                    delay: isFirstVisit ? 0.15 : 0.5,
                  }}
                  className="block mt-2 sm:mt-6 text-[1.25rem] leading-[1.2] sm:text-3xl md:text-4xl lg:text-[3rem] xl:text-5xl font-lobster tracking-normal px-1 sm:px-4"
                  style={{ color: titleColor }}
                >
                  {t.hero.title}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Subtitle — word-by-word reveal */}
          <motion.p className="text-muted-foreground text-xs sm:text-base md:text-lg max-w-3xl mx-auto mb-[2.5dvh] sm:mb-12 leading-relaxed flex flex-wrap justify-center gap-x-[0.35em] font-medium">
            {isLowPerf ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: baseDelay + 0.9 }}
              >
                {subtitle}
              </motion.span>
            ) : (
              words.map((word, i) => (
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
              ))
            )}
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
                onClick={() => {
                  const newState = !isCtaOpen;
                  setIsCtaOpen(newState);
                  if (newState) {
                    window.dispatchEvent(new CustomEvent('orbit-cta-open'));
                  }
                }}
                whileHover={{ scale: 1.04, boxShadow: `0 8px 30px ${ctaGradientStart}44` }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="inline-flex items-center gap-1.5 px-4 sm:px-8 py-2 sm:py-2.5 rounded-full font-bold text-primary-foreground shadow-lg gentle-animation cursor-pointer justify-center text-sm sm:text-base border-[0.5px] border-amber-400/60"
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
                    className="absolute top-full left-0 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-4 w-full sm:w-[240px] z-[150] flex flex-col gap-2"
                  >
                    <motion.a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsCtaOpen(false)}
                      whileHover={{ scale: 1.02, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2.5 px-3 py-1.5 bg-secondary border border-border rounded-lg shadow-lg hover:border-primary/50 transition-colors text-foreground font-semibold group"
                    >
                      <div className="w-6 h-6 rounded-md bg-[#0d2818] flex items-center justify-center shrink-0 group-hover:bg-[#143d24] transition-colors">
                        <MessageCircle className="w-3 h-3 text-[#25D366]" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm">WhatsApp</span>
                        <span className="text-[10px] text-muted-foreground font-normal leading-tight">Direct inquiry</span>
                      </div>
                    </motion.a>

                    <motion.a
                      href="mailto:contact@orbitsaas.cloud"
                      onClick={() => setIsCtaOpen(false)}
                      whileHover={{ scale: 1.02, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2.5 px-3 py-1.5 bg-secondary border border-border rounded-lg shadow-lg hover:border-primary/50 transition-colors text-foreground font-semibold group"
                    >
                      <div className="w-6 h-6 rounded-md bg-[#1a2a1e] flex items-center justify-center shrink-0 group-hover:bg-[#243a28] transition-colors">
                        <Mail className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm">Email Us</span>
                        <span className="text-[10px] text-muted-foreground font-normal leading-tight">Send a detailed inquiry</span>
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
              className="inline-flex items-center gap-1.5 px-4 sm:px-8 py-2 sm:py-2.5 rounded-full font-bold glass-effect text-foreground cursor-pointer justify-center text-sm sm:text-base border-[0.5px] border-amber-400/60"
            >
              {t.hero.learnMore}
            </motion.a>
          </motion.div>
          {/* Newsletter Subscribe — Desktop block (centered, fixed-height wrapper) */}
          {isHeroLoaded && (
            <div className="hidden sm:block w-full mt-6" style={{ height: '56px' }}>
              <div
                ref={emailBarRef}
                className={`w-[450px] max-w-full mx-auto z-[100] ${isCtaOpen ? 'pointer-events-none' : ''}`}
                style={{
                  opacity: isCtaOpen ? 0 : 1,
                  visibility: isCtaOpen ? 'hidden' : 'visible',
                  transition: 'opacity 0.4s ease, transform 0.4s ease, visibility 0.4s',
                  transform: 'translateY(0)',
                }}
              >
                <form onSubmit={handleSubscribe} className="relative flex justify-center w-full">
                  <input
                    type="email"
                    placeholder={lang === 'bn' ? 'আপনার ইমেইল...' : 'Enter your email...'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className="w-full bg-card/80 border border-border/60 rounded-full py-2.5 pl-6 pr-[150px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-lg text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer border-[0.5px] border-amber-400/40"
                  >
                    {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span className="inline">{lang === 'bn' ? 'যুক্ত হোন' : "Let's Build"}</span>
                  </button>
                </form>
                {status === 'success' && (
                  <p className="text-emerald-400 text-xs mt-3 text-center animate-in fade-in slide-in-from-bottom-2 font-medium">
                    {lang === 'bn' ? 'আমাদের এক্সক্লুসিভ ওয়েটলিস্টে স্বাগতম!' : 'Welcome to the exclusive waitlist!'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>{/* End Hero Container Card */}
      </div>

      {/* Full-Screen Blur Overlay for Mobile Newsletter Focus */}
      <AnimatePresence>
        {isNewsletterFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-background/60 backdrop-blur-md sm:hidden"
            onClick={() => {
              if (!email) setIsNewsletterFocused(false);
              // Small hack to blur the input & hide keyboard when backdrop is clicked
              if (mobileEmailBarRef.current) {
                const input = mobileEmailBarRef.current.querySelector('input');
                if (input) input.blur();
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Newsletter Subscribe — Mobile block (fixed to viewport, outside transform) */}
      {isHeroLoaded && (
        <motion.div
          ref={mobileEmailBarRef}
          layout
          initial={false}
          animate={{
            width: isNewsletterFocused ? 'calc(100% - 32px)' : '140px',
            right: isNewsletterFocused ? '16px' : '80px',
            bottom: isNewsletterFocused ? '120px' : '100px',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
          className={`fixed left-4 z-[100] sm:hidden ${isCtaOpen ? 'pointer-events-none' : ''}`}
          style={{
            opacity: isCtaOpen ? 0 : 1,
            visibility: isCtaOpen ? 'hidden' : 'visible',
            transition: 'opacity 0.4s ease, visibility 0.4s',
          }}
        >
          <form
            onSubmit={handleSubscribe}
            className="relative flex justify-center w-full"
            onClick={() => !isNewsletterFocused && setIsNewsletterFocused(true)}
          >
            <motion.input
              layout
              type="email"
              placeholder={!isNewsletterFocused ? (lang === 'bn' ? 'যুক্ত হোন' : 'Stay Updated') : (lang === 'bn' ? 'আপনার ইমেইল...' : 'Enter your email...')}
              value={email}
              autoFocus={isNewsletterFocused}
              onFocus={() => setIsNewsletterFocused(true)}
              onBlur={() => !email && setIsNewsletterFocused(false)}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className={`w-full bg-card/90 border border-primary/30 rounded-full py-2.5 transition-all shadow-xl text-foreground placeholder:text-muted-foreground/60 ${isNewsletterFocused ? 'pl-5 pr-[120px] text-sm' : 'pl-10 pr-4 text-xs font-bold'
                }`}
            />

            {!isNewsletterFocused && (
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-pulse" />
            )}

            <AnimatePresence>
              {isNewsletterFocused && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-full bg-primary text-primary-foreground font-bold text-[12px] flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all"
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{lang === 'bn' ? 'যুক্ত হোন' : "Let's Build"}</span>
                </motion.button>
              )}
            </AnimatePresence>
          </form>

          {status === 'success' && (
            <p className="text-emerald-400 text-[10px] mt-2 text-center animate-in fade-in slide-in-from-bottom-2 font-medium">
              {lang === 'bn' ? 'স্বাগতম!' : 'Welcome!'}
            </p>
          )}
        </motion.div>
      )}


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
