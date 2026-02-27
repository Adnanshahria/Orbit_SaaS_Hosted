import { useMemo } from 'react';
import { useContent } from '@/contexts/ContentContext';
import {
    Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
    Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
    Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette, Brain, Wrench
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
    Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
    Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
    Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette, Brain, Wrench
};
const FALLBACK_ICONS = ['Brain', 'Wrench', 'Zap', 'Shield', 'Target', 'Rocket', 'Globe', 'Bot'];
const FALL_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#22d3ee'];
const PARTICLE_COUNT = 30;

/**
 * Global falling-icons background effect.
 * Extracts icon names from the Why Us section data; falls back to a default set.
 * Renders as a fixed, full-screen layer behind everything.
 */
export function FallingIcons() {
    const { content } = useContent();

    // Extract icon names used in the Why Us section
    const iconNames = useMemo(() => {
        const whyUsData = (content?.en as any)?.whyUs;
        const items: any[] = whyUsData?.items || [];
        const names = items.map((item: any) => item.icon).filter(Boolean) as string[];
        // Use content icons if available, otherwise fallback
        return names.length >= 3 ? names : FALLBACK_ICONS;
    }, [content]);

    const particles = useMemo(() =>
        Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const iconName = iconNames[Math.floor(Math.random() * iconNames.length)];
            const Icon = ICON_MAP[iconName] || Zap;
            const size = 12 + Math.random() * 20;       // 12-32px
            const left = Math.random() * 100;            // 0-100% horizontal
            const delay = Math.random() * 18;            // 0-18s staggered start
            const duration = 14 + Math.random() * 20;    // 14-34s fall time (slow & elegant)
            const drift = -40 + Math.random() * 80;      // horizontal sway in px
            const rotation = Math.random() * 360;
            const opacity = 0.40 + Math.random() * 0.2; // brighter: 0.15-0.35
            const color = FALL_COLORS[Math.floor(Math.random() * FALL_COLORS.length)];

            return { Icon, size, left, delay, duration, drift, rotation, opacity, color, key: i };
        }), [iconNames]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
            <style>{`
        @keyframes globalIconFall {
          0%   { transform: translateY(-80px) translateX(0px) rotate(0deg); opacity: 0; }
          8%   { opacity: var(--p-opacity); }
          92%  { opacity: var(--p-opacity); }
          100% { transform: translateY(calc(100vh + 80px)) translateX(var(--p-drift)) rotate(var(--p-end-rot)); opacity: 0; }
        }
      `}</style>
            {particles.map(({ Icon, size, left, delay, duration, drift, rotation, opacity, color, key }) => (
                <div
                    key={key}
                    className="absolute"
                    style={{
                        left: `${left}%`,
                        top: '-60px',
                        animation: `globalIconFall ${duration}s ${delay}s linear infinite`,
                        ['--p-drift' as any]: `${drift}px`,
                        ['--p-end-rot' as any]: `${rotation + 180}deg`,
                        ['--p-opacity' as any]: opacity,
                    }}
                >
                    <Icon
                        style={{ width: size, height: size, color, opacity: 1, transform: `rotate(${rotation}deg)` }}
                    />
                </div>
            ))}
        </div>
    );
}
