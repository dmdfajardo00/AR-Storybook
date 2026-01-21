# ClimaTales AR - Progress Checklist

> Track your progress by checking off completed items. Update this file as you go.

---

## 📅 Timeline
- **POC Demo**: February 7, 2025
- **Final Deadline**: February 28, 2025
- **Estimated Hours**: 60-80 hours

---

## Phase 1: Project Foundation ⏱️ ~4 hours
**Target**: Day 1-2

- [ ] Initialize SvelteKit 5 project with TypeScript
- [ ] Install Tailwind CSS v3 and PostCSS
- [ ] Configure tailwind.config.js with brand.json tokens
- [ ] Set up CSS variables in app.css from brand.json
- [ ] Add Google Fonts (Fredoka, Nunito, Baloo 2)
- [ ] Install shadcn-svelte and initialize
- [ ] Create folder structure (components, stores, utils, data, types)
- [ ] Install vite-plugin-pwa (configure later)
- [ ] Verify dev server runs without errors

**Phase 1 Complete**: [ ] Date: ______

---

## Phase 2: Design System & UI ⏱️ ~8 hours
**Target**: Day 3-5

### shadcn Components (customize to brand)
- [ ] Button - primary, secondary, accent, ghost variants
- [ ] Card - with proper shadow and border-radius
- [ ] Input - with focus states matching brand
- [ ] Badge - success, warning, error, info, primary

### Custom Components
- [ ] BottomNav.svelte - AR/Quiz/Video tabs with active state
- [ ] Header.svelte - page title, back button when needed
- [ ] LoadingSpinner.svelte - branded spinner
- [ ] Mascot.svelte - Terra character display
- [ ] AudioButton.svelte - speaker icon, plays audio
- [ ] PageTransition.svelte - fade/slide transitions

**Phase 2 Complete**: [ ] Date: ______

---

## Phase 3: State Management ⏱️ ~4 hours
**Target**: Day 5-6

### Utilities
- [ ] storage.ts - localStorage wrapper with type safety
- [ ] audio.ts - audio playback utilities

### Svelte 5 Stores (runes)
- [ ] user.svelte.ts - name, session info
- [ ] quiz.svelte.ts - takes, scores, current progress
- [ ] ar.svelte.ts - detected page, overlay visibility
- [ ] app.svelte.ts - current mode, loading states

### Features
- [ ] Auto-save to localStorage on state change
- [ ] Load persisted data on app init
- [ ] Quiz resume functionality logic

**Phase 3 Complete**: [ ] Date: ______

---

## Phase 4: Data Layer ⏱️ ~3 hours
**Target**: Day 6-7

### TypeScript Types
- [ ] User interface
- [ ] Page interface (storybook page)
- [ ] QuizQuestion interface
- [ ] QuizTake interface
- [ ] Video interface

### Data Files
- [ ] pages.ts - 10 storybook pages with:
  - [ ] Page ID, title, description
  - [ ] Explanation text (for AR overlay)
  - [ ] Audio file reference
  - [ ] Model/image reference
- [ ] quizzes.ts - questions per page:
  - [ ] Question text
  - [ ] 3 answer options
  - [ ] Correct answer ID
- [ ] videos.ts - YouTube links:
  - [ ] Carbon Cycle videos
  - [ ] Human Actions videos
  - [ ] Climate Change videos

**Phase 4 Complete**: [ ] Date: ______

---

## Phase 5: Core Pages ⏱️ ~4 hours
**Target**: Day 7-8

- [ ] +layout.svelte - root layout with BottomNav
- [ ] Home (+page.svelte):
  - [ ] Welcome message
  - [ ] Name input field
  - [ ] Persist name to storage
  - [ ] Show greeting if name exists
- [ ] Route structure:
  - [ ] /ar - AR mode
  - [ ] /quiz - Quiz mode
  - [ ] /videos - Video mode
- [ ] Navigation working between all routes
- [ ] Active tab indicator on BottomNav

**Phase 5 Complete**: [ ] Date: ______

---

## Phase 6: AR Mode ⚠️ CRITICAL ⏱️ ~16 hours
**Target**: Day 8-12

### Setup
- [ ] Install mind-ar and three packages
- [ ] Create mindar.ts utility for initialization
- [ ] Handle MindAR types (may need declarations)

### ARViewer Component
- [ ] Camera permission request
- [ ] Permission denied fallback UI
- [ ] MindAR initialization
- [ ] Camera stream display
- [ ] Loading state while AR initializes

### Image Detection
- [ ] Load .mind target file
- [ ] Detect when image is found
- [ ] Detect when image is lost
- [ ] Update ar.svelte.ts store on detection

### Overlay System
- [ ] AROverlay.svelte component
- [ ] Position overlay on detected image
- [ ] Show explanation text box
- [ ] Show 2D image or 3D model
- [ ] Audio narration button
- [ ] "Next" button navigation

### Testing
- [ ] Test with placeholder image
- [ ] Test with actual storybook page scan
- [ ] Test on mobile device (Chrome Android)
- [ ] Test on iOS Safari

**🎯 POC MILESTONE**: AR camera opens, detects image, shows overlay

**Phase 6 Complete**: [ ] Date: ______

---

## Phase 7: Quiz Mode ⏱️ ~12 hours
**Target**: Day 12-15

### Quiz Flow
- [ ] Quiz landing - show available quizzes or continue
- [ ] QuizQuestion.svelte - question card with styling
- [ ] QuizOption.svelte - answer options A/B/C
- [ ] Selection state (highlight selected)
- [ ] Submit answer logic

### Feedback
- [ ] QuizFeedback.svelte - correct/incorrect display
- [ ] Correct: yellow blob, celebration animation, "YOU GOT IT RIGHT!"
- [ ] Incorrect: red blob, wiggle animation, "TRY AGAIN"
- [ ] Next question button (on correct)
- [ ] Retry button (on incorrect)

### Progress & Scoring
- [ ] QuizProgress.svelte - progress indicator
- [ ] Track current question number
- [ ] Calculate and store score
- [ ] Quiz results page
- [ ] Display score and summary

### Take System
- [ ] Create new "take" when starting quiz
- [ ] Save progress after each answer
- [ ] Resume incomplete take
- [ ] View historical takes and scores

**Phase 7 Complete**: [ ] Date: ______

---

## Phase 8: Video Mode ⏱️ ~4 hours
**Target**: Day 15-16

- [ ] Video page with gradient background (from brand)
- [ ] VideoCard.svelte - glassmorphism style
- [ ] Three categories displayed:
  - [ ] Carbon Cycle
  - [ ] Human Actions
  - [ ] Climate Change
- [ ] Download/link icon
- [ ] Open YouTube in new tab on click
- [ ] Optional: YouTube embed player

**Phase 8 Complete**: [ ] Date: ______

---

## Phase 9: PWA & Offline ⏱️ ~4 hours
**Target**: Day 16-17

- [ ] Configure vite-plugin-pwa in vite.config.ts
- [ ] Create manifest.json with:
  - [ ] App name, short_name
  - [ ] Theme color (Canopy Green)
  - [ ] Background color
  - [ ] Icons (multiple sizes)
  - [ ] Display: standalone
- [ ] Configure service worker caching:
  - [ ] Cache static assets
  - [ ] Cache .mind target files
  - [ ] Cache 3D models
  - [ ] Cache audio files
- [ ] Test offline mode
- [ ] Add install prompt (optional)

**Phase 9 Complete**: [ ] Date: ______

---

## Phase 10: Polish & Testing ⏱️ ~8 hours
**Target**: Day 17-20

### Responsive Design
- [ ] Test on small phones (320px width)
- [ ] Test on medium phones (375px)
- [ ] Test on large phones (414px)
- [ ] Test on tablets (768px)

### Performance
- [ ] Lazy load AR components
- [ ] Optimize 3D model file sizes
- [ ] Check bundle size
- [ ] Lighthouse audit

### Accessibility
- [ ] Focus states on all interactive elements
- [ ] ARIA labels where needed
- [ ] Color contrast check
- [ ] Keyboard navigation

### Error Handling
- [ ] Camera permission denied
- [ ] AR initialization failure
- [ ] Storage quota exceeded
- [ ] Network errors (offline)

### Final Polish
- [ ] Animation timing refinement
- [ ] Loading states everywhere
- [ ] Empty states
- [ ] Consistent spacing

**Phase 10 Complete**: [ ] Date: ______

---

## Phase 11: Deployment ⏱️ ~2 hours
**Target**: Day 20-21

- [ ] Build production bundle
- [ ] Test production build locally
- [ ] Deploy to Vercel/Netlify
- [ ] Verify HTTPS (required for camera)
- [ ] Test deployed version on phone
- [ ] Write README with:
  - [ ] Setup instructions
  - [ ] How to generate .mind files
  - [ ] How to add content
- [ ] Client handoff

**Phase 11 Complete**: [ ] Date: ______

---

## 🏁 Project Complete!

**Final Delivery Date**: ______

**Notes**:
_______________________________________
_______________________________________
_______________________________________

---

## 🐛 Issues & Blockers Log

| Date | Issue | Resolution |
|------|-------|------------|
| | | |
| | | |
| | | |

---

## 📊 Time Tracking

| Phase | Estimated | Actual |
|-------|-----------|--------|
| Phase 1 | 4h | |
| Phase 2 | 8h | |
| Phase 3 | 4h | |
| Phase 4 | 3h | |
| Phase 5 | 4h | |
| Phase 6 | 16h | |
| Phase 7 | 12h | |
| Phase 8 | 4h | |
| Phase 9 | 4h | |
| Phase 10 | 8h | |
| Phase 11 | 2h | |
| **Total** | **69h** | |
