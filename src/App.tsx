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

import { lazy, Suspense } from 'react';

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
const AdminNavbar = lazy(() => import('./pages/admin/AdminNavbar'));
const AdminSEO = lazy(() => import('./pages/admin/AdminSEO'));

function PublicSite() {
  return (
    <>
      <StructuredData />
      <div className="min-h-screen bg-background text-foreground">
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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <ContentProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Suspense fallback={<AdminLoading />}>
            <Routes>
              <Route path="/" element={<PublicSite />} />
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
                <Route path="navbar" element={<AdminNavbar />} />
                <Route path="seo" element={<AdminSEO />} />
              </Route>
            </Routes>
          </Suspense>
          <Analytics />
        </BrowserRouter>
      </LanguageProvider>
    </ContentProvider>
  );
}
