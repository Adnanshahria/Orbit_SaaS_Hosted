import { useRef, useEffect, useCallback, useState } from 'react';
import { BOOM_DATA_URL } from './boomDataUrl';

/**
 * useCollisionSound — "dhurum" impact sound via Web Audio API.
 *
 * Returns `playBoom()` function. Sound respects user's mute preference
 * stored in localStorage ('orbit_sound_muted').
 * Sound only plays while the hero section is visible.
 *
 * IMPORTANT: AudioContext is NOT created until the first real user gesture
 * (click/touch/keydown). This avoids Chrome's "AudioContext was not allowed
 * to start" console warnings entirely.
 */

// ── Shared singleton so multiple hook instances reuse one context ──
let _audioCtx: AudioContext | null = null;
let _audioBuffer: AudioBuffer | null = null;
let _bufferLoading = false;
let _unlocked = false;

// Pre-processed raw bytes from the base64 data-URL (no AudioContext needed)
let _rawBytes: ArrayBuffer | null = null;

export function getAudioCtx(): AudioContext {
    if (!_audioCtx) {
        _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return _audioCtx;
}

/**
 * Pre-process the base64 data-URL into a raw ArrayBuffer.
 * This does NOT require an AudioContext, so it's safe to call on mount.
 */
function prepareRawBytes(): ArrayBuffer {
    if (_rawBytes) return _rawBytes;
    const base64 = BOOM_DATA_URL.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    _rawBytes = bytes.buffer;
    return _rawBytes;
}

/** Decode raw bytes into an AudioBuffer. Requires AudioContext to exist. */
async function decodeBuffer(): Promise<AudioBuffer | null> {
    if (_audioBuffer) return _audioBuffer;
    if (_bufferLoading) return null;
    if (!_audioCtx) return null;
    _bufferLoading = true;
    try {
        const raw = prepareRawBytes();
        // decodeAudioData detaches the buffer, so we need a copy
        const copy = raw.slice(0);
        _audioBuffer = await _audioCtx.decodeAudioData(copy);
    } catch {
        _bufferLoading = false;
    }
    return _audioBuffer;
}

// ── Queued audio for dice-loader fireball ──────────────────────────
//
// Chrome blocks ALL audio without a real user activation gesture.
// Only click, touchstart, touchend, mousedown, pointerup, keydown count.
//
// Strategy:
//  1. warmUpAudio() — pre-processes the base64 data (no AudioContext needed).
//  2. playBoomDirect() — plays immediately if unlocked, else QUEUES it
//     so it fires on the very first real gesture.

const ACTIVATION_EVENTS = ['click', 'touchstart', 'touchend', 'mousedown', 'pointerup', 'keydown'] as const;
let _pendingBoom = false;
let _activationListenerAdded = false;

/** Play the boom using the shared AudioContext singletons. */
function _fireBoom(volMul: number = 1) {
    console.log('[orbit-audio] _fireBoom called. Buffer:', !!_audioBuffer, 'Ctx:', !!_audioCtx, 'Mul:', volMul);
    try {
        if (!_audioBuffer || !_audioCtx) {
            console.warn('[orbit-audio] Cannot fire: context or buffer missing.');
            return;
        }
        const ctx = _audioCtx;
        const savedVol = localStorage.getItem('orbit_sound_volume');
        // Universal 35% Ceiling: 100% in admin = 0.35 absolute volume
        const userVol = savedVol !== null ? Number(savedVol) / 100 : 1.0;
        const base = userVol * 0.35;
        const finalVol = Math.max(0, Math.min(1, base * (0.85 + Math.random() * 0.3) * volMul));
        console.log(`[orbit-audio] Firing sound. Base: 0.35, User Setting: ${userVol.toFixed(2)}, Mul: ${volMul}, Absolute Vol: ${finalVol.toFixed(4)}`);
        const source = ctx.createBufferSource();
        source.buffer = _audioBuffer;
        const gain = ctx.createGain();
        gain.gain.value = finalVol;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
        console.log('[orbit-audio] Boom played successfully!');
    } catch (e) {
        console.error('[orbit-audio] Error during playback:', e);
    }
}

/** Real activation handler — creates AudioContext, decodes buffer, flushes queue. */
function _onFirstActivation(e: Event) {
    console.log(`[orbit-audio] First activation triggered by: ${e.type}`);
    // Create AudioContext inside a real gesture — no warnings!
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
        console.log('[orbit-audio] Resuming context...');
        ctx.resume().catch(err => console.error('[orbit-audio] Resume failed:', err));
    } else {
        console.log('[orbit-audio] Context already running.');
    }
    _unlocked = true;

    // Decode buffer if not done yet, then flush pending boom
    if (!_audioBuffer) {
        console.log('[orbit-audio] Decoding buffer on first activation...');
        decodeBuffer().then(() => {
            console.log('[orbit-audio] Decode complete. Pending boom?', _pendingBoom);
            if (_pendingBoom) {
                _pendingBoom = false;
                _fireBoom();
            }
        });
    } else if (_pendingBoom) {
        console.log('[orbit-audio] Buffer ready, flushing pending boom immediately.');
        _pendingBoom = false;
        _fireBoom();
    } else {
        console.log('[orbit-audio] Activation logic ran, but no boom pending.');
    }
    ACTIVATION_EVENTS.forEach(ev => document.removeEventListener(ev, _onFirstActivation, { capture: true }));
}

function _ensureActivationListeners() {
    if (_activationListenerAdded) return;
    console.log('[orbit-audio] Registering activation listeners on document (capture phase).');
    _activationListenerAdded = true;
    if (_audioCtx && _audioCtx.state === 'running') {
        console.log('[orbit-audio] Context already running, not registering listeners.');
        _unlocked = true;
        return;
    }
    // Bind to document in CAPTURE phase so we catch the event before any
    // React component can call e.stopPropagation()
    ACTIVATION_EVENTS.forEach(e =>
        document.addEventListener(e, _onFirstActivation, { once: true, capture: true, passive: true })
    );
}

/** Call on canvas mount to pre-process the audio data (no AudioContext created). */
export function warmUpAudio() {
    console.log('[orbit-audio] warmUpAudio: preparing raw bytes.');
    prepareRawBytes();
    _ensureActivationListeners();
}

/** Play boom immediately if unlocked, else queue for first real gesture. */
export function playBoomDirect(volMul: number = 1) {
    console.log('[orbit-audio] playBoomDirect requested. Mul:', volMul);
    if (localStorage.getItem('orbit_sound_muted') === 'true') {
        console.log('[orbit-audio] Skipped: explicitly muted in localStorage.');
        return;
    }

    // Already unlocked — play right now
    if (_unlocked && _audioCtx) {
        console.log('[orbit-audio] Already unlocked. Triggering play...');
        if (_audioBuffer) {
            _fireBoom(volMul);
        } else {
            console.log('[orbit-audio] Waiting for decode...');
            decodeBuffer().then(() => _fireBoom(volMul));
        }
        return;
    }

    // Audio still locked — queue the boom for the first real gesture
    console.log('[orbit-audio] Context locked. QUEUING boom for first gesture.');
    _pendingBoom = true;
    _ensureActivationListeners();
}


export function useCollisionSound() {
    const mutedRef = useRef(false);
    const volumeRef = useRef(0.15);
    const chatbotOpenRef = useRef(false);

    // Load mute preference & pre-process audio on mount
    useEffect(() => {
        mutedRef.current = localStorage.getItem('orbit_sound_muted') === 'true';

        const savedVol = localStorage.getItem('orbit_sound_volume');
        const vol = savedVol !== null ? Number(savedVol) / 100 : 0.35;
        volumeRef.current = vol > 0 ? vol : 0.35;

        // Pre-process raw bytes (no AudioContext needed — no warnings)
        prepareRawBytes();

        // Create AudioContext + decode buffer on first real user gesture
        const unlock = () => {
            if (_unlocked) return;
            const ctx = getAudioCtx();
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => { });
            }
            _unlocked = true;
            // Decode buffer now that we have a context
            if (!_audioBuffer) decodeBuffer();
            ACTIVATION_EVENTS.forEach(evt => document.removeEventListener(evt, unlock, { capture: true }));
        };
        // If context already exists and is running, mark unlocked
        if (_audioCtx && _audioCtx.state === 'running') _unlocked = true;

        ACTIVATION_EVENTS.forEach(evt =>
            document.addEventListener(evt, unlock, { once: true, capture: true, passive: true })
        );

        return () => {
            ACTIVATION_EVENTS.forEach(evt => document.removeEventListener(evt, unlock, { capture: true }));
        };
    }, []);

    // Listen for mute toggle events from other components
    useEffect(() => {
        const handler = () => {
            mutedRef.current = localStorage.getItem('orbit_sound_muted') === 'true';
            const savedVol = localStorage.getItem('orbit_sound_volume');
            if (savedVol !== null) volumeRef.current = Number(savedVol) / 100;
        };
        window.addEventListener('orbit-sound-toggle', handler);
        return () => window.removeEventListener('orbit-sound-toggle', handler);
    }, []);

    // Suppress collision sounds when the chatbot overlay is open
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent<{ isOpen: boolean }>).detail;
            if (detail) chatbotOpenRef.current = detail.isOpen;
        };
        window.addEventListener('orbit-chatbot-state-change', handler);
        return () => window.removeEventListener('orbit-chatbot-state-change', handler);
    }, []);

    const collisionCountRef = useRef(0);

    const playSound = useCallback(() => {
        try {
            if (!_audioBuffer || !_audioCtx) return;
            const ctx = _audioCtx;

            // Re-read volume from localStorage for real-time admin updates
            const savedVol = localStorage.getItem('orbit_sound_volume');
            // Universal 35% Ceiling
            const userVol = savedVol !== null ? Number(savedVol) / 100 : 1.0;
            const base = userVol * 0.35;
            const finalVol = Math.max(0, Math.min(1, base * (0.85 + Math.random() * 0.3)));
            console.log(`[orbit-audio] playSound. Base: 0.35, User Setting: ${userVol.toFixed(2)}, Absolute Vol: ${finalVol.toFixed(4)}`);

            // Create a fresh source node (they are one-shot, this is by design)
            const source = ctx.createBufferSource();
            source.buffer = _audioBuffer;

            // Apply volume via GainNode
            const gain = ctx.createGain();
            gain.gain.value = finalVol;
            source.connect(gain);
            gain.connect(ctx.destination);

            source.start(0);
        } catch {
            // Silently fail
        }
    }, []);

    const playBoom = useCallback(() => {
        // Track collision count and notify SoundToggle (always, even when muted)
        collisionCountRef.current++;
        window.dispatchEvent(new CustomEvent('orbit-collision', { detail: collisionCountRef.current }));

        if (mutedRef.current) return;

        // Suppress sounds while chatbot is open
        if (chatbotOpenRef.current) return;

        // Relaxed visibility check: only skip if hero is almost entirely scrolled away
        const hero = document.getElementById('hero');
        if (hero) {
            const rect = hero.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, -rect.top / (rect.height || 1)));
            if (ratio >= 0.95) return;
        }

        // If buffer isn't loaded yet, load it and play once ready
        if (!_audioBuffer) {
            decodeBuffer().then(() => {
                if (_audioBuffer && _audioCtx && _audioCtx.state === 'running') {
                    playSound();
                }
            });
            return;
        }

        const ctx = getAudioCtx();
        // If context is suspended, resume and play after it's running
        if (ctx.state === 'suspended') {
            ctx.resume().then(() => {
                playSound();
            }).catch(() => { });
            return;
        }

        playSound();
    }, [playSound]);

    return { playBoom };
}

/**
 * SoundToggle — small floating mute/unmute button.
 * Shows a speaker icon on mobile (bottom-left corner).
 */
export function SoundToggle() {
    const [muted, setMuted] = useState(
        () => localStorage.getItem('orbit_sound_muted') === 'true'
    );
    const [visible, setVisible] = useState(false);

    // Show from the very first collision
    useEffect(() => {
        const handler = (e: Event) => {
            const count = (e as CustomEvent).detail;
            if (count >= 1 && !visible) {
                setVisible(true);
            }
        };
        window.addEventListener('orbit-collision', handler);
        return () => window.removeEventListener('orbit-collision', handler);
    }, [visible]);

    const toggle = () => {
        const next = !muted;
        setMuted(next);
        localStorage.setItem('orbit_sound_muted', String(next));
        window.dispatchEvent(new Event('orbit-sound-toggle'));
    };

    return (
        <button
            onClick={toggle}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            className="fixed bottom-[10dvh] left-4 z-[100] md:bottom-6 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-500 cursor-pointer sm:hidden"
            title={muted ? 'Sound OFF' : 'Sound ON'}
            style={{
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? 'auto' : 'none',
                transform: visible ? 'scale(1)' : 'scale(0.5)',
                transition: 'opacity 0.5s ease, transform 0.4s ease',
            }}
        >
            {muted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <line x1="23" x2="17" y1="9" y2="15" />
                    <line x1="17" x2="23" y1="9" y2="15" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
            )}
        </button>
    );
}
