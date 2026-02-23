import React, { useMemo } from 'react';

interface ElectricLoaderProps {
    size?: number;
    className?: string;
}

// Generate a jagged bolt path from center outward at a given angle
function generateBolt(angle: number, length: number, segments: number = 3): string {
    const cx = 50, cy = 50;
    const rad = (angle * Math.PI) / 180;
    const segLen = length / segments;
    let path = `M ${cx} ${cy}`;
    for (let i = 1; i <= segments; i++) {
        // Add jitter perpendicular to the direction
        const jitter = (Math.random() - 0.5) * 12;
        const along = segLen * i;
        const px = cx + Math.cos(rad) * along + Math.cos(rad + Math.PI / 2) * jitter;
        const py = cy + Math.sin(rad) * along + Math.sin(rad + Math.PI / 2) * jitter;
        path += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    return path;
}

export const ElectricLoader: React.FC<ElectricLoaderProps> = ({ size = 100, className = '' }) => {
    // Generate 16 bolts evenly spread around 360° with slight randomness
    const bolts = useMemo(() => {
        const count = 16;
        return Array.from({ length: count }, (_, i) => {
            const baseAngle = (360 / count) * i;
            const angle = baseAngle + (Math.random() - 0.5) * 15; // ±7.5° jitter
            const length = 18 + Math.random() * 10; // shorter: 18-28 units
            return generateBolt(angle, length, 3);
        });
    }, []);

    // Generate 10 small sparks at random angles
    const sparks = useMemo(() => {
        return Array.from({ length: 10 }, () => {
            const angle = Math.random() * 360;
            const length = 12 + Math.random() * 8; // very short
            return generateBolt(angle, length, 2);
        });
    }, []);

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size, willChange: 'transform' }}
        >
            <svg
                viewBox="0 0 100 100"
                className="electric-loader-svg w-full h-full overflow-visible"
            >
                <g className="electric-loader-group">
                    {/* Main Bolts — 360° distribution */}
                    {bolts.map((d, i) => (
                        <path
                            key={i}
                            d={d}
                            fill="none"
                            stroke="#FFD700"
                            strokeWidth="0.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="electric-bolt"
                            style={{ animationDelay: `${i * 0.03}s` }}
                        />
                    ))}

                    {/* Smaller Sparks — random 360° */}
                    {sparks.map((d, i) => (
                        <path
                            key={`spark-${i}`}
                            d={d}
                            fill="none"
                            stroke="#FFD700"
                            strokeWidth="0.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="electric-spark"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        />
                    ))}

                    {/* Core flash */}
                    <circle cx="50" cy="50" r="3" fill="#FFFFFF" className="electric-flash" />
                </g>
            </svg>
        </div>
    );
};

export default ElectricLoader;
