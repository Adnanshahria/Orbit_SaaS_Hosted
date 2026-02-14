import { Helmet } from 'react-helmet-async';
import { useContent } from '@/contexts/ContentContext';
import { useLang } from '@/contexts/LanguageContext';

export function SEOHead() {
    const { content } = useContent();
    const { lang } = useLang();

    // Get SEO data from content context or fallback to defaults
    const seoData = content[lang] as Record<string, any> || {};

    // Keyword-optimized defaults
    const defaultTitle = "Best Website Development Company | Build Custom Websites & Web Solutions | ORBIT SaaS";
    const defaultDesc = "ORBIT SaaS is a top website development company offering custom web solutions, web app development, eCommerce platforms, SaaS products & enterprise software. Build your website today — get a free consultation.";
    const defaultKeywords = "website development, web development company, web solution, build website, custom website development, website builder, web app development, web development services, best web development company, website design and development, professional website development, custom web solutions, web application development, build custom website, eCommerce website development, SaaS development, enterprise web application, React development, Node.js development, full-stack web development, web build, build web app, website maker, ORBIT SaaS";

    // Data from DB (saved via AdminSEO)
    const title = (content[lang]?.['seo_title'] as string) || defaultTitle;
    const description = (content[lang]?.['seo_description'] as string) || defaultDesc;
    const keywords = (content[lang]?.['seo_keywords'] as string) || defaultKeywords;

    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://orbitsaas.com';
    const canonicalUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://orbitsaas.com';
    const image = 'https://orbitsaas.com/og-banner.png';

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
            <meta property="og:image:alt" content="ORBIT SaaS - Website Development Company" />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="ORBIT SaaS – Website Development Company" />
            <meta property="og:locale" content={lang === 'bn' ? 'bn_BD' : 'en_US'} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            <meta name="twitter:image:alt" content="ORBIT SaaS - Website Development Company" />

            {/* Canonical */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Language alternates */}
            <link rel="alternate" hrefLang="en" href="https://orbitsaas.com/" />
            <link rel="alternate" hrefLang="bn" href="https://orbitsaas.com/?lang=bn" />
            <link rel="alternate" hrefLang="x-default" href="https://orbitsaas.com/" />

            {/* Additional SEO meta */}
            <meta name="language" content={lang === 'bn' ? 'Bengali' : 'English'} />
        </Helmet>
    );
}
