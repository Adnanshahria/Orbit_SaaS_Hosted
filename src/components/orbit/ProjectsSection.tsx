import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowRight, Eye, ExternalLink } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useContent } from '@/contexts/ContentContext';
import { Link } from 'react-router-dom';

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

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function truncate(text: string, maxLen: number): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '…';
}

const CATEGORIES = ['All', 'SaaS', 'eCommerce', 'Enterprise', 'Education', 'Portfolio'];

import { ensureAbsoluteUrl } from '@/lib/utils';

export function ProjectsSection() {
  const { lang, t } = useLang();
  const { content } = useContent();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  // State
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  // Data with Fallback Logic
  // 1. Get both lists
  const enData = (content.en as any).projects || {};
  const bnData = (content.bn as any).projects || {};
  const enItems: any[] = Array.isArray(enData.items) ? enData.items : [];
  const bnItems: any[] = Array.isArray(bnData.items) ? bnData.items : [];

  // 2. Use EN as master list for length/iteration
  const displayItems = enItems.map((enItem, i) => {
    const bnItem = bnItems[i];
    // If language is BN, declare checks
    // We show BN if: we are in BN mode AND BN item exists AND BN item has a title
    const showBn = lang === 'bn' && bnItem && bnItem.title && bnItem.title.trim() !== '';

    // Return the item to display, preserved with original index logic
    return showBn ? bnItem : enItem;
  });

  // Filter items
  const items = displayItems.filter(item =>
    activeCategory === 'All' || item.category === activeCategory || (!item.category && activeCategory === 'Other')
  );

  // Section Title/Subtitle Fallback
  const sectionTitle = lang === 'bn' && bnData.title ? bnData.title : (enData.title || 'Featured Projects');
  const sectionSubtitle = lang === 'bn' && bnData.subtitle ? bnData.subtitle : (enData.subtitle || 'Real solutions we\'ve built for real businesses.');

  return (
    <section id="projects" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-background">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(108,92,231,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-20"
        >
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Our Work
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {sectionSubtitle}
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mt-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeCategory === cat
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
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
              // Re-calculate original index based on master EN list to ensure routing consistency
              // We finding the index of this item in the displayItems maps 1:1 to enItems
              const originalIndex = displayItems.indexOf(item);

              const plainDesc = stripHtml(item.desc || '');
              const shortDesc = truncate(plainDesc, 100);
              // Determine cover image
              const coverImage = item.images?.[0] || item.image || '/placeholder.png';

              return (
                <motion.div
                  layout
                  key={originalIndex} // Use original index as key for stability
                  custom={originalIndex}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 flex flex-col h-full"
                  onMouseEnter={() => setHoveredProject(originalIndex)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  {/* Media Area - Linked to Detail Page */}
                  <Link to={`/project/${originalIndex}`} className="block relative aspect-video overflow-hidden bg-muted cursor-pointer">
                    {/* Video Preview (on hover) */}
                    {item.videoPreview && hoveredProject === originalIndex ? (
                      <video src={item.videoPreview} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-20" />
                    ) : null}

                    {/* Static Image */}
                    <img
                      src={coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Overlay Buttons */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                      <span
                        className="p-3 rounded-full bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 transition-all transform hover:scale-110 flex items-center justify-center pointer-events-auto"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </span>
                      {item.link && (
                        <a
                          href={ensureAbsoluteUrl(item.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-3 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all transform hover:scale-110 flex items-center justify-center pointer-events-auto"
                          title="Visit Live"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {item.featured && (
                      <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded bg-yellow-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        Featured
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1 block">
                          {item.category || 'Portfolio'}
                        </span>
                        <Link to={`/project/${originalIndex}`}>
                          <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
                      {shortDesc}
                    </p>

                    {/* Footer: Tags & Link */}
                    <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                      <div className="flex -space-x-2">
                        {/* Simplified tech stack display */}
                        {item.tags?.slice(0, 3).map((tag: string, j: number) => (
                          <div key={j} className="w-6 h-6 rounded-full bg-secondary border border-background flex items-center justify-center text-[10px] text-muted-foreground" title={tag}>
                            {tag[0]}
                          </div>
                        ))}
                        {item.tags?.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-secondary border border-background flex items-center justify-center text-[8px] text-muted-foreground">
                            +{item.tags.length - 3}
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/project/${originalIndex}`}
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
      </div>
    </section>
  );
}
