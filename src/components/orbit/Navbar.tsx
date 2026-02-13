import { motion } from 'framer-motion';
import { Menu, X, Globe, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';

const WHATSAPP_URL = 'https://wa.me/8801853452264';

export function Navbar() {
  const { t, lang, toggleLang } = useLang();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileOpen]);

  const links = [
    { href: '#services', label: t.nav.services },
    { href: '#tech-stack', label: t.nav.techStack },
    { href: '#why-us', label: t.nav.whyUs },
    { href: '#leadership', label: t.nav.leadership },
    { href: '#contact', label: t.nav.contact },
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 w-full z-[110]"
      >
        <div className={`w-full px-4 sm:px-8 lg:px-12 py-3 sm:py-4 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border' : 'bg-transparent'}`}>
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="https://storage.googleapis.com/gpt-engineer-file-uploads/aMjanxrDoUP1QJ5krTWiqhWnSbF3/uploads/1758710472461-logo-icon-BG-circle copy.png"
                alt="ORBIT SaaS Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
              />
              <span className="font-display text-foreground text-base sm:text-xl font-bold tracking-wider">ORBIT</span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              {links.map(l => (
                <a key={l.href} href={l.href} className="text-foreground/80 hover:text-foreground font-medium gentle-animation text-sm">{l.label}</a>
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
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden glass-effect p-2 sm:p-2.5 rounded-full text-foreground cursor-pointer">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:hidden fixed inset-0 bg-background/60 backdrop-blur-md z-[100]" onClick={() => setMobileOpen(false)} />
      )}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: mobileOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="md:hidden fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-background/95 backdrop-blur-xl border-l border-border z-[105]"
      >
        <div className="flex flex-col p-6 pt-20 gap-4">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-foreground px-4 py-3 rounded-lg hover:bg-secondary font-medium text-lg">{l.label}</a>
          ))}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="mt-4 text-center px-5 py-3 rounded-lg font-semibold text-primary-foreground bg-primary neon-glow">
            {t.nav.bookCall}
          </a>
        </div>
      </motion.div>
    </>
  );
}
