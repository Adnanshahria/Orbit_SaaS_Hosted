/**
 * MobileStarField — "3D Deep Space Flight" background for mobile / low-perf devices.
 *
 * Implements a rich, immersive 3D space-flight aesthetic via CSS:
 * - Deep dark space background with rich cosmic clouds (Neon Green, Emerald, Orange-Gold).
 * - "Flying through space" parallax: stars start from center, move outwards, and scale up (3D zoom effect).
 * - Distant galaxies and nebula clouds that pulse slowly.
 * - Shooting stars to add dynamism.
 * - All animated via CSS keyframes (`starZoom`, `nebulaBreath`) for 60fps compositor performance.
 */

// Generate random star data for the 3D zoom out effect
const NUM_STARS = 60; // Increased count since some will be off-screen in the corners of the spinning box

const generateStars = (count: number) => Array.from({ length: count }).map((_, i) => {
    // Random position across the container (0-100%)
    const rawX = Math.random() * 100;
    const rawY = Math.random() * 100;

    // Calculate distance from center (50, 50)
    const dx = rawX - 50;
    const dy = rawY - 50;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Calculate target translation (tx, ty) to move the star outward.
    const travelDist = 60 + Math.random() * 80;
    const tx = (dx / dist) * travelDist;
    const ty = (dy / dist) * travelDist;

    // Start slightly clamped so they don't immediately spawn off-screen
    const startX = 50 + dx * 0.2;
    const startY = 50 + dy * 0.2;

    return {
        id: i,
        x: startX,
        y: startY,
        tx: tx.toFixed(2),
        ty: ty.toFixed(2),
        size: 0.8 + Math.random() * 1.5,
        opacity: 0.4 + Math.random() * 0.6,
        // Theme Colors: Amber-400 (#fbbf24), Emerald-400 (#34d399), White (#ffffff)
        color: Math.random() > 0.85 ? '#fbbf24' : Math.random() > 0.7 ? '#34d399' : '#ffffff',
        dur: 8 + Math.random() * 16,
        delay: Math.random() * -20, // Negative delay so they start already flying!
        scale: 2 + Math.random() * 3.5,
    };
});

// Split into two sets for counter-rotating fields
const ZOOM_STARS_1 = generateStars(NUM_STARS / 2);
const ZOOM_STARS_2 = generateStars(NUM_STARS / 2);

const SHOOTING_STARS = [
    { id: 1, x: 15, y: 5, width: 120, angle: 35, dur: 1.8, delay: 2, opacity: 0.85 },
    { id: 2, x: 80, y: -5, width: 100, angle: 42, dur: 1.5, delay: 9, opacity: 0.7 },
    { id: 3, x: 25, y: 15, width: 140, angle: 30, dur: 2.0, delay: 17, opacity: 0.9 },
    { id: 4, x: 90, y: 0, width: 90, angle: 45, dur: 1.4, delay: 25, opacity: 0.6 },
    { id: 5, x: 45, y: -5, width: 110, angle: 38, dur: 1.7, delay: 35, opacity: 0.8 },
];

export function MobileStarField() {
    return (
        <div
            className="fixed inset-0 w-full h-[100dvh] pointer-events-none select-none overflow-hidden"
            style={{ zIndex: -49 }}
            aria-hidden
        >
            {/* ── 1. Deep Cosmic Void Base ── */}
            <div className="absolute inset-0 bg-[#000000]" />

            {/* ── 2. Rich Deep Galaxy Dust & Nebulas ── */}
            {/* Neon Green / Emerald Cloud */}
            <div className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at 30% 70%, rgba(16, 185, 129, 0.08) 0%, rgba(4, 47, 46, 0.03) 50%, transparent 100%)',
                    mixBlendMode: 'screen',
                    animation: 'nebulaBreath 15s ease-in-out infinite alternate',
                    ['--neb-lo' as any]: '0.5',
                    ['--neb-hi' as any]: '1'
                }}
            />
            {/* Orange-Gold / Amber Cloud */}
            <div className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at 80% 30%, rgba(245, 158, 11, 0.06) 0%, rgba(120, 53, 15, 0.02) 60%, transparent 100%)',
                    mixBlendMode: 'screen',
                    animation: 'nebulaBreath 12s ease-in-out 3s infinite alternate',
                    ['--neb-lo' as any]: '0.4',
                    ['--neb-hi' as any]: '0.9'
                }}
            />
            {/* Ambient Cosmic Dust Diagonal */}
            <div className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, transparent 40%, rgba(245, 158, 11, 0.03) 100%)'
                }}
            />

            {/* ── 3. Distant Beautiful Spiral Galaxy Element ── */}
            <div className="absolute top-[35%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] sm:w-[90vw] sm:h-[90vw] mix-blend-screen opacity-50">
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

            {/* ── 4. Floating 3D Zooming Stars (Dynamic Infinite Variation) ── */}
            {/* By placing the stars in a massive spinning container, their outward flight paths 
                rotate over time. This makes the CSS keyframes feel infinitely random as no star 
                will ever cross exactly the same path twice. */}

            {/* Layer 1: Forward Rotation */}
            <div className="absolute top-1/2 left-1/2 w-[180vw] h-[180vw]"
                style={{ animation: 'starFieldRotate 180s linear infinite' }}
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
                            boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
                            animation: `starZoom ${s.dur}s ease-in ${s.delay}s infinite`,
                            opacity: 0,
                            willChange: 'transform, opacity',
                        }}
                    />
                ))}
            </div>

            {/* Layer 2: Counter-Rotation */}
            <div className="absolute top-1/2 left-1/2 w-[180vw] h-[180vw]"
                style={{ animation: 'starFieldRotateReverse 240s linear infinite' }}
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
                            boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
                            animation: `starZoom ${s.dur}s ease-in ${s.delay}s infinite`,
                            opacity: 0,
                            willChange: 'transform, opacity',
                        }}
                    />
                ))}
            </div>

            {/* ── 5. Shooting Stars ── */}
            {SHOOTING_STARS.map((s) => (
                <div
                    key={`ss-${s.id}`}
                    className="absolute"
                    style={{
                        left: `${s.x}%`, top: `${s.y}%`,
                        width: `${s.width}px`, height: '2px', borderRadius: '9999px',
                        background: `linear-gradient(to right, transparent, rgba(255,255,255,${s.opacity}), rgba(16,185,129,0.4), transparent)`,
                        ['--angle' as any]: `${s.angle}deg`,
                        animation: `shootingStar ${s.dur}s ease-out ${s.delay}s infinite`,
                        opacity: 0,
                        willChange: 'transform, opacity',
                    }}
                />
            ))}
        </div>
    );
}
