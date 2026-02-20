import { useLang } from '@/contexts/LanguageContext';

export function StructuredData() {
    const { t } = useLang();

    // Dynamic WhatsApp info from admin settings
    const whatsappRaw = (t.contact as any).whatsapp || '+8801853452264';
    const whatsappClean = whatsappRaw.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappClean}`;

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "ORBIT SaaS",
        "alternateName": ["Orbit SaaS Agency", "ORBIT SaaS Web Development", "ORBIT Web Solutions"],
        "url": "https://orbitsaas.cloud",
        "logo": "https://orbitsaas.cloud/favicon.png",
        "image": "https://orbitsaas.cloud/og-banner.png",
        "description": "ORBIT SaaS is a leading website development company offering custom web solutions, eCommerce platforms, SaaS products, and enterprise web applications. Build your website with expert developers.",
        "slogan": "Build Your Dream Website – Custom Web Solutions That Scale",
        "foundingDate": "2024",
        "founders": [
            {
                "@type": "Person",
                "name": "Muhammed Nisar Uddin",
                "jobTitle": "Founder & CTO"
            },
            {
                "@type": "Person",
                "name": "Mohammed Adnan Shahria",
                "jobTitle": "Co-Founder & CEO"
            }
        ],
        "numberOfEmployees": {
            "@type": "QuantitativeValue",
            "minValue": 2,
            "maxValue": 10
        },
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "BD"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "sales",
            "url": whatsappUrl,
            "telephone": whatsappRaw,
            "availableLanguage": ["English", "Bengali"]
        },
        "knowsAbout": [
            "Web Solution",
            "Website Related Solutions",
            "Website Development",
            "Web Solutions",
            "Custom Website Development",
            "Web Application Development",
            "eCommerce Development",
            "SaaS Development",
            "React Development",
            "Node.js Development",
            "Full-Stack Web Development",
            "Enterprise Software Development",
            "Cloud Infrastructure",
            "Website Design",
            "Responsive Web Design",
            "Progressive Web Apps"
        ],
        "sameAs": []
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ORBIT SaaS – Website Development Company",
        "alternateName": "ORBIT SaaS",
        "url": "https://orbitsaas.cloud",
        "description": "ORBIT SaaS is a professional website development company. Build custom websites, web applications, eCommerce platforms, and SaaS products with our expert team.",
        "inLanguage": ["en", "bn"],
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://orbitsaas.cloud/?s={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "ORBIT SaaS – Website Development & Custom Web Solutions",
        "url": "https://orbitsaas.cloud",
        "image": "https://orbitsaas.cloud/og-banner.png",
        "description": "Professional website development company specializing in building custom websites, web applications, eCommerce platforms, SaaS products, educational platforms, and enterprise web solutions using React, Node.js, and modern cloud technologies.",
        "priceRange": "$$",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "BD"
        },
        "telephone": whatsappRaw,
        "areaServed": [
            {
                "@type": "Country",
                "name": "Bangladesh"
            },
            {
                "@type": "GeoCircle",
                "geoMidpoint": {
                    "@type": "GeoCoordinates",
                    "latitude": 23.8103,
                    "longitude": 90.4125
                },
                "geoRadius": "50000"
            }
        ],
        "serviceType": [
            "Web Solution",
            "Website Related Solutions",
            "Website Development",
            "Web Application Development",
            "Custom Web Solutions",
            "eCommerce Development",
            "SaaS Product Development",
            "Enterprise Software Development"
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Website Development & Web Solutions",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Custom Website Development",
                        "description": "Build custom websites tailored to your business needs. Responsive web design, fast performance, and SEO-optimized websites built with React and modern web technologies."
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "eCommerce Website Development",
                        "description": "Build scalable eCommerce websites with payment gateways, inventory management, and analytics dashboards. Custom online store development with React and Node.js."
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "SaaS Web Application Development",
                        "description": "Full-stack SaaS product development — build web applications with modern technologies including React, TypeScript, Node.js, and cloud infrastructure."
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Enterprise Web Application Development",
                        "description": "Build robust, secure, and high-performance enterprise web applications for complex business workflows. Custom web solutions for large-scale operations."
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Educational Platform & LMS Development",
                        "description": "Build custom learning management systems, online course platforms, and interactive educational web applications designed for engagement and scale."
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Portfolio & Blog Website Development",
                        "description": "Build SEO-optimized portfolio websites and blogging platforms with CMS integrations, custom responsive web designs, and fast performance."
                    }
                }
            ]
        },
        "knowsAbout": [
            "Website Development",
            "Web Solutions",
            "Build Website",
            "Custom Website",
            "Web Application Development",
            "Web Design",
            "React",
            "Node.js",
            "TypeScript",
            "Next.js",
            "Full-Stack Development",
            "eCommerce Development",
            "SaaS Development",
            "Enterprise Software",
            "Cloud Infrastructure",
            "PostgreSQL",
            "MongoDB",
            "Tailwind CSS",
            "REST API",
            "GraphQL",
            "Progressive Web Apps",
            "Responsive Web Design",
            "Website Optimization",
            "SEO",
            "Web Performance"
        ]
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://orbitsaas.cloud" },
            { "@type": "ListItem", "position": 2, "name": "Web Development Services", "item": "https://orbitsaas.cloud/#services" },
            { "@type": "ListItem", "position": 3, "name": "Custom Software", "item": "https://orbitsaas.cloud/#tech-stack" },
            { "@type": "ListItem", "position": 4, "name": "SaaS Development", "item": "https://orbitsaas.cloud/#projects" },
            { "@type": "ListItem", "position": 5, "name": "About ORBIT SaaS", "item": "https://orbitsaas.cloud/#why-us" },
            { "@type": "ListItem", "position": 6, "name": "Contact Us", "item": "https://orbitsaas.cloud/#contact" }
        ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What website development services does ORBIT SaaS offer?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ORBIT SaaS offers comprehensive website development services including custom website development, eCommerce website development, SaaS product development, enterprise web application development, educational platform development, and portfolio & blog website development. We build custom web solutions using React, Node.js, TypeScript, and modern cloud infrastructure."
                }
            },
            {
                "@type": "Question",
                "name": "How much does it cost to build a website?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Website development costs vary based on complexity, features, and technology stack. ORBIT SaaS offers competitive website development pricing — from affordable packages for startups and small businesses to custom enterprise-grade web solutions. Contact us for a free website development consultation and quote."
                }
            },
            {
                "@type": "Question",
                "name": "What is the best website development company?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ORBIT SaaS is a top-rated website development company specializing in custom web solutions, eCommerce platforms, SaaS products, and enterprise web applications. We use cutting-edge technologies like React, Node.js, and TypeScript to build high-performance, scalable websites that drive business growth."
                }
            },
            {
                "@type": "Question",
                "name": "What technologies does ORBIT SaaS use to build websites?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We use the latest web technologies to build websites: React, Next.js, TypeScript, Node.js, Express, PostgreSQL, MongoDB, Tailwind CSS, Docker, AWS, Vercel, and more. Our tech stack is optimized for performance, scalability, SEO, and maintainability."
                }
            },
            {
                "@type": "Question",
                "name": "How long does it take to build a custom website?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A typical custom website takes 2-8 weeks depending on complexity and features. Simple business websites can be delivered in 1-2 weeks, while complex web applications and eCommerce platforms may take 2-3 months. We provide detailed timelines during our free consultation."
                }
            },
            {
                "@type": "Question",
                "name": "How can I hire ORBIT SaaS to build my website?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `You can hire ORBIT SaaS for your website development project by booking a free consultation through WhatsApp at ${whatsappRaw} or visiting our website. We work with businesses of all sizes — from startups to enterprises — to deliver custom web solutions that scale with your growth.`
                }
            },
            {
                "@type": "Question",
                "name": "Does ORBIT SaaS provide web solutions for startups?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! ORBIT SaaS specializes in building web solutions for startups. We offer MVP development, SaaS product development, and scalable website development services tailored for startup budgets. Our web solutions are built to grow with your business."
                }
            }
        ]
    };

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "ORBIT SaaS Website Development Services",
        "description": "Complete list of web development services offered by ORBIT SaaS",
        "numberOfItems": 6,
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Custom Website Development",
                "url": "https://orbitsaas.cloud/#services",
                "description": "Build custom websites with React, Node.js, and modern web technologies"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "eCommerce Website Development",
                "url": "https://orbitsaas.cloud/#services",
                "description": "Build scalable online stores with payment gateways and analytics"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "SaaS Web Application Development",
                "url": "https://orbitsaas.cloud/#services",
                "description": "Build full-stack SaaS products with cloud infrastructure"
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": "Enterprise Web Application Development",
                "url": "https://orbitsaas.cloud/#services",
                "description": "Build secure enterprise web solutions for complex workflows"
            },
            {
                "@type": "ListItem",
                "position": 5,
                "name": "Educational Platform Development",
                "url": "https://orbitsaas.cloud/#services",
                "description": "Build learning management systems and online course platforms"
            },
            {
                "@type": "ListItem",
                "position": 6,
                "name": "Portfolio & Blog Website Development",
                "url": "https://orbitsaas.cloud/#services",
                "description": "Build SEO-optimized portfolio websites and blogging platforms"
            }
        ]
    };

    const webAppSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "ORBIT SaaS",
        "url": "https://orbitsaas.cloud",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "description": "ORBIT SaaS website — your gateway to professional website development and custom web solutions. Explore our services, projects, and tech stack.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Free consultation for website development projects"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
            />
        </>
    );
}
