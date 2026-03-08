# ClimaTales AR - AI Agent Guide

## Project Overview

**ClimaTales AR** is an augmented reality educational storybook experience that transforms climate change education into an interactive adventure for children ages 8-14. The app combines AR technology with interactive quizzes and educational videos to make learning about climate change engaging and hopeful.

**Tagline**: "Where Stories Come Alive to Save Our Planet"

## Tech Stack

### Core Framework
- **SvelteKit** 2.x - Full-stack framework with SSR and routing
- **Svelte 5** - Component framework with runes API
- **TypeScript** - Type safety throughout
- **Vite** - Build tool and dev server

### UI & Styling
- **TailwindCSS 4.x** - Utility-first CSS framework
- **bits-ui** - Headless UI components
- **lucide-svelte** - Icon library
- **Iconify** - Additional icon support
- **tailwind-variants** - Component variants
- **tailwind-merge** (clsx) - Conditional class merging

### PWA & Performance
- **@vite-pwa/sveltekit** - PWA support
- **vite-plugin-pwa** - Service worker generation
- Offline-first architecture
- Asset caching for images, audio, and AR targets

### 3D & AR
- **Three.js** - 3D rendering for AR experiences
- **MindAR** - AR tracking (via .mind files)
- Custom AR overlay system

### Other Dependencies
- **canvas-confetti** - Celebration animations

## Architecture & Structure

### Directory Layout

```
AR-Storybook/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/          # Reusable UI components (button, card, input, badge)
│   │   │   ├── layout/      # Layout components (Header, BottomNav)
│   │   │   ├── shared/      # Shared components (LoadingSpinner, AudioButton)
│   │   │   ├── ar/          # AR-specific components (AROverlay, ARViewer)
│   │   │   └── quiz/        # Quiz components (QuizQuestion, QuizOption, QuizResults)
│   │   ├── stores/          # Svelte stores (user, quiz, ar)
│   │   ├── utils/           # Utility functions (storage, audio, helpers, content)
│   │   ├── types/           # TypeScript type definitions
│   │   └── assets/          # SVG assets (favicon)
│   ├── routes/
│   │   ├── +layout.svelte   # Root layout with PWA setup
│   │   ├── +page.svelte     # Home page
│   │   ├── ar/              # AR mode route
│   │   ├── quiz/            # Quiz routes (with dynamic [pageId])
│   │   └── videos/          # Video library route
│   ├── app.html             # HTML template
│   ├── app.css              # Global styles
│   └── app.d.ts             # App type definitions
├── static/
│   ├── content/             # Content manifest and assets
│   ├── icons/               # PWA icons
│   └── robots.txt
├── brand.json               # Complete design system specification
├── components.json          # Shadcn-svelte configuration
├── package.json
├── svelte.config.js         # SvelteKit configuration
├── vite.config.ts           # Vite + PWA configuration
└── tsconfig.json            # TypeScript configuration
```

### Key Files & Their Purpose

#### Configuration Files
- **vite.config.ts**: Configures Vite, PWA manifest, service worker, and caching strategies
- **svelte.config.js**: SvelteKit adapter configuration
- **components.json**: UI component library aliases and settings
- **brand.json**: Complete design system (colors, typography, spacing, animations)
- **tsconfig.json**: TypeScript compiler settings

#### Core Application Files
- **src/routes/+layout.svelte**: Root layout with navigation, PWA reload prompt
- **src/app.css**: Global CSS variables and Tailwind imports
- **src/lib/types/index.ts**: All TypeScript interfaces and types

#### Stores (Svelte 5 Runes)
- **stores/user.svelte.ts**: User state management (name, creation date)
- **stores/quiz.svelte.ts**: Quiz state (current take, answers, score)
- **stores/ar.svelte.ts**: AR state (tracking, detection, permissions)

#### Utilities
- **utils/storage.ts**: LocalStorage abstraction
- **utils/audio.ts**: Audio playback utilities (narration)
- **utils/sfx.ts**: Procedural sound effects (Web Audio API, zero files)
- **utils/content.ts**: Content loading from manifest.json
- **utils/helpers.ts**: General helper functions

#### Components

**UI Components** (`lib/components/ui/`)
- Based on shadcn-svelte pattern
- Button, Card, Input, Badge
- Variants using tailwind-variants
- Fully accessible and styled per brand.json

**Layout Components** (`lib/components/layout/`)
- Header: Top navigation bar
- BottomNav: Primary navigation (Home, AR, Quiz, Videos)

**Shared Components** (`lib/components/shared/`)
- LoadingSpinner: Loading state indicator
- AudioButton: Play/pause audio with visual feedback

**AR Components** (`lib/components/ar/`)
- ARViewer: Main AR camera and tracking logic
- AROverlay: Educational content overlay on AR view

**Quiz Components** (`lib/components/quiz/`)
- QuizQuestion: Question display with hints
- QuizOption: Selectable answer option
- QuizResults: Score display with celebration

### Routes

- `/` - Home page with mode selection
- `/ar` - AR camera mode with page detection and overlays
- `/quiz` - Quiz landing page
- `/quiz/[pageId]` - Page-specific quiz
- `/videos` - Video library with category filtering

## Design System

The complete design system is defined in `brand.json`. Key highlights:

### Colors
- **Primary (Canopy Green)**: #22A652 - Actions, navigation, growth
- **Secondary (Ocean Deep)**: #1E6B8C - Water themes, trust
- **Accent (Sunset Coral)**: #FF6B4A - Highlights, CTAs, energy
- **Semantic Colors**: Success (Sprout), Warning (Sunbeam), Error (Autumn), Info (Sky)

### Typography
- **Display Font**: Fredoka - Headlines, quiz questions (rounded, friendly)
- **Body Font**: Nunito - Body text, explanations (readable, rounded)
- **Accent Font**: Baloo 2 - Buttons, labels (extra playful)

### Spacing
- Base unit: 4px
- Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24
- Semantic: componentPadding, sectionGap, cardPadding, buttonPadding

### Border Radius
- Rounded corners everywhere (organic, friendly feel)
- Button: 12px, Card: 20px, Input: 12px, Badge: 8px

### Animations
- Durations: instant (100ms), fast (200ms), normal (300ms), slow (500ms)
- Easings: default, bounce, smooth, spring, snappy
- Key animations: celebrate, wiggle, bounce, float, shimmer

## Content Management

### Content Structure
Content is managed via `static/content/manifest.json`:

```json
{
  "pages": [
    {
      "id": 1,
      "title": "Page Title",
      "description": "Short description",
      "explanation": "Detailed explanation (HTML allowed)",
      "audioUrl": "/audio/page1.mp3",
      "modelUrl": "/models/page1.glb",
      "imageUrl": "/images/page1.jpg",
      "quiz": [
        {
          "question": "Quiz question?",
          "options": [
            { "id": "a", "text": "Option A" },
            { "id": "b", "text": "Option B" }
          ],
          "correctOptionId": "a",
          "hint": "Optional hint"
        }
      ]
    }
  ],
  "videos": [
    {
      "category": "carbon-cycle",
      "name": "Carbon Cycle",
      "description": "Category description",
      "items": [
        {
          "id": "video1",
          "title": "Video Title",
          "description": "Video description",
          "youtubeUrl": "https://youtube.com/..."
        }
      ]
    }
  ]
}
```

### Content Loading
- **src/lib/utils/content.ts** provides functions:
  - `loadContentManifest()`: Loads manifest.json
  - `getStoryPages()`: Returns all story pages
  - `getQuizQuestions(pageId)`: Returns quiz questions for a page
  - `getVideos()`: Returns all videos grouped by category
- Fallback to default content if manifest not found
- Content is cached after first load

## PWA Configuration

### Service Worker
- **Strategy**: generateSW (automatic)
- **Update**: autoUpdate on page load
- **Glob patterns**: JS, CSS, HTML, images, fonts, audio, AR targets (.mind)

### Caching Strategies
- **Google Fonts**: CacheFirst, 1 year expiration
- **CDN assets (jsDelivr)**: CacheFirst, 30 days
- **Images**: CacheFirst, 30 days, max 100 entries
- **Audio**: CacheFirst, 30 days, max 50 entries
- **AR targets (.mind)**: CacheFirst, 30 days, max 10 entries

### Manifest
- **Name**: ClimaTales AR
- **Short Name**: ClimaTales
- **Theme Color**: #22A652 (Canopy Green)
- **Background Color**: #F7FAF8
- **Display**: standalone
- **Orientation**: portrait
- **Icons**: 72px to 512px (all maskable)
- **Categories**: education, kids, entertainment

## AR System

### AR Implementation
- Uses MindAR for image tracking
- Target images defined as `.mind` files
- Each story page has a `targetIndex` corresponding to an AR target
- AR state managed in `stores/ar.svelte.ts`

### AR Workflow
1. User navigates to `/ar`
2. ARViewer initializes camera and MindAR
3. Detects tracked images from physical storybook
4. Shows AROverlay with 3D models and explanations
5. User can interact with "Next" to cycle through content

### AR State
```typescript
interface ARState {
  isInitialized: boolean;      // AR system ready
  isTracking: boolean;          // Currently tracking a target
  detectedPageIndex: number | null;  // Which page is detected
  overlayVisible: boolean;      // Show explanation overlay
  error: string | null;         // Error messages
  permissionDenied: boolean;    // Camera permission denied
}
```

## Quiz System

### Quiz Flow
1. User selects a page quiz from `/quiz`
2. Quiz questions loaded from manifest
3. User answers questions sequentially
4. Immediate feedback (correct/incorrect with animations)
5. Final score with celebration (confetti for high scores)

### Quiz State
```typescript
interface QuizTake {
  id: number;
  pageId: number;
  completed: boolean;
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  startedAt: string;
  completedAt?: string;
}
```

### Quiz Storage
- Quiz takes stored in localStorage
- Key: `climatales_quiz_takes`
- Persists across sessions

## State Management

All stores use **Svelte 5 Runes** (`$state`, `$derived`, `$effect`):

### User Store
```typescript
const user = $state<User | null>(null);
```

### Quiz Store
```typescript
const currentTake = $state<QuizTake | null>(null);
const allTakes = $state<QuizTake[]>([]);
```

### AR Store
```typescript
const state = $state<ARState>({ ... });
```

## Mobile-First Design Policy (MANDATORY)

This app is **Android-first, PWA-friendly**. All UI work MUST follow these rules.

### Viewport & Units
- Always use `min-h-dvh` alongside `min-h-screen` (never `min-h-screen` alone) — mobile browsers collapse address bars
- Use `dvh` units for any viewport-relative height calculations (modals, full-screen views, image containers)
- The viewport meta in `app.html` is locked: `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover` — do not change it

### Touch Targets & Interaction
- **44px minimum** touch target on ALL interactive elements (buttons, links, options, icons)
- Add `touch-manipulation` to all clickable elements (globally applied in `app.css` but verify on custom elements)
- Never use `scale` transforms on active navigation states — they cause layout jumps on mobile
- Use `active:scale-95` or `active:scale-[0.98]` only for press feedback (not for state indication)
- `-webkit-tap-highlight-color: transparent` is set globally — do not override

### Safe Areas & Android
- `env(safe-area-inset-*)` does NOT work in Android WebView
- The `.native-app` class (added by `+layout.svelte` on Capacitor) provides fixed padding via `max()` fallback in `app.css`
- Never duplicate safe-area styles in component `<style>` blocks — use the global `.safe-top` and `.safe-bottom` classes
- `overscroll-behavior: none` is set globally to prevent pull-to-refresh interference

### Responsive Breakpoints
- Design for **320px-480px first** (small Android phones)
- Use `md:` breakpoints only for progressive enhancement on larger screens
- Test all layouts at 320px width minimum
- Use `max-w-lg mx-auto` for content containers to prevent ultra-wide layouts on tablets

### Layout Rules
- BottomNav is 72px tall + safe area padding — always use `.pb-nav` class on scrollable content
- Sticky headers must use `safe-top` class for native app status bar clearance
- Use `fixed inset-0` for full-screen views (AR, modals), not `min-h-screen`

## Sound Effects System

### Architecture
- **`src/lib/utils/sfx.ts`** — Procedural Web Audio API sound effects (zero audio files)
- Import via `import { sfx } from '$lib/utils';`
- All sounds are generated from oscillators and noise buffers — no files to cache or download
- Respects `prefers-reduced-motion` automatically
- Mute preference persisted to `localStorage` key `climatales_sfx_muted`

### Available Sounds
- `sfx.tap()` — Button press click
- `sfx.select()` — Quiz option selection pop
- `sfx.correct()` — Right answer chime (C-E-G arpeggio)
- `sfx.incorrect()` — Wrong answer gentle descend
- `sfx.celebrate()` — Quiz completion sparkle
- `sfx.nav()` — Navigation tab switch whoosh
- `sfx.pageTurn()` — Paper swish for page transitions
- `sfx.arDetect()` — AR target found shimmer
- `sfx.modalOpen()` — Modal open rising tone
- `sfx.modalClose()` — Modal close falling tone
- `sfx.complete()` — Action completion ping

### Mute Controls
- `sfx.mute()`, `sfx.unmute()`, `sfx.toggleMute()`, `sfx.isMuted()`
- Mute toggle button is in `+layout.svelte` (bottom-right floating button)

### When Adding New UI Interactions
- Every new interactive element should have an appropriate SFX trigger
- Keep volumes subtle (0.06-0.25 gain range) — these are UI feedback, not music
- Wrap all SFX calls in component event handlers, never in render logic
- Use `$effect` for reactive sound triggers (e.g., quiz result reveal)

## Development Guidelines

### Component Structure
- Use Svelte 5 syntax with runes
- Props via `let { prop1, prop2 }: Props = $props()`
- State via `$state`, `$derived`, `$effect`
- Events via callbacks (no event dispatchers)

### Styling
- Use Tailwind classes
- Reference brand.json for colors, spacing, typography
- Use `cn()` utility for conditional classes (from utils)
- Custom CSS in component `<style>` blocks only when necessary

### Accessibility
- Minimum contrast: 4.5:1 for normal text
- Touch targets: 44px x 44px minimum (enforced — see Mobile-First Design Policy)
- Keyboard navigation support
- Focus indicators: 3px solid accent with 2px offset
- Respect `prefers-reduced-motion`

### TypeScript
- Strict mode enabled
- All exports should be typed
- Use interfaces from `lib/types/index.ts`
- No implicit `any`

### File Naming
- Components: PascalCase (e.g., `QuizQuestion.svelte`)
- Utilities: camelCase (e.g., `storage.ts`)
- Routes: kebab-case or SvelteKit convention (e.g., `+page.svelte`, `[pageId]`)
- Types: camelCase for interfaces (e.g., `StoryPage`)

## Workflow Restrictions

### npm Commands
- Never run npm commands (e.g., `npm run dev`, `npm run build`) without explicit permission.
- Do not commit or push without explicit permission.

### Git Commits
- When asked to commit, ensure the message omits any `Co-authored-by: Claude` trailer.
- When asked to open a PR, do not auto-merge into main and exclude any `Co-authored-by: Claude` trailers.
- When explicitly told to "Commit all", review the staged history and create a sequence of focused commits that group related changes, rather than one omnibus commit, matching the batches observed in git log.

### Test Screenshots
- All test screenshots must be saved to `test-screenshots/` (gitignored). Never place them elsewhere in the project.

### Documentation
- Never create new .md documents unless explicitly instructed to do so.

### Decision-Making
- Pause for explicit user confirmation before making important architectural choices, irreversible refactors, or dependency upgrades.
- After every response, include succinct feedback options or recommended next steps so the user can react quickly.
- If any requirement or prompt is unclear, immediately ask the user for clarification instead of assuming.
- When diagnosing or fixing bugs, request additional context (logs, repro steps, recent changes) before proposing a solution.

## Android APK Build & Release

### Prerequisites
- Android Studio installed at `C:\Program Files\Android\Android Studio`
- JAVA_HOME = `C:\Program Files\Android\Android Studio\jbr`
- ANDROID_HOME = `C:\Users\dmfaj\AppData\Local\Android\Sdk`

### Build APK
```bash
npm run build && npx cap sync
cd android && JAVA_HOME="/c/Program Files/Android/Android Studio/jbr" ANDROID_HOME="/c/Users/dmfaj/AppData/Local/Android/Sdk" ./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Versioning Policy (MANDATORY)
- **NEVER delete, overwrite, or replace existing GitHub releases.** Always create a new version.
- **NEVER delete or overwrite existing QR code images.** Always generate a new file alongside existing ones.
- Version numbers follow semver: `vMAJOR.MINOR.PATCH` (e.g., v0.2.0 → v0.2.1 → v0.3.0)
- APK naming: `ClimaTales-AR-vX.Y.Z.apk` (include version in filename)
- QR code naming: `MM-DD-YYYY-vX.Y.Z-APK.png` (include version in filename)
- Check `gh release list` before creating a release to determine the next version number.

### Create GitHub Release
```bash
# Copy and rename APK with version
cp android/app/build/outputs/apk/debug/app-debug.apk android/app/build/outputs/apk/debug/ClimaTales-AR-vX.Y.Z.apk

# Create NEW release (never delete old ones)
gh release create vX.Y.Z android/app/build/outputs/apk/debug/ClimaTales-AR-vX.Y.Z.apk --title "ClimaTales AR vX.Y.Z" --notes "Release notes here"
```

### Generate QR Code for APK Download
```bash
npm install --no-save qrcode  # if not already installed
node -e "
const QRCode = require('qrcode');
QRCode.toFile('static/download-qr-codes/MM-DD-YYYY-vX.Y.Z-APK.png',
  'https://github.com/dmdfajardo00/AR-Storybook/releases/download/vX.Y.Z/ClimaTales-AR-vX.Y.Z.apk',
  { width: 400, margin: 2, errorCorrectionLevel: 'M' }, (err) => { if (err) throw err; });
"
```
Naming convention: `MM-DD-YYYY-vX.Y.Z-APK.png` (never overwrite existing QR codes)

### Convenience Scripts
- `npm run cap:build` — build web + sync to Android
- `npm run cap:open` — open in Android Studio
- `npm run cap:run` — build and run on connected device

### Key Config Files
- `capacitor.config.ts` — Capacitor settings (androidScheme: 'https' is critical for camera)
- `android/app/src/main/AndroidManifest.xml` — CAMERA + INTERNET permissions
- `android/app/src/main/res/mipmap-*/` — App icons (sourced from static/icons/icon-512x512.png)

### Notes
- APK size is ~291MB due to static assets (models + videos). Fine for sideloading, exceeds Play Store 150MB limit.
- `env(safe-area-inset-*)` doesn't work in Android WebView. The `.native-app` CSS class (added by +layout.svelte on Capacitor) provides `max()` fallback padding in `app.css`.
- YouTube links use `@capacitor/browser` on native to open in system browser instead of WebView.

### Mobile Device Testing via USB

#### ADB Port Forwarding (recommended)
Forwards the dev server from PC to a USB-connected Android device so the phone sees `localhost`. Camera works without HTTPS on localhost.

```bash
# Start dev server
npm run dev

# In another terminal, forward port to phone via ADB
adb reverse tcp:6175 tcp:6175
```

Then open `http://localhost:6175` in Chrome on the phone.

#### Prerequisites
- USB Debugging enabled on phone: Settings > Developer Options > USB Debugging
- If Developer Options not visible: Settings > About Phone > tap Build Number 7 times
- Accept the "Allow USB debugging" prompt on phone when connecting
- ADB available at: `C:\Users\dmfaj\AppData\Local\Android\Sdk\platform-tools\adb`

#### Chrome DevTools Port Forwarding (alternative)
1. Connect phone via USB with USB Debugging enabled
2. On desktop Chrome, go to `chrome://inspect/#devices`
3. Check "Discover USB devices"
4. Click "Port forwarding..." > add rule: `6175` → `localhost:6175`
5. Check "Enable port forwarding" > Done
6. On phone Chrome, navigate to `http://localhost:6175`

#### Troubleshooting
- `unauthorized` in `adb devices`: Accept USB debugging prompt on phone
- `ERR_CONNECTION_REFUSED` on phone: Ensure dev server is running AND port forwarding is active
- Port 6175 in use: Kill zombie Vite processes with `netstat -ano | grep :6175` then `taskkill /PID <pid> /F`
- Dev server on wrong port: Use `npx vite dev --port 6175` to force port

## Common Tasks

### Adding a New Story Page
1. Add page data to `static/content/manifest.json`
2. Include quiz questions in the page object
3. Add corresponding AR target (.mind file)
4. Add audio file to `static/audio/`
5. Add 3D model if applicable
6. Update targetIndex mapping

### Adding a New UI Component
1. Create component in appropriate directory under `lib/components/`
2. Follow shadcn-svelte pattern if it's a base UI component
3. Use TypeScript for props interface
4. Style using Tailwind + brand.json values
5. Export from index.ts in component directory

### Modifying the Design System
1. Update `brand.json` with new values
2. Update CSS variables in `src/app.css` if needed
3. Update Tailwind config if using custom theme extensions
4. Ensure accessibility standards are maintained

### Debugging AR Issues
1. Check browser console for MindAR errors
2. Verify camera permissions in browser
3. Check AR target file (.mind) is loaded correctly
4. Verify lighting conditions (AR tracking sensitive to lighting)
5. Check `stores/ar.svelte.ts` state for error messages

## Browser Support

- Modern browsers with WebRTC support (camera access)
- Service Worker support (PWA)
- ES2020+ features
- Mobile-first design (portrait orientation primary)

## Performance Considerations

- AR targets cached via service worker
- Images optimized and cached
- Audio files cached for offline use
- Code splitting via SvelteKit routes
- PWA for instant loading on repeat visits

## Mascot: Terra

Terra is the friendly guide character who appears throughout the app:
- 3D cartoon character with warm, approachable design
- Blonde hair, pink/coral explorer jacket, teal pants, round glasses
- Poses: pointing/explaining, celebrating, thinking/encouraging, waving, looking through magnifying glass
- Used in AR mode (corner gestures), quiz feedback, video introductions, transitions

## Target Audience

- **Primary**: Children ages 8-14
- **Secondary**: Educators, parents, environmental advocates
- **Context**: Classroom learning, home education, science museums

## Brand Personality

- **Traits**: Playful, Educational, Hopeful, Adventurous, Empowering
- **Voice**: Friendly guide who makes complex topics feel like exciting discoveries
- **Tone**: Encouraging, curious, wonder-filled, never preachy or scary

## Aesthetic

**Eco-Futurism meets Storybook Whimsy**
- A living storybook that bridges the natural world with technology
- Organic shapes meet clean digital interfaces
- Creates a sense of magic and possibility
- Premium picture book that came to life - tactile, warm, yet technologically impressive

---

**Last Updated**: 2026-03-06
**Version**: 0.0.2
