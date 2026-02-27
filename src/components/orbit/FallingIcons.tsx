import { useMemo } from 'react';
import { useContent } from '@/contexts/ContentContext';
import {
    Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
    Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
    Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette, Brain, Wrench
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import orbitLogo from '@/assets/orbit-logo.png';

export const ICON_MAP: Record<string, LucideIcon> = {
    Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
    Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
    Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette, Brain, Wrench
};
export const ALL_ICON_NAMES = Object.keys(ICON_MAP);
const FALLBACK_ICONS = ['Zap', 'Sparkles', 'Globe', 'Bot', 'Code', 'Database', 'Cpu', 'Smartphone'];
const ORBIT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#22d3ee'];

// 2D Projection constants
const SQUASH = Math.cos((65 * Math.PI) / 180); // cos(65°) ≈ 0.4226
const UNSQUASH = 1 / SQUASH; // ≈ 2.366

/**
 * Global background with 2D projected planetary orbital rotation.
 * Optimized for low-end devices with GPU compositing, will-change hints,
 * CSS containment, reduced filter complexity, and prefers-reduced-motion support.
 */
export function FallingIcons() {
    const { content } = useContent();

    const iconNames = useMemo(() => {
        const config = (content?.en as any)?.fallingIcons;
        if (config?.icons && typeof config.icons === 'object') {
            const enabled = Object.entries(config.icons)
                .filter(([_, v]) => v === true)
                .map(([k]) => k)
                .filter(name => ICON_MAP[name]);
            if (enabled.length >= 1) return enabled;
        }
        const whyUsData = (content?.en as any)?.whyUs;
        const items: any[] = whyUsData?.items || [];
        const names = items.map((item: any) => item.icon).filter(Boolean) as string[];
        return names.length >= 3 ? names : FALLBACK_ICONS;
    }, [content]);

    const isEnabled = useMemo(() => {
        const config = (content?.en as any)?.fallingIcons;
        if (config && config.enabled === false) return false;
        return true;
    }, [content]);

    const ORBIT_RADII = [150, 250, 350, 450, 550, 650, 750, 850];

    const particles = useMemo(() => {
        return iconNames.map((iconName, i) => {
            const Icon = ICON_MAP[iconName] || Zap;
            const radius = ORBIT_RADII[i % ORBIT_RADII.length];
            const orbitDuration = 80 - i * 7;
            const delay = -Math.random() * orbitDuration;
            const spinDuration = 4 + Math.random() * 8;
            const isReverse = i % 2 === 1;
            const size = 20 + Math.random() * 12;
            const opacity = 0.50 + Math.random() * 0.3;
            const color = ORBIT_COLORS[i % ORBIT_COLORS.length];
            return { Icon, size, radius, delay, orbitDuration, spinDuration, isReverse, opacity, color, key: i };
        });
    }, [iconNames]);

    if (!isEnabled) return null;

    const SYSTEM_ROTATE_SPEED = 180;

    return (
        <div
            className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center"
            aria-hidden
            style={{ contain: 'strict' }}
        >
            <style>{`
                /* ===== KEYFRAMES — only transform & opacity for GPU compositing ===== */
                @keyframes systemSpin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes counterSystemSpin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(-360deg); }
                }
                @keyframes orbitAnim {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes counterOrbitAnim {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(-360deg); }
                }
                @keyframes selfSpin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes systemDrift {
                    0%   { transform: translate(0px, 0px); }
                    33%  { transform: translate(3vw, -4vh); }
                    66%  { transform: translate(-2vw, 5vh); }
                    100% { transform: translate(0px, 0px); }
                }
                @keyframes sunPulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50%      { transform: scale(1.15); opacity: 0.6; }
                }

                /* ===== REDUCED MOTION — respect user/device preference ===== */
                @media (prefers-reduced-motion: reduce) {
                    .orbit-animated { animation: none !important; }
                    .orbit-glow-ring { animation: none !important; opacity: 0.3; }
                }
            `}</style>

            {/* Drift wrapper */}
            <div
                className="relative orbit-animated"
                style={{
                    animation: 'systemDrift 40s ease-in-out infinite',
                    willChange: 'transform',
                    width: 0,
                    height: 0
                }}
            >
                {/* ScaleY wrapper — squashes circles into ellipses */}
                <div
                    className="absolute inset-0"
                    style={{ transform: `scaleY(${SQUASH})` }}
                >
                    {/* Rotating Frame */}
                    <div
                        className="absolute inset-0 orbit-animated"
                        style={{
                            animation: `systemSpin ${SYSTEM_ROTATE_SPEED}s linear infinite`,
                            willChange: 'transform',
                        }}
                    >
                        {/* ===== SUN: Logo with layered glow ===== */}
                        <div
                            className="absolute flex items-center justify-center"
                            style={{
                                left: -60,
                                top: -60,
                                width: 120,
                                height: 120,
                                transform: `scaleY(${UNSQUASH})`,
                                contain: 'layout style',
                            }}
                        >
                            {/* Single combined glow ring instead of 3 separate layers */}
                            <div
                                className="absolute rounded-full orbit-glow-ring"
                                style={{
                                    width: 160,
                                    height: 160,
                                    background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(251,191,36,0.15) 30%, rgba(16,185,129,0.08) 55%, transparent 70%)',
                                    animation: 'sunPulse 4s ease-in-out infinite',
                                    willChange: 'transform, opacity',
                                }}
                            />
                            {/* The actual logo */}
                            <img
                                src={orbitLogo}
                                alt=""
                                className="relative z-10 orbit-animated"
                                style={{
                                    width: 36,
                                    height: 36,
                                    objectFit: 'contain',
                                    opacity: 0.35,
                                    filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.9)) drop-shadow(0 0 30px rgba(16,185,129,0.4))',
                                    animation: 'selfSpin 30s linear infinite',
                                    willChange: 'transform',
                                }}
                            />
                        </div>

                        {/* Orbit Rings — pure CSS borders, no filters */}
                        {ORBIT_RADII.slice(0, iconNames.length).map((r, idx) => (
                            <div
                                key={`ring-${idx}`}
                                className="absolute rounded-full border-primary/10 border-dashed"
                                style={{
                                    width: r * 2,
                                    height: r * 2,
                                    left: -r,
                                    top: -r,
                                    borderWidth: '1px'
                                }}
                            />
                        ))}

                        {/* Orbiting Icons */}
                        {particles.map(({ Icon, size, radius, delay, orbitDuration, spinDuration, isReverse, opacity, color, key }) => (
                            <div
                                key={key}
                                className="absolute flex items-center justify-center orbit-animated"
                                style={{
                                    animation: `orbitAnim ${orbitDuration}s ${delay}s linear infinite`,
                                    animationDirection: isReverse ? 'reverse' : 'normal',
                                    willChange: 'transform',
                                    contain: 'layout style',
                                }}
                            >
                                {/* Push icon out to orbit radius */}
                                <div style={{ transform: `translateX(${radius}px)` }}>
                                    {/* Counter-rotate */}
                                    <div
                                        className="orbit-animated"
                                        style={{
                                            animation: `counterOrbitAnim ${orbitDuration}s ${delay}s linear infinite`,
                                            animationDirection: isReverse ? 'reverse' : 'normal',
                                            willChange: 'transform',
                                        }}
                                    >
                                        <div
                                            className="orbit-animated"
                                            style={{
                                                animation: `counterSystemSpin ${SYSTEM_ROTATE_SPEED}s linear infinite`,
                                                willChange: 'transform',
                                            }}
                                        >
                                            {/* Un-squash */}
                                            <div style={{ transform: `scaleY(${UNSQUASH})` }}>
                                                {/* 2D self-spin */}
                                                <div
                                                    className="orbit-animated"
                                                    style={{
                                                        animation: `selfSpin ${spinDuration}s linear infinite`,
                                                        willChange: 'transform',
                                                    }}
                                                >
                                                    <Icon
                                                        style={{
                                                            width: size,
                                                            height: size,
                                                            color,
                                                            opacity,
                                                            // Single drop-shadow instead of double
                                                            filter: `drop-shadow(0px 4px 4px rgba(0,0,0,0.5))`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
