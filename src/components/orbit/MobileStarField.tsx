import { useEffect, useRef, useCallback } from 'react';

/**
 * MobileStarField — "3D Deep Space Flight" background.
 *
 * PERFORMANCE-OPTIMIZED for low-end devices:
 * ─ Adaptive star count: 20 on mobile, 40 on desktop (halved from 60).
 * ─ No boxShadow on stars (avoids per-frame paint).
 * ─ Rotating containers shrunk from 180vw → 150vw (less GPU rasterization).
 * ─ Shooting stars use useRef + direct DOM manipulation (zero React re-renders).
 * ─ No mix-blend-mode on nebula layers (compositing overhead removed).
 * ─ nebulaBreath animates only opacity (compositor-only, no layout).
 * ─ willChange removed from individual stars (browser decides compositing).
 * ─ contain: layout style on rotating containers.
 */

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// Adaptive star count: fewer on mobile
const NUM_STARS = isMobile ? 20 : 40;

const generateStars = (count: number) => Array.from({ length: count }).map((_, i) => {
    const rawX = Math.random() * 100;
    const rawY = Math.random() * 100;
    const dx = rawX - 50;
    const dy = rawY - 50;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const travelDist = 60 + Math.random() * 80;
    const tx = (dx / dist) * travelDist;
    const ty = (dy / dist) * travelDist;
    const startX = 50 + dx * 0.2;
    const startY = 50 + dy * 0.2;

    return {
        id: i,
        x: startX,
        y: startY,
        tx: tx.toFixed(2),
        ty: ty.toFixed(2),
        size: 1 + Math.random() * 1.8, // Slightly larger to compensate for no boxShadow
        opacity: 0.4 + Math.random() * 0.6,
        color: Math.random() > 0.85 ? '#fbbf24' : Math.random() > 0.7 ? '#34d399' : '#ffffff',
        dur: 8 + Math.random() * 16,
        delay: Math.random() * -20,
        scale: 2 + Math.random() * 3.5,
    };
});

// Split into two sets for counter-rotating fields
const ZOOM_STARS_1 = generateStars(Math.ceil(NUM_STARS / 2));
const ZOOM_STARS_2 = generateStars(Math.floor(NUM_STARS / 2));

export function MobileStarField() {
    const shootingContainerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    // Direct DOM shooting star spawner — zero React re-renders
    const spawnStar = useCallback(() => {
        const container = shootingContainerRef.current;
        if (!container) return;

        const origin = Math.random();
        let left: string, top: string, angle: number;

        if (origin < 0.33) {
            left = -10 + Math.random() * 120 + '%';
            top = '-10%';
            angle = 20 + Math.random() * 140;
        } else if (origin < 0.66) {
            left = '-10%';
            top = -10 + Math.random() * 80 + '%';
            angle = -20 + Math.random() * 80;
        } else {
            left = '110%';
            top = -10 + Math.random() * 80 + '%';
            angle = 120 + Math.random() * 80;
        }

        const dur = 1.0 + Math.random() * 2.0;
        const travel = 100 + Math.random() * 100 + 'vw';
        const width = 60 + Math.random() * 100;
        const opacity = 0.5 + Math.random() * 0.5;

        const el = document.createElement('div');
        el.style.cssText = `
            position:absolute;
            left:${left};top:${top};
            width:${width}px;height:2px;border-radius:9999px;
            background:linear-gradient(to right, transparent 0%, rgba(16,185,129,0.3) 40%, rgba(255,255,255,${opacity}) 100%);
            --angle:${angle}deg;
            --travel:${travel};
            animation:shootingStarDynamic ${dur}s ease-in forwards;
            opacity:0;
        `;
        container.appendChild(el);

        // Auto-remove after animation ends
        setTimeout(() => {
            el.remove();
        }, dur * 1000 + 100);

        // Schedule the next shooting star (2–8s on mobile, 1–6s on desktop)
        const nextDelay = isMobile ? 2000 + Math.random() * 6000 : 1000 + Math.random() * 5000;
        timeoutRef.current = setTimeout(spawnStar, nextDelay);
    }, []);

    useEffect(() => {
        // Respect reduced motion preference
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        // Start first shooting star after a short delay
        timeoutRef.current = setTimeout(spawnStar, 800);
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [spawnStar]);

    return (
        <div
            className="fixed inset-0 w-full h-[100dvh] pointer-events-none select-none overflow-hidden"
            style={{ zIndex: -49, contain: 'strict' }}
            aria-hidden
        >
            {/* ── 1. Deep Cosmic Void Base ── */}
            <div className="absolute inset-0 bg-[#000000]" />

            {/* ── 2. Rich Deep Galaxy Dust & Nebulas (no mix-blend-mode) ── */}
            {/* Neon Green / Emerald Cloud */}
            <div className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at 30% 70%, rgba(16, 185, 129, 0.08) 0%, rgba(4, 47, 46, 0.03) 50%, transparent 100%)',
                    animation: 'nebulaBreath 15s ease-in-out infinite alternate',
                    ['--neb-lo' as any]: '0.5',
                    ['--neb-hi' as any]: '1'
                }}
            />
            {/* Orange-Gold / Amber Cloud */}
            <div className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at 80% 30%, rgba(245, 158, 11, 0.06) 0%, rgba(120, 53, 15, 0.02) 60%, transparent 100%)',
                    animation: 'nebulaBreath 12s ease-in-out 3s infinite alternate',
                    ['--neb-lo' as any]: '0.4',
                    ['--neb-hi' as any]: '0.9'
                }}
            />
            {/* Ambient Cosmic Dust Diagonal (static, no animation) */}
            <div className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, transparent 40%, rgba(245, 158, 11, 0.03) 100%)'
                }}
            />

            {/* ── 3. Distant Spiral Galaxy Element ── */}
            <div className="absolute top-[35%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] sm:w-[90vw] sm:h-[90vw] opacity-50">
                {/* Galactic Core Glow */}
                <div className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(245,158,11,0.08) 10%, rgba(217,119,6,0.03) 30%, transparent 50%)',
                        animation: 'nebulaBreath 10s ease-in-out infinite alternate',
                        ['--neb-lo' as any]: '0.6',
                        ['--neb-hi' as any]: '1'
                    }}
                />
                {/* Spiral Disk Body */}
                <div className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.06) 0%, rgba(20,184,166,0.03) 40%, transparent 60%)',
                        transform: 'scaleY(0.3) rotate(15deg)',
                        animation: 'nebulaBreath 18s ease-in-out 2s infinite alternate',
                        ['--neb-lo' as any]: '0.5',
                        ['--neb-hi' as any]: '0.9'
                    }}
                />
                {/* Second Spiral Arm */}
                <div className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.05) 0%, rgba(217,119,6,0.02) 30%, transparent 50%)',
                        transform: 'scaleY(0.25) rotate(-20deg)',
                        animation: 'nebulaBreath 14s ease-in-out 5s infinite alternate',
                        ['--neb-lo' as any]: '0.4',
                        ['--neb-hi' as any]: '0.8'
                    }}
                />
            </div>

            {/* ── 4. Floating 3D Zooming Stars ── */}
            {/* Layer 1: Forward Rotation (150vw container, down from 180vw) */}
            <div className="absolute top-1/2 left-1/2 w-[150vw] h-[150vw] star-layer-rotate"
                style={{
                    animation: 'starFieldRotate 180s linear infinite',
                    contain: 'layout style',
                }}
            >
                {ZOOM_STARS_1.map((s) => (
                    <div
                        key={`z1-${s.id}`}
                        className="absolute rounded-full"
                        style={{
                            left: `${s.x}%`, top: `${s.y}%`,
                            width: `${s.size}px`, height: `${s.size}px`,
                            background: s.color,
                            ['--star-op' as any]: s.opacity,
                            ['--tx' as any]: s.tx,
                            ['--ty' as any]: s.ty,
                            ['--star-scale' as any]: s.scale,
                            animation: `starZoom ${s.dur}s ease-in ${s.delay}s infinite`,
                            opacity: 0,
                        }}
                    />
                ))}
            </div>

            {/* Layer 2: Counter-Rotation */}
            <div className="absolute top-1/2 left-1/2 w-[150vw] h-[150vw] star-layer-rotate-reverse"
                style={{
                    animation: 'starFieldRotateReverse 240s linear infinite',
                    contain: 'layout style',
                }}
            >
                {ZOOM_STARS_2.map((s) => (
                    <div
                        key={`z2-${s.id}`}
                        className="absolute rounded-full"
                        style={{
                            left: `${s.x}%`, top: `${s.y}%`,
                            width: `${s.size}px`, height: `${s.size}px`,
                            background: s.color,
                            ['--star-op' as any]: s.opacity,
                            ['--tx' as any]: s.tx,
                            ['--ty' as any]: s.ty,
                            ['--star-scale' as any]: s.scale,
                            animation: `starZoom ${s.dur}s ease-in ${s.delay}s infinite`,
                            opacity: 0,
                        }}
                    />
                ))}
            </div>

            {/* ── 5. Dynamic Shooting Stars (DOM-direct, zero re-renders) ── */}
            <div ref={shootingContainerRef} className="absolute inset-0" />
        </div>
    );
}
