import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const cardVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 60,
    rotateX: 8,
    scale: 0.92,
  }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 65,
      damping: 16,
      delay: i * 0.12,
    },
  }),
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '…';
}

export function ProjectsSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-80px' });
  const [lightboxData, setLightboxData] = useState<{ images: string[]; index: number; title: string } | null>(null);

  const items = (t as any).projects?.items ?? [];

  const openLightbox = (project: any) => {
    const images = project.images && project.images.length > 0
      ? project.images
      : project.image ? [project.image] : [];
    if (images.length > 0) {
      setLightboxData({ images, index: 0, title: project.title });
    }
  };

  const closeLightbox = () => setLightboxData(null);
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightboxData) return;
    setLightboxData({ ...lightboxData, index: (lightboxData.index + 1) % lightboxData.images.length });
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightboxData) return;
    setLightboxData({ ...lightboxData, index: (lightboxData.index - 1 + lightboxData.images.length) % lightboxData.images.length });
  };

  return (
    <section id="projects" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(108,92,231,0.08),transparent_60%)]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-6xl mx-auto relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
          animate={inView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          className="text-center mb-16 sm:mb-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4"
          >
            Portfolio
          </motion.div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-6">
            {(t as any).projects?.title ?? 'Our Projects'}
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {(t as any).projects?.subtitle ?? 'Real solutions we\'ve built for real businesses.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12" style={{ perspective: '1200px' }}>
          {items.map((item: any, i: number) => {
            const plainDesc = stripHtml(item.desc || '');
            const shortDesc = truncate(plainDesc, 140);

            return (
              <motion.div
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                whileHover={{
                  y: -12,
                  scale: 1.01,
                  transition: { type: 'spring', stiffness: 300, damping: 25 },
                }}
                className="group relative rounded-3xl overflow-hidden border border-border bg-card/40 backdrop-blur-md shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
              >
                {/* Image — use images[] array first, fallback to legacy image field */}
                {(item.images?.[0] || item.image) && (
                  <div
                    className="aspect-[16/10] overflow-hidden cursor-zoom-in relative"
                    onClick={() => openLightbox(item)}
                  >
                    <motion.img
                      src={item.images?.[0] || item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700"
                      whileHover={{ scale: 1.1 }}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white transform scale-90 group-hover:scale-100 transition-transform">
                        <ChevronRight className="w-6 h-6 rotate-[-45deg] translate-x-0.5 -translate-y-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags?.slice(0, 3).map((tag: string, j: number) => (
                      <span key={j} className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link to={`/project/${i}`} className="block group/title">
                    <h3 className="font-display font-bold text-foreground text-xl sm:text-2xl mb-3 group-hover/title:text-primary transition-colors flex items-center gap-2">
                      {item.title}
                      <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all" />
                    </h3>
                  </Link>

                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 font-medium opacity-80">
                    {shortDesc}
                  </p>

                  <Link
                    to={`/project/${i}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary group/link relative"
                  >
                    View Case Study
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover/link:w-full transition-all duration-300" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Shared Lightbox */}
      <AnimatePresence>
        {lightboxData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {lightboxData.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer border border-white/10"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer border border-white/10"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div className="relative max-w-5xl w-full flex flex-col items-center gap-4">
              <motion.img
                key={lightboxData.index}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                src={lightboxData.images[lightboxData.index]}
                alt={lightboxData.title}
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="text-center">
                <h4 className="text-white font-display text-xl font-bold mb-1">{lightboxData.title}</h4>
                <div className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-xs font-bold">
                  {lightboxData.index + 1} / {lightboxData.images.length}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
