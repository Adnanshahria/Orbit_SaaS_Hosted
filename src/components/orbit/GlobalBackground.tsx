import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import solarSystemData from '@/assets/solar-system.json';
import { useRef } from 'react';

export function GlobalBackground() {
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    return (
        <div className="fixed inset-0 w-full h-[100dvh] -z-50 overflow-hidden pointer-events-none select-none flex items-center justify-center bg-black">
            <div className="opacity-40 transition-opacity duration-700" style={{ width: 'max(150%, 150vh)', maxWidth: 'none' }}>
                <Lottie
                    lottieRef={lottieRef}
                    animationData={solarSystemData}
                    loop={true}
                    style={{ width: '100%', height: '100%' }}
                    onDOMLoaded={() => lottieRef.current?.setSpeed(0.4)}
                />
            </div>
        </div>
    );
}
