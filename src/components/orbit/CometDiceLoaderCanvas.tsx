import React, { useEffect, useRef } from 'react';
import { playBoomDirect, warmUpAudio } from './CollisionSound';

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Props {
    orbitRects: (Rect | null)[]; // O, R, B, I, T
    saasRect: Rect | null;       // SaaS
    onRevealLetter: (index: number) => void;
    onRevealSaaS: () => void;
    onComplete: () => void;
}

const COLORS = ['#f59e0b', '#d97706', '#fbbf24', '#b45309', '#fcd34d'];
const TAU = Math.PI * 2;

export function CometDiceLoaderCanvas({ orbitRects, saasRect, onRevealLetter, onRevealSaaS, onComplete }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Use refs so the animation loop always reads the latest values
    // without needing to restart the effect
    const orbitRectsRef = useRef(orbitRects);
    const saasRectRef = useRef(saasRect);
    const onRevealLetterRef = useRef(onRevealLetter);
    const onRevealSaaSRef = useRef(onRevealSaaS);
    const onCompleteRef = useRef(onComplete);

    // Keep refs in sync with props (no effect restart needed)
    orbitRectsRef.current = orbitRects;
    saasRectRef.current = saasRect;
    onRevealLetterRef.current = onRevealLetter;
    onRevealSaaSRef.current = onRevealSaaS;
    onCompleteRef.current = onComplete;

    useEffect(() => {
        // Pre-warm audio so the boom is ready by the time the fireball hits (~8s)
        warmUpAudio();

        const cvs = canvasRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;

        let dpr = window.devicePixelRatio || 1;
        let W = window.innerWidth;
        let H = window.innerHeight;

        const resize = () => {
            dpr = window.devicePixelRatio || 1;
            W = window.innerWidth;
            H = window.innerHeight;
            // Set the canvas buffer size (high-res)
            cvs.width = W * dpr;
            cvs.height = H * dpr;
            // CRITICAL: Set the CSS display size to match the viewport exactly
            cvs.style.width = W + 'px';
            cvs.style.height = H + 'px';
        };
        resize();
        window.addEventListener('resize', resize);

        // Dice state
        let diceX = W / 2;
        let diceY = H * 0.25;
        let diceRotX = 0;
        let diceRotY = 0;
        let diceRotZ = 0;
        let diceScale = 1;
        let diceOpacity = 1;

        // Physics for dislocation
        let diceVx = 0;
        let diceVy = 0;
        let gravity = 0;

        // State machine
        let state = 'SPAWNING_ORBIT';
        let stateTimer = 0.8; // Initial delay before first letter
        let lettersRevealed = 0;
        let lastTime = performance.now();
        let floatTime = 0;
        let rafId = 0;

        // Entities
        const comets: any[] = [];
        const particles: any[] = [];

        // ─── 3D Cube rendering with optional center text ───
        const drawCube = (cx: number, cy: number, size: number, rx: number, ry: number, rz: number, alpha: number, centerText?: string) => {
            if (alpha <= 0) return;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.globalAlpha = alpha;

            const s = size / 2;
            const vertices = [
                [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
                [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]
            ];

            const cosX = Math.cos(rx), sinX = Math.sin(rx);
            const cosY = Math.cos(ry), sinY = Math.sin(ry);
            const cosZ = Math.cos(rz), sinZ = Math.sin(rz);

            const proj = vertices.map(([x, y, z]) => {
                let y1 = y * cosX - z * sinX;
                let z1 = y * sinX + z * cosX;
                let x2 = x * cosY + z1 * sinY;
                let z2 = -x * sinY + z1 * cosY;
                let x3 = x2 * cosZ - y1 * sinZ;
                let y3 = x2 * sinZ + y1 * cosZ;
                const fov = 300;
                const scale = fov / (fov + z2);
                return { x: x3 * scale, y: y3 * scale, z: z2 };
            });

            const faces = [
                [0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7],
                [1, 5, 6, 2], [4, 5, 1, 0], [3, 2, 6, 7]
            ];

            const mappedFaces = faces.map(f => {
                const zAvg = (proj[f[0]].z + proj[f[1]].z + proj[f[2]].z + proj[f[3]].z) / 4;
                return { f, zAvg };
            }).sort((a, b) => b.zAvg - a.zAvg);

            mappedFaces.forEach(({ f, zAvg }) => {
                if (zAvg < -size * 0.8) return;
                ctx.beginPath();
                ctx.moveTo(proj[f[0]].x, proj[f[0]].y);
                for (let i = 1; i < 4; i++) ctx.lineTo(proj[f[i]].x, proj[f[i]].y);
                ctx.closePath();
                ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
                ctx.fill();
                ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2.5;
                // Faster alternative to shadowBlur
                ctx.globalAlpha = alpha * 0.3;
                ctx.stroke();
                ctx.globalAlpha = alpha;
                ctx.stroke();
            });

            if (centerText) {
                ctx.fillStyle = '#ffffff';
                ctx.font = `bold ${size * 0.7}px Poppins`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // Simplify or remove text shadow
                ctx.fillText(centerText, 0, 0);
            }
            ctx.restore();
        };

        const spawnParticles = (x: number, y: number, color: string, count: number, speedMul: number = 1) => {
            for (let i = 0; i < count; i++) {
                const a = Math.random() * TAU;
                const s = (Math.random() * 4 + 2) * speedMul;
                particles.push({
                    x, y,
                    vx: Math.cos(a) * s,
                    vy: Math.sin(a) * s,
                    life: 1,
                    decay: 0.02 + Math.random() * 0.03,
                    color,
                    size: Math.random() * 4 + 2
                });
            }
        };

        const drawComet = (c: any) => {
            ctx.save();
            const dx = c.x - c.lastX;
            const dy = c.y - c.lastY;

            const grad = ctx.createLinearGradient(c.x, c.y, c.x - dx * 5, c.y - dy * 5);
            grad.addColorStop(0, c.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.beginPath();
            ctx.moveTo(c.x, c.y);
            ctx.lineTo(c.x - dx * 5, c.y - dy * 5);
            ctx.strokeStyle = grad;
            ctx.lineWidth = c.size * 2;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Head glow
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.size, 0, TAU);
            ctx.fill();

            // Letter text centered on the comet head
            if (c.text) {
                ctx.fillStyle = '#ffffff';
                ctx.font = `bold ${c.size * 2.5}px Poppins`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(c.text, c.x, c.y);
            }
            ctx.restore();
        };

        // ─── Helper to get target rect from the LATEST ref ───
        const getLetterTarget = (idx: number) => {
            const rects = orbitRectsRef.current;
            const rect = rects[idx];
            if (rect) return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
            // Fallback: center of screen
            return { x: W / 2 + (idx - 2) * 60, y: H * 0.45 };
        };

        const getSaasTarget = () => {
            const rect = saasRectRef.current;
            if (rect) return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
            return { x: W * 0.7, y: H * 0.45 };
        };

        // ─── Main render loop ───
        const render = (time: number) => {
            rafId = requestAnimationFrame(render);
            const dt = Math.min((time - lastTime) / 1000, 0.1);
            lastTime = time;

            ctx.clearRect(0, 0, cvs.width, cvs.height);
            ctx.save();
            ctx.scale(dpr, dpr);

            const currentLetter = lettersRevealed < 5 ? ['O', 'R', 'B', 'I', 'T'][lettersRevealed] : '';

            // ─── STATE: SPAWNING_ORBIT ───
            if (state === 'SPAWNING_ORBIT') {
                floatTime += dt;
                // Dice floats in a gentle Lissajous pattern in the upper area
                diceX = W / 2 + Math.sin(floatTime * 1.8) * (W * 0.2);
                diceY = H * 0.2 + Math.cos(floatTime * 2.3) * (H * 0.08);

                diceRotX += dt * 3;
                diceRotY += dt * 4;
                stateTimer -= dt;

                if (stateTimer <= 0 && lettersRevealed < 5) {
                    const target = getLetterTarget(lettersRevealed);

                    comets.push({
                        type: 'letter',
                        idx: lettersRevealed,
                        text: currentLetter,
                        x: diceX, y: diceY,
                        lastX: diceX, lastY: diceY,
                        targetX: target.x, targetY: target.y,
                        speed: 600,
                        color: COLORS[lettersRevealed % COLORS.length],
                        size: 7
                    });

                    lettersRevealed++;
                    stateTimer = 1.2; // ~6s for all 5 letters
                } else if (lettersRevealed >= 5 && comets.length === 0) {
                    state = 'AWAITING_COLLISION';
                    stateTimer = 0.8;
                }
            }
            // ─── STATE: AWAITING_COLLISION ───
            else if (state === 'AWAITING_COLLISION') {
                floatTime += dt;
                diceX = W / 2 + Math.sin(floatTime * 1.8) * (W * 0.2);
                diceY = H * 0.2 + Math.cos(floatTime * 2.3) * (H * 0.08);

                diceRotX += dt * 3;
                diceRotY += dt * 4;
                stateTimer -= dt;

                if (stateTimer <= 0) {
                    comets.push({
                        type: 'strike',
                        text: null,
                        x: -200, y: H * 0.15,
                        lastX: -200, lastY: H * 0.15,
                        targetX: diceX, targetY: diceY,
                        speed: 2000,
                        color: '#ef4444',
                        size: 15
                    });
                    state = 'COLLIDING';
                }
            }
            // ─── STATE: COLLIDING ───
            else if (state === 'COLLIDING') {
                diceRotX += dt * 3;
                diceRotY += dt * 4;
            }
            // ─── STATE: DISLOCATING ───
            else if (state === 'DISLOCATING') {
                const saasTarget = getSaasTarget();

                diceVy += gravity * dt;
                diceVx *= 0.98;
                diceX += diceVx * dt;
                diceY += diceVy * dt;

                diceRotX += diceVx * dt * 0.01;
                diceRotY += diceVy * dt * 0.01;

                const dist = Math.hypot(diceX - saasTarget.x, diceY - saasTarget.y);

                // Homing force
                const f = 15;
                diceVx += (saasTarget.x - diceX) * f * dt;
                diceVy += (saasTarget.y - diceY) * f * dt;
                diceVx *= 0.92;
                diceVy *= 0.92;

                // Trail particles
                if (Math.random() > 0.5) {
                    particles.push({
                        x: diceX + (Math.random() - 0.5) * 20,
                        y: diceY + (Math.random() - 0.5) * 20,
                        vx: -diceVx * 0.1, vy: -diceVy * 0.1,
                        life: 1, decay: 0.05, color: '#f59e0b', size: 3
                    });
                }

                if (dist < 40) {
                    state = 'BURSTING';
                    stateTimer = 0.4;
                    onRevealSaaSRef.current();
                    spawnParticles(diceX, diceY, '#f59e0b', 50, 3);
                    spawnParticles(diceX, diceY, '#fbbf24', 50, 4);
                }
            }
            // ─── STATE: BURSTING ───
            else if (state === 'BURSTING') {
                diceScale += dt * 10;
                diceOpacity -= dt * 3;
                if (diceOpacity <= 0) {
                    state = 'DONE';
                    stateTimer = 0.5;
                }
            }
            // ─── STATE: DONE ───
            else if (state === 'DONE') {
                stateTimer -= dt;
                if (stateTimer <= 0) {
                    onCompleteRef.current();
                    cancelAnimationFrame(rafId);
                }
            }

            // ─── RENDER COMETS ───
            for (let i = comets.length - 1; i >= 0; i--) {
                const c = comets[i];
                c.lastX = c.x; c.lastY = c.y;

                // For letter comets, continuously update target from latest DOM rects
                if (c.type === 'letter') {
                    const target = getLetterTarget(c.idx);
                    c.targetX = target.x;
                    c.targetY = target.y;
                }

                const dx = c.targetX - c.x;
                const dy = c.targetY - c.y;
                const dist = Math.hypot(dx, dy);

                if (dist < c.speed * dt) {
                    c.x = c.targetX;
                    c.y = c.targetY;

                    if (c.type === 'letter') {
                        onRevealLetterRef.current(c.idx);
                        spawnParticles(c.x, c.y, c.color, 30);
                        // Play a subtler 20% volume sound for each letter reveal
                        playBoomDirect(0.2);
                    } else if (c.type === 'strike') {
                        spawnParticles(c.x, c.y, '#ef4444', 40, 3);
                        spawnParticles(c.x, c.y, '#f97316', 40, 2);
                        state = 'DISLOCATING';

                        // Play the boom sound on fireball impact
                        playBoomDirect();

                        const saasTarget = getSaasTarget();
                        diceVx = (saasTarget.x - diceX) * 2.5;
                        diceVy = -800;
                        gravity = 2500;
                    }
                    comets.splice(i, 1);
                } else {
                    c.x += (dx / dist) * c.speed * dt;
                    c.y += (dy / dist) * c.speed * dt;
                    drawComet(c);
                }
            }

            // ─── RENDER PARTICLES ───
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;

                if (p.life <= 0) {
                    particles.splice(i, 1);
                } else {
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * p.life, 0, TAU);
                    ctx.fill();
                }
            }

            // ─── RENDER MAIN DICE ───
            if (diceOpacity > 0 && state !== 'DONE') {
                const rawSize = W < 768 ? 50 : 70;
                drawCube(diceX, diceY, rawSize * diceScale, diceRotX, diceRotY, diceRotZ, diceOpacity, currentLetter);
            }

            ctx.restore();
        };

        rafId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resize);
        };
        // IMPORTANT: empty deps — effect runs once, reads latest props via refs
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-50 pointer-events-none"
        />
    );
}
