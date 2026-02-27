import { Helmet } from 'react-helmet-async';
import { useContent } from '@/contexts/ContentContext';
import { useLang } from '@/contexts/LanguageContext';

export function SEOHead() {
    const { content } = useContent();
    const { lang } = useLang();

    // Get SEO data from content context or fallback to defaults
    const seoData = content[lang] as Record<string, any> || {};

    // Keyword-optimized defaults
    const defaultTitle = "ORBIT SaaS | Custom SaaS, AI Agency & Web Development";
    const defaultDesc = "ORBIT SaaS is a top-tier software and AI agency. We specialize in custom SaaS platforms, AI chatbots, agentic automation, mobile apps, and enterprise web applications. Get your custom orbit saas solutions today.";
    const defaultKeywords = "orbit, ORBIT SaaS, orbit sas, orbit saas, orbit sass, orbit software, orbit web solutions, orbit SaaS solutions, orbot, orbot saas, orbot sas, Orbot, assa, Assa, orbitsaas, OrbitSaaS, orbit tech, orbit agency, orbit web agency, orbit software agency, orbit ai, orbit ai agency, orbit development, orbit web development, orbit saass, orbir saas, orbt saas, obit saas, saas development, saas platform, custom saas, best saas company, saas products, enterprise saas, web development company, full stack web development, custom website development, AI chatbot development, custom AI chatbot, chatbot integration, LLM chatbot, conversational AI, AI automation, agentic AI, AI agent development, intelligent automation, workflow automation, mobile app development, Flutter app development, React Native app development, eCommerce website development, enterprise web application, PWA development, progressive web app, React development, Node.js development, software development agency, web development Bangladesh, best web development company Bangladesh, top saas agency, custom software development, orbit cloud, orbitsaas.cloud";

    // Data from DB (saved via AdminSEO)
    const title = (content[lang]?.['seo_title'] as string) || defaultTitle;
    const description = (content[lang]?.['seo_description'] as string) || defaultDesc;
    const keywords = (content[lang]?.['seo_keywords'] as string) || defaultKeywords;

    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://orbitsaas.cloud';
    const canonicalUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://orbitsaas.cloud';
    const image = 'https://orbitsaas.cloud/og-banner.png';

    return (
        <Helmet>
            {/* Basic */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:image" content={image} />
            <meta property="og:image:alt" content="ORBIT SaaS" />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="ORBIT SaaS" />
            <meta property="og:locale" content={lang === 'bn' ? 'bn_BD' : 'en_US'} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            <meta name="twitter:image:alt" content="ORBIT SaaS" />

            {/* Canonical */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Language alternates */}
            <link rel="alternate" hrefLang="en" href="https://orbitsaas.com/" />
            <link rel="alternate" hrefLang="bn" href="https://orbitsaas.com/?lang=bn" />
            <link rel="alternate" hrefLang="x-default" href="https://orbitsaas.com/" />

            {/* Additional SEO meta */}
            <meta name="language" content={lang === 'bn' ? 'Bengali' : 'English'} />
        </Helmet >
    );
}
