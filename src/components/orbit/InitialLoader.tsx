import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function InitialLoader() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if the user has already seen the loader in this session
        const hasVisited = sessionStorage.getItem('orbit_has_visited');

        if (hasVisited) {
            setLoading(false);
            return;
        }

        // Set the flag and start the 3.5s timer
        sessionStorage.setItem('orbit_has_visited', 'true');
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden"
                >
                    {/* Subtle background glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,92,231,0.15),transparent_50%)]" />

                    {/* 3D Dice Loader */}
                    <div className="dice-loader-wrapper relative w-24 h-24 sm:w-32 sm:h-32 perspective-[1000px]">
                        <div className="dice-cube w-full h-full absolute transform-style-3d animate-spin-cube">
                            {/* Front */}
                            <div className="cube-face front bg-primary text-primary-foreground flex items-center justify-center font-black text-2xl sm:text-4xl border-2 border-primary-foreground/20 rounded-xl">O</div>
                            {/* Back */}
                            <div className="cube-face back bg-primary text-primary-foreground flex items-center justify-center font-black text-2xl sm:text-4xl border-2 border-primary-foreground/20 rounded-xl">R</div>
                            {/* Right */}
                            <div className="cube-face right bg-foreground text-background flex items-center justify-center font-black text-2xl sm:text-4xl border-2 border-background/20 rounded-xl">B</div>
                            {/* Left */}
                            <div className="cube-face left bg-foreground text-background flex items-center justify-center font-black text-2xl sm:text-4xl border-2 border-background/20 rounded-xl">I</div>
                            {/* Top */}
                            <div className="cube-face top bg-secondary text-foreground flex items-center justify-center font-black text-2xl sm:text-4xl border-2 border-foreground/10 rounded-xl">T</div>
                            {/* Bottom */}
                            <div className="cube-face bottom bg-secondary text-foreground flex items-center justify-center font-black text-2xl sm:text-4xl border-2 border-foreground/10 rounded-xl">⚡</div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="mt-16 sm:mt-24 text-center z-10"
                    >
                        <h1 className="font-display font-black text-3xl sm:text-4xl bg-gradient-to-r from-primary to-neon-cyan bg-clip-text text-transparent mb-3">
                            Orbit SaaS
                        </h1>
                        <p className="text-muted-foreground font-medium tracking-widest uppercase text-xs sm:text-sm animate-pulse">
                            Initializing Experience
                        </p>
                    </motion.div>

                    <style>{`
            .perspective-[1000px] { perspective: 1000px; }
            .transform-style-3d { transform-style: preserve-3d; }
            
            .cube-face {
              position: absolute;
              width: 100%;
              height: 100%;
              backface-visibility: hidden;
              box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
            }

            .front  { transform: rotateY(  0deg) translateZ(calc(3rem)); }
            .back   { transform: rotateY(180deg) translateZ(calc(3rem)); }
            .right  { transform: rotateY( 90deg) translateZ(calc(3rem)); }
            .left   { transform: rotateY(-90deg) translateZ(calc(3rem)); }
            .top    { transform: rotateX( 90deg) translateZ(calc(3rem)); }
            .bottom { transform: rotateX(-90deg) translateZ(calc(3rem)); }

            @media (min-width: 640px) {
              .front  { transform: rotateY(  0deg) translateZ(calc(4rem)); }
              .back   { transform: rotateY(180deg) translateZ(calc(4rem)); }
              .right  { transform: rotateY( 90deg) translateZ(calc(4rem)); }
              .left   { transform: rotateY(-90deg) translateZ(calc(4rem)); }
              .top    { transform: rotateX( 90deg) translateZ(calc(4rem)); }
              .bottom { transform: rotateX(-90deg) translateZ(calc(4rem)); }
            }

            @keyframes spin-cube {
              0%   { transform: rotateX(0deg) rotateY(0deg); }
              25%  { transform: rotateX(180deg) rotateY(90deg); }
              50%  { transform: rotateX(360deg) rotateY(180deg); }
              75%  { transform: rotateX(540deg) rotateY(270deg); }
              100% { transform: rotateX(720deg) rotateY(360deg); }
            }
            .animate-spin-cube {
              animation: spin-cube 3.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
            }
          `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
