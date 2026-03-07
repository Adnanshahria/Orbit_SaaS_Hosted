import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Send, Loader2, Mail, MessageCircle, Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud, Cpu, Monitor, Wifi, Camera, Music, Heart, Star, Target, Briefcase, Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette, Brain, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Custom Icons ───
const Bullseye = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Outer circle (broken at top-right) */}
    <path d="M16.5 4A9.5 9.5 0 1 0 20 7.5" />
    {/* Inner circle (broken at top-right) */}
    <path d="M14 8a4.5 4.5 0 1 0 2 2" />
    {/* Arrow shaft — from center outward to top-right */}
    <line x1="11" y1="13" x2="20" y2="4" />
    {/* Solid arrowhead pointing OUTWARD (at top-right) */}
    <path d="M14 2h8v8Z" fill="currentColor" stroke="currentColor" />
  </svg>
);

// ─── Icon Map for dynamic tagline icons (synced with admin panel) ───
const TAGLINE_ICON_MAP: Record<string, LucideIcon | any> = {
  Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
  Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
  Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette, Brain, Wrench,
  Bullseye
};
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { CometDiceLoaderCanvas } from './CometDiceLoaderCanvas';


/** Parse rich markers: **bold**, [[green-card]], **[[bold+green]]**, {{white-card}}, **{{bold+white}}** */
export type RichSegment = {
  text: string;
  bold: boolean;
  card: boolean;
  whiteCard: boolean;
  greenCard?: boolean;
  color?: 'green' | 'gold' | 'white';
};

function parseSubtitleSegments(str: string, inherited: Partial<RichSegment> = {}): RichSegment[] {
  if (!str) return [];
  const parts: RichSegment[] = [];

  const regex = /\*\*\[\[(.+?)\]\]\*\*|\*\*\{\{(.+?)\}\}\*\*|\*\*\=\=(.+?)\=\=\*\*|\*\*\<\<(.+?)\>\>\*\*|\*\*\(\((.+?)\)\)\*\*|\*\*\|\|(.+?)\|\|\*\*|\*\*(.+?)\*\*|\[\[(.+?)\]\]|\{\{(.+?)\}\}|\=\=(.+?)\=\=|\<\<(.+?)\>\>|\(\((.+?)\)\)|\|\|(.+?)\|\|/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(str)) !== null) {
    if (m.index > last) {
      parts.push({
        text: str.slice(last, m.index),
        bold: !!inherited.bold,
        card: !!inherited.card,
        whiteCard: !!inherited.whiteCard,
        greenCard: !!inherited.greenCard,
        color: inherited.color
      });
    }

    const content = m[1] || m[2] || m[3] || m[4] || m[5] || m[6] || m[7] || m[8] || m[9] || m[10] || m[11] || m[12] || m[13];
    const nextInherited: Partial<RichSegment> = { ...inherited };

    if (m[1] !== undefined) { nextInherited.bold = true; nextInherited.card = true; }
    else if (m[2] !== undefined) { nextInherited.bold = true; nextInherited.whiteCard = true; }
    else if (m[3] !== undefined) { nextInherited.bold = true; nextInherited.greenCard = true; }
    else if (m[4] !== undefined) { nextInherited.bold = true; nextInherited.color = 'green'; }
    else if (m[5] !== undefined) { nextInherited.bold = true; nextInherited.color = 'gold'; }
    else if (m[6] !== undefined) { nextInherited.bold = true; nextInherited.color = 'white'; }
    else if (m[7] !== undefined) { nextInherited.bold = true; }
    else if (m[8] !== undefined) { nextInherited.card = true; }
    else if (m[9] !== undefined) { nextInherited.whiteCard = true; }
    else if (m[10] !== undefined) { nextInherited.greenCard = true; }
    else if (m[11] !== undefined) { nextInherited.color = 'green'; }
    else if (m[12] !== undefined) { nextInherited.color = 'gold'; }
    else if (m[13] !== undefined) { nextInherited.color = 'white'; }

    // Recursively parse the content in case it has more markers
    const inner = parseSubtitleSegments(content, nextInherited);
    parts.push(...inner);

    last = m.index + m[0].length;
  }

  if (last < str.length) {
    parts.push({
      text: str.slice(last),
      bold: !!inherited.bold,
      card: !!inherited.card,
      whiteCard: !!inherited.whiteCard,
      greenCard: !!inherited.greenCard,
      color: inherited.color
    });
  }

  return parts;
}

/* ── Home component ───────────────────────────────────────────── */
export function Home() {
  const { t, lang } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const [isCtaOpen, setIsCtaOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isNewsletterFocused, setIsNewsletterFocused] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const mobileEmailBarRef = useRef<HTMLDivElement>(null);
  const [isInHero, setIsInHero] = useState(true);

  useEffect(() => {
    const handleChatbotState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      if (customEvent.detail) {
        setIsChatbotOpen(customEvent.detail.isOpen);
      }
    };
    window.addEventListener('orbit-chatbot-state-change', handleChatbotState);
    return () => window.removeEventListener('orbit-chatbot-state-change', handleChatbotState);
  }, []);

  // Track scroll position to hide newsletter button
  useEffect(() => {
    let wasVisible = true;
    const onScroll = () => {
      const hero = sectionRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, -rect.top / (rect.height || 1)));
      const shouldShow = ratio < 0.15;
      if (shouldShow === wasVisible) return;
      wasVisible = shouldShow;
      setIsInHero(shouldShow);
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
      const res = await fetch(`${API_BASE}/api/leads?action=submit`, {
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


  // Parse subtitle with rich markers
  const subtitle = t.hero.subtitle || '';
  const subtitleSegments = useMemo(() => parseSubtitleSegments(subtitle), [subtitle]);
  // low-perf barrier removed — canvas is efficient enough for all devices

  // Always play the loading animation on every page load
  const isFirstVisit = true;
  const baseDelay = 8.5; // Stretched to fit the new 10s canvas sequence

  // Theme Customization: Metallic Hierarchy
  const taglineColor = 'var(--metallic-pale)'; // Champagne for the subtle top tag
  const titleColor = 'var(--metallic-gold)';   // Pure Gold for the hero text
  const ctaGradientStart = 'var(--metallic-amber)';
  const ctaGradientEnd = 'var(--metallic-bronze)';

  // Dynamic WhatsApp URL from admin settings
  const whatsappNumber = (t.contact as any).whatsapp || '';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  // ─── Loading Sequence: Comet-Dice Canvas Loader ────────────────
  const letters = ['O', 'R', 'B', 'I', 'T'];

  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const saasRef = useRef<HTMLSpanElement>(null);

  const [orbitRects, setOrbitRects] = useState<any[]>([]);
  const [saasRect, setSaasRect] = useState<any>(null);

  const [revealedLetters, setRevealedLetters] = useState<boolean[]>(
    isFirstVisit ? new Array(5).fill(false) : new Array(5).fill(true)
  );
  const [saasRevealed, setSaasRevealed] = useState(!isFirstVisit);
  const [loaderComplete, setLoaderComplete] = useState(!isFirstVisit);
  const [isHeroLoaded, setIsHeroLoaded] = useState(!isFirstVisit);

  // Measure final resting places of text so Canvas can target them
  useEffect(() => {
    if (!isFirstVisit) return;
    const measure = () => {
      setOrbitRects(letterRefs.current.map(el => el ? el.getBoundingClientRect() : null));
      setSaasRect(saasRef.current ? saasRef.current.getBoundingClientRect() : null);
    };

    // Wait for fonts to be ready before measuring to guarantee exact placement
    document.fonts.ready.then(() => {
      measure();
      // And a tiny safety delay just in case of layout shifts
      setTimeout(measure, 100);
    });

    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
    };
  }, [isFirstVisit]);

  const handleRevealLetter = useCallback((idx: number) => {
    setRevealedLetters(prev => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  }, []);

  const handleRevealSaaS = useCallback(() => {
    setSaasRevealed(true);
  }, []);

  const handleLoaderComplete = useCallback(() => {
    // Safety: Force all letters to reveal just in case canvas triggers were missed
    setRevealedLetters(new Array(5).fill(true));
    setSaasRevealed(true);
    setLoaderComplete(true);
    setTimeout(() => setIsHeroLoaded(true), 300);
  }, []);

  // Fallback if canvas crashes
  useEffect(() => {
    if (!isFirstVisit) return;
    const fallback = setTimeout(() => {
      handleLoaderComplete();
    }, 15000); // 15 seconds safety fallback to allow majestic sequence to finish
    return () => clearTimeout(fallback);
  }, [isFirstVisit, handleLoaderComplete]);

  // heroHeight removed — using min-h-[100dvh] in className instead

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
      className={`relative flex flex-col items-center justify-center overflow-x-hidden transition-all duration-1000 ease-in-out min-h-[100dvh] pb-28 sm:pb-8 ${loaderComplete
        ? 'pt-0 sm:pt-6'
        : 'pt-0 sm:pt-6'
        }`}
    >

      <div
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto lg:-mt-12"
        style={{ contain: 'none' }}
      >
        <div className={`px-4 sm:px-14 py-8 sm:py-10 flex flex-col justify-center items-center gap-4 sm:gap-6 transition-all duration-700 ease-in-out ${loaderComplete ? 'min-h-0' : 'min-h-[350px]'} sm:min-h-0`}>
          {/* Badge — slides down with spring */}
          {t.hero.tagline && (() => {
            const line1 = t.hero.tagline;
            const line2 = (t.hero as any).tagline2 || '';
            const fullTagline = line2 ? `${line1} ${line2}` : line1;
            const icon1Name = (t.hero as any).taglineIcon1 || 'Bullseye';
            const icon2Name = (t.hero as any).taglineIcon2 || 'Rocket';
            const Icon1 = TAGLINE_ICON_MAP[icon1Name] || Target;
            const Icon2 = TAGLINE_ICON_MAP[icon2Name] || Rocket;
            return (
              <>
                {/* Desktop: single pill with animated SVG icons */}
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: baseDelay + 0.3 }}
                  className="hidden sm:inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-sm font-playfair italic font-bold mb-12 -mt-4 tracking-wide w-auto max-w-[95%] md:text-center shrink-0 min-w-0 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  style={{ color: taglineColor }}
                >
                  <Icon1 className="w-4 h-4 shrink-0 tagline-icon-spin text-[#10b981]" />
                  {fullTagline}
                  <Icon2 className="w-4 h-4 shrink-0 tagline-icon-float text-[#10b981]" />
                </motion.div>

                {/* Mobile: single pill with animated SVG icons */}
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: baseDelay + 0.3 }}
                  className="flex sm:hidden items-center justify-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-lg font-playfair italic font-bold text-[13px] tracking-wide mx-auto mb-6"
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1.5px solid rgba(16, 185, 129, 0.6)',
                    color: 'var(--metallic-pale)',
                  }}
                >
                  <Icon1 className="w-3.5 h-3.5 shrink-0 tagline-icon-spin text-[#10b981]" />
                  <span>{fullTagline}</span>
                  <Icon2 className="w-3.5 h-3.5 shrink-0 tagline-icon-float text-[#10b981]" />
                </motion.div>
              </>
            );
          })()}

          <div className={`text-foreground leading-[1] mb-1 sm:mb-1 flex flex-col items-center justify-center relative transition-all duration-700 ease-in-out ${loaderComplete ? 'min-h-0' : 'min-h-[140px] sm:min-h-[180px]'}`}>

            {/* ─── 3D Comet-Dice Canvas Loader ─── */}
            {!loaderComplete && orbitRects.length > 0 && saasRect && (
              <CometDiceLoaderCanvas
                orbitRects={orbitRects}
                saasRect={saasRect}
                onRevealLetter={handleRevealLetter}
                onRevealSaaS={handleRevealSaaS}
                onComplete={handleLoaderComplete}
              />
            )}

            {/* ORBIT SaaS title — Fixed layout, dice moves across it */}
            <div className="flex items-center justify-center relative z-10 whitespace-nowrap min-w-[280px]">

              {/* O-R-B-I-T container — Flex ensures natural typographic spacing */}
              <div className="flex relative items-baseline justify-center gap-[0.02em]">
                {letters.map((letter, i) => {
                  const isFirstLetter = i === 0;
                  const fontSizeClass = isFirstLetter
                    ? "text-[clamp(3.8rem,15vw,6rem)] lg:text-[7rem] xl:text-[8rem]"
                    : "text-[clamp(2.5rem,10vw,4.5rem)] lg:text-[5rem] xl:text-[6rem]";

                  return (
                    <motion.span
                      key={letter}
                      ref={(el) => { letterRefs.current[i] = el; }}
                      initial={{ opacity: 0, filter: 'blur(10px)' }}
                      animate={{
                        opacity: revealedLetters[i] ? 1 : 0,
                        filter: revealedLetters[i] ? 'none' : 'blur(10px)'
                      }}
                      transition={{
                        duration: 0.4,
                        ease: "easeOut",
                      }}
                      className={`${fontSizeClass} font-abril tracking-tight inline-block animate-text-shimmer-orbit`}
                    >
                      {letter}
                    </motion.span>
                  );
                })}
              </div>

              <motion.span
                ref={saasRef}
                initial={{ opacity: 0, filter: 'blur(8px)' }}
                animate={{
                  opacity: saasRevealed ? 1 : 0,
                  filter: saasRevealed ? 'none' : 'blur(8px)'
                }}
                className="font-abril tracking-tight inline-block ml-4"
              >
                {['S', 'a', 'a', 'S'].map((char, i) => {
                  const isLarge = i === 0 || i === 3; // First and last S

                  // 'S' uses the large size.
                  // 'a' needs to be sized up so its x-height matches the cap-height of 'RBIT' (which uses xl:text-[6rem]).
                  // vertical-align is used instead of relative/transform so WebKit's background clip doesn't break
                  const fontSizeClass = isLarge
                    ? "text-[clamp(3.8rem,15vw,6rem)] lg:text-[7rem] xl:text-[8rem]"
                    : "text-[clamp(3.3rem,13vw,5.8rem)] lg:text-[6.5rem] xl:text-[7.8rem] align-[0.05em]";

                  return (
                    <span key={i} className={`${fontSizeClass} inline-block animate-text-shimmer-saas`}>
                      {char}
                    </span>
                  );
                })}
              </motion.span>
            </div>
          </div>

          {/* Title — word-by-word reveal with blur */}
          <AnimatePresence mode="wait">
            {isHeroLoaded && (
              <motion.div
                key={`title-${lang}`}
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3 } }}
                className={`${isInHero ? 'animate-title-breath' : ''} text-[clamp(1.15rem,4.5vw,1.5rem)] leading-[1.2] sm:text-3xl md:text-4xl lg:text-[3rem] xl:text-5xl font-garamond italic font-medium tracking-normal px-1 sm:px-4 flex flex-wrap justify-center gap-x-[0.25em] gap-y-2 ${lang === 'bn' ? 'font-bengali font-bold' : ''}`}
                style={{ color: titleColor }}
              >
                {t.hero.title.split(' ').filter(Boolean).map((word: string, wi: number) => {
                  const delay = 0.05 + wi * 0.06;
                  return (
                    <motion.span
                      key={`tw-${wi}`}
                      layout
                      initial={{ opacity: 0, y: 10, filter: 'blur(8px)', scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
                      className="inline-block align-middle"
                    >
                      {word}
                    </motion.span>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtitle — word-by-word reveal with rich formatting + mid-pause */}
        <AnimatePresence mode="wait">
          <motion.p
            key={lang}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3 } }}
            className="text-muted-foreground text-[12.5px] sm:text-base md:text-lg lg:text-xl w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6 mb-4 sm:mb-6 leading-[1.6] flex flex-wrap justify-center gap-x-[0.4em] gap-y-[0.4rem] sm:gap-y-3 tracking-wide italic"
          >
            {(
              (() => {
                // Count total words for mid-pause calculation
                let totalWords = 0;
                subtitleSegments.forEach(seg => { totalWords += seg.text.split(' ').filter(Boolean).length; });
                const midPoint = Math.ceil(totalWords / 2);
                const midPause = 0.6; // seconds to pause between halves

                let wordIndex = 0;
                return subtitleSegments.map((seg, si) => {
                  if (seg.bold || seg.card || seg.whiteCard || seg.greenCard || seg.color) {
                    const wordsInSeg = seg.text.split(' ').length;
                    const pastMid = wordIndex >= midPoint;
                    const delay = (isHeroLoaded ? 0.05 : baseDelay + 0.9) + wordIndex * 0.04 + (pastMid ? midPause : 0);
                    wordIndex += wordsInSeg;
                    const cls = [
                      seg.bold && !seg.color ? 'font-bold text-white' : '',
                      seg.bold && seg.color ? 'font-bold' : '',
                      seg.card ? 'word-card' : '',
                      seg.whiteCard ? 'word-card-white' : '',
                      seg.greenCard ? 'word-card-green' : '',
                      seg.color === 'green' ? '!text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : '',
                      seg.color === 'gold' ? '!text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]' : '',
                      seg.color === 'white' ? '!text-white' : '',
                    ].filter(Boolean).join(' ');
                    return (
                      <motion.span
                        key={`seg-${si}`}
                        layout
                        initial={{ opacity: 0, y: 10, filter: 'blur(10px)', scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                        transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
                        className={`${cls} inline-block align-middle`}
                      >
                        {seg.text}
                      </motion.span>
                    );
                  }
                  return seg.text.split(' ').filter(Boolean).map((word, wi) => {
                    const pastMid = wordIndex >= midPoint;
                    const delay = (isHeroLoaded ? 0.05 : baseDelay + 0.9) + wordIndex * 0.04 + (pastMid ? midPause : 0);
                    wordIndex++;
                    return (
                      <motion.span
                        key={`w-${si}-${wi}`}
                        layout
                        initial={{ opacity: 0, y: 10, filter: 'blur(8px)', scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                        transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-block align-middle"
                      >
                        {word}
                      </motion.span>
                    );
                  });
                });
              })()
            )}
          </motion.p>
        </AnimatePresence>

        {/* CTA buttons — slide up with spring */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 16, delay: baseDelay + 1.6 }}
          className="flex flex-row w-full justify-between sm:justify-center sm:w-auto gap-4 sm:gap-10 items-center px-1 sm:px-0 mt-12 sm:mt-12 lg:mt-16"
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
              className="inline-flex items-center gap-1.5 px-4 sm:px-8 py-1.5 sm:py-2.5 rounded-full font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.2)] gentle-animation cursor-pointer justify-center text-sm sm:text-base border border-[#FFE5B4]/40"
              style={{ background: `linear-gradient(to right, var(--metallic-gold), var(--metallic-amber))` }}
            >
              {t.hero.cta}
              <div className="ml-1.5 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 border border-white/10 shadow-inner group-hover:bg-white/30 transition-colors">
                <ChevronDown strokeWidth={2.5} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-white transition-transform duration-300 ${isCtaOpen ? 'rotate-180' : ''}`} />
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
            className="inline-flex items-center gap-1.5 px-4 sm:px-8 py-1.5 sm:py-2.5 rounded-full font-bold bg-[#8B5A2B]/10 hover:bg-[#8B5A2B]/20 text-[#FFE5B4] cursor-pointer justify-center text-sm sm:text-base border border-[#8B5A2B]/40 hover:border-[#F59E0B]/60 shadow-lg"
          >
            {t.hero.learnMore}
          </motion.a>
        </motion.div>

      </div>{/* End Hero Container Card */}

      {/* Full-Screen Blur Overlay for Newsletter Focus */}
      <AnimatePresence>
        {isNewsletterFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[250] bg-background/60 backdrop-blur-md"
            onClick={() => {
              if (!email) setIsNewsletterFocused(false);
              if (mobileEmailBarRef.current) {
                const input = mobileEmailBarRef.current.querySelector('input');
                if (input) input.blur();
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Newsletter — Compact button (fixed, bottom-left, inline with chatbot) */}
      {
        isHeroLoaded && !isNewsletterFocused && (
          <div
            className={`fixed bottom-[10dvh] sm:bottom-6 left-4 sm:left-6 z-[180] transition-all duration-500 ease-out ${(!isInHero || isCtaOpen || (isChatbotOpen && typeof window !== 'undefined' && window.innerWidth < 768)) ? 'opacity-0 pointer-events-none translate-y-4 scale-90 invisible' : 'opacity-100 translate-y-0 scale-100 visible'}`}
          >
            <button
              type="button"
              onClick={() => setIsNewsletterFocused(true)}
              className="flex items-center gap-2 bg-card/90 border border-primary/50 rounded-full py-2.5 pl-3.5 pr-5 text-xs font-bold text-foreground cursor-pointer newsletter-attract backdrop-blur-sm"
            >
              <Mail className="w-4 h-4 text-primary animate-bounce" />
              <span>{lang === 'bn' ? 'যুক্ত হোন' : 'Stay Updated'}</span>
            </button>
          </div>
        )
      }

      {/* Newsletter — Expanded email form (centered overlay) */}
      <AnimatePresence>
        {isHeroLoaded && isNewsletterFocused && (
          <div className="fixed inset-0 z-[260] flex items-center justify-center px-4">
            <div className="absolute inset-0" onClick={() => { if (!email) setIsNewsletterFocused(false); }} />
            <motion.div
              ref={mobileEmailBarRef}
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative w-full max-w-[420px]"
            >
              <form onSubmit={handleSubscribe} className="relative flex justify-center w-full">
                <input
                  type="email"
                  placeholder={lang === 'bn' ? 'আপনার ইমেইল...' : 'Enter your email...'}
                  value={email}
                  autoFocus
                  onBlur={() => !email && setIsNewsletterFocused(false)}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full bg-card/95 border border-primary/30 rounded-full py-3 pl-5 pr-[130px] text-sm shadow-2xl text-amber-500 font-bold tracking-wider placeholder:text-muted-foreground/60 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-xl"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-5 rounded-full bg-primary text-primary-foreground font-bold text-[12px] flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{lang === 'bn' ? 'যুক্ত হোন' : "Let's Build"}</span>
                </button>
              </form>
              {status === 'success' && (
                <p className="text-amber-500 text-xs mt-3 text-center animate-in fade-in slide-in-from-bottom-2 font-medium">
                  {lang === 'bn' ? 'স্বাগতম!' : 'Welcome to the waitlist!'}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>


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
    </section >
  );
}

