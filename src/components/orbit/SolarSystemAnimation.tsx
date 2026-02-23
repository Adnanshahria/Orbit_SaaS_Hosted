import React, { useRef, useEffect } from 'react';
import { Zap, Sparkles, Globe, Bot, Code, Database, Cpu, Smartphone } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Detect low-end device based on hardware hints
function isLowEndDevice(): boolean {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = (navigator as any).deviceMemory || 4;
    const isMobile = window.innerWidth < 768;
    // Low-end: <=4 cores, <=4GB RAM, or mobile
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

        // Cap DPI to 1 on mobile to reduce pixel count significantly
        const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        // Frame rate throttling: 20fps mobile, 30fps desktop
        const targetFPS = isMobile ? 20 : (lowEnd ? 24 : 30);
        const frameDuration = 1000 / targetFPS;
        let lastFrameTime = 0;

        // Visibility tracking - pause when not visible
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
            { name: 'Mercury', dist: 80, speed: 3.0, size: 16, color: '0, 255, 255', Icon: Zap },
            { name: 'Venus', dist: 130, speed: 2.2, size: 18, color: '100, 210, 255', Icon: Sparkles },
            { name: 'Earth', dist: 190, speed: 1.5, size: 22, color: '0, 160, 255', Icon: Globe },
            { name: 'Mars', dist: 250, speed: 1.1, size: 18, color: '160, 110, 255', Icon: Bot },
            { name: 'Jupiter', dist: 400, speed: 0.55, size: 32, color: '0, 255, 255', Icon: Code },
            { name: 'Saturn', dist: 550, speed: 0.35, size: 28, color: '110, 255, 255', Icon: Database },
            { name: 'Uranus', dist: 700, speed: 0.22, size: 24, color: '0, 210, 255', Icon: Cpu },
            { name: 'Neptune', dist: 850, speed: 0.15, size: 24, color: '160, 255, 255', Icon: Smartphone },
        ];

        // Pre-render icons to textures
        const iconTextures: Record<string, HTMLImageElement> = {};
        planets.forEach(p => {
            const svgString = renderToStaticMarkup(
                <p.Icon color={`rgb(${p.color})`} size={isMobile ? 48 : 64} strokeWidth={isMobile ? 2 : 2.5} />
            );
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.src = url;
            iconTextures[p.name] = img;
        });

        // Reduced particle counts for performance
        const starCount = isMobile ? 120 : (lowEnd ? 200 : 350);
        const asteroidCount = isMobile ? 40 : (lowEnd ? 60 : 120);

        const asteroids = Array.from({ length: asteroidCount }).map(() => ({
            dist: 290 + Math.random() * 80,
            angle: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 0.3,
            size: Math.random() * 1.2 + 0.3,
            alpha: Math.random() * 0.3 + 0.05
        }));

        const stars = Array.from({ length: starCount }).map(() => ({
            x: (Math.random() - 0.5) * 5000,
            y: (Math.random() - 0.5) * 5000,
            z: (Math.random() - 0.5) * 5000,
            size: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.6 + 0.1,
            color: Math.random() > 0.8 ? '100, 200, 255' : '255, 255, 255'
        }));

        let t = 0;
        const sunSpeed = 150;
        // Reduced trail points but compensated by faster speed
        const trailPoints = isMobile ? 20 : (lowEnd ? 35 : 60);
        const trailDt = 0.03;
        // Target animation speed: t units per second (matches original 60fps * 0.02 = 1.2/s)
        const animSpeed = 1.2;

        function rotate(x: number, y: number, z: number, pitch: number, yaw: number, roll: number) {
            const cosa = Math.cos(pitch), sina = Math.sin(pitch);
            const y1 = y * cosa - z * sina;
            const z1 = y * sina + z * cosa;

            const cosb = Math.cos(yaw), sinb = Math.sin(yaw);
            const x2 = x * cosb + z1 * sinb;
            const z2 = -x * sinb + z1 * cosb;

            const cosc = Math.cos(roll), sinc = Math.sin(roll);
            const x3 = x2 * cosc - y1 * sinc;
            const y3 = x2 * sinc + y1 * cosc;

            return { x: x3, y: y3, z: z2 };
        }

        let animationFrameId: number;
        let prevTime = 0;

        function render(now: number) {
            animationFrameId = requestAnimationFrame(render);

            // Skip frames if not visible or tab inactive
            if (!isVisible || !isTabActive) {
                prevTime = now;
                return;
            }

            // Frame rate throttling
            const elapsed = now - lastFrameTime;
            if (elapsed < frameDuration) return;
            lastFrameTime = now - (elapsed % frameDuration);

            // Delta-time based animation: speed is independent of frame rate
            const dt = Math.min((now - prevTime) / 1000, 0.1); // cap at 100ms to avoid jumps
            prevTime = now;
            t += dt * animSpeed;

            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#000510';
            ctx.fillRect(0, 0, width, height);

            const currentPitch = 0.35 + Math.sin(t * 0.2) * 0.1;
            const currentYaw = t * 0.15;
            const currentRoll = 0;

            const fov = 1000;
            const zOffset = 1500;

            const driftX = Math.sin(t * 0.25) * (width * 0.3);
            const driftY = Math.cos(t * 0.2) * (height * 0.2);
            const centerX = width / 2 + driftX;
            const centerY = height / 2.5 + driftY;

            const project = (x: number, y: number, z: number) => {
                const pt = rotate(x, y, z, currentPitch, currentYaw, currentRoll);
                const scale = fov / (fov + pt.z + zOffset);
                return {
                    x: centerX + pt.x * scale,
                    y: centerY + pt.y * scale,
                    s: scale,
                    z: pt.z
                };
            };

            // Stars
            for (const star of stars) {
                let sy = star.y - t * sunSpeed;
                sy = sy % 5000;
                if (sy < -2500) sy += 5000;

                const proj = project(star.x, sy, star.z);
                if (proj.s < 0) continue;

                ctx.globalAlpha = star.alpha;
                ctx.fillStyle = `rgb(${star.color})`;
                const size = Math.max(0.1, star.size * proj.s);
                ctx.fillRect(proj.x - size, proj.y - size, size * 2, size * 2);
            }

            // Planet trails — no shadowBlur used
            ctx.globalCompositeOperation = 'screen';
            for (const p of planets) {
                let prevProj: any = null;
                for (let i = 0; i < trailPoints; i++) {
                    const histTime = t - i * trailDt;
                    const angle = histTime * p.speed;

                    const hx = Math.cos(angle) * p.dist;
                    const hz = Math.sin(angle) * p.dist;
                    const hy = (sunSpeed * i * trailDt);

                    const proj = project(hx, hy, hz);
                    if (proj.s < 0) continue;

                    if (prevProj) {
                        const progress = i / trailPoints;
                        const opacity = (1 - progress) * 0.6;

                        ctx.beginPath();
                        ctx.moveTo(prevProj.x, prevProj.y);
                        ctx.lineTo(proj.x, proj.y);
                        ctx.strokeStyle = `rgba(${p.color}, ${opacity})`;
                        ctx.lineWidth = Math.max(0.5, 3.5 * prevProj.s);
                        ctx.stroke();
                    }
                    prevProj = proj;
                }
            }

            // Collect items for depth-sorted rendering
            const renderItems: any[] = [];
            const sunProj = project(0, 0, 0);
            if (sunProj.s > 0) renderItems.push({ type: 'sun', proj: sunProj, z: sunProj.z });

            for (const p of planets) {
                const angle = t * p.speed;
                const px = Math.cos(angle) * p.dist;
                const pz = Math.sin(angle) * p.dist;
                const py = 0;
                const proj = project(px, py, pz);
                if (proj.s > 0) renderItems.push({ type: 'planet', p, proj, z: proj.z });
            }

            for (const ast of asteroids) {
                const angle = ast.angle + t * ast.speed;
                const px = Math.cos(angle) * ast.dist;
                const pz = Math.sin(angle) * ast.dist;
                const py = 0;
                const proj = project(px, py, pz);
                if (proj.s > 0) renderItems.push({ type: 'asteroid', ast, proj, z: proj.z });
            }

            renderItems.sort((a, b) => b.z - a.z);

            for (const item of renderItems) {
                if (item.type === 'asteroid') {
                    ctx.globalAlpha = item.ast.alpha;
                    ctx.fillStyle = '#1a3a5a';
                    const size = Math.max(0.1, item.ast.size * item.proj.s);
                    ctx.fillRect(item.proj.x - size, item.proj.y - size, size * 2, size * 2);
                } else if (item.type === 'planet') {
                    const { p, proj } = item;
                    const texture = iconTextures[p.name];

                    if (texture && texture.complete) {
                        const s = Math.max(12, p.size * proj.s * (isMobile ? 2.0 : 2.5));
                        // No shadowBlur — replaced with a simple glow circle for desktop only
                        if (!isMobile && !lowEnd) {
                            ctx.globalAlpha = 0.15;
                            ctx.fillStyle = `rgb(${p.color})`;
                            ctx.beginPath();
                            ctx.arc(proj.x, proj.y, s * 0.8, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.globalAlpha = 1.0;
                        ctx.drawImage(texture, proj.x - s / 2, proj.y - s / 2, s, s);
                    } else {
                        ctx.beginPath();
                        ctx.arc(proj.x, proj.y, Math.max(1, p.size * proj.s), 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${p.color}, 0.5)`;
                        ctx.fill();
                    }
                } else if (item.type === 'sun') {
                    const { proj } = item;
                    const sunRadius = 60 * proj.s;

                    // Simplified sun — no outer glow gradient on low-end
                    if (!lowEnd) {
                        const sunGlow = ctx.createRadialGradient(proj.x, proj.y, sunRadius, proj.x, proj.y, sunRadius * 3);
                        sunGlow.addColorStop(0, 'rgba(255, 200, 0, 0.3)');
                        sunGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
                        ctx.beginPath();
                        ctx.arc(proj.x, proj.y, sunRadius * 3, 0, Math.PI * 2);
                        ctx.fillStyle = sunGlow;
                        ctx.fill();
                    }

                    const sunGradient = ctx.createRadialGradient(proj.x, proj.y, sunRadius * 0.5, proj.x, proj.y, sunRadius * 1.5);
                    sunGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                    sunGradient.addColorStop(0.4, 'rgba(255, 220, 0, 0.8)');
                    sunGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
                    ctx.beginPath();
                    ctx.arc(proj.x, proj.y, sunRadius * 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = sunGradient;
                    ctx.fill();

                    if (!lowEnd) {
                        ctx.beginPath();
                        ctx.arc(proj.x, proj.y, sunRadius * 0.7, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff';
                        ctx.fill();
                    }
                }
            }

            ctx.globalAlpha = 1.0;
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
            <style dangerouslySetInnerHTML={{
                __html: `
        body, a, button, [role="button"] {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ctext x='0' y='24' font-size='24' style='transform: rotate(-30deg); transform-origin: center; filter: drop-shadow(0px 0px 4px rgba(255,255,255,0.8));'%3E🛸%3C/text%3E%3C/svg%3E") 16 16, auto !important;
        }
      `}} />
            <div className="absolute inset-0 w-full h-full bg-[#000510] z-0 pointer-events-none select-none overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-100" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 40%, rgba(0,5,16,0.7) 85%, #000 100%)' }} />
            </div>
        </>
    );
}
