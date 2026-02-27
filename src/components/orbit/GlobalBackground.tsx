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
    const useLightMode = isMobileOrLowPerf();

    return (
        <>
            {useLightMode ? (
                // Mobile / low-perf: CSS-only star field (zero CPU during scroll)
                <MobileStarField />
            ) : (
                // Desktop: full canvas solar system animation
                <div className="fixed inset-0 w-full h-[100dvh] -z-50 overflow-hidden pointer-events-none select-none bg-black opacity-50">
                    <SolarSystemAnimation />
                </div>
            )}
        </>
    );
}
