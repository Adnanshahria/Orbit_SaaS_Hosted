import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Sun, Moon, Home, Layers, MessageSquare, Trophy, Users, Phone, FolderOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import orbitLogo from '@/assets/orbit-logo.png';
import { useNavigate, useLocation } from 'react-router-dom';

const WHATSAPP_URL = 'https://wa.me/8801853452264';

const mobileNavItems = [
  { href: '#hero', icon: Home, label: 'Home' },
  { href: '#services', icon: Layers, label: 'Services' },
  { href: '#tech-stack', icon: Trophy, label: 'Tech' },
  { href: '#why-us', icon: MessageSquare, label: 'Why Us' },
  { href: '#projects', icon: FolderOpen, label: 'Projects' },
  { href: '#leadership', icon: Users, label: 'Team' },
  { href: '#contact', icon: Phone, label: 'Contact' },
];

export function Navbar() {
  const { t, lang, toggleLang } = useLang();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [activeSection, setActiveSection] = useState('#hero');
  const navigate = useNavigate();
  const location = useLocation();
  const [showNavbarCTA, setShowNavbarCTA] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  // Handle scroll spy
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detect active section
      const sections = ['hero', 'services', 'tech-stack', 'why-us', 'projects', 'leadership', 'contact'];
      let current = 'hero';

      // If scrolled to bottom of page, highlight contact
      const atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 50;
      if (atBottom) {
        current = 'contact';
      } else {
        for (const id of sections) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 150) {
              current = id;
            }
          }
        }
      }
      setActiveSection(`#${current}`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Handle hash scrolling on mount or when location changes (for cross-page nav)
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100); // Small delay to ensure render
      }
    }
  }, [location.pathname, location.hash]);

  // Handle CTA visibility based on Hero button position
  useEffect(() => {
    const handleScroll = () => {
      const heroBtn = document.getElementById('hero-book-appointment');
      if (heroBtn) {
        const rect = heroBtn.getBoundingClientRect();
        // Show navbar CTA only when hero CTA is scrolled out of view (top < 0)
        setShowNavbarCTA(rect.top < -50);
      } else {
        // Fallback if on other pages where hero btn might not exist (optional, or hide it)
        // Let's hidden it on other pages to not distract, OR show it since there's no hero btn to duplicate.
        // Usually on inner pages you want the CTA visible.
        setShowNavbarCTA(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const id = href.substring(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
      }
    } else {
      navigate('/' + href);
    }
  };

  const links = [
    { href: '#services', label: t.nav.services },
    { href: '#tech-stack', label: t.nav.techStack },
    { href: '#why-us', label: t.nav.whyUs },
    { href: '#projects', label: (t.nav as any).projects ?? 'Projects' },
    { href: '#leadership', label: t.nav.leadership },
    { href: '#contact', label: t.nav.contact },
  ];

  return (
    <>
      {/* Desktop top navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 w-full z-[110] px-3 sm:px-4 md:px-6 lg:px-10 pt-3"
      >
        <div className={`w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 transition-all duration-500 ease-in-out rounded-full backdrop-blur-xl ${isScrolled ? 'bg-card/90 border border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.3)] dark:border-neon-purple/30 dark:shadow-[0_0_20px_rgba(139,92,246,0.15)]' : 'bg-card/70 navbar-gradient-border'}`}>
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/');
              }
            }}>
              <img
                src={orbitLogo}
                alt="ORBIT SaaS Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-full"
              />
              <span className="font-display text-foreground text-base sm:text-xl font-bold tracking-wider">ORBIT</span>
            </motion.div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-2">
              {links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => scrollToSection(e, l.href)}
                  className={`px-4 py-1.5 rounded-full border font-medium gentle-animation text-sm ${activeSection === l.href
                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(108,92,231,0.3)]'
                    : 'border-foreground/20 dark:border-white/20 text-foreground/80 hover:text-foreground hover:border-foreground/40 dark:hover:border-white/60 hover:bg-foreground/5 dark:hover:bg-white/5'
                    }`}>{l.label}</a>
              ))}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <button onClick={toggleTheme} className="glass-effect p-2 sm:p-2.5 rounded-full text-foreground hover:bg-foreground/10 gentle-animation cursor-pointer" aria-label="Toggle theme">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={toggleLang} className="glass-effect px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-foreground hover:bg-foreground/10 gentle-animation flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium cursor-pointer">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {lang === 'en' ? 'বাং' : 'EN'}
              </button>

              <AnimatePresence>
                {showNavbarCTA && (
                  <motion.a
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full font-semibold text-sm text-primary-foreground bg-gradient-to-r from-[#6c5ce7] to-[#3b82f6] dark:to-[#4facfe] shadow-lg hover:opacity-90 gentle-animation cursor-pointer"
                  >
                    {t.nav.bookCall}
                  </motion.a>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile bottom pill navbar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="md:hidden fixed bottom-5 left-4 right-4 z-[120]"
      >
        <div className="flex items-center gap-0.5 px-3 py-3 rounded-[28px] bg-card/90 backdrop-blur-2xl border border-border dark:border-neon-purple/25 shadow-[0_10px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_30px_rgba(139,92,246,0.2)] overflow-x-auto scrollbar-hide mx-auto w-fit max-w-full">
          {mobileNavItems.map((item) => {
            const isActive = activeSection === item.href;
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(e, item.href);
                  setActiveSection(item.href);
                }}
                className="relative"
              >
                <motion.div
                  layout
                  className={`flex items-center gap-2 rounded-full gentle-animation cursor-pointer ${isActive
                    ? 'bg-primary/20 px-4 py-2.5 border border-primary/50 shadow-[0_0_12px_rgba(108,92,231,0.3)]'
                    : 'px-3 py-2.5 hover:bg-foreground/5 border border-transparent'
                    }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-sm font-semibold text-primary whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </a>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
