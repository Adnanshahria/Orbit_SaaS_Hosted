# `StarfieldCanvas.tsx` Line-by-Line Analysis & Bug Report

## Overview
This file replaces the legacy DOM-based background with a highly performant HTML5 `<canvas>` element. It handles rendering stars, nebulae, shooting stars, icon comets, and collision bursts.

## Line-by-Line Breakdown
- **Lines 1-13**: Imports and file documentation. Explains the purpose of the canvas replacement to save CPU/GPU.
- **Lines 15-57**: Global constants (device detection, star counts, math constants) and TypeScript interfaces for all rendering entities (`ZoomStar`, `Shooting`, `Comet`, `Approach`, `Particle`, `Flash`). 
- **Lines 59-83**: SVG definitions (`ICONS`) and the `iconImg` function which converts raw SVG strings into cached `HTMLImageElement` objects for fast canvas drawing.
- **Lines 85-113**: The `makeStars` factory function. Generates randomized properties for 3D zooming stars.
- **Lines 116-142**: The main React Component. Initializes `canvasRef`, `pausedRef`, and binds the `playBoom` function from `useCollisionSound`. Adds a window resize listener to maintain HDPI/Retina resolution (`dpr`).
- **Lines 144-157**: Initializes state arrays for all canvas entities and variables for the sequence timer.
- **Lines 159-253**: The Spawner functions (`spawnShoot`, `spawnComet`, `spawnCollision`).
  - **Bug/Issue Identification**: Inside `spawnCollision` (Lines 229 & 246), `playBoomRef.current()` is called exactly when the `setTimeout` triggers the visual explosion. **NO MUTING LOGIC EXISTS HERE.** It fires exactly as intended.
- **Lines 256-498**: The `render` loop via `requestAnimationFrame`. Calculates deltaTime (`dt`), runs the `seqTimer` to spawn random events every ~4 seconds, and executes the highly optimized `ctx.fillRect`/`ctx.arc` drawing commands for all entities.
- **Lines 503-527**: IntersectionObserver logic to pause the canvas loop when the `#hero` element is scrolled out of view. This saves system resources.
- **Lines 530-538**: The JSX return, rendering the `<canvas>` as a `fixed inset-0` background layer below everything (`zIndex: -49`).

## Audio/Muting Bugs Identified:
✅ **NONE.** `StarfieldCanvas` contains no `collisionCount` logic and does not artificially mute or delay the sound call. It perfectly calls `playBoomRef.current()` on the exact millisecond of the collision visual.
