import React, { useRef, useEffect } from 'react';

// Detect low-end device based on hardware hints
function isLowEndDevice(): boolean {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = (navigator as any).deviceMemory || 4;
    const isMobile = window.innerWidth < 768;
    return cores <= 4 || memory <= 4 || isMobile;
}

export function SolarSystemAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const isMobile = window.innerWidth < 768;
        const lowEnd = isLowEndDevice();

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
        <div className="absolute inset-0 w-full h-full bg-[#06060c] z-0 pointer-events-none select-none overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-100" />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(6,6,12,0.6) 70%, #06060c 100%)'
                }}
            />
        </div>
    );
}
