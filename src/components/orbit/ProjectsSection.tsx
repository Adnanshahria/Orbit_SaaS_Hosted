import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useContent } from '@/contexts/ContentContext';
import { Link } from 'react-router-dom';
import { ProjectCard } from './ProjectCard';

// Animations removed to prevent mobile scroll layout shifting

// stripHtml and truncate are now in ProjectCard

const DEFAULT_CATEGORIES = ['SaaS', 'eCommerce', 'Enterprise', 'Education', 'Portfolio'];

import { ensureAbsoluteUrl, parseRichText } from '@/lib/utils';

const INITIAL_SHOW = 3;

export function ProjectsSection() {
  const { lang, t } = useLang();
  const { content } = useContent();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  // State
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

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

  // Show 3 initially, all when expanded
  const items = expanded ? filteredItems : filteredItems.slice(0, INITIAL_SHOW);
  const canExpand = filteredItems.length > INITIAL_SHOW;

  // Section Title/Subtitle Fallback
  const sectionTitle = lang === 'bn' && bnData.title ? bnData.title : (enData.title || 'Featured Projects');
  const sectionSubtitle = lang === 'bn' && bnData.subtitle ? bnData.subtitle : (enData.subtitle || 'Real solutions we\'ve built for real businesses.');

  return (
    <section id="project" className="py-10 sm:py-20 px-3 sm:px-6 lg:px-8 relative scroll-mt-12" style={{ contain: 'none' }}>



      <motion.div layout className="w-full mx-auto relative" ref={ref}>
        {/* Big Container Card */}
        <div className="relative px-4 sm:px-14 py-5 sm:py-10">
          {/* View All / Mobile Nav Button */}
          <Link
            to="/project"
            className="absolute top-5 right-5 sm:top-8 sm:right-12 inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#8B5A2B]/5 backdrop-blur-md border border-[#8B5A2B]/30 text-[#FFE5B4] font-display italic text-sm transition-all duration-500 hover:bg-[#8B5A2B]/10 hover:border-[#8B5A2B]/50 hover:gap-4 hover:shadow-[0_0_20px_rgba(139,90,43,0.15)] group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 text-[#8B5A2B] transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-10"
          >
            <h2 className="inline-block px-6 sm:px-8 py-2 sm:py-3 rounded-full border-[0.5px] border-[#8B5A2B]/50 bg-[#8B5A2B]/10 text-[#FFE5B4] text-3xl sm:text-4xl font-display italic tracking-wide mb-4 shadow-[0_4px_20px_rgba(139,90,43,0.15)]">
              {sectionTitle}
            </h2>
            <p className="text-[#10b981] text-[12.5px] sm:text-base md:text-lg lg:text-xl max-w-xl mx-auto flex flex-wrap justify-center gap-x-[0.4em] gap-y-[0.4rem] sm:gap-y-2 tracking-wide italic leading-relaxed pt-2">
              {parseRichText(sectionSubtitle).map((seg, i) => {
                if (!seg.bold && !seg.card && !seg.whiteCard && !seg.color && !seg.greenCard) {
                  return seg.text.split(' ').filter(Boolean).map((word, wi) => (
                    <span key={`w-${i}-${wi}`} className="inline-block align-middle">{word}</span>
                  ));
                }
                const cls = [
                  seg.bold && !seg.color ? 'font-bold text-white' : '',
                  seg.bold && seg.color ? 'font-bold' : '',
                  seg.card ? 'word-card' : '',
                  seg.whiteCard ? 'word-card-white' : '',
                  seg.greenCard ? 'word-card-green' : '',
                  seg.color === 'green' ? '!text-emerald-400' : '',
                  seg.color === 'gold' ? '!text-amber-500' : '',
                  seg.color === 'white' ? '!text-white' : '',
                ].filter(Boolean).join(' ');
                return (
                  <span key={`s-${i}`} className={`${cls} inline-block align-middle`}>
                    {seg.text}
                  </span>
                );
              })}
            </p>
          </motion.div>

          {/* Projects Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {items.map((item: any, idx: number) => {
                const routeId = item._id || item._originalIndex;

                return (
                  <motion.div
                    key={routeId}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
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

          {/* Expand / Collapse Button */}
          {canExpand && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-10"
            >
              <button
                onClick={() => setExpanded(prev => !prev)}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border border-transparent transition-all duration-500 cursor-pointer hover:gap-3"
                style={{
                  background: 'linear-gradient(#10101a, #10101a) padding-box, linear-gradient(135deg, #10b981, #f59e0b, #10b981) border-box',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'transparent',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.12), 0 0 40px rgba(245, 158, 11, 0.06)',
                }}
              >
                <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                  {expanded ? 'Show Less' : 'Explore More ✦'}
                </span>
                {expanded ? (
                  <ChevronUp className="w-4 h-4 text-amber-500 transition-transform group-hover:-translate-y-0.5" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-y-0.5" />
                )}
              </button>
            </motion.div>
          )}
        </div>{/* End Container Card */}
      </motion.div>
    </section >
  );
}
