import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ContentProvider } from './contexts/ContentContext';
import { Navbar } from './components/orbit/Navbar';
import { HeroSection } from './components/orbit/HeroSection';
import { ServicesSection } from './components/orbit/ServicesSection';
import { TechStackSection } from './components/orbit/TechStackSection';
import { WhyUsSection } from './components/orbit/WhyUsSection';
import { ProjectsSection } from './components/orbit/ProjectsSection';
import { LeadershipSection } from './components/orbit/LeadershipSection';
import { ContactSection } from './components/orbit/ContactSection';
import { OrbitFooter } from './components/orbit/OrbitFooter';
import { Chatbot } from './components/orbit/Chatbot';
import { StructuredData } from './components/seo/StructuredData';
import { LeadMagnetPopup } from './components/orbit/LeadMagnetPopup';
import ScrollToTop from './components/ScrollToTop';

import { lazy, Suspense, useEffect } from 'react';

// Lazy load admin pages
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const AdminHero = lazy(() => import('./pages/admin/AdminHero'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminTechStack = lazy(() => import('./pages/admin/AdminTechStack'));
const AdminWhyUs = lazy(() => import('./pages/admin/AdminWhyUs'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminLeadership = lazy(() => import('./pages/admin/AdminLeadership'));
const AdminContact = lazy(() => import('./pages/admin/AdminContact'));
const AdminFooter = lazy(() => import('./pages/admin/AdminFooter'));
const AdminChatbot = lazy(() => import('./pages/admin/AdminChatbot'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const AdminLinks = lazy(() => import('./pages/admin/AdminLinks'));
const AdminNavbar = lazy(() => import('./pages/admin/AdminNavbar'));
const AdminSEO = lazy(() => import('./pages/admin/AdminSEO'));
const AdminBackup = lazy(() => import('./pages/admin/AdminBackup'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));

import { InitialLoader } from './components/orbit/InitialLoader';

function PublicSite() {
  // Formulate and record unique visitor session
  useEffect(() => {
    let sessionId = localStorage.getItem('orbit_visitor_session_id');
    if (!sessionId) {
      // Create a unique UUID for this visitor
      sessionId = crypto.randomUUID();
      localStorage.setItem('orbit_visitor_session_id', sessionId);
    }

    // Ping the api silently to log the visitor
    const API_BASE = import.meta.env.VITE_API_URL || '';
    fetch(`${API_BASE}/api/record-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    }).catch(err => console.error("Visitor logging failed", err));
  }, []);

  // Mobile UX: Scroll to hide address bar
  useEffect(() => {
    const hideAddressBar = () => {
      window.scrollTo({
        top: 1,
        behavior: 'smooth'
      });
    };

    // Try multiple times to ensure it works across different browsers/loading speeds
    setTimeout(hideAddressBar, 0);
    setTimeout(hideAddressBar, 100);
    setTimeout(hideAddressBar, 500);
    setTimeout(hideAddressBar, 1000);

    window.addEventListener('load', hideAddressBar);
    window.addEventListener('orientationchange', () => {
      setTimeout(hideAddressBar, 100);
    });

    return () => {
      window.removeEventListener('load', hideAddressBar);
      window.removeEventListener('orientationchange', hideAddressBar);
    };
  }, []);

  return (
    <>
      <LeadMagnetPopup />
      <InitialLoader />
      <StructuredData />
      <div className="min-h-[100dvh] bg-background text-foreground">
        <Navbar />
        <main>
          <HeroSection />
          <ServicesSection />
          <TechStackSection />
          <WhyUsSection />
          <ProjectsSection />
          <LeadershipSection />
          <ContactSection />
        </main>
        <OrbitFooter />
        <Chatbot />
      </div>
    </>
  );
}

function AdminLoading() {
  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import { SEOHead } from './components/seo/SEOHead';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Consider data stale immediately
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnMount: true, // Refetch on mount
      refetchOnReconnect: true, // Refetch on reconnect
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ContentProvider>
          <LanguageProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <SEOHead />
              <Suspense fallback={<AdminLoading />}>
                <Routes>
                  <Route path="/" element={<PublicSite />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/project/:id" element={<ProjectDetail />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/hero" replace />} />
                    <Route path="hero" element={<AdminHero />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="tech-stack" element={<AdminTechStack />} />
                    <Route path="why-us" element={<AdminWhyUs />} />
                    <Route path="projects" element={<AdminProjects />} />
                    <Route path="leadership" element={<AdminLeadership />} />
                    <Route path="contact" element={<AdminContact />} />
                    <Route path="footer" element={<AdminFooter />} />
                    <Route path="chatbot" element={<AdminChatbot />} />
                    <Route path="links" element={<AdminLinks />} />
                    <Route path="navbar" element={<AdminNavbar />} />
                    <Route path="seo" element={<AdminSEO />} />
                    <Route path="leads" element={<AdminLeads />} />
                    <Route path="backup" element={<AdminBackup />} />

                  </Route>
                </Routes>
              </Suspense>
              <Analytics />
            </BrowserRouter>
          </LanguageProvider>
        </ContentProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
