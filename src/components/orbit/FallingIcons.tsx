import { useMemo } from 'react';
import { useContent } from '@/contexts/ContentContext';
import {
    Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
    Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
    Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette, Brain, Wrench
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
    Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
    Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
    Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette, Brain, Wrench
};
export const ALL_ICON_NAMES = Object.keys(ICON_MAP);
const FALLBACK_ICONS = ['Brain', 'Wrench', 'Zap', 'Shield', 'Target', 'Rocket', 'Globe', 'Bot'];
const FALL_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#22d3ee'];
const PARTICLE_COUNT = 30;

/**
 * Global falling-icons background with orbital 3D-tilted rotation.
 * Reads enabled icons from content.en.fallingIcons; falls back to Why Us icons or defaults.
 */
export function FallingIcons() {
    const { content } = useContent();

    // Read admin-configured enabled icons
    const iconNames = useMemo(() => {
        const config = (content?.en as any)?.fallingIcons;

        // If admin has configured specific icons, use only those that are enabled
        if (config?.icons && typeof config.icons === 'object') {
            const enabled = Object.entries(config.icons)
                .filter(([_, v]) => v === true)
                .map(([k]) => k)
                .filter(name => ICON_MAP[name]);
            if (enabled.length >= 1) return enabled;
        }

        // Fallback: extract from Why Us section
        const whyUsData = (content?.en as any)?.whyUs;
        const items: any[] = whyUsData?.items || [];
        const names = items.map((item: any) => item.icon).filter(Boolean) as string[];
        return names.length >= 3 ? names : FALLBACK_ICONS;
    }, [content]);

    // Check if effect is disabled by admin
    const isEnabled = useMemo(() => {
        const config = (content?.en as any)?.fallingIcons;
        if (config && config.enabled === false) return false;
        return true;
    }, [content]);

    const particles = useMemo(() =>
        Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const iconName = iconNames[Math.floor(Math.random() * iconNames.length)];
            const Icon = ICON_MAP[iconName] || Zap;
            const size = 12 + Math.random() * 20;
            const left = Math.random() * 100;
            const delay = Math.random() * 18;
            const duration = 14 + Math.random() * 20;
            const drift = -40 + Math.random() * 80;
            const opacity = 0.30 + Math.random() * 0.2;
            const color = FALL_COLORS[Math.floor(Math.random() * FALL_COLORS.length)];
            // Orbital spin: each icon gets its own spin speed and tilt axis
            const spinDuration = 3 + Math.random() * 6; // 3-9s per orbit rotation
            const tiltX = 40 + Math.random() * 30;      // 40-70° perspective tilt
            const tiltDir = Math.random() > 0.5 ? 1 : -1; // clockwise or counter

            return { Icon, size, left, delay, duration, drift, opacity, color, key: i, spinDuration, tiltX, tiltDir };
        }), [iconNames]);

    if (!isEnabled) return null;

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
            <style>{`
                @keyframes globalIconFall {
                    0%   { transform: translateY(-80px) translateX(0px); opacity: 0; }
                    8%   { opacity: var(--p-opacity); }
                    92%  { opacity: var(--p-opacity); }
                    100% { transform: translateY(calc(100vh + 80px)) translateX(var(--p-drift)); opacity: 0; }
                }
                @keyframes iconOrbitSpin {
                    0%   { transform: perspective(200px) rotateX(var(--p-tiltX)) rotateY(0deg); }
                    100% { transform: perspective(200px) rotateX(var(--p-tiltX)) rotateY(var(--p-spin-dir)); }
                }
            `}</style>
            {particles.map(({ Icon, size, left, delay, duration, drift, opacity, color, key, spinDuration, tiltX, tiltDir }) => (
                <div
                    key={key}
                    className="absolute"
                    style={{
                        left: `${left}%`,
                        top: '-60px',
                        animation: `globalIconFall ${duration}s ${delay}s linear infinite`,
                        ['--p-drift' as any]: `${drift}px`,
                        ['--p-opacity' as any]: opacity,
                    }}
                >
                    <div
                        style={{
                            animation: `iconOrbitSpin ${spinDuration}s linear infinite`,
                            ['--p-tiltX' as any]: `${tiltX}deg`,
                            ['--p-spin-dir' as any]: `${tiltDir * 360}deg`,
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        <Icon
                            style={{ width: size, height: size, color }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
