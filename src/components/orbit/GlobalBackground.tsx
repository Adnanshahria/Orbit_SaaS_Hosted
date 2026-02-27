import { SolarSystemAnimation } from './SolarSystemAnimation';

export function GlobalBackground() {
    return (
        <div className="fixed inset-0 w-full h-[100dvh] -z-50 overflow-hidden pointer-events-none select-none bg-black opacity-50">
            <SolarSystemAnimation />
        </div>
    );
}
