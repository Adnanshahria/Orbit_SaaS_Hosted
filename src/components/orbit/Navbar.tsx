import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Home, Layers, MessageSquare, Trophy, Users, Phone, FolderOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import orbitLogo from '@/assets/orbit-logo.png';
import { useNavigate, useLocation } from 'react-router-dom';

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

  // Dynamic WhatsApp URL from admin settings
  const whatsappNumber = (t.contact as any).whatsapp || '';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('#hero');
  const navigate = useNavigate();
  const location = useLocation();
  const [showNavbarCTA, setShowNavbarCTA] = useState(false);

  // Unified scroll handler — single listener with rAF throttling
  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        setIsScrolled(window.scrollY > 50);

        // Detect active section (only on home page)
        if (location.pathname !== '/') {
          setActiveSection('');
        } else {
          const sections = ['hero', 'services', 'tech-stack', 'why-us', 'projects', 'leadership', 'contact'];
          let current = 'hero';
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
        }

        // CTA visibility based on Hero button position
        const heroBtn = document.getElementById('hero-book-appointment');
        if (heroBtn) {
          const rect = heroBtn.getBoundingClientRect();
          setShowNavbarCTA(rect.top < -50);
        } else {
          setShowNavbarCTA(true);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
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
        <div className={`navbar-gradient-border w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 transition-all duration-500 ease-in-out rounded-full ${isScrolled ? 'bg-background/80 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-transparent'}`}>
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
            <motion.div
              layout="position"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="hidden md:flex items-center gap-2"
            >
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
            </motion.div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <AnimatePresence>
                {showNavbarCTA && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, width: 0, x: 10 }}
                    animate={{ opacity: 1, scale: 1, width: "auto", x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, width: 0, x: 10 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30
                    }}
                    className="flex shrink-0 overflow-hidden"
                  >
                    <motion.a
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full font-semibold text-sm text-primary-foreground bg-gradient-to-r from-[#6c5ce7] to-[#3b82f6] dark:to-[#4facfe] shadow-[0_5px_15px_rgba(108,92,231,0.3)] hover:shadow-[0_8px_25px_rgba(108,92,231,0.5)] gentle-animation cursor-pointer mr-1 sm:mr-2 transform-gpu whitespace-nowrap"
                    >
                      {t.nav.bookCall}
                    </motion.a>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={toggleLang} className="glass-effect px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-foreground hover:bg-foreground/10 gentle-animation flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium cursor-pointer shrink-0">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {lang === 'en' ? 'বাং' : 'EN'}
              </button>
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
        <div className="navbar-gradient-border flex items-center gap-0.5 px-3 py-3 rounded-[28px] bg-background/80 shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-x-auto scrollbar-hide mx-auto w-fit max-w-full">
          {links.map((link) => {
            const isActive = activeSection === link.href;
            // Map href to icon
            const Icon = mobileNavItems.find(i => i.href === link.href)?.icon || Layers;

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(e, link.href);
                  setActiveSection(link.href);
                }}
                className="relative"
              >
                <motion.div
                  layout
                  className={`flex items-center gap-2 rounded-full gentle-animation cursor-pointer ${isActive
                    ? 'bg-primary/20 px-3 py-2 border border-primary/50 shadow-[0_0_12px_rgba(108,92,231,0.3)]'
                    : 'px-2 py-2 hover:bg-foreground/5 border border-transparent'
                    }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-sm font-semibold text-primary whitespace-nowrap overflow-hidden"
                      >
                        {link.label}
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
