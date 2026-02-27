import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useContent } from '@/contexts/ContentContext';
import { Link } from 'react-router-dom';
import { ProjectCard } from './ProjectCard';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 50,
      damping: 15,
      delay: i * 0.1,
    },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

// stripHtml and truncate are now in ProjectCard

const DEFAULT_CATEGORIES = ['SaaS', 'eCommerce', 'Enterprise', 'Education', 'Portfolio'];

import { ensureAbsoluteUrl } from '@/lib/utils';

const HOMEPAGE_LIMIT = 6;

export function ProjectsSection() {
  const { lang, t } = useLang();
  const { content } = useContent();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  // State
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  // Data with Fallback Logic
  const enData = (content.en as any).projects || {};
  const bnData = (content.bn as any).projects || {};
  const enItems: any[] = Array.isArray(enData.items) ? enData.items : [];
  const bnItems: any[] = Array.isArray(bnData.items) ? bnData.items : [];

  // Build display items with original index preserved
  const displayItems = enItems.map((enItem, i) => {
    const bnItem = bnItems[i];
    const showBn = lang === 'bn' && bnItem && bnItem.title && bnItem.title.trim() !== '';
    const item = showBn ? bnItem : enItem;
    return { ...item, _originalIndex: i, _id: enItem.id || '' };
  });

  // Sort by order field (ascending), then by original index as tiebreaker
  const sortedItems = [...displayItems].sort((a, b) => {
    const orderA = a.order ?? a._originalIndex;
    const orderB = b.order ?? b._originalIndex;
    return orderA - orderB;
  });

  const categories = enData.categories || DEFAULT_CATEGORIES;
  const ALL_CATEGORIES = ['All', ...categories];

  // Filter items — support both categories (array) and category (string)
  const filteredItems = sortedItems.filter(item => {
    if (activeCategory === 'All') return true;
    const cats: string[] = item.categories || (item.category ? [item.category] : []);
    return cats.includes(activeCategory);
  });

  // Limit to homepage count
  const items = filteredItems.slice(0, HOMEPAGE_LIMIT);
  const hasMore = filteredItems.length > HOMEPAGE_LIMIT;

  // Section Title/Subtitle Fallback
  const sectionTitle = lang === 'bn' && bnData.title ? bnData.title : (enData.title || 'Featured Projects');
  const sectionSubtitle = lang === 'bn' && bnData.subtitle ? bnData.subtitle : (enData.subtitle || 'Real solutions we\'ve built for real businesses.');

  return (
    <section id="project" className="py-10 sm:py-20 px-3 sm:px-6 lg:px-8 relative overflow-hidden scroll-mt-12">



      <div className="w-full mx-auto relative" ref={ref}>
        {/* Big Container Card */}
        <div className="relative rounded-2xl sm:rounded-3xl premium-card bg-white/[0.02] backdrop-blur-xl px-4 sm:px-14 py-5 sm:py-10 shadow-[0_0_40px_rgba(108,92,231,0.08)]">
          {/* View All / Mobile Nav Button */}
          <Link
            to="/project"
            className="absolute top-5 right-5 sm:top-8 sm:right-8 inline-flex items-center justify-center gap-2 rounded-xl bg-neon-emerald/20 text-neon-emerald font-semibold text-sm border border-neon-emerald/30 hover:bg-neon-emerald/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(108,92,231,0.3)] hover:gap-3 w-10 h-10 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 animate-pulse-slow sm:animate-none"
          >
            <span className="hidden sm:inline">View All</span> <ArrowRight className="w-4 h-4" />
          </Link>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-10"
          >
            <h2 className="inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-neon-emerald/25 bg-neon-emerald/5 font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {sectionTitle}
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              {sectionSubtitle}
            </p>
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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

          {/* View All Projects Button */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-14"
            >
              <Link
                to="/project"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-neon-emerald/20 text-neon-emerald font-semibold text-base border border-neon-emerald/30 hover:bg-neon-emerald/30 transition-all shadow-[0_0_20px_rgba(108,92,231,0.2)] hover:shadow-[0_0_30px_rgba(108,92,231,0.35)] hover:gap-3"
              >
                View All Projects <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )}
        </div>{/* End Container Card */}
      </div>
    </section>
  );
}
