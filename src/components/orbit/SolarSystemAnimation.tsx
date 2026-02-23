import React, { useRef, useEffect } from 'react';

export function SolarSystemAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const planets = [
            { name: 'Mercury', dist: 80, speed: 2.5, size: 2, color: '0, 255, 255' },
            { name: 'Venus', dist: 130, speed: 1.8, size: 3, color: '0, 200, 255' },
            { name: 'Earth', dist: 190, speed: 1.2, size: 4, color: '0, 150, 255' },
            { name: 'Mars', dist: 250, speed: 0.9, size: 3, color: '0, 100, 255' },
            { name: 'Jupiter', dist: 400, speed: 0.4, size: 10, color: '0, 80, 255' },
            { name: 'Saturn', dist: 550, speed: 0.25, size: 8, color: '0, 60, 255' },
            { name: 'Uranus', dist: 700, speed: 0.15, size: 6, color: '0, 40, 255' },
            { name: 'Neptune', dist: 850, speed: 0.1, size: 6, color: '0, 20, 255' },
        ];

        const asteroids = Array.from({ length: 800 }).map(() => ({
            dist: 290 + Math.random() * 80,
            angle: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 0.3,
            size: Math.random() * 1.2 + 0.3,
            alpha: Math.random() * 0.3 + 0.05
        }));

        const stars = Array.from({ length: 1500 }).map(() => ({
            x: (Math.random() - 0.5) * 5000,
            y: (Math.random() - 0.5) * 5000,
            z: (Math.random() - 0.5) * 5000,
            size: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.6 + 0.1,
            color: Math.random() > 0.8 ? '100, 200, 255' : '255, 255, 255'
        }));

        let t = 0;
        const sunSpeed = 150;
        const trailPoints = 300;
        const trailDt = 0.03;

        function rotate(x: number, y: number, z: number, pitch: number, yaw: number, roll: number) {
            let cosa = Math.cos(pitch), sina = Math.sin(pitch);
            let y1 = y * cosa - z * sina;
            let z1 = y * sina + z * cosa;

            let cosb = Math.cos(yaw), sinb = Math.sin(yaw);
            let x2 = x * cosb + z1 * sinb;
            let z2 = -x * sinb + z1 * cosb;

            let cosc = Math.cos(roll), sinc = Math.sin(roll);
            let x3 = x2 * cosc - y1 * sinc;
            let y3 = x2 * sinc + y1 * cosc;

            return { x: x3, y: y3, z: z2 };
        }

        let animationFrameId: number;

        function render() {
            t += 0.02; // Increased from 0.012

            // Reset state every frame to fix accumulation bug
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#000510';
            ctx.fillRect(0, 0, width, height);

            const currentPitch = 0.35 + Math.sin(t * 0.2) * 0.1;
            const currentYaw = t * 0.15; // Increased from 0.1
            const currentRoll = 0;

            const fov = 1000;
            const zOffset = 1500;

            // Calculate dynamic center for movement across the page - Faster drift
            const driftX = Math.sin(t * 0.25) * (width * 0.3); // Increased frequency and range
            const driftY = Math.cos(t * 0.2) * (height * 0.2); // Increased frequency and range
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

            // Render Stars
            for (const star of stars) {
                let sy = star.y - t * sunSpeed;
                sy = sy % 5000;
                if (sy < -2500) sy += 5000;

                const proj = project(star.x, sy, star.z);
                if (proj.s < 0) continue;

                ctx.globalAlpha = star.alpha;
                ctx.fillStyle = `rgb(${star.color})`;
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, Math.max(0.1, star.size * proj.s), 0, Math.PI * 2);
                ctx.fill();
            }

            // Render Trails with additive blending
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
                        const opacity = (1 - progress) * 0.4;

                        ctx.beginPath();
                        ctx.moveTo(prevProj.x, prevProj.y);
                        ctx.lineTo(proj.x, proj.y);
                        ctx.strokeStyle = `rgba(${p.color}, ${opacity})`;
                        ctx.lineWidth = Math.max(0.5, 3 * prevProj.s);
                        ctx.stroke();
                    }
                    prevProj = proj;
                }
            }

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
                    ctx.beginPath();
                    ctx.arc(item.proj.x, item.proj.y, Math.max(0.1, item.ast.size * item.proj.s), 0, Math.PI * 2);
                    ctx.fill();
                } else if (item.type === 'planet') {
                    const { p, proj } = item;
                    ctx.beginPath();
                    ctx.arc(proj.x, proj.y, Math.max(1, p.size * proj.s * 4), 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.color}, 0.5)`;
                    ctx.globalAlpha = 1.0;
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(proj.x, proj.y, Math.max(0.5, p.size * proj.s), 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                } else if (item.type === 'sun') {
                    const { proj } = item;
                    const sunRadius = 70 * proj.s;

                    let sunGlow = ctx.createRadialGradient(
                        proj.x, proj.y, sunRadius,
                        proj.x, proj.y, sunRadius * 6
                    );
                    sunGlow.addColorStop(0, 'rgba(0, 200, 255, 0.4)');
                    sunGlow.addColorStop(1, 'rgba(0, 50, 255, 0)');

                    ctx.beginPath();
                    ctx.arc(proj.x, proj.y, sunRadius * 6, 0, Math.PI * 2);
                    ctx.fillStyle = sunGlow;
                    ctx.fill();

                    let sunGradient = ctx.createRadialGradient(
                        proj.x, proj.y, sunRadius * 0.5,
                        proj.x, proj.y, sunRadius * 2.5
                    );
                    sunGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                    sunGradient.addColorStop(0.4, 'rgba(0, 255, 255, 0.8)');
                    sunGradient.addColorStop(1, 'rgba(0, 100, 255, 0)');

                    ctx.beginPath();
                    ctx.arc(proj.x, proj.y, sunRadius * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = sunGradient;
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(proj.x, proj.y, sunRadius * 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                }
            }

            ctx.globalAlpha = 1.0;
            animationFrameId = requestAnimationFrame(render);
        }

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
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
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-90" />
                {/* Vignette */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,5,16,0.85) 80%, #000 100%)' }} />
            </div>
        </>
    );
}
