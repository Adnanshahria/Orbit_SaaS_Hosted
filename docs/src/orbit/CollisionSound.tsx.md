# `CollisionSound.tsx` Line-by-Line Analysis & Bug Report

## Overview
This file serves as the strict, centralized Audio Manager for the Orbit SaaS project. It specifically handles the `boomDataUrl.ts` base64 audio and plays it using the robust HTML5 Web Audio API (`AudioContext`) rather than the older `<audio>` element approach, bypassing several Mobile Safari/Chrome limitations. It has been recently rewritten to implement an event-driven Audio Queue system perfectly compliant with 2024 web autoplay policies.

## Line-by-Line Breakdown
- **Lines 1-2**: React hooks import and `BOOM_DATA_URL` import containing the raw base64 string.
- **Lines 4-16**: Documentation blocking. Declares 4 core singletons (`_audioCtx`, `_audioBuffer`, `_bufferLoading`, `_unlocked`) and the raw byte array `_rawBytes`. This singleton pattern ensures that even if `useCollisionSound` is mounted 50 times inside 50 different React components, exactly ONE `AudioContext` is ever created, saving massive browser memory.
- **Lines 18-24**: The `getAudioCtx()` factory function. It instantiates `window.AudioContext` with `webkit` fallback for legacy Safari ONLY when requested.
- **Lines 26-36**: The `prepareRawBytes()` function. **CRUCIAL UPDATE:** This strictly strips the `data:audio/mp3;base64,` header from the base64 string and converts it to a raw `Uint8Array` memory buffer *without* touching the Web Audio API. This avoids triggering Chrome's aggressive "AudioContext was not allowed to start" warning on page load.
- **Lines 38-51**: The `decodeBuffer()` function. Actually processes the raw binary audio array into an playable `AudioBuffer`. Safely checks to prevent double-decoding.
- **Lines 53-73**: The `_fireBoom()` internal playback controller. It creates a `BufferSourceNode`, attaches a `GainNode` for volume (default exactly 0.50 but respects `orbit_sound_volume` in `localStorage`), connects to the speakers (`destination`), and calls `start(0)`. Includes multiple `console.log` lines for live debugging.
- **Lines 75-128**: The **Activation Event Queue System** (`_onFirstActivation`, `_ensureActivationListeners`). 
  - **Bug/Issue Identification**: Browsers strictly forbid audio without a real click or tap from the user. Therefore, this code listens to `click`, `touchstart`, `keydown`, etc. on the native `document` root using the exact `{ capture: true }` parameter so the events cannot be blocked by React `e.stopPropagation()` calls. 
  - If a boom is queued in `_pendingBoom` before the user interacts, it will perfectly wait. The exact millisecond the user clicks the document, the queued boom instantly decodes and fires.
- **Lines 132-155**: The `warmUpAudio` and `playBoomDirect` global exports. Used by `CometDiceLoaderCanvas` to bypass React's standard hook lifecycle mapping since the canvas fireball occurs before full DOM tree interactivity.
- **Lines 158-251**: The React Hook wrapper: `useCollisionSound()`.
  - Reads the `orbit_sound_muted` boolean from `localStorage`.
  - Attaches listeners to sync volume preferences across multiple components cleanly.
  - Contains a `Chatbot` checker: If `orbit-chatbot-state-change` fires and reports the chatbot is OPEN -> It instantly blocks `playBoom()` to prevent disruptive sound overlaps. This is intentional logic, not a bug.
- **Lines 253-305**: The `playSound` helper and the `playBoom` exported action. Tracks the visible viewport ratio (`getBoundingClientRect()`) so that collisions happening deep off-screen while the user reads the footer do not aggressively loudly boom in their ears.
- **Lines 307-350**: The `SoundToggle` floating UI button. Automatically remains invisible until the very first collision completes, gracefully preventing ghost UI clutter on fast networking.

## Analysis of "Disabled until 3 collisions / fixed time" Memory:
✅ **This logic does NOT exist in the current codebase.**
After parsing the full `orbit` source code via file searching and line-by-line reading, there is no code enforcing a 3-count limit or a hard fixed-time delay on `playBoom`. 
In previous versions of the file you wrote, there may have been an `if (collisionCountRef.current < 3) return;` block, but the complete rewrite of the Web Audio API Queue system overrode it. 

The *actual* reason you hear no sound randomly for the first 8-10 seconds is entirely documented above: Chrome's Autoplay Policy strictly blocks the audio context. Because the loading screen requires no clicking, the browser queues the sound safely. Since you never click the page, the queued sound never gets permission to play.
