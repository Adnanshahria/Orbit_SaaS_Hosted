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
const ORBIT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#22d3ee'];

/**
 * Global background with 3D planetary orbital rotation.
 * Reads enabled icons from content.en.fallingIcons.
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

    const particles = useMemo(() => {
        // Map over exactly the selected icons so each shows up only once
        return iconNames.map((iconName, i) => {
            const Icon = ICON_MAP[iconName] || Zap;

            // Randomize orbit properties
            const radius = 100 + Math.random() * 500; // Orbit distance from center
            const orbitDuration = 30 + Math.random() * 60; // 30s-90s to complete one orbit
            const delay = -Math.random() * orbitDuration; // Random phase start
            const spinDuration = 4 + Math.random() * 8; // 4-12s spin on own 2D axis
            const isReverse = Math.random() > 0.5; // Orbit direction

            const size = 18 + Math.random() * 16;
            const opacity = 0.40 + Math.random() * 0.4;
            const color = ORBIT_COLORS[Math.floor(Math.random() * ORBIT_COLORS.length)];

            return { Icon, size, radius, delay, orbitDuration, spinDuration, isReverse, opacity, color, key: i };
        });
    }, [iconNames]);

    if (!isEnabled) return null;

    const TILT_ANGLE = 65; // Degrees of isometric tilt for the solar system
    const SYSTEM_ROTATE_SPEED = 180; // Seconds for the entire solar system to align once

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center" aria-hidden style={{ perspective: '1200px' }}>
            <style>{`
                /* Global slow rotation of the whole solar system */
                @keyframes systemSpin {
                    0%   { transform: rotateZ(0deg); }
                    100% { transform: rotateZ(360deg); }
                }
                /* Counter-rotation to keep icons oriented correctly relative to global spin */
                @keyframes counterSystemSpin {
                    0%   { transform: rotateZ(0deg); }
                    100% { transform: rotateZ(-360deg); }
                }
                /* Individual planet orbit around the sun */
                @keyframes orbitAnim {
                    0%   { transform: rotateZ(0deg); }
                    100% { transform: rotateZ(360deg); }
                }
                /* Counter-rotation to keep icons oriented correctly relative to their orbit */
                @keyframes counterOrbitAnim {
                    0%   { transform: rotateZ(0deg); }
                    100% { transform: rotateZ(-360deg); }
                }
                /* 2D Spin (like a steering wheel) facing the camera */
                @keyframes selfSpin {
                    0%   { transform: rotateX(-${TILT_ANGLE}deg) rotateZ(0deg); }
                    100% { transform: rotateX(-${TILT_ANGLE}deg) rotateZ(360deg); }
                }
                /* Slow drift of the entire solar system across the screen */
                @keyframes systemDrift {
                    0%   { transform: translate(0px, 0px) rotateX(${TILT_ANGLE}deg); }
                    33%  { transform: translate(3vw, -4vh) rotateX(${TILT_ANGLE}deg); }
                    66%  { transform: translate(-2vw, 5vh) rotateX(${TILT_ANGLE}deg); }
                    100% { transform: translate(0px, 0px) rotateX(${TILT_ANGLE}deg); }
                }
            `}</style>

            {/* The Solar System Container (Tilted in 3D space and drifting) */}
            <div
                className="relative"
                style={{
                    animation: \`systemDrift 40s ease-in-out infinite\`,
            transformStyle: 'preserve-3d',
            width: 0,
            height: 0
                }}
            >
            {/* Rotating Frame for everything inside the solar system */}
            <div
                className="absolute inset-0"
                style={{
                    animation: \`systemSpin \${SYSTEM_ROTATE_SPEED}s linear infinite\`,
            transformStyle: 'preserve-3d',
                    }}
                >
            {/* Orbit Rings (Dashed circles to show the planetary paths rotating) */}
            {[150, 250, 350, 450, 550, 650].map((r, idx) => (
                <div
                    key={\`ring-\${idx}\`}
            className="absolute rounded-full border-primary/10 border-dashed"
            style={{
                width: r * 2,
                height: r * 2,
                left: -r,
                top: -r,
                transform: 'translateZ(-1px)', // Keep rings slightly below icons
                borderWidth: '1px'
            }}
                        />
                    ))}

            {/* Orbiting Icons */}
            {particles.map(({ Icon, size, radius, delay, orbitDuration, spinDuration, isReverse, opacity, color, key }) => (
                <div
                    key={key}
                    className="absolute flex items-center justify-center"
                    style={{
                        animation: \`orbitAnim \${orbitDuration}s \${delay}s linear infinite\`,
            animationDirection: isReverse ? 'reverse' : 'normal',
            transformStyle: 'preserve-3d',
                            }}
                        >
            {/* Push the icon out to its orbit radius */}
            <div
                style={{
                    transform: \`translateX(\${radius}px)\`,
            transformStyle: 'preserve-3d',
                                }}
                            >
            {/* Counter-rotate the local orbit so the icon faces 0 deg Z before self-spin */}
            <div
                style={{
                    animation: \`counterOrbitAnim \${orbitDuration}s \${delay}s linear infinite\`,
            animationDirection: isReverse ? 'reverse' : 'normal',
            transformStyle: 'preserve-3d',
                                    }}
                                >
            {/* Counter-rotate the global system spin so it stays perfectly aligned */}
            <div
                style={{
                    animation: \`counterSystemSpin \${SYSTEM_ROTATE_SPEED}s linear infinite\`,
            transformStyle: 'preserve-3d',
                                        }}
                                    >
            {/* Tilt back to face the camera, then spin 2D */}
            <div
                style={{
                    animation: \`selfSpin \${spinDuration}s linear infinite\`,
            transformStyle: 'preserve-3d',
                                            }}
                                        >
            <Icon
                style={{
                    width: size,
                    height: size,
                    color,
                    opacity,
                    filter: \`drop-shadow(0px 8px 6px rgba(0,0,0,0.6)) drop-shadow(0px 3px 3px rgba(0,0,0,0.8))\`
                                                }}
                                            />
        </div>
                                    </div >
                                </div >
                            </div >
                        </div >
                    ))
}
                </div >
            </div >
        </div >
    );
}
