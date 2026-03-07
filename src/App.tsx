import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ContentProvider } from './contexts/ContentContext';
import { Navbar } from './components/orbit/Navbar';
import { Home } from './components/orbit/Home';
import { StructuredData } from './components/seo/StructuredData';
import ScrollToTop from './components/ScrollToTop';
import { GlobalBackground } from './components/orbit/GlobalBackground';
import { useContent } from './contexts/ContentContext';
import { getAudioCtx } from './components/orbit/CollisionSound';
import { Check, ShieldCheck, Orbit as OrbitIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { SEOHead } from './components/seo/SEOHead';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Lazy load public sections
const StatsSection = lazy(() => import('./components/orbit/StatsSection').then(m => ({ default: m.StatsSection })));
const ServicesSection = lazy(() => import('./components/orbit/ServicesSection').then(m => ({ default: m.ServicesSection })));
const TechStackSection = lazy(() => import('./components/orbit/TechStackSection').then(m => ({ default: m.TechStackSection })));
const WhyUsSection = lazy(() => import('./components/orbit/WhyUsSection').then(m => ({ default: m.WhyUsSection })));
const ProjectsSection = lazy(() => import('./components/orbit/ProjectsSection').then(m => ({ default: m.ProjectsSection })));
const LeadershipSection = lazy(() => import('./components/orbit/LeadershipSection').then(m => ({ default: m.LeadershipSection })));
const ReviewsSection = lazy(() => import('./components/orbit/ReviewsSection').then(m => ({ default: m.ReviewsSection })));
const ContactSection = lazy(() => import('./components/orbit/ContactSection').then(m => ({ default: m.ContactSection })));
const OrbitFooter = lazy(() => import('./components/orbit/OrbitFooter').then(m => ({ default: m.OrbitFooter })));
const Chatbot = lazy(() => import('./components/orbit/Chatbot').then(m => ({ default: m.Chatbot })));
const LeadMagnetPopup = lazy(() => import('./components/orbit/LeadMagnetPopup').then(m => ({ default: m.LeadMagnetPopup })));

// Lazy load public pages
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

// Lazy load admin pages
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const AdminHero = lazy(() => import('./pages/admin/AdminHero'));
const AdminStats = lazy(() => import('./pages/admin/AdminStats'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminTechStack = lazy(() => import('./pages/admin/AdminTechStack'));
const AdminWhyUs = lazy(() => import('./pages/admin/AdminWhyUs'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminLeadership = lazy(() => import('./pages/admin/AdminLeadership'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminContact = lazy(() => import('./pages/admin/AdminContact'));
const AdminFooter = lazy(() => import('./pages/admin/AdminFooter'));
const AdminChatbot = lazy(() => import('./pages/admin/AdminChatbot'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const AdminLinks = lazy(() => import('./pages/admin/AdminLinks'));
const AdminNavbar = lazy(() => import('./pages/admin/AdminNavbar'));
const AdminSEO = lazy(() => import('./pages/admin/AdminSEO'));
const AdminBackup = lazy(() => import('./pages/admin/AdminBackup'));
const AdminLegal = lazy(() => import('./pages/admin/AdminLegal'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));

function AdminLoading() {
  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

/**
 * VisitorGateway: A global wrapper for all public-facing routes.
 */
function VisitorGateway({ children }: { children: React.ReactNode }) {
  const { loading: isDataLoading } = useContent();
  const [hasEntered, setHasEntered] = useState(() => sessionStorage.getItem('orbit_gate_passed') === 'true');
  const [isChecked, setIsChecked] = useState(false);

  const handleEnter = async () => {
    // Phase 1: Animate the checkbox tick
    setIsChecked(true);

    // Phase 2: Request notification permission DURING this user gesture
    // (must be called synchronously from click handler to avoid browser blocking it)
    try {
      if ('Notification' in window && 'serviceWorker' in navigator && localStorage.getItem('orbit_push_subscribed') !== 'true') {
        let permission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }

        if (permission === 'granted') {
          // Subscribe in the background — don't block the gate transition
          (async () => {
            try {
              const registration = await navigator.serviceWorker.ready;
              const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
              if (!vapidPublicKey) return;

              const padding = '='.repeat((4 - (vapidPublicKey.length % 4)) % 4);
              const base64 = (vapidPublicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
              const rawData = atob(base64);
              const applicationServerKey = new Uint8Array(rawData.length);
              for (let i = 0; i < rawData.length; i++) applicationServerKey[i] = rawData.charCodeAt(i);

              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey,
              });

              const sub = subscription.toJSON();
              const API_BASE = import.meta.env.VITE_API_URL || '';
              await fetch(`${API_BASE}/api/notifications?action=subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: sub.endpoint, keys: sub.keys }),
              });

              localStorage.setItem('orbit_push_subscribed', 'true');
            } catch (err) {
              console.error('Push subscription failed:', err);
            }
          })();
        }
      }
    } catch { }

    // Phase 3: After a brief delay to show the check animation, enter the site
    setTimeout(() => {
      setHasEntered(true);
      sessionStorage.setItem('orbit_gate_passed', 'true');
      localStorage.removeItem('orbit_sound_muted');
      window.dispatchEvent(new Event('orbit-sound-toggle'));
      try { getAudioCtx().resume(); } catch { }
    }, 700);
  };

  return (
    <>
      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
          >
            <div className="flex flex-col items-center max-w-sm w-full px-6">
              <div className="mb-8 text-center flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                  <OrbitIcon className="w-10 h-10 text-primary animate-[spin_8s_linear_infinite] absolute opacity-30" />
                  <div className="w-14 h-14 rounded-full border-t-2 border-r-2 border-primary animate-[spin_3s_linear_infinite]" />
                  <ShieldCheck className="w-6 h-6 text-primary absolute" />
                </div>
                <h2 className="text-xl font-bold font-display tracking-widest text-foreground uppercase">Initializing Orbit</h2>
                <p className="text-sm text-muted-foreground mt-1">Checking secure connection...</p>
              </div>

              <div className="w-full flex flex-col items-center">
                {isDataLoading ? (
                  <div className="flex items-center gap-4 w-full justify-center p-4">
                    <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                    <span className="text-sm font-medium animate-pulse text-muted-foreground">Loading Assets & Content...</span>
                  </div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 15 }}
                    animate={isChecked
                      ? { opacity: 1, scale: 1, y: 0 }
                      : {
                        opacity: 1,
                        scale: [1, 1.04, 1],
                        y: 0,
                        boxShadow: [
                          '0 0 8px rgba(16,185,129,0.15), 0 0 15px rgba(245,158,11,0.08)',
                          '0 0 25px rgba(16,185,129,0.4), 0 0 50px rgba(245,158,11,0.2)',
                          '0 0 8px rgba(16,185,129,0.15), 0 0 15px rgba(245,158,11,0.08)',
                        ],
                      }
                    }
                    transition={isChecked
                      ? { type: 'spring', stiffness: 300, damping: 15 }
                      : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    }
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleEnter}
                    disabled={isChecked}
                    className="w-full max-w-[300px] relative group overflow-hidden rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-500 backdrop-blur-md"
                    style={{
                      background: isChecked
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(245,158,11,0.15))'
                        : 'rgba(255,255,255,0.03)',
                      border: isChecked
                        ? '1.5px solid rgba(16,185,129,0.6)'
                        : '1.5px solid rgba(255,255,255,0.1)',
                      boxShadow: isChecked
                        ? '0 0 25px rgba(16,185,129,0.3), 0 0 50px rgba(245,158,11,0.15)'
                        : '0 2px 10px rgba(0,0,0,0.2)',
                    }}
                  >
                    {/* Shimmer sweep effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(16,185,129,0.08) 50%, transparent 60%)',
                        backgroundSize: '200% 100%',
                      }}
                      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Checkbox */}
                    <motion.div
                      animate={isChecked ? {
                        scale: [1, 1.3, 1],
                        borderColor: ['rgba(16,185,129,0.6)', 'rgba(245,158,11,0.8)', 'rgba(16,185,129,0.8)'],
                        backgroundColor: ['rgba(16,185,129,0.1)', 'rgba(16,185,129,0.2)', 'rgba(16,185,129,0.15)'],
                      } : {}}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`relative w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 ${isChecked
                        ? 'border-2 border-emerald-500 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        : 'border-2 border-muted-foreground/30 group-hover:border-emerald-500/60 group-hover:bg-emerald-500/5'
                        }`}
                    >
                      <AnimatePresence>
                        {isChecked && (
                          <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                          >
                            <Check className="w-4.5 h-4.5 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {!isChecked && (
                        <Check className="w-4 h-4 text-transparent group-hover:text-amber-500/40 transition-colors duration-300" strokeWidth={3} />
                      )}
                    </motion.div>

                    {/* Label */}
                    <span className={`text-sm font-bold tracking-wide text-left uppercase transition-all duration-500 ${isChecked
                      ? 'bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent'
                      : 'text-foreground group-hover:text-amber-500'
                      }`}>
                      {isChecked ? 'Verified ✓' : 'I am not a robot'}
                    </span>

                    {/* Glow ring on checked */}
                    {isChecked && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-xl border-2 border-emerald-500/50 pointer-events-none"
                      />
                    )}
                  </motion.button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-8 text-center uppercase tracking-widest">
                Protected by Orbit Security
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {hasEntered ? children : null}
    </>
  );
}

function PublicSite() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let sessionId = localStorage.getItem('orbit_visitor_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('orbit_visitor_session_id', sessionId);
    }
    const API_BASE = import.meta.env.VITE_API_URL || '';
    fetch(`${API_BASE}/api/leads?action=visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    }).catch(err => console.error("Visitor logging failed", err));
  }, []);

  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 10500);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const hash = window.location.hash;
    if (!hash || hash === '#hero') return;
    const timer = setTimeout(() => {
      const el = document.getElementById(hash.substring(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => setShowChatbot(true), 2000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  return (
    <div className="min-h-[100dvh] text-foreground relative z-0">
      {isLoaded && <Navbar />}
      <main className="pb-24 md:pb-0">
        <Home />
        {isLoaded && (
          <Suspense fallback={null}>
            <StatsSection />
            <ServicesSection />
            <TechStackSection />
            <WhyUsSection />
            <ProjectsSection />
            <ReviewsSection />
            <LeadershipSection />
            <ContactSection />
          </Suspense>
        )}
      </main>
      {isLoaded && (
        <Suspense fallback={null}>
          <OrbitFooter />
        </Suspense>
      )}
      {isLoaded && (
        <Suspense fallback={null}>
          <LeadMagnetPopup />
        </Suspense>
      )}
      {showChatbot && (
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      )}
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ContentProvider>
          <LanguageProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <SEOHead />
              <Suspense fallback={<AdminLoading />}>
                <Routes>
                  {/* Public Experience wrapped in Gateway */}
                  <Route path="/" element={
                    <VisitorGateway>
                      <StructuredData />
                      <GlobalBackground />
                      <PublicSite />
                    </VisitorGateway>
                  } />
                  <Route path="/project" element={
                    <VisitorGateway>
                      <StructuredData />
                      <GlobalBackground />
                      <ProjectsPage />
                    </VisitorGateway>
                  } />
                  <Route path="/project/:id" element={
                    <VisitorGateway>
                      <StructuredData />
                      <GlobalBackground />
                      <ProjectDetail />
                    </VisitorGateway>
                  } />
                  <Route path="/privacy" element={
                    <VisitorGateway>
                      <StructuredData />
                      <GlobalBackground />
                      <PrivacyPolicy />
                    </VisitorGateway>
                  } />
                  <Route path="/terms" element={
                    <VisitorGateway>
                      <StructuredData />
                      <GlobalBackground />
                      <TermsOfService />
                    </VisitorGateway>
                  } />

                  {/* Admin Area */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/hero" replace />} />
                    <Route path="login" element={<AdminLogin />} />
                    <Route path="hero" element={<AdminHero />} />
                    <Route path="stats" element={<AdminStats />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="tech-stack" element={<AdminTechStack />} />
                    <Route path="why-us" element={<AdminWhyUs />} />
                    <Route path="project" element={<AdminProjects />} />
                    <Route path="leadership" element={<AdminLeadership />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="contact" element={<AdminContact />} />
                    <Route path="footer" element={<AdminFooter />} />
                    <Route path="chatbot" element={<AdminChatbot />} />
                    <Route path="links" element={<AdminLinks />} />
                    <Route path="navbar" element={<AdminNavbar />} />
                    <Route path="seo" element={<AdminSEO />} />
                    <Route path="leads" element={<AdminLeads />} />
                    <Route path="backup" element={<AdminBackup />} />
                    <Route path="legal" element={<AdminLegal />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </LanguageProvider>
        </ContentProvider>
      </QueryClientProvider>
    </>
  );
}
