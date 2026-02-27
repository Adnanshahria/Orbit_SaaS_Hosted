/**
 * MobileStarField — "Flying through space" background for mobile / low-perf devices.
 *
 * Creates a sense of moving through space / orbiting a galaxy:
 * - 3 parallax star layers (slow/medium/fast) flow top → bottom
 * - Fast (close) stars: large, bright — zoom past quickly
 * - Slow (far) stars: small, dim — drift gently
 * - 5 shooting stars at random intervals
 * - Pulsing nebula glows (emerald, amber, indigo) for "galaxy nearby" feel
 * - All CSS keyframe animations: compositor-only, zero CPU during scroll
 */

// ── Parallax star data — each layer scrolls at a different speed ─────────────

// FAST layer — large, bright, close stars (loop from bottom so they refill)
const FAST_STARS = [
    { x: 12, y: 0, size: 2.8, opacity: 0.95, color: '#ffffff', delay: 0 },
    { x: 34, y: 15, size: 2.2, opacity: 0.85, color: '#ffd580', delay: 2 },
    { x: 58, y: 5, size: 3.0, opacity: 0.9, color: '#d0ffe8', delay: 4 },
    { x: 78, y: 30, size: 2.5, opacity: 0.88, color: '#80ffea', delay: 1 },
    { x: 92, y: 0, size: 2.0, opacity: 0.82, color: '#ffffff', delay: 3 },
    { x: 22, y: 55, size: 3.2, opacity: 0.95, color: '#ffd580', delay: 5 },
    { x: 48, y: 80, size: 2.6, opacity: 0.9, color: '#d0ffe8', delay: 0.5 },
    { x: 68, y: 65, size: 2.2, opacity: 0.85, color: '#80ffea', delay: 6 },
];

// MED layer — mid-sized stars
const MED_STARS = [
    { x: 8, y: 10, size: 1.6, opacity: 0.7, color: '#e0f0ff', delay: 0 },
    { x: 25, y: 40, size: 1.4, opacity: 0.65, color: '#ffffff', delay: 3 },
    { x: 45, y: 20, size: 1.8, opacity: 0.75, color: '#ffd580', delay: 1.5 },
    { x: 62, y: 50, size: 1.5, opacity: 0.68, color: '#d0ffe8', delay: 4 },
    { x: 82, y: 15, size: 1.7, opacity: 0.72, color: '#80ffea', delay: 2 },
    { x: 15, y: 75, size: 1.4, opacity: 0.65, color: '#e0f0ff', delay: 6 },
    { x: 55, y: 90, size: 1.9, opacity: 0.78, color: '#ffffff', delay: 0.8 },
    { x: 88, y: 70, size: 1.5, opacity: 0.67, color: '#ffd580', delay: 5 },
    { x: 35, y: 60, size: 1.6, opacity: 0.70, color: '#ffffff', delay: 7 },
    { x: 72, y: 35, size: 1.3, opacity: 0.60, color: '#d0ffe8', delay: 9 },
];

// SLOW layer — tiny, dim, far stars
const SLOW_STARS = [
    { x: 5, y: 5, size: 0.9, opacity: 0.4, color: '#aabbdd', delay: 0 },
    { x: 18, y: 25, size: 0.8, opacity: 0.35, color: '#aabbdd', delay: 4 },
    { x: 32, y: 50, size: 1.0, opacity: 0.42, color: '#aabbdd', delay: 8 },
    { x: 50, y: 35, size: 0.8, opacity: 0.35, color: '#aabbdd', delay: 2 },
    { x: 65, y: 78, size: 0.9, opacity: 0.38, color: '#aabbdd', delay: 12 },
    { x: 80, y: 45, size: 0.8, opacity: 0.33, color: '#aabbdd', delay: 6 },
    { x: 92, y: 88, size: 1.0, opacity: 0.40, color: '#aabbdd', delay: 10 },
    { x: 42, y: 12, size: 0.8, opacity: 0.35, color: '#aabbdd', delay: 16 },
    { x: 72, y: 60, size: 0.9, opacity: 0.38, color: '#aabbdd', delay: 14 },
];

// ── Shooting stars — timing staggered so they appear every ~8s on average ───
const SHOOTING_STARS = [
    { x: 10, y: 5, width: 110, angle: 32, dur: 1.6, delay: 1, opacity: 0.9 },
    { x: 60, y: 3, width: 90, angle: 38, dur: 1.4, delay: 9, opacity: 0.75 },
    { x: 30, y: 8, width: 130, angle: 30, dur: 1.8, delay: 18, opacity: 0.85 },
    { x: 75, y: 5, width: 100, angle: 35, dur: 1.5, delay: 27, opacity: 0.8 },
    { x: 48, y: 2, width: 85, angle: 40, dur: 1.7, delay: 38, opacity: 0.7 },
];

// ── Flight durations per layer ───────────────────────────────────────────────
const FAST_DUR = 8;  // seconds to cross screen
const MED_DUR = 16;
const SLOW_DUR = 35;

export function MobileStarField() {
    return (
        <div
            className="fixed inset-0 w-full h-[100dvh] pointer-events-none select-none overflow-hidden"
            style={{ zIndex: -49 }}
            aria-hidden
        >
            {/* ── Deep space base ── */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at 50% 20%, #07071a 0%, #03030c 55%, #000000 100%)',
                }}
            />

            {/* ── Nebula glow 1: Emerald — top-right, galaxy core ── */}
            <div
                className="absolute"
                style={{
                    width: '80vw', height: '80vw',
                    top: '-30vw', right: '-20vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0.08) 45%, transparent 72%)',
                    animation: 'nebulaBreath 8s ease-in-out infinite',
                    ['--neb-lo' as any]: '0.7',
                    ['--neb-hi' as any]: '1',
                }}
            />

            {/* ── Nebula glow 2: Amber — left center, passing star cluster ── */}
            <div
                className="absolute"
                style={{
                    width: '65vw', height: '65vw',
                    top: '20vw', left: '-18vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.05) 55%, transparent 78%)',
                    animation: 'nebulaBreath 11s ease-in-out 3s infinite',
                    ['--neb-lo' as any]: '0.6',
                    ['--neb-hi' as any]: '1',
                }}
            />

            {/* ── Nebula glow 3: Indigo — bottom, distant galaxy arm ── */}
            <div
                className="absolute"
                style={{
                    width: '90vw', height: '70vw',
                    bottom: '-25vw', left: '5vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, rgba(99,102,241,0.05) 50%, transparent 75%)',
                    animation: 'nebulaBreath 14s ease-in-out 6s infinite',
                    ['--neb-lo' as any]: '0.55',
                    ['--neb-hi' as any]: '1',
                }}
            />

            {/* ── Nebula glow 4: Teal — center, core light ── */}
            <div
                className="absolute"
                style={{
                    width: '55vw', height: '55vw',
                    top: '30vw', right: '5vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)',
                    animation: 'nebulaBreath 10s ease-in-out 1.5s infinite',
                    ['--neb-lo' as any]: '0.5',
                    ['--neb-hi' as any]: '1',
                }}
            />

            {/* ── Milky way band ── */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(115deg, transparent 10%, rgba(130,150,255,0.05) 50%, transparent 90%)',
                }}
            />

            {/* ══ FAST stars (close, fly past quickly) ══ */}
            {FAST_STARS.map((s, i) => (
                <div
                    key={`f-${i}`}
                    className="absolute rounded-full"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                        background: s.color,
                        opacity: s.opacity,
                        boxShadow: `0 0 ${s.size * 2.5}px ${s.color}`,
                        animation: `spaceFlightFast ${FAST_DUR}s linear ${s.delay}s infinite`,
                        willChange: 'transform',
                    }}
                />
            ))}

            {/* ══ MEDIUM stars ══ */}
            {MED_STARS.map((s, i) => (
                <div
                    key={`m-${i}`}
                    className="absolute rounded-full"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                        background: s.color,
                        opacity: s.opacity,
                        boxShadow: s.size > 1.5 ? `0 0 ${s.size * 2}px ${s.color}` : 'none',
                        animation: `spaceFlightMed ${MED_DUR}s linear ${s.delay}s infinite`,
                        willChange: 'transform',
                    }}
                />
            ))}

            {/* ══ SLOW (far) stars ══ */}
            {SLOW_STARS.map((s, i) => (
                <div
                    key={`sl-${i}`}
                    className="absolute rounded-full"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                        background: s.color,
                        opacity: s.opacity,
                        animation: `spaceFlightSlow ${SLOW_DUR}s linear ${s.delay}s infinite`,
                        willChange: 'transform',
                    }}
                />
            ))}

            {/* ══ Shooting / falling stars ══ */}
            {SHOOTING_STARS.map((s, i) => (
                <div
                    key={`ss-${i}`}
                    className="absolute"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        // Tail: long narrow gradient
                        width: `${s.width}px`,
                        height: '1.5px',
                        borderRadius: '9999px',
                        background: `linear-gradient(to right, transparent, rgba(255,255,255,${s.opacity}), rgba(255,255,255,0.2), transparent)`,
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
