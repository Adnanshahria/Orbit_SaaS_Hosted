import React, { useRef, useEffect } from 'react';

// Lucide icon SVG path data — avoids importing react-dom/server (~40KB)
const ICON_PATHS: Record<string, { d: string; strokeWidth?: number }[]> = {
    Zap: [{ d: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z' }],
    Sparkles: [{ d: 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z' }, { d: 'M20 3v4' }, { d: 'M22 5h-4' }],
    Globe: [{ d: 'M21.54 15H17a2 2 0 0 0-2 2v4.54' }, { d: 'M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17' }, { d: 'M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05' }],
    Bot: [{ d: 'M12 8V4H8' }, { d: 'M2 14h2' }, { d: 'M20 14h2' }, { d: 'M15 13v2' }, { d: 'M9 13v2' }],
    Code: [{ d: 'M16 18l6-6-6-6' }, { d: 'M8 6l-6 6 6 6' }],
    Database: [{ d: 'M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3z', strokeWidth: 2 }, { d: 'M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5' }, { d: 'M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3' }],
    Cpu: [{ d: 'M6 6h12v12H6z' }, { d: 'M9 9h6v6H9z' }, { d: 'M9 1v3' }, { d: 'M15 1v3' }, { d: 'M9 20v3' }, { d: 'M15 20v3' }, { d: 'M20 9h3' }, { d: 'M20 14h3' }, { d: 'M1 9h3' }, { d: 'M1 14h3' }],
    Smartphone: [{ d: 'M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z' }, { d: 'M11 17h2' }],
};

// Build SVG string for an icon without react-dom/server
function buildIconSvg(iconName: string, color: string, size: number, strokeW: number): string {
    const paths = ICON_PATHS[iconName];
    if (!paths) return '';
    const pathsStr = paths.map(p =>
        `<path d="${p.d}" fill="none" stroke="${color}" stroke-width="${p.strokeWidth || strokeW}" stroke-linecap="round" stroke-linejoin="round"/>`
    ).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">${pathsStr}</svg>`;
}

// Detect low-end device based on hardware hints
function isLowEndDevice(): boolean {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = (navigator as any).deviceMemory || 4;
    const isMobile = window.innerWidth < 768;
    return cores <= 4 || memory <= 4 || isMobile;
}

// Icon name mapping for planets
const PLANET_ICONS = ['Zap', 'Sparkles', 'Globe', 'Bot', 'Code', 'Database', 'Cpu', 'Smartphone'];

export function SolarSystemAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Component-level flags for conditional rendering (cursor, etc.)
    const [isDesktopCapable, setIsDesktopCapable] = React.useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const isMobile = window.innerWidth < 768;
        const lowEnd = isLowEndDevice();
        setIsDesktopCapable(!isMobile && !lowEnd);

        const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        // Frame rate throttling
        const targetFPS = isMobile ? 40 : (lowEnd ? 30 : 60);
        const frameDuration = 1000 / targetFPS;
        let lastFrameTime = 0;

        // Visibility tracking
        let isVisible = true;
        let isTabActive = true;

        const observer = new IntersectionObserver(
            ([entry]) => { isVisible = entry.isIntersecting; },
            { threshold: 0.05 }
        );
        if (canvas.parentElement) observer.observe(canvas.parentElement);

        const onVisibilityChange = () => {
            isTabActive = document.visibilityState === 'visible';
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        };
        window.addEventListener('resize', handleResize);

        // Planet speeds boosted slightly for a more dynamic, realistic feel
        const planets = [
            { name: 'Mercury', dist: 80, speed: 3.0, size: 16, color: '0, 255, 255', iconIdx: 0 },
            { name: 'Venus', dist: 130, speed: 2.2, size: 18, color: '100, 210, 255', iconIdx: 1 },
            { name: 'Earth', dist: 190, speed: 1.5, size: 22, color: '0, 160, 255', iconIdx: 2 },
            { name: 'Mars', dist: 250, speed: 1.1, size: 18, color: '160, 110, 255', iconIdx: 3 },
            { name: 'Jupiter', dist: 400, speed: 0.55, size: 32, color: '0, 255, 255', iconIdx: 4 },
            { name: 'Saturn', dist: 550, speed: 0.35, size: 28, color: '110, 255, 255', iconIdx: 5 },
            { name: 'Uranus', dist: 700, speed: 0.22, size: 24, color: '0, 210, 255', iconIdx: 6 },
            { name: 'Neptune', dist: 850, speed: 0.15, size: 24, color: '160, 255, 255', iconIdx: 7 },
        ];

        // Pre-render icons to textures — using direct SVG strings (no react-dom/server)
        const iconTextures: Record<string, HTMLImageElement> = {};
        planets.forEach(p => {
            const iconName = PLANET_ICONS[p.iconIdx];
            const svgString = buildIconSvg(iconName, `rgb(${p.color})`, isMobile ? 48 : 64, isMobile ? 2 : 2.5);
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.src = url;
            iconTextures[p.name] = img;
        });

        // ─── Stars ───────────────────────────────────────────────
        const starCount = isMobile ? 100 : (lowEnd ? 180 : 320);
        const stars = Array.from({ length: starCount }).map(() => ({
            x: Math.random() * 4000 - 2000,
            y: Math.random() * 4000 - 2000,
            size: Math.random() * 1.8 + 0.3,
            baseAlpha: Math.random() * 0.5 + 0.15,
            twinkleSpeed: Math.random() * 2 + 0.5,
            twinkleOffset: Math.random() * Math.PI * 2,
            // Gold / warm-white mix
            color: Math.random() > 0.7
                ? `${200 + Math.floor(Math.random() * 55)}, ${170 + Math.floor(Math.random() * 60)}, ${80 + Math.floor(Math.random() * 50)}`
                : `${220 + Math.floor(Math.random() * 35)}, ${220 + Math.floor(Math.random() * 35)}, ${220 + Math.floor(Math.random() * 35)}`
        }));

        // Reduced particle counts for performance
        const asteroidCount = isMobile ? 40 : (lowEnd ? 60 : 120);

        const asteroids = Array.from({ length: asteroidCount }).map(() => ({
            dist: 290 + Math.random() * 80,
            angle: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 0.3,
            size: Math.random() * 1.2 + 0.3,
            alpha: Math.random() * 0.3 + 0.05
        }));

        // ─── Floating dust motes (rising golden particles) ──────
        const dustCount = isMobile ? 30 : (lowEnd ? 50 : 90);
        const dustMotes = Array.from({ length: dustCount }).map(() => ({
            x: Math.random() * 3000 - 1500,
            y: Math.random() * 3000 - 1500,
            size: Math.random() * 1.5 + 0.5,
            speedY: -(Math.random() * 15 + 5), // drift upward
            speedX: (Math.random() - 0.5) * 8,
            alpha: Math.random() * 0.4 + 0.1,
            color: Math.random() > 0.5
                ? '245, 158, 11'   // amber
                : '16, 185, 129'   // emerald
        }));

        // ─── Nebula clouds ──────────────────────────────────────
        const nebulaCount = lowEnd ? 2 : (isMobile ? 3 : 5);
        const nebulae = Array.from({ length: nebulaCount }).map((_, i) => ({
            // Spread nebulae across the canvas
            x: (i / nebulaCount) * width + (Math.random() - 0.5) * width * 0.4,
            y: (Math.random()) * height,
            radius: (isMobile ? 150 : 250) + Math.random() * (isMobile ? 100 : 200),
            driftSpeedX: (Math.random() - 0.5) * 12,
            driftSpeedY: (Math.random() - 0.5) * 8,
            pulseSpeed: Math.random() * 0.3 + 0.15,
            pulseOffset: Math.random() * Math.PI * 2,
            baseAlpha: 0.04 + Math.random() * 0.04,
            // Cycle through emerald, teal, amber, rose
            colors: [
                ['16, 185, 129', '20, 184, 166'],   // emerald → teal
                ['245, 158, 11', '236, 72, 153'],    // amber → rose
                ['20, 184, 166', '16, 185, 129'],    // teal → emerald
                ['236, 72, 153', '245, 158, 11'],    // rose → amber
                ['16, 185, 129', '245, 158, 11'],    // emerald → amber
            ][i % 5]
        }));

        let t = 0;
        const animSpeed = 1.0;

        let animationFrameId: number;
        let prevTime = 0;

        function render(now: number) {
            animationFrameId = requestAnimationFrame(render);

            if (!isVisible || !isTabActive) {
                prevTime = now;
                return;
            }

            const elapsed = now - lastFrameTime;
            if (elapsed < frameDuration) return;
            lastFrameTime = now - (elapsed % frameDuration);

            const dt = Math.min((now - prevTime) / 1000, 0.1);
            prevTime = now;
            t += dt * animSpeed;

            // ─── Background fill ────────────────────────────────
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#06060c';
            ctx.fillRect(0, 0, width, height);

            // Subtle warm gradient overlay at bottom
            if (!lowEnd) {
                const warmOverlay = ctx.createRadialGradient(
                    width * 0.5, height * 0.85, 0,
                    width * 0.5, height * 0.85, height * 0.7
                );
                warmOverlay.addColorStop(0, 'rgba(245, 158, 11, 0.025)');
                warmOverlay.addColorStop(0.5, 'rgba(16, 185, 129, 0.015)');
                warmOverlay.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = warmOverlay;
                ctx.fillRect(0, 0, width, height);
            }

            // ─── Nebula clouds ──────────────────────────────────
            ctx.globalCompositeOperation = 'screen';
            for (const neb of nebulae) {
                const cx = neb.x + Math.sin(t * 0.1 + neb.driftSpeedX) * (width * 0.15);
                const cy = neb.y + Math.cos(t * 0.08 + neb.driftSpeedY) * (height * 0.1);
                const pulse = Math.sin(t * neb.pulseSpeed + neb.pulseOffset) * 0.5 + 0.5;
                const alpha = neb.baseAlpha + pulse * 0.03;

                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, neb.radius);
                grad.addColorStop(0, `rgba(${neb.colors[0]}, ${alpha})`);
                grad.addColorStop(0.4, `rgba(${neb.colors[1]}, ${alpha * 0.5})`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(cx, cy, neb.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // ─── Central core glow (emerald/teal breathing) ────
            ctx.globalCompositeOperation = 'screen';
            const corePulse = Math.sin(t * 0.4) * 0.3 + 0.7;
            const coreX = width * 0.5 + Math.sin(t * 0.12) * width * 0.05;
            const coreY = height * 0.42 + Math.cos(t * 0.1) * height * 0.03;
            const coreRadius = (isMobile ? 120 : 220) * corePulse;

            if (!lowEnd) {
                // Outer aura
                const outerAura = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreRadius * 2.5);
                outerAura.addColorStop(0, `rgba(20, 184, 166, ${0.06 * corePulse})`);
                outerAura.addColorStop(0.3, `rgba(16, 185, 129, ${0.03 * corePulse})`);
                outerAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = outerAura;
                ctx.beginPath();
                ctx.arc(coreX, coreY, coreRadius * 2.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Inner core
            const coreGrad = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreRadius);
            coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.12 * corePulse})`);
            coreGrad.addColorStop(0.2, `rgba(20, 184, 166, ${0.08 * corePulse})`);
            coreGrad.addColorStop(0.6, `rgba(16, 185, 129, ${0.04 * corePulse})`);
            coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(coreX, coreY, coreRadius, 0, Math.PI * 2);
            ctx.fill();

            // ─── Stars ──────────────────────────────────────────
            ctx.globalCompositeOperation = 'screen';
            for (const star of stars) {
                // Parallax: stars far away barely move
                const parallax = 0.02;
                const sx = ((star.x + t * 5) % (width * 2)) - width * 0.5;
                const sy = ((star.y + t * 3) % (height * 2)) - height * 0.5;

                // Skip off-screen
                if (sx < -10 || sx > width + 10 || sy < -10 || sy > height + 10) continue;

                const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
                ctx.globalAlpha = star.baseAlpha * twinkle;
                ctx.fillStyle = `rgb(${star.color})`;
                const size = star.size;

                // Draw a soft cross for brighter stars, dot for dimmer
                if (star.size > 1.2 && !lowEnd) {
                    // Tiny glow dot
                    ctx.beginPath();
                    ctx.arc(sx, sy, size * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                    // Cross rays
                    ctx.globalAlpha = star.baseAlpha * twinkle * 0.3;
                    ctx.fillRect(sx - size * 2, sy - 0.3, size * 4, 0.6);
                    ctx.fillRect(sx - 0.3, sy - size * 2, 0.6, size * 4);
                } else {
                    ctx.fillRect(sx - size * 0.5, sy - size * 0.5, size, size);
                }
            }

            // ─── Floating dust motes ────────────────────────────
            ctx.globalCompositeOperation = 'screen';
            for (const dust of dustMotes) {
                // Animate position
                let dx = dust.x + Math.sin(t * 0.3 + dust.speedX) * 50 + t * dust.speedX * 0.5;
                let dy = dust.y + t * dust.speedY;

                // Wrap vertically
                dy = ((dy % (height * 2)) + height * 2) % (height * 2) - height * 0.5;
                dx = ((dx % (width * 2)) + width * 2) % (width * 2) - width * 0.5;

                if (dx < -20 || dx > width + 20 || dy < -20 || dy > height + 20) continue;

                const flicker = Math.sin(t * 3 + dust.speedX * 10) * 0.3 + 0.7;
                ctx.globalAlpha = dust.alpha * flicker;
                ctx.fillStyle = `rgb(${dust.color})`;
                ctx.beginPath();
                ctx.arc(dx, dy, dust.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
        }

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            observer.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <>
            {/* Custom cursor only on non-touch desktop devices */}
            {isDesktopCapable && (
                <style dangerouslySetInnerHTML={{
                    __html: `
        body, a, button, [role="button"] {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ctext x='0' y='24' font-size='24' style='transform: rotate(-30deg); transform-origin: center; filter: drop-shadow(0px 0px 4px rgba(255,255,255,0.8));'%3E🛸%3C/text%3E%3C/svg%3E") 16 16, auto !important;
        }
      `}} />
            )}
            <div className="absolute inset-0 w-full h-full bg-[#000510] z-0 pointer-events-none select-none overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-100" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 40%, rgba(0,5,16,0.7) 85%, #000 100%)' }} />
            </div>
        </>
    );
}
