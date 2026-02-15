import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useContent } from '@/contexts/ContentContext';
import { Navbar } from '@/components/orbit/Navbar';
import { OrbitFooter } from '@/components/orbit/OrbitFooter';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ensureAbsoluteUrl } from '@/lib/utils';

function ImageGallery({ images, title }: { images: string[]; title: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (!images || images.length === 0) return null;

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    const openLightbox = () => setLightboxOpen(true);
    const closeLightbox = () => setLightboxOpen(false);

    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const handleDragEnd = (e: any, { offset, velocity }: any) => {
        const swipe = swipePower(offset.x, velocity.x);

        if (swipe < -10000) {
            nextSlide();
        } else if (swipe > 10000) {
            prevSlide();
        }
    };

    return (
        <>
            {/* Main Carousel */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-8"
            >
                <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/5 group">
                    {/* Main Image */}
                    <div className="cursor-pointer overflow-hidden relative" onClick={openLightbox}>
                        <AnimatePresence mode='wait'>
                            <motion.img
                                key={currentIndex}
                                src={images[currentIndex]}
                                alt={`${title} - slide ${currentIndex + 1}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={1}
                                onDragEnd={handleDragEnd}
                                className="w-full h-auto max-h-[600px] object-contain bg-black/5 touch-pan-y"
                            />
                        </AnimatePresence>
                    </div>

                    {/* Navigation Arrows (Only if > 1 image) */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transform hover:scale-110 z-10"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transform hover:scale-110 z-10"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                    className="absolute left-4 md:left-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors opacity-100 sm:opacity-70 sm:hover:opacity-100"
                                >
                                    <ChevronLeft className="w-10 h-10" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                    className="absolute right-4 md:right-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors opacity-100 sm:opacity-70 sm:hover:opacity-100"
                                >
                                    <ChevronRight className="w-10 h-10" />
                                </button>
                            </>
                        )}

                        <motion.img
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            src={images[currentIndex]}
                            alt="Fullscreen view"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={handleDragEnd}
                            className="max-w-full max-h-full md:max-w-[85vw] md:max-h-[85vh] object-contain select-none shadow-2xl touch-pan-y"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-base font-medium bg-black/40 px-6 py-2 rounded-full backdrop-blur-md">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const { lang } = useLang();
    const { content } = useContent();

    // Data with Fallback Logic
    const enData = (content.en as any).projects || {};
    const bnData = (content.bn as any).projects || {};
    const enItems: any[] = Array.isArray(enData.items) ? enData.items : [];
    const bnItems: any[] = Array.isArray(bnData.items) ? bnData.items : [];

    const idx = parseInt(id || '0', 10);

    // Get potential projects
    const projectEn = enItems[idx];
    const projectBn = bnItems[idx];

    // Determine fallback
    // If we are in BN mode, and BN project exists and has a title, use it. Otherwise use EN.
    const isBn = lang === 'bn';
    const hasBnContent = projectBn && projectBn.title && projectBn.title.trim() !== '';
    const project = (isBn && hasBnContent) ? projectBn : projectEn;

    if (!project || isNaN(idx) || idx < 0 || idx >= enItems.length) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-40 px-4">
                    <Helmet>
                        <title>Project Not Found | Orbit SaaS</title>
                        <meta name="robots" content="noindex" />
                    </Helmet>
                    <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
                    <Link to="/#projects" className="text-primary hover:underline flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Projects
                    </Link>
                </div>
                <OrbitFooter />
            </div>
        );
    }

    // Build images array: prefer `images`, fallback to single `image`
    const allImages: string[] =
        project.images && Array.isArray(project.images) && project.images.length > 0
            ? project.images
            : project.image
                ? [project.image]
                : [];

    // SEO Data (Shared)
    // Note: SEO data on the item is shared so it should be available on both EN and BN objects
    const seoTitle = project.seo?.title || `${project.title} | Orbit SaaS Case Study`;
    const plainDesc = stripHtml(project.desc || '');
    const seoDesc = project.seo?.description || (plainDesc.length > 160 ? plainDesc.substring(0, 157) + '...' : plainDesc);
    const seoKeywords = project.seo?.keywords?.join(', ') || project.tags?.join(', ') || 'SaaS, Portfolio, Case Study';
    const ogImage = allImages[0] ? ensureAbsoluteUrl(allImages[0]) : 'https://orbitsaas.cloud/og-banner.png';
    const currentUrl = `https://orbitsaas.cloud/project/${id}`;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDesc} />
                <meta name="keywords" content={seoKeywords} />
                <link rel="canonical" href={currentUrl} />

                {/* OpenGraph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDesc} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:site_name" content="ORBIT SaaS" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDesc} />
                <meta name="twitter:image" content={ogImage} />
                <meta name="twitter:image:alt" content={seoTitle} />
            </Helmet>
            <Navbar />
            <main className="pt-20">
                {/* Image Gallery */}
                <ImageGallery images={allImages} title={project.title} />

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
                    {/* Back link */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Link
                            to="/#projects"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Projects
                        </Link>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
                    >
                        {project.title}
                    </motion.h1>

                    {/* Tags */}
                    {project.tags && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-wrap gap-2 mb-8"
                        >
                            {project.tags.map((tag: string, j: number) => (
                                <span
                                    key={j}
                                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </motion.div>
                    )}

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="prose-section"
                    >
                        <div
                            className="text-muted-foreground text-base sm:text-lg leading-relaxed space-y-4 [&_b]:font-bold [&_b]:text-foreground [&_i]:italic [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_hr]:my-6 [&_hr]:border-border [&_span]:inline"
                            dangerouslySetInnerHTML={{ __html: project.desc || '' }}
                        />
                    </motion.div>

                    {/* Live Link Button */}
                    {project.link && project.link !== '#' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="mt-10"
                        >
                            <a
                                href={ensureAbsoluteUrl(project.link)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Visit Live Project
                            </a>
                        </motion.div>
                    )}
                </div>
            </main>
            <OrbitFooter />
        </div>
    );
}
