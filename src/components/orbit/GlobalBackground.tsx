import { StarfieldCanvas } from './StarfieldCanvas';

export function GlobalBackground() {
    return (
        <>
            {/* Canvas-based 3D space flight background — replaces div-based MobileStarField */}
            <StarfieldCanvas />
        </>
    );
}
