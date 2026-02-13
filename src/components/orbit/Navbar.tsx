import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Sun, Moon, Home, Layers, MessageSquare, Trophy, Users, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import orbitLogo from '@/assets/orbit-logo.png';

const WHATSAPP_URL = 'https://wa.me/8801853452264';

const mobileNavItems = [
  { href: '#hero', icon: Home, label: 'Home' },
  { href: '#services', icon: Layers, label: 'Services' },
  { href: '#tech-stack', icon: Trophy, label: 'Tech' },
  { href: '#why-us', icon: MessageSquare, label: 'Why Us' },
  { href: '#leadership', icon: Users, label: 'Team' },
  { href: '#contact', icon: Phone, label: 'Contact' },
];

export function Navbar() {
  const { t, lang, toggleLang } = useLang();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [activeSection, setActiveSection] = useState('#hero');

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detect active section
      const sections = ['hero', 'services', 'tech-stack', 'why-us', 'leadership', 'contact'];
      let current = 'hero';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 3) {
            current = id;
          }
        }
      }
      setActiveSection(`#${current}`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#services', label: t.nav.services },
    { href: '#tech-stack', label: t.nav.techStack },
    { href: '#why-us', label: t.nav.whyUs },
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
        <div className={`w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 transition-all duration-500 ease-in-out rounded-full backdrop-blur-xl ${isScrolled ? 'bg-card/90 border border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-card/70 navbar-gradient-border'}`}>
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
                <a key={l.href} href={l.href} className="px-4 py-1.5 rounded-full border border-foreground/20 dark:border-white/20 text-foreground/80 hover:text-foreground hover:border-foreground/40 dark:hover:border-white/60 hover:bg-foreground/5 dark:hover:bg-white/5 font-medium gentle-animation text-sm">{l.label}</a>
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
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-lg font-semibold text-sm text-primary-foreground bg-primary neon-glow hover:opacity-90 gentle-animation cursor-pointer">
                {t.nav.bookCall}
              </a>
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
        <div className="flex items-center gap-1 px-2.5 py-2.5 rounded-full bg-card/90 backdrop-blur-2xl border border-border shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-x-auto scrollbar-hide mx-auto w-fit max-w-full">
          {mobileNavItems.map((item) => {
            const isActive = activeSection === item.href;
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setActiveSection(item.href)}
                className="relative"
              >
                <motion.div
                  layout
                  className={`flex items-center gap-1.5 rounded-full gentle-animation cursor-pointer ${
                    isActive
                      ? 'bg-primary/15 dark:bg-primary/20 px-4 py-2.5'
                      : 'px-3 py-2.5 hover:bg-foreground/5'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
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
