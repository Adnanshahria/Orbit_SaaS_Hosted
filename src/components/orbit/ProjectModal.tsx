import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Tech stack icon mapping (simplified for now)
const TechIcon = ({ name }: { name: string }) => {
    const n = name.toLowerCase();

    if (n.includes('react')) return <span title="React">⚛️</span>;
    if (n.includes('node')) return <span title="Node.js">🟩</span>;
    if (n.includes('next')) return <span title="Next.js">▲</span>;
    if (n.includes('vue')) return <span title="Vue">Pv</span>;
    if (n.includes('typescript')) return <span title="TypeScript">Ts</span>;
    if (n.includes('tailwind')) return <span title="Tailwind">🌊</span>;

    return <span className="text-gray-400">⚡</span>;
};

export interface ProjectData {
    title: string;
    desc: string;
    tags: string[];
    link: string;
    images: string[];
    category?: string;
    featured?: boolean;
    videoPreview?: string;
    id?: number;
}

interface ProjectModalProps {
    project: ProjectData | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!project) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-[#0A0A0A] border border-white/10 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl pointer-events-auto flex flex-col md:flex-row relative"
                        >

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-all border border-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Left: Media Area */}
                            <div className="w-full md:w-3/5 bg-neutral-900/50 relative min-h-[300px] md:min-h-full overflow-hidden group">
                                {/* Video Preview if available, else Image */}
                                {project.videoPreview ? (
                                    <video
                                        src={project.videoPreview}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={project.images?.[0] || ''}
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {/* Gradient Overlay for text readability on small screens */}
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent md:hidden" />
                            </div>

                            {/* Right: Content Area */}
                            <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col h-full bg-[#111] overflow-y-auto">

                                {/* Header: Badges & Title */}
                                <div className="mb-6">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        {project.featured && (
                                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
                                                Featured
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                            {project.category || ''}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-bold font-display text-white mb-2 leading-tight">
                                        {project.title}
                                    </h2>

                                    {/* Tech Stack Icons */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {project.tags?.map((tag, i) => (
                                            <div key={i} className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md text-xs border border-white/5 text-gray-300">
                                                <TechIcon name={tag} />
                                                <span>{tag}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Description - Render HTML safely */}
                                <div
                                    className="prose prose-invert prose-sm max-w-none text-gray-400 mb-8 leading-relaxed flex-grow"
                                    dangerouslySetInnerHTML={{ __html: project.desc }}
                                />

                                {/* Footer: Action Button */}
                                <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <a
                                            href={project.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/20 group"
                                        >
                                            <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            {project.link ? (project.link.includes('github') ? 'GitHub' : 'Link') : ''}
                                        </a>
                                        {project.id !== undefined && (
                                            <Link
                                                to={`/project/${project.id}`}
                                                onClick={onClose}
                                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10 group"
                                            >
                                                Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
