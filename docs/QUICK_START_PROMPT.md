# ClimaTales AR - Quick Start Prompt for Claude Code

**Copy this entire prompt into Claude Code to begin building.**

---

## Context

Build **ClimaTales AR** - an augmented reality storybook app for climate education.

**Stack**: SvelteKit 5 + Vite + MindAR.js + shadcn-svelte + Tailwind v3 + localStorage

**Files provided in root**:
- `brand.json` - Design tokens (colors, fonts, spacing)
- `brand-reference.html` - Visual style guide

---

## Your First Task

Read the brand files, then initialize the project:

```bash
# Step 1: Read the design system
cat brand.json

# Step 2: Create SvelteKit 5 project
npx sv create climatales-ar --template minimal --types ts
cd climatales-ar

# Step 3: Install dependencies
npm install mind-ar three clsx tailwind-merge
npm install -D tailwindcss@3 postcss autoprefixer vite-plugin-pwa @tailwindcss/forms
npx tailwindcss init -p

# Step 4: Install shadcn-svelte
npx shadcn-svelte@latest init
```

---

## Project Structure to Create

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/          # shadcn components
│   │   ├── ar/          # ARViewer, AROverlay
│   │   ├── quiz/        # QuizQuestion, QuizFeedback
│   │   ├── video/       # VideoCard
│   │   └── layout/      # BottomNav, Header
│   ├── stores/          # Svelte 5 runes stores
│   ├── utils/           # storage.ts, audio.ts
│   ├── data/            # pages.ts, quizzes.ts, videos.ts
│   └── types/           # TypeScript interfaces
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte     # Home
│   ├── ar/+page.svelte
│   ├── quiz/+page.svelte
│   └── videos/+page.svelte
└── app.css
```

---

## Critical Rules

1. **Svelte 5 runes only** - Use `$state()`, `$derived()`, `$effect()`, NOT legacy stores
2. **Tailwind v3 only** - NOT v4 syntax
3. **Use brand.json values** - Don't invent colors/fonts
4. **TypeScript required** - All files must be typed

---

## Phase Priority

**For POC (Feb 7)** - Get these working first:
1. Project setup with Tailwind themed to brand.json
2. Basic navigation (Home → AR/Quiz/Video)
3. AR camera opens and detects ONE image target
4. Shows overlay when image detected

**Later phases**: Quiz logic, Video mode, PWA offline, Polish

---

## Key Code Patterns

### Svelte 5 Store (user.svelte.ts)
```typescript
import { storage } from '$lib/utils/storage';

let userName = $state(storage.getUser()?.name ?? '');

export function setUserName(name: string) {
  userName = name;
  storage.setUser({ name });
}

export { userName };
```

### MindAR Setup (ARViewer.svelte)
```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
  
  let container: HTMLDivElement;
  let mindar: any;
  
  onMount(async () => {
    mindar = new MindARThree({
      container,
      imageTargetSrc: '/targets/storybook.mind',
    });
    
    const { renderer, scene, camera } = mindar;
    const anchor = mindar.addAnchor(0);
    
    // Add content to anchor.group here
    
    await mindar.start();
    renderer.setAnimationLoop(() => renderer.render(scene, camera));
  });
  
  onDestroy(() => mindar?.stop());
</script>

<div bind:this={container} class="w-full h-full"></div>
```

### Tailwind Config with Brand Tokens
```javascript
// tailwind.config.js
const brand = require('./brand.json');

module.exports = {
  content: ['./src/**/*.{html,svelte,js,ts}'],
  theme: {
    extend: {
      colors: {
        canopy: brand.colors.core.primary.hex,
        ocean: brand.colors.core.secondary.hex,
        coral: brand.colors.core.accent.hex,
        // ... map all brand colors
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
        accent: ['Baloo 2', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        button: '12px',
      },
    },
  },
  plugins: [],
};
```

---

## Start Now

Begin by:
1. Reading `brand.json`
2. Creating the SvelteKit project
3. Setting up Tailwind with brand colors
4. Creating the basic route structure
5. Building the BottomNav component

Report progress after each phase. **GO!**
