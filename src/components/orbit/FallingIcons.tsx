import { useMemo, useRef, useEffect, useCallback } from 'react';
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

// 2D ellipse projection
const SQUASH = Math.cos((65 * Math.PI) / 180);
const TWO_PI = Math.PI * 2;
const ORBIT_RADII = [150, 250, 350, 450, 550, 650, 750, 850];
const SYSTEM_ROTATE_SPEED = 180;

/**
 * Smooth & optimized orbital animation.
 * - Single rAF at native refresh rate (no throttle) for butter-smooth motion
 * - Float positions for subpixel rendering (smooth translate)
 * - No CSS filters or shadows (GPU-light)
 * - prefers-reduced-motion support
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
        return iconNames.map((iconName, i) => {
            const Icon = ICON_MAP[iconName] || Zap;
            const radius = ORBIT_RADII[i % ORBIT_RADII.length];
            const orbitDuration = 80 - i * 7;
            const phase = Math.random() * TWO_PI;
            const spinDuration = 4 + Math.random() * 8;
            const direction = i % 2 === 1 ? -1 : 1;
            const size = 20 + Math.random() * 12;
            const opacity = 0.50 + Math.random() * 0.3;
            const color = ORBIT_COLORS[i % ORBIT_COLORS.length];
            // Pre-compute angular velocities (radians per second)
            const orbitVel = (TWO_PI / orbitDuration) * direction;
            const spinVel = 360 / spinDuration;
            return { Icon, radius, phase, orbitVel, spinVel, size, opacity, color, key: i };
        });
    }, [iconNames]);

    const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
    const logoRef = useRef<HTMLImageElement | null>(null);
    const ringsRef = useRef<HTMLDivElement | null>(null);
    const rafId = useRef(0);

    const animate = useCallback((time: number) => {
        const t = time * 0.001; // ms to seconds

        // System rotation
        const sysRad = (t / SYSTEM_ROTATE_SPEED) * TWO_PI;
        const sysDeg = (t / SYSTEM_ROTATE_SPEED) * 360;

        // Rotate the rings + squash container
        if (ringsRef.current) {
            ringsRef.current.style.transform = `scaleY(${SQUASH}) rotate(${sysDeg.toFixed(2)}deg)`;
        }

        // Logo spin
        if (logoRef.current) {
            logoRef.current.style.transform = `rotate(${((t / 30) * 360).toFixed(1)}deg)`;
        }

        // Update each icon — smooth float positions
        for (let i = 0; i < particles.length; i++) {
            const el = iconRefs.current[i];
            if (!el) continue;

            const p = particles[i];
            const angle = sysRad + t * p.orbitVel + p.phase;
            const x = p.radius * Math.cos(angle);
            const y = p.radius * Math.sin(angle) * SQUASH;
            const spin = (t * p.spinVel) % 360;

            // Use .toFixed(1) for smooth subpixel positions without excessive precision
            el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${spin.toFixed(1)}deg)`;
        }

        rafId.current = requestAnimationFrame(animate);
    }, [particles]);

    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        rafId.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId.current);
    }, [animate]);

    if (!isEnabled) return null;

    return (
        <div
            className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center"
            aria-hidden
            style={{ contain: 'strict' }}
        >
            {/* Rings container (receives scaleY + system rotation) */}
            <div ref={ringsRef} className="absolute" style={{ width: 0, height: 0, transform: `scaleY(${SQUASH})` }}>
                {/* Sun glow — static */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 140, height: 140, left: -70, top: -70,
                        background: 'radial-gradient(circle, rgba(251,191,36,0.35) 0%, rgba(16,185,129,0.1) 45%, transparent 70%)',
                        transform: `scaleY(${1 / SQUASH})`,
                    }}
                />

                {/* Orbit rings — static borders, rotated by parent */}
                {ORBIT_RADII.slice(0, iconNames.length).map((r, idx) => (
                    <div
                        key={`ring-${idx}`}
                        className="absolute rounded-full border-primary/10 border-dashed"
                        style={{
                            width: r * 2, height: r * 2,
                            left: -r, top: -r,
                            borderWidth: '1px'
                        }}
                    />
                ))}
            </div>

            {/* Logo at center */}
            <img
                ref={logoRef}
                src={orbitLogo}
                alt=""
                style={{
                    position: 'absolute',
                    width: 36, height: 36,
                    objectFit: 'contain',
                    opacity: 0.35,
                }}
            />

            {/* Icons — flat list, JS-positioned */}
            {particles.map(({ Icon, size, opacity, color, key }) => (
                <div
                    key={key}
                    ref={(el) => { iconRefs.current[key] = el; }}
                    className="absolute"
                    style={{ marginLeft: -size / 2, marginTop: -size / 2 }}
                >
                    <Icon style={{ width: size, height: size, color, opacity }} />
                </div>
            ))}
        </div>
    );
}
