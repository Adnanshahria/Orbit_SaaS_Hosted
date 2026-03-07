# `Home.tsx` Line-by-Line Analysis & Bug Report

## Overview
This is the root landing page component for the Orbit SaaS website. It stitches together the 3D Canvas backgrounds (`StarfieldCanvas`, `CometDiceLoaderCanvas`), the Lead Magnet logic, the Hero text, and the Navigation UI.

## Line-by-Line Breakdown
- **Lines 1-7**: Standard imports including `framer-motion` for buttery smooth text animations, `lucide-react` for SVG icons, `sonner` for toast notifications, and custom Hooks (`useLang`).
- **Lines 9-26**: The `parseSubtitleSegments()` helper function. This parses raw strings to extract rich markdown markers like `**bold**`, `[[green-card]]`, and `{{white-card}}` to inject complex styled elements into the hero text without needing raw React components in the translation files.
- **Lines 28-50**: The `<Home>` component init. Manages state for the CTA popup, email input, newsletter focus, and the chatbot state. **Line 41** listens carefully to the `orbit-chatbot-state-change` event so it knows exactly when the user has opened the AI chat.
- **Lines 51-66**: Scroll tracking `useEffect`. Monitors how deep the user has scrolled to selectively hide/show the "Subscribe" newsletter button. It uses highly optimized `getBoundingClientRect` comparisons rather than raw scroll pixels.
- **Lines 68-95**: The `handleSubscribe()` network fetch handler. Posts leads to the backend API via the `VITE_API_URL` endpoint and stores a strict `orbit_chatbot_email_provided` flag in localstorage if successful.
- **Lines 98-115**: Prepares translation strings (`tagline`, `subtitle`), theme colors (`#10b981`, `#f59e0b`), and parses the WhatsApp dynamic link using regex filtering on the phone number.
- **Lines 117-181**: The Majestic "O R B I T" Canvas Loader Sequence logic. 
  - Initializes the canvas delay sequence. It uses DOM `getBoundingClientRect` to map the exact screen coordinates of the HTML `<span>` letters so the `CometDiceLoaderCanvas` can shoot 3D comets EXACTLY to their visual locations.
  - Generates a strict 15-second safety fallback timeout (`last-resort`) so that if the canvas crashes on extremely old phones, the site still forces open.
- **Lines 183-215**: Cross-browser mobile hacks. Forces the exact `innerViewport` height and strict body scroll-locking when the user selects the newsletter input to prevent iOS Safari from destroying the flex layout.
- **Lines 217-250**: The core JSX tree starts. Renders the main `#hero` containment section, the animated Tagline badge, and begins the Title typography.

## Audio/Muting Bugs Identified:
✅ **NONE.** `Home.tsx` does not touch or limit the audio system in any way. It simply mounts the Canvas elements which subsequently trigger their own internal sounds via `CollisionSound`. The "3 collision" muting bug you suspected is entirely absent from this file.
