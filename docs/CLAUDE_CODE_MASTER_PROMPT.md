# ClimaTales AR - Claude Code Master Orchestration Prompt

## 🎯 Project Overview

You are the **Lead Architect** for building **ClimaTales AR**, an augmented reality educational storybook app for climate change education. Your job is to orchestrate multiple specialist subagents to build this project from start to finish.

**Client**: Student researchers (thesis project)
**Timeline**: 3-4 weeks
**Budget**: ₱17,500
**Deadline**: February 28, 2025
**POC Demo**: February 7, 2025

---

## 📋 Project Requirements

### Core Features
1. **AR Mode**: Scan printed storybook pages (10 pages) → Display 2D/3D overlays with text explanations and audio narration
2. **Quiz Mode**: Multiple choice questions per page, track scores, allow resume incomplete attempts
3. **Video Mode**: Links to YouTube educational videos (Carbon Cycle, Human Actions, Climate Change)
4. **User System**: Name input only (no auth), localStorage persistence
5. **Offline Support**: PWA that works without internet after initial load

### Technical Stack (MANDATORY - Do Not Deviate)
- **Framework**: SvelteKit 5 (Svelte 5 runes syntax)
- **Build Tool**: Vite
- **AR Engine**: MindAR.js (image tracking)
- **3D Rendering**: Three.js (bundled with MindAR)
- **UI Components**: shadcn-svelte
- **Styling**: Tailwind CSS v3 (NOT v4)
- **Storage**: localStorage (no backend)
- **PWA**: vite-plugin-pwa

### Design System
- Brand tokens are defined in `/brand.json` - **USE THESE VALUES**
- Visual reference in `/brand-reference.html`
- Primary color: #22A652 (Canopy Green)
- Fonts: Fredoka (display), Nunito (body), Baloo 2 (accent)
- All components must have rounded corners (organic feel)
- Must feel playful but educational

---

## 🏗️ Project Structure

```
climatales-ar/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn-svelte components (customized)
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   ├── input/
│   │   │   │   ├── badge/
│   │   │   │   └── ...
│   │   │   ├── ar/
│   │   │   │   ├── ARViewer.svelte    # Main AR camera + MindAR
│   │   │   │   ├── AROverlay.svelte   # Explanation overlay
│   │   │   │   └── ARControls.svelte  # AR mode controls
│   │   │   ├── quiz/
│   │   │   │   ├── QuizQuestion.svelte
│   │   │   │   ├── QuizOption.svelte
│   │   │   │   ├── QuizFeedback.svelte
│   │   │   │   └── QuizProgress.svelte
│   │   │   ├── video/
│   │   │   │   ├── VideoCard.svelte
│   │   │   │   └── VideoList.svelte
│   │   │   ├── layout/
│   │   │   │   ├── BottomNav.svelte
│   │   │   │   ├── Header.svelte
│   │   │   │   └── PageTransition.svelte
│   │   │   └── shared/
│   │   │       ├── Mascot.svelte
│   │   │       ├── AudioButton.svelte
│   │   │       └── LoadingSpinner.svelte
│   │   ├── stores/
│   │   │   ├── user.svelte.ts         # User name, current session
│   │   │   ├── quiz.svelte.ts         # Quiz state, scores, takes
│   │   │   ├── ar.svelte.ts           # AR state, detected page
│   │   │   └── app.svelte.ts          # App-wide state, current mode
│   │   ├── utils/
│   │   │   ├── storage.ts             # localStorage wrapper
│   │   │   ├── audio.ts               # Audio playback utilities
│   │   │   └── helpers.ts             # General utilities
│   │   ├── data/
│   │   │   ├── pages.ts               # Storybook content data
│   │   │   ├── quizzes.ts             # Quiz questions per page
│   │   │   └── videos.ts              # YouTube video links
│   │   └── types/
│   │       └── index.ts               # TypeScript interfaces
│   ├── routes/
│   │   ├── +layout.svelte             # Root layout with nav
│   │   ├── +page.svelte               # Home/Welcome screen
│   │   ├── ar/
│   │   │   └── +page.svelte           # AR Mode
│   │   ├── quiz/
│   │   │   ├── +page.svelte           # Quiz Mode (question display)
│   │   │   └── results/
│   │   │       └── +page.svelte       # Quiz results
│   │   └── videos/
│   │       └── +page.svelte           # Video Mode
│   ├── app.html
│   ├── app.css                        # Global styles, Tailwind imports
│   └── app.d.ts
├── static/
│   ├── targets/                       # .mind files for AR tracking
│   │   └── storybook.mind
│   ├── models/                        # 3D models (.glb/.gltf)
│   ├── audio/                         # Narration audio files
│   ├── images/
│   │   ├── mascot/                    # Terra mascot poses
│   │   └── icons/
│   ├── manifest.json                  # PWA manifest
│   └── favicon.ico
├── brand.json                         # Design tokens (PROVIDED)
├── brand-reference.html               # Visual reference (PROVIDED)
├── tailwind.config.js                 # Tailwind config with brand tokens
├── svelte.config.js
├── vite.config.ts
├── package.json
└── README.md
```

---

## 📝 MASTER TODO LIST

### Phase 1: Project Foundation (Day 1-2)
- [ ] **1.1** Initialize SvelteKit 5 project with TypeScript
- [ ] **1.2** Install and configure Tailwind CSS v3
- [ ] **1.3** Install and configure shadcn-svelte
- [ ] **1.4** Parse brand.json and create tailwind.config.js with custom theme
- [ ] **1.5** Set up CSS variables from brand.json in app.css
- [ ] **1.6** Install Google Fonts (Fredoka, Nunito, Baloo 2)
- [ ] **1.7** Create base layout structure (+layout.svelte)
- [ ] **1.8** Set up vite-plugin-pwa for offline support

### Phase 2: Design System & UI Components (Day 3-5)
- [ ] **2.1** Customize shadcn Button component with brand styles
- [ ] **2.2** Customize shadcn Card component with brand styles
- [ ] **2.3** Customize shadcn Input component with brand styles
- [ ] **2.4** Create Badge component with semantic color variants
- [ ] **2.5** Create BottomNav component (AR/Quiz/Video tabs)
- [ ] **2.6** Create Header component
- [ ] **2.7** Create LoadingSpinner component
- [ ] **2.8** Create Mascot component (Terra character)
- [ ] **2.9** Create AudioButton component
- [ ] **2.10** Implement page transition animations

### Phase 3: State Management & Storage (Day 5-6)
- [ ] **3.1** Create localStorage utility wrapper with type safety
- [ ] **3.2** Create user store (Svelte 5 runes) - name, session
- [ ] **3.3** Create quiz store - current take, scores, answers, progress
- [ ] **3.4** Create AR store - detected page, overlay state
- [ ] **3.5** Create app store - current mode, loading states
- [ ] **3.6** Implement data persistence (auto-save to localStorage)
- [ ] **3.7** Implement quiz resume functionality

### Phase 4: Data Layer (Day 6-7)
- [ ] **4.1** Define TypeScript interfaces for all data types
- [ ] **4.2** Create storybook pages data (10 pages with content)
- [ ] **4.3** Create quiz questions data (questions per page)
- [ ] **4.4** Create video links data (YouTube URLs by category)
- [ ] **4.5** Create sample audio file references

### Phase 5: Core Pages - Home & Navigation (Day 7-8)
- [ ] **5.1** Build Welcome/Home page with name input
- [ ] **5.2** Implement name persistence and greeting
- [ ] **5.3** Build mode selection UI (if not using bottom nav as primary)
- [ ] **5.4** Implement bottom navigation with active states
- [ ] **5.5** Add route transitions

### Phase 6: AR Mode (Day 8-12) ⚠️ CRITICAL PATH
- [ ] **6.1** Install MindAR.js and Three.js dependencies
- [ ] **6.2** Create MindAR initialization utility
- [ ] **6.3** Build ARViewer component with camera access
- [ ] **6.4** Implement image target detection
- [ ] **6.5** Create AR overlay system (positioned on detected image)
- [ ] **6.6** Build explanation card overlay component
- [ ] **6.7** Implement 2D/3D model rendering on target
- [ ] **6.8** Add audio narration playback
- [ ] **6.9** Implement page navigation (Next button)
- [ ] **6.10** Handle camera permissions gracefully
- [ ] **6.11** Add loading states for AR initialization
- [ ] **6.12** Test with actual printed images

### Phase 7: Quiz Mode (Day 12-15)
- [ ] **7.1** Build Quiz landing page (select page or continue)
- [ ] **7.2** Create QuizQuestion component with question card styling
- [ ] **7.3** Create QuizOption component with selection states
- [ ] **7.4** Implement answer selection and validation
- [ ] **7.5** Create QuizFeedback component (correct/incorrect blobs)
- [ ] **7.6** Add celebration animation for correct answers
- [ ] **7.7** Add encouragement animation for incorrect answers
- [ ] **7.8** Implement quiz progress tracking
- [ ] **7.9** Build quiz results/summary page
- [ ] **7.10** Implement "take" system (multiple attempts)
- [ ] **7.11** Implement quiz resume (continue incomplete take)
- [ ] **7.12** Store and display historical scores

### Phase 8: Video Mode (Day 15-16)
- [ ] **8.1** Build Video Mode page with gradient background
- [ ] **8.2** Create VideoCard component with glassmorphism
- [ ] **8.3** Implement video category list
- [ ] **8.4** Add YouTube link handling (external open)
- [ ] **8.5** Optional: Embed YouTube player

### Phase 9: PWA & Offline (Day 16-17)
- [ ] **9.1** Configure vite-plugin-pwa
- [ ] **9.2** Create PWA manifest with app icons
- [ ] **9.3** Configure service worker for asset caching
- [ ] **9.4** Pre-cache all static assets (models, audio, images)
- [ ] **9.5** Test offline functionality
- [ ] **9.6** Add install prompt UI

### Phase 10: Polish & Testing (Day 17-20)
- [ ] **10.1** Responsive design testing (various phone sizes)
- [ ] **10.2** Performance optimization (lazy loading, code splitting)
- [ ] **10.3** Accessibility audit (focus states, ARIA labels)
- [ ] **10.4** Error handling and user feedback
- [ ] **10.5** Loading states for all async operations
- [ ] **10.6** Final UI polish and animation timing
- [ ] **10.7** Cross-browser testing (Chrome, Safari mobile)
- [ ] **10.8** Create README with setup instructions

### Phase 11: Deployment (Day 20-21)
- [ ] **11.1** Build production bundle
- [ ] **11.2** Deploy to Vercel/Netlify
- [ ] **11.3** Test deployed version
- [ ] **11.4** Provide client handoff documentation

---

## 🤖 SUBAGENT DEFINITIONS

When executing tasks, spawn specialized subagents using this format:

```
Task: [Task description]
```

### Subagent 1: **Project Architect**
**Responsibility**: Project setup, configuration files, folder structure
**Tasks**: 1.1-1.8, 11.1-11.4
**Expertise**: SvelteKit 5, Vite config, PWA setup, deployment

### Subagent 2: **Design System Engineer**
**Responsibility**: Tailwind config, CSS variables, shadcn customization
**Tasks**: 2.1-2.10
**Expertise**: Tailwind CSS v3, CSS animations, shadcn-svelte, design tokens
**Critical Rule**: MUST read brand.json and apply exact values

### Subagent 3: **State Manager**
**Responsibility**: Svelte 5 stores, localStorage, data persistence
**Tasks**: 3.1-3.7, 4.1-4.5
**Expertise**: Svelte 5 runes ($state, $derived, $effect), TypeScript, localStorage API

### Subagent 4: **Page Builder**
**Responsibility**: Route pages, layouts, navigation
**Tasks**: 5.1-5.5, 8.1-8.5
**Expertise**: SvelteKit routing, page transitions, responsive layouts

### Subagent 5: **AR Specialist** ⚠️ CRITICAL
**Responsibility**: MindAR integration, camera handling, 3D rendering
**Tasks**: 6.1-6.12
**Expertise**: MindAR.js, Three.js, WebGL, getUserMedia API
**Critical Rule**: This is the most complex part - allocate extra time

### Subagent 6: **Quiz Engineer**
**Responsibility**: Quiz logic, scoring system, feedback animations
**Tasks**: 7.1-7.12
**Expertise**: Game logic, animations, state machines

### Subagent 7: **QA Specialist**
**Responsibility**: Testing, optimization, accessibility, polish
**Tasks**: 10.1-10.8
**Expertise**: Performance optimization, a11y, cross-browser testing

---

## 🚀 EXECUTION INSTRUCTIONS

### Step 1: Read Context Files First
Before writing any code, ALWAYS read:
```bash
cat brand.json
cat brand-reference.html
```
These contain the EXACT design tokens to use. Do not invent colors or fonts.

### Step 2: Execute by Phase
Work through phases sequentially. Each phase builds on the previous.

### Step 3: Checkpoint After Each Phase
After completing each phase, verify:
- All files created
- No TypeScript errors
- App runs without crashes
- Visual output matches brand guidelines

### Step 4: POC Priority (Due Feb 7)
For the POC demo, prioritize:
1. ✅ Phase 1 (Foundation)
2. ✅ Phase 2 (Basic UI)
3. ✅ Phase 6.1-6.5 (AR core working)
4. ✅ Phase 5 (Navigation)

Minimum POC = Camera opens, detects one image, shows overlay

---

## 📐 TECHNICAL SPECIFICATIONS

### Svelte 5 Runes Syntax (MANDATORY)
```svelte
<script lang="ts">
  // Use runes, not legacy stores
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

### shadcn-svelte Import Pattern
```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
</script>
```

### MindAR Integration Pattern
```typescript
// src/lib/utils/mindar.ts
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import * as THREE from 'three';

export async function initAR(container: HTMLElement, targetSrc: string) {
  const mindar = new MindARThree({
    container,
    imageTargetSrc: targetSrc,
  });
  
  const { renderer, scene, camera } = mindar;
  
  // Add anchor for detected image
  const anchor = mindar.addAnchor(0);
  
  await mindar.start();
  
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
  
  return { mindar, anchor, scene };
}
```

### localStorage Wrapper Pattern
```typescript
// src/lib/utils/storage.ts
const STORAGE_KEYS = {
  USER: 'climatales_user',
  QUIZ: 'climatales_quiz',
} as const;

export const storage = {
  getUser: () => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  // ... more methods
};
```

### Quiz Data Structure
```typescript
interface QuizTake {
  id: number;
  pageId: number;
  completed: boolean;
  currentQuestion: number;
  answers: { questionId: number; answerId: string; correct: boolean }[];
  score: number;
  startedAt: string;
  completedAt?: string;
}

interface UserQuizData {
  name: string;
  takes: QuizTake[];
}
```

---

## ⚠️ CRITICAL RULES

1. **DO NOT use Tailwind v4** - Use v3 syntax only
2. **DO NOT use legacy Svelte stores** - Use Svelte 5 runes only
3. **DO NOT invent colors** - Use brand.json values exactly
4. **DO NOT skip TypeScript** - All files must be typed
5. **DO NOT hardcode strings** - Use data files for content
6. **DO use relative imports** - `$lib/` alias for lib folder
7. **DO test AR on mobile** - Camera access requires HTTPS or localhost
8. **DO handle permissions** - Camera denial should show friendly message

---

## 📦 PACKAGE.JSON DEPENDENCIES

```json
{
  "dependencies": {
    "mind-ar": "^1.2.5",
    "three": "^0.160.0",
    "bits-ui": "latest",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "tailwind-variants": "^0.2.0"
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "svelte": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "typescript": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0"
  }
}
```

---

## 🎬 BEGIN EXECUTION

Start with Phase 1. After reading this entire prompt, your first action should be:

1. Read brand.json to understand the design system
2. Initialize the SvelteKit 5 project
3. Report back with the project structure created

**GO!**
