# `CometDiceLoaderCanvas.tsx` Line-by-Line Analysis & Bug Report

## Overview
This file renders the initial loading sequence where the word "ORBIT" is revealed by comets striking placeholders. It culminates in a red "strike" comet hitting a 3D HTML5 Canvas dice, revealing the "SaaS" text and initiating the main page content.

## Line-by-Line Breakdown
- **Lines 1-2**: Imports React and `playBoomDirect`, `warmUpAudio` from `CollisionSound.tsx`. 
- **Lines 4-17**: TypeScript interface definitions for props and DOM Rect math (`Rect`).
- **Lines 19-38**: Constants (Colors, TAU) and the component initializations. Defines refs to sync React state variables into the `requestAnimationFrame` render loop without triggering re-renders.
- **Lines 40-65**: The main `useEffect` hook. **Line 42** correctly calls `warmUpAudio();` to pre-decode the audio buffer so it's ready ~8 seconds later when the fireball hits. Sets up device pixel ratio scaling (`dpr`) for Retina screens.
- **Lines 67-91**: State machine variables for handling physics. `diceX`, `diceY`, `diceRot*`, `diceVx`, and forces like `gravity`. Defines states like `SPAWNING_ORBIT`, `AWAITING_COLLISION`, `COLLIDING`, `DISLOCATING`, `BURSTING` and `DONE`.
- **Lines 93-159**: The `drawCube` function. This is a complex custom 3D math engine written in plain 2D canvas context. It defines 8 vertices, projects them using a basic perspective formula (FOV = 300), sorts faces by Z-average to fix clipping, and draws glowing borders and center text.
- **Lines 161-175**: `spawnParticles` helper for explosions (comets hitting letters, fireball hitting dice).
- **Lines 177-213**: `drawComet` function rendering linear gradients for the comet tail, head, and optional center text (the orbiting letters).
- **Lines 215-228**: Math helpers checking the synced `orbitRectsRef` and `saasRectRef` for exact DOM coordinates so the canvas animation perfectly matches the React HTML text coordinates.
- **Lines 230-359**: The `render` loop State Machine. Dictates exactly what happens at every millisecond of the 8-second sequence based on `dt`.
  - **`SPAWNING_ORBIT`**: Floats the dice in a Lissajous curve. Spawns 5 letter comets over 6 seconds.
  - **`AWAITING_COLLISION`**: 0.8s gap of tension.
  - **`COLLIDING`**: Spawns the red fireball targeting the dice.
  - **`DISLOCATING`**: Fires gravity+homing forces to simulate the dice bursting and falling to the "SaaS" text placeholder.
- **Lines 361-430**: Actual object rendering phase for Comets, Particles, and the Dice. 
  - **Bug/Issue Identification**: In **Line 390**, when the fireball distance `< c.speed * dt`, it calls `playBoomDirect();`. **There is no muting logic or `count < 3` condition here.**
- **Lines 432-448**: Cleanup function for `requestAnimationFrame`, followed by the `<canvas>` DOM JSX output.

## Audio/Muting Bugs Identified:
✅ **NONE.** The code correctly fires `playBoomDirect()` exactly when the fireball hits the dice. The perceived "bug" where the sound is muted is entirely due to Chrome's strict Audio Autoplay rules, which force the queue logic (in `CollisionSound.tsx`) to hold the playback until the user clicks their mouse or taps their screen. Because the loading sequence demands ~8 seconds of watching passively, users naturally don't click, so the browser actively blocks the audio request.
