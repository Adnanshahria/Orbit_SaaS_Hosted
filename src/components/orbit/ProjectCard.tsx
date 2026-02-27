import { Link } from 'react-router-dom';
import { Eye, ExternalLink, ArrowRight } from 'lucide-react';
import { ensureAbsoluteUrl } from '@/lib/utils';

function stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function truncate(str: string, max: number): string {
    if (!str || str.length <= max) return str || '';
    return str.substring(0, max).replace(/\s+\S*$/, '') + '...';
}

interface ProjectCardProps {
    item: any;
    routeId: string | number;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export function ProjectCard({ item, routeId, isHovered, onMouseEnter, onMouseLeave }: ProjectCardProps) {
    const plainDesc = stripHtml(item.desc || '');
    const shortDesc = truncate(plainDesc, 100);
    const coverImage = item.images?.[0] || item.image || '/placeholder.png';
    const categories: string[] = item.categories || (item.category ? [item.category] : ['Portfolio']);

    return (
        <div
            className="group relative rounded-xl sm:rounded-2xl overflow-hidden flex flex-col h-full bg-white/[0.03] backdrop-blur-xl premium-card-sub transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(108,92,231,0.2),0_0_60px_rgba(108,92,231,0.08)]"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Media Area */}
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <Link to={`/project/${routeId}`} className="block absolute inset-0 z-10 cursor-pointer">
                    {/* Video Preview (on hover) */}
                    {item.videoPreview && isHovered ? (
                        <video src={item.videoPreview} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                    ) : null}

                    {/* Static Image */}
                    <img
                        src={coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Featured Badge */}
                    {item.featured && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-500/90 to-amber-400/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-yellow-400/30">
                            ✦ Featured
                        </div>
                    )}
                </Link>

                {/* Overlay with interaction buttons */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-4 backdrop-blur-[2px] pointer-events-none">
                    <Link
                        to={`/project/${routeId}`}
                        className="p-3 rounded-full bg-white/10 hover:bg-neon-amber/20 text-white hover:text-neon-amber backdrop-blur-md border border-white/20 hover:border-neon-amber/40 transition-all transform hover:scale-110 hover:shadow-[0_0_15px_rgba(0,245,255,0.3)] flex items-center justify-center pointer-events-auto"
                        title="View Details"
                    >
                        <Eye className="w-5 h-5" />
                    </Link>
                    {item.link && (
                        <a
                            href={ensureAbsoluteUrl(item.link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full bg-neon-emerald/80 hover:bg-neon-emerald text-white shadow-[0_0_20px_rgba(108,92,231,0.4)] transition-all transform hover:scale-110 flex items-center justify-center pointer-events-auto"
                            title="Visit Live"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1.5">
                    <div>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neon-amber neon-text mb-0.5 block">
                            {categories.join(' · ')}
                        </span>
                        <Link to={`/project/${routeId}`}>
                            <h3 className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                {item.title}
                            </h3>
                        </Link>
                    </div>
                </div>

                <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed mb-2 line-clamp-2 flex-grow">
                    {shortDesc}
                </p>

                {/* Footer: Tags & Link */}
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between mt-auto">
                    <div className="flex -space-x-2">
                        {item.tags?.slice(0, 3).map((tag: string, j: number) => (
                            <div key={j} className="w-6 h-6 rounded-full bg-neon-emerald/10 border border-neon-emerald/20 flex items-center justify-center text-[10px] text-neon-emerald" title={tag}>
                                {tag[0]}
                            </div>
                        ))}
                        {item.tags?.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-neon-emerald/10 border border-neon-emerald/20 flex items-center justify-center text-[8px] text-neon-emerald">
                                +{item.tags.length - 3}
                            </div>
                        )}
                    </div>

                    <Link
                        to={`/project/${routeId}`}
                        className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        View Details <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export { stripHtml, truncate };
