# `Chatbot.tsx` Line-by-Line Analysis & Bug Report

## Overview
This file manages the persistent AI Chatbot widget present across the Orbit SaaS application. It controls the interactive Groq-powered messaging, idle-time popup behaviors, and lead capture logic.

## Line-by-Line Breakdown
- **Lines 1-11**: Imports for Framer Motion, animations (DotLottie), icons, React context, and the Groq AI service. 
- **Lines 13-66**: `contextMessages` dictionary. Maps specific webpage sections (`hero`, `services`, `project`, etc.) to array lists of localized tooltip prompts.
- **Lines 68-87**: The main `Chatbot()` component state initializations. Tracks chat history strictly in `messages`, visibility states (`open`, `showMenu`, `isKeyboardOpen`), and the logic around the idle welcome popup (`showWelcomePopup`).
- **Lines 89-122**: `getActiveSection()` and `getRandomContextMessage()`. Helper functions that measure DOM element bounding boxes to figure out exactly what the user is reading vertically, mapping it to the `contextMessages` dictionary to provide context-aware popups.
- **Lines 124-150**: Event listeners that suppress the Chatbot popup globally. 
  - **Bug/Issue Identification**: **Lines 130-139** specifically hide the welcome popup during `orbit-collision-start` and `-end`. This is a visual suppression of the chat UI during the canvas fireball burst, but it **does not mute the audio**. Audio logic lives in `CollisionSound.tsx`.
- **Lines 152-206**: The Idle Timer engine. Tracks mouse sweeps, scrolls, and touch events on window. After 10s of complete inactivity, forces `setShowWelcomePopup(true)`.
- **Lines 208-284**: Localization strings mapping, scroll-to-bottom refs, and viewport scroll-lock mechanisms for mobile. When the chat modal is full-screened, the `body` is completely locked to `fixed` coordinates to prevent buggy Safari rubber-banding.
- **Lines 286-356**: The Email Interceptor & Background Summary AI. Checks `localStorage` to see if a user already submitted an email. If they did, it counts up 45 seconds of background inactivity, secretly queries the Groq AI layer to write a 3-sentence summary of the user's intents, and `POST`s it to the Lead Database silently.
- **Lines 358-408**: `handleLeadSubmit()`. Native lead form rendering hook. Submits manual emails to the backend.
- **Lines 410-466**: The Visual Viewport resize handler. Listens to Android/iOS virtual keyboard pops. Calculates custom `maxHeight` properties to slide the chat UI gracefully above the native smartphone touch keyboard.
- **Lines 468-775**: The `executeAIResponse()` core engine logic. 
  - Downloads remote Knowledge Base JSON API injections.
  - Builds huge `systemPrompt` arrays mapping the exact English or Bengali tone constraints.
  - Calls `sendToGroq()`.
  - Parses the raw AI output using custom RegExp implementations (Strategies 1-4) to extract trailing questions into clickable 'Suggestions / Follow-ups'.
- **Lines 777+**: Formatting strings into clean Markdown structures and generating the visual JSX layout.

## Audio/Muting Bugs Identified:
✅ **NONE.** `Chatbot` does not touch or disable the `orbit-audio` systems. It visually hides its tooltip during collisions, but has absolutely zero impact on the queue or playing of the HTML5 Audio API buffer.
