import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowRight, Eye, ExternalLink, ArrowLeft } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useContent } from '@/contexts/ContentContext';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/orbit/Navbar';
import { OrbitFooter } from '@/components/orbit/OrbitFooter';
import { Chatbot } from '@/components/orbit/Chatbot';
import { Helmet } from 'react-helmet-async';
import { useProjectTheme, ProjectThemeToggle } from '@/components/orbit/ProjectThemeToggle';
import { ensureAbsoluteUrl } from '@/lib/utils';

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
    const { isLight, toggle, themeClass } = useProjectTheme();

    return (
        <div className={`min-h-[100dvh] ${themeClass} transition-colors duration-500`} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <ProjectThemeToggle isLight={isLight} toggle={toggle} />
            <Helmet>
                <title>All Projects | ORBIT SaaS</title>
                <meta name="description" content="Browse all projects built by ORBIT SaaS — web apps, AI solutions, mobile apps, and more." />
            </Helmet>
            <Navbar />
            <main className="pt-24 pb-20">
                <section className="px-4 sm:px-6 relative overflow-hidden">
                    {/* Neon Background Decorations */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(108,92,231,0.12),transparent_50%)] pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,245,255,0.08),transparent_50%)] pointer-events-none" />
                    <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-cyan/8 rounded-full blur-[130px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-neon-pink/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

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

                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-12 sm:mb-16"
                        >
                            <div className="inline-block px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-bold uppercase tracking-widest mb-4 neon-text">
                                Our Portfolio
                            </div>
                            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 neon-text">
                                {sectionTitle}
                            </h1>
                            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                                {sectionSubtitle}
                            </p>

                            <div className="flex flex-wrap justify-center gap-2 mt-10">
                                {ALL_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${activeCategory === cat
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
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            <AnimatePresence mode="popLayout">
                                {items.map((item: any) => {
                                    const routeId = item._id || item._originalIndex;
                                    const plainDesc = stripHtml(item.desc || '');
                                    const shortDesc = truncate(plainDesc, 100);
                                    const coverImage = item.images?.[0] || item.image || '/placeholder.png';

                                    return (
                                        <motion.div
                                            layout
                                            key={routeId}
                                            custom={item._originalIndex}
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="group relative rounded-2xl overflow-hidden flex flex-col h-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-neon-purple/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(108,92,231,0.15),0_0_60px_rgba(108,92,231,0.05)]"
                                            onMouseEnter={() => setHoveredProject(item._originalIndex)}
                                            onMouseLeave={() => setHoveredProject(null)}
                                        >
                                            <Link to={`/project/${routeId}`} className="block relative aspect-video overflow-hidden bg-muted cursor-pointer">
                                                {item.videoPreview && hoveredProject === item._originalIndex ? (
                                                    <video src={item.videoPreview} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-20" />
                                                ) : null}
                                                <img
                                                    src={coverImage}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                                    <span className="p-3 rounded-full bg-white/10 hover:bg-neon-cyan/20 text-white hover:text-neon-cyan backdrop-blur-md border border-white/20 hover:border-neon-cyan/40 transition-all transform hover:scale-110 hover:shadow-[0_0_15px_rgba(0,245,255,0.3)] flex items-center justify-center pointer-events-auto" title="View Details">
                                                        <Eye className="w-5 h-5" />
                                                    </span>
                                                    {item.link && (
                                                        <a
                                                            href={ensureAbsoluteUrl(item.link)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-3 rounded-full bg-neon-purple/80 hover:bg-neon-purple text-white shadow-[0_0_20px_rgba(108,92,231,0.4)] transition-all transform hover:scale-110 flex items-center justify-center pointer-events-auto"
                                                            title="Visit Live"
                                                        >
                                                            <ExternalLink className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                </div>
                                                {item.featured && (
                                                    <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-500/90 to-amber-400/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-yellow-400/30">
                                                        ✦ Featured
                                                    </div>
                                                )}
                                            </Link>

                                            <div className="p-6 flex flex-col flex-grow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-neon-cyan neon-text-cyan mb-1 block">
                                                            {(item.categories || (item.category ? [item.category] : ['Portfolio'])).join(' · ')}
                                                        </span>
                                                        <Link to={`/project/${routeId}`}>
                                                            <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                                {item.title}
                                                            </h3>
                                                        </Link>
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
                                                    {shortDesc}
                                                </p>
                                                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between mt-auto">
                                                    <div className="flex -space-x-2">
                                                        {item.tags?.slice(0, 3).map((tag: string, j: number) => (
                                                            <div key={j} className="w-6 h-6 rounded-full bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-[10px] text-neon-purple" title={tag}>
                                                                {tag[0]}
                                                            </div>
                                                        ))}
                                                        {item.tags?.length > 3 && (
                                                            <div className="w-6 h-6 rounded-full bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-[8px] text-neon-purple">
                                                                +{item.tags.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Link
                                                        to={`/project/${routeId}`}
                                                        className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                                                    >
                                                        View Details <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
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
                    </div>
                </section>
            </main>
            <OrbitFooter />
            <Chatbot />
        </div>
    );
}
