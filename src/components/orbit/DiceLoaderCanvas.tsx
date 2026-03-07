import { useEffect, useRef } from 'react';

/**
 * DiceLoaderCanvas — 3D tumbling dice that reveals O-R-B-I-T-S.
 * Pure canvas rendering with perspective projection.
 */

type V3 = [number, number, number];
const PI = Math.PI;

// 3D rotation helpers
const rotY = (v: V3, a: number): V3 => {
    const c = Math.cos(a), s = Math.sin(a);
    return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
};
const rotX = (v: V3, a: number): V3 => {
    const c = Math.cos(a), s = Math.sin(a);
    return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
};
const easeInOut = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Cube face data: vertex indices + letter + accent color
const FACE_DATA: { vi: number[]; letter: string; accent: string }[] = [
    { vi: [4, 5, 6, 7], letter: 'O', accent: '#f59e0b' },  // front +Z
    { vi: [5, 1, 2, 6], letter: 'R', accent: '#d97706' },  // right +X
    { vi: [1, 0, 3, 2], letter: 'B', accent: '#fcd34d' },  // back -Z
    { vi: [0, 4, 7, 3], letter: 'I', accent: '#b45309' },  // left -X
    { vi: [7, 6, 2, 3], letter: 'T', accent: '#fbbf24' },  // top +Y
    { vi: [0, 1, 5, 4], letter: 'S', accent: '#f59e0b' },  // bottom -Y
];

// Target rotations to show each face (with extra tumble spins)
// Face normals after rotY then rotX must point toward viewer (+Z)
const TARGETS: { ry: number; rx: number; at: number }[] = [
    { ry: 0, rx: 0, at: 500 },                                // O: front
    { ry: -(PI * 2 + PI / 2), rx: 0, at: 1000 },              // R: right
    { ry: -(PI * 2 + PI), rx: PI * 2, at: 1500 },             // B: back
    { ry: -(PI * 2 + PI * 1.5), rx: PI * 2, at: 2100 },       // I: left
    { ry: -(PI * 2 + PI * 1.5), rx: PI * 2 + PI / 2, at: 2700 }, // T: top
    { ry: -(PI * 4 + PI * 1.5), rx: PI * 2 + PI * 1.5, at: 3300 }, // S: bottom
];

interface Props {
    onStep?: (index: number) => void;
    canvasSize?: number;
}

export function DiceLoaderCanvas({ onStep, canvasSize = 240 }: Props) {
    const ref = useRef<HTMLCanvasElement>(null);
    const cbRef = useRef(onStep);
    cbRef.current = onStep;

    useEffect(() => {
        const cvs = ref.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        cvs.width = canvasSize * dpr;
        cvs.height = canvasSize * dpr;

        // Cube half-size, perspective
        const S = canvasSize * 0.18;
        const FOV = canvasSize * 1.2;
        const CAM_Z = canvasSize * 0.9;
        const CX = canvasSize / 2, CY = canvasSize / 2;

        // Vertices
        const verts: V3[] = [
            [-S, -S, -S], [S, -S, -S], [S, S, -S], [-S, S, -S],
            [-S, -S, S], [S, -S, S], [S, S, S], [-S, S, S],
        ];

        const project = (v: V3): [number, number] => {
            const z = v[2] + CAM_Z;
            const sc = FOV / z;
            return [v[0] * sc + CX, -v[1] * sc + CY];
        };

        let start = 0;
        let lastFired = -1;
        let raf = 0;

        const render = (ts: number) => {
            if (!start) start = ts;
            const elapsed = ts - start;

            // Find current/prev targets & interpolate
            let ry = 0, rx = 0;
            let settling = false;

            // Pre-spin: fast initial spin before first letter
            if (elapsed < TARGETS[0].at) {
                const t = easeInOut(elapsed / TARGETS[0].at);
                ry = lerp(PI * 3, TARGETS[0].ry, t);
                rx = lerp(-PI * 2, TARGETS[0].rx, t);
            } else {
                // Find segment
                let found = false;
                for (let i = 1; i < TARGETS.length; i++) {
                    if (elapsed < TARGETS[i].at) {
                        const prev = TARGETS[i - 1];
                        const cur = TARGETS[i];
                        const raw = (elapsed - prev.at) / (cur.at - prev.at);
                        const t = easeInOut(Math.min(1, raw));
                        ry = lerp(prev.ry, cur.ry, t);
                        rx = lerp(prev.rx, cur.rx, t);
                        settling = raw > 0.85;
                        if (settling && lastFired < i - 1) {
                            lastFired = i - 1;
                            cbRef.current?.(i - 1);
                        }
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    const last = TARGETS[TARGETS.length - 1];
                    ry = last.ry;
                    rx = last.rx;
                    if (lastFired < TARGETS.length - 1) {
                        lastFired = TARGETS.length - 1;
                        cbRef.current?.(TARGETS.length - 1);
                    }
                }
            }

            // Transform
            const tv = verts.map(v => rotX(rotY(v, ry), rx));

            // Sort faces by avg Z
            const sorted = FACE_DATA.map((f, fi) => {
                const avgZ = f.vi.reduce((s, i) => s + tv[i][2], 0) / 4;
                return { ...f, avgZ, fi };
            }).sort((a, b) => a.avgZ - b.avgZ);

            // Draw
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, canvasSize, canvasSize);

            // Ambient glow behind cube
            const grd = ctx.createRadialGradient(CX, CY, 0, CX, CY, S * 2.5);
            grd.addColorStop(0, 'rgba(245,158,11,0.12)');
            grd.addColorStop(0.5, 'rgba(217,119,6,0.06)');
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            for (const face of sorted) {
                const pts = face.vi.map(i => project(tv[i]));
                const brightness = 0.25 + 0.75 * Math.max(0, (face.avgZ + S) / (2 * S));

                // Face fill
                ctx.beginPath();
                ctx.moveTo(pts[0][0], pts[0][1]);
                for (let i = 1; i < 4; i++) ctx.lineTo(pts[i][0], pts[i][1]);
                ctx.closePath();

                ctx.globalAlpha = 0.7 + 0.3 * brightness;
                ctx.fillStyle = `rgba(8, 15, 12, ${0.85 + 0.15 * brightness})`;
                ctx.fill();

                // Edge glow
                ctx.strokeStyle = face.accent;
                ctx.globalAlpha = 0.3 + 0.7 * brightness;
                ctx.lineWidth = 1.5 + brightness;
                ctx.shadowColor = face.accent;
                ctx.shadowBlur = 8 * brightness;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Letter (only on visible faces)
                if (brightness > 0.35) {
                    const cx = pts.reduce((s, p) => s + p[0], 0) / 4;
                    const cy = pts.reduce((s, p) => s + p[1], 0) / 4;
                    const dx = pts[1][0] - pts[0][0], dy = pts[1][1] - pts[0][1];
                    const faceW = Math.sqrt(dx * dx + dy * dy);
                    const fs = Math.max(10, faceW * 0.55);

                    ctx.globalAlpha = brightness * brightness;
                    ctx.font = `800 ${fs}px Poppins, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // Letter shadow/glow
                    ctx.shadowColor = face.accent;
                    ctx.shadowBlur = 10;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(face.letter, cx, cy);
                    ctx.shadowBlur = 0;
                }
                ctx.globalAlpha = 1;
            }

            // Subtle rotating halo ring
            const haloAngle = elapsed * 0.001;
            ctx.save();
            ctx.translate(CX, CY);
            ctx.rotate(haloAngle);
            ctx.strokeStyle = 'rgba(245,158,11,0.08)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(0, 0, S * 2.2, S * 1.8, 0, 0, PI * 2);
            ctx.stroke();
            ctx.restore();

            raf = requestAnimationFrame(render);
        };

        raf = requestAnimationFrame(render);
        return () => cancelAnimationFrame(raf);
    }, [canvasSize]);

    return (
        <canvas
            ref={ref}
            style={{ width: canvasSize, height: canvasSize }}
            aria-hidden
        />
    );
}
