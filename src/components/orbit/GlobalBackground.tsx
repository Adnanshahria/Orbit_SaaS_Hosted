import { SolarSystemAnimation } from './SolarSystemAnimation';
import { MobileStarField } from './MobileStarField';

function isMobileOrLowPerf(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        window.innerWidth < 768 ||
        document.documentElement.classList.contains('low-perf')
    );
}

export function GlobalBackground() {
    const isDesktop = !isMobileOrLowPerf();

    return (
        <>
            {/* The new immersive 3D space flight & galaxy background is active for everyone */}
            <MobileStarField />

            {/* Desktop only: keep the original solar system at low opacity to maintain cosmic elements theme */}
            {isDesktop && (
                <div className="fixed inset-0 w-full h-[100dvh] -z-40 overflow-hidden pointer-events-none select-none bg-black/10 opacity-20 mix-blend-screen">
                    <SolarSystemAnimation />
                </div>
            )}
        </>
    );
}
