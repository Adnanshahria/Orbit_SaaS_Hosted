import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useCallback } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import { useLang } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export function ReviewsSection() {
    const { content } = useContent();
    const { lang } = useLang();
    const navigate = useNavigate();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const scrollRef = useRef<HTMLDivElement>(null);
    const isPaused = useRef(false);
    const rafRef = useRef<number>(0);

    // Get reviews data — no placeholders, only admin-managed items
    const enReviews = (content.en as any).reviews;
    const bnReviews = (content.bn as any).reviews;
    const reviewsData = lang === 'bn' && bnReviews ? bnReviews : enReviews;

    const title = reviewsData?.title || 'Client Reviews';
    const subtitle = reviewsData?.subtitle || 'What our clients say about working with us';
    const items: any[] = reviewsData?.items?.length ? reviewsData.items : [];

    // Resolve projectId to route
    const enProjects = (content.en as any).projects;
    const projectItems: any[] = Array.isArray(enProjects?.items) ? enProjects.items : [];

    const resolveProjectRoute = (review: any) => {
        if (!review.projectId) return null;
        const idx = projectItems.findIndex((p: any) => (p.id || '') === review.projectId);
        if (idx >= 0) return `/project/${projectItems[idx].id || idx}`;
        const numIdx = parseInt(review.projectId, 10);
        if (!isNaN(numIdx) && numIdx >= 0 && numIdx < projectItems.length) return `/project/${numIdx}`;
        return null;
    };

    const resolveProjectName = (review: any) => {
        if (review.badgeName) return review.badgeName;
        if (review.projectName) return review.projectName;
        if (!review.projectId) return null;
        const idx = projectItems.findIndex((p: any) => (p.id || '') === review.projectId);
        if (idx >= 0) return projectItems[idx].title;
        const numIdx = parseInt(review.projectId, 10);
        if (!isNaN(numIdx) && numIdx >= 0 && numIdx < projectItems.length) return projectItems[numIdx].title;
        return review.projectId;
    };

    // Auto-scroll loop
    const autoScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el || isPaused.current) {
            rafRef.current = requestAnimationFrame(autoScroll);
            return;
        }
        el.scrollLeft += 0.6;
        if (el.scrollLeft >= el.scrollWidth / 2) {
            el.scrollLeft = 0;
        }
        rafRef.current = requestAnimationFrame(autoScroll);
    }, []);

    // Only run auto-scroll when section is visible on screen
    useEffect(() => {
        if (!inView) return;
        rafRef.current = requestAnimationFrame(autoScroll);
        return () => cancelAnimationFrame(rafRef.current);
    }, [autoScroll, inView]);

    const pause = () => { isPaused.current = true; };
    const resume = () => { isPaused.current = false; };

    // Drag support
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const dragStartScroll = useRef(0);
    const hasDragged = useRef(false);

    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        hasDragged.current = false;
        isPaused.current = true;
        dragStartX.current = e.pageX;
        dragStartScroll.current = scrollRef.current?.scrollLeft ?? 0;
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return;
        const dx = e.pageX - dragStartX.current;
        if (Math.abs(dx) > 3) hasDragged.current = true;
        scrollRef.current.scrollLeft = dragStartScroll.current - dx;
        const el = scrollRef.current;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
        if (el.scrollLeft < 0) el.scrollLeft = el.scrollWidth / 2;
    };
    const onMouseUp = () => { isDragging.current = false; isPaused.current = false; };

    const displayItems = items.slice(0, 4);
    // Only use marquee (duplicate) if 3+ items; for 1-2 items show them statically
    const useMarquee = displayItems.length >= 3;
    const loopItems = useMarquee ? [...displayItems, ...displayItems, ...displayItems] : displayItems;

    // Hide section entirely if no admin-managed reviews
    if (items.length === 0) return null;

    return (
        <section id="reviews" className="py-10 sm:py-20 px-3 sm:px-6 lg:px-8 relative overflow-hidden scroll-mt-12" ref={ref}>
            <div className="w-full mx-auto relative">
                {/* Big Container Card */}
                <div className="relative rounded-2xl sm:rounded-3xl premium-card bg-white/[0.02] backdrop-blur-xl px-4 sm:px-14 py-6 sm:py-10 shadow-[0_0_40px_rgba(108,92,231,0.08)]">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8 sm:mb-10"
                    >
                        <h2 className="inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-neon-emerald/25 bg-neon-emerald/5 font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            {title}
                        </h2>
                        <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                            {subtitle}
                        </p>
                    </motion.div>

                    {/* Carousel — marquee for 3+ items, static for 1-2 */}
                    <div
                        ref={useMarquee ? scrollRef : undefined}
                        className={`${useMarquee ? 'overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none' : 'flex justify-center'}`}
                        style={useMarquee ? { scrollbarWidth: 'none' } : {}}
                        onMouseEnter={useMarquee ? pause : undefined}
                        onMouseLeave={useMarquee ? () => { resume(); onMouseUp(); } : undefined}
                        onMouseDown={useMarquee ? onMouseDown : undefined}
                        onMouseMove={useMarquee ? onMouseMove : undefined}
                        onMouseUp={useMarquee ? onMouseUp : undefined}
                        onTouchStart={useMarquee ? pause : undefined}
                        onTouchEnd={useMarquee ? resume : undefined}
                    >
                        <div className={`flex gap-4 pb-2 ${useMarquee ? '' : 'flex-wrap justify-center'}`} style={useMarquee ? { width: 'max-content' } : {}}>
                            {loopItems.map((review: any, i: number) => {
                                const projectRoute = resolveProjectRoute(review);
                                const projectName = resolveProjectName(review);

                                return (
                                    <div
                                        key={i}
                                        className="w-[260px] sm:w-[300px] flex-shrink-0"
                                        aria-hidden={i >= displayItems.length ? true : undefined}
                                    >
                                        <div
                                            className={`h-full rounded-xl premium-card-sub bg-white/[0.03] backdrop-blur-xl p-4 flex flex-col transition-shadow duration-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] ${projectRoute ? 'cursor-pointer' : ''}`}
                                            onClick={() => {
                                                if (hasDragged.current) return;
                                                if (projectRoute) navigate(projectRoute);
                                            }}
                                        >
                                            {/* Top row: Stars + Project Badge */}
                                            <div className="flex items-center justify-between mb-2.5">
                                                <div className="flex gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, si) => (
                                                        <Star key={si} className={`w-3.5 h-3.5 ${si < (review.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} />
                                                    ))}
                                                </div>
                                                {projectName && (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-transparent"
                                                        style={{
                                                            background: 'linear-gradient(#10101a, #10101a) padding-box, linear-gradient(135deg, #10b981, #f59e0b) border-box',
                                                            borderWidth: '1px', borderStyle: 'solid', borderColor: 'transparent',
                                                        }}
                                                    >
                                                        <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">{projectName}</span>
                                                        {projectRoute && <ArrowRight className="w-2.5 h-2.5 text-emerald-400" />}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Review Text */}
                                            <p className="text-muted-foreground text-xs leading-relaxed mb-3 flex-grow line-clamp-4">
                                                "{review.text}"
                                            </p>

                                            {/* Reviewer Info */}
                                            <div className="pt-2.5 border-t border-white/[0.06]">
                                                <span className="font-bold text-foreground text-xs block">{review.name}</span>
                                                <span className="text-muted-foreground text-[11px]">{review.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/**
 * Utility: Get reviews for a specific project (used by ProjectDetail)
 */
export function getProjectReviews(content: any, projectId: string): any[] {
    const reviewsData = (content.en as any)?.reviews;
    if (!reviewsData?.items) return [];
    return reviewsData.items.filter((r: any) => r.projectId === projectId);
}
