import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useContent } from '@/contexts/ContentContext';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/orbit/Navbar';
import { OrbitFooter } from '@/components/orbit/OrbitFooter';
import { Chatbot } from '@/components/orbit/Chatbot';
import { Helmet } from 'react-helmet-async';
import { ProjectCard } from '@/components/orbit/ProjectCard';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 50,
            damping: 15,
            delay: i * 0.08,
        },
    }),
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

function stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function truncate(text: string, maxLen: number): string {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trimEnd() + '…';
}

const DEFAULT_CATEGORIES = ['SaaS', 'eCommerce', 'Enterprise', 'Education', 'Portfolio'];

export default function ProjectsPage() {
    const { lang } = useLang();
    const { content } = useContent();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });

    const [activeCategory, setActiveCategory] = useState('All');
    const [hoveredProject, setHoveredProject] = useState<number | null>(null);

    const enData = (content.en as any).projects || {};
    const bnData = (content.bn as any).projects || {};
    const enItems: any[] = Array.isArray(enData.items) ? enData.items : [];
    const bnItems: any[] = Array.isArray(bnData.items) ? bnData.items : [];

    const displayItems = enItems.map((enItem, i) => {
        const bnItem = bnItems[i];
        const showBn = lang === 'bn' && bnItem && bnItem.title && bnItem.title.trim() !== '';
        const item = showBn ? bnItem : enItem;
        return { ...item, _originalIndex: i, _id: enItem.id || '' };
    });

    const sortedItems = [...displayItems].sort((a, b) => {
        const orderA = a.order ?? a._originalIndex;
        const orderB = b.order ?? b._originalIndex;
        return orderA - orderB;
    });

    const categories = enData.categories || DEFAULT_CATEGORIES;
    const ALL_CATEGORIES = ['All', ...categories];

    // Filter items — support both categories (array) and category (string)
    const items = sortedItems.filter(item => {
        if (activeCategory === 'All') return true;
        const cats: string[] = item.categories || (item.category ? [item.category] : []);
        return cats.includes(activeCategory);
    });

    const sectionTitle = lang === 'bn' && bnData.title ? bnData.title : (enData.title || 'All Projects');
    const sectionSubtitle = lang === 'bn' && bnData.subtitle ? bnData.subtitle : (enData.subtitle || 'Explore all the projects we\'ve built.');

    return (
        <div className="min-h-[100dvh] bg-background text-foreground">
            <Helmet>
                <title>All Projects | ORBIT SaaS</title>
                <meta name="description" content="Browse all projects built by ORBIT SaaS — web apps, AI solutions, mobile apps, and more." />
            </Helmet>
            <Navbar />
            <main className="pt-24 pb-20">
                <section className="px-4 sm:px-6 relative overflow-hidden">



                    <div className="max-w-7xl mx-auto relative" ref={ref}>
                        {/* Back Link */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="mb-8"
                        >
                            <Link
                                to="/#projects"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Home
                            </Link>
                        </motion.div>

                        {/* Big Container Card */}
                        <div className="rounded-2xl sm:rounded-3xl border-2 border-neon-purple/30 bg-white/[0.02] backdrop-blur-xl px-4 sm:px-8 md:px-14 py-6 sm:py-10 shadow-[0_0_40px_rgba(108,92,231,0.08)]">

                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6 }}
                                className="text-center mb-8 sm:mb-12"
                            >
                                <div className="inline-block px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-bold uppercase tracking-widest mb-4 neon-text">
                                    Our Portfolio
                                </div>
                                <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                                    {sectionSubtitle}
                                </p>

                                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-8">
                                    {ALL_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border cursor-pointer ${activeCategory === cat
                                                ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/40 shadow-[0_0_15px_rgba(108,92,231,0.25)] scale-105'
                                                : 'bg-white/[0.03] text-muted-foreground border-white/10 hover:bg-white/[0.06] hover:text-foreground hover:border-white/20 backdrop-blur-sm'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Projects Grid */}
                            <motion.div
                                layout
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
                            >
                                <AnimatePresence mode="popLayout">
                                    {items.map((item: any) => {
                                        const routeId = item._id || item._originalIndex;

                                        return (
                                            <motion.div
                                                layout
                                                key={routeId}
                                                custom={item._originalIndex}
                                                variants={cardVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                            >
                                                <ProjectCard
                                                    item={item}
                                                    routeId={routeId}
                                                    isHovered={hoveredProject === item._originalIndex}
                                                    onMouseEnter={() => setHoveredProject(item._originalIndex)}
                                                    onMouseLeave={() => setHoveredProject(null)}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>

                            {items.length === 0 && (
                                <div className="text-center py-20 text-muted-foreground">
                                    <p className="text-lg">No projects found in this category.</p>
                                </div>
                            )}

                        </div>{/* End Container Card */}
                    </div>
                </section>
            </main>
            <OrbitFooter />
            <Chatbot />
        </div>
    );
}
