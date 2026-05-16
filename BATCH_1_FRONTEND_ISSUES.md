# 🎮 Batch 1: Frontend UI/UX Issues (LitRPG Design System)
**Status Panels, Components, and Animations**

---

## Issue #1: Dark Mode Design System Foundation

**Complexity: 100 Points**

### Description
Establish the core dark mode color palette and Tailwind configuration that defines the entire LitRPG aesthetic. This is the foundation all other components will build upon.

### Requirements and context

**Why this matters:**  
Every component depends on a consistent dark mode theme. Without it, contributors will create inconsistent UIs. This sets the visual language for the entire project.

**What "done" looks like:**
- Tailwind configuration file (`tailwind.config.ts`) with custom dark mode palette
- Custom colors: neon accents (cyan, magenta, lime), true blacks, metallic grays
- CSS variables for glow effects and borders
- All colors tested in browser at `localhost:3000`
- Documentation of the palette (which color is "primary health bar", "secondary UI", etc.)

**Design constraints:**
- Use true black (`#000000`) for backgrounds, not gray
- Neon accent colors: `#00D9FF` (cyan), `#FF006E` (magenta), `#CCFF00` (lime)
- No rounded corners on primary surfaces (hard sci-fi aesthetic)

### Suggested execution

1. Fork the repo and create a branch: `git checkout -b feature/dark-mode-palette`
2. Key files to touch:
   - `frontend/tailwind.config.ts` — add custom theme colors and CSS variables
   - `frontend/src/globals.css` — define glow effects, gradients, borders (e.g., `@apply border-neon-cyan`)
   - `frontend/src/app/page.tsx` — create a simple demo page showing all palette colors

3. Implementation guidelines:
   - Use Tailwind's `extend` to add custom colors without overwriting defaults
   - Create utility classes for common patterns: `.text-neon-primary`, `.border-scan`, `.bg-deep-void`
   - Document color usage in a comment block at the top of `tailwind.config.ts`

### Test and commit

- Open `localhost:3000` and verify all neon colors render crisply
- Add a Storybook-like demo page or color grid showing all palette tokens
- Commit with: `feat: establish dark mode color palette and Tailwind config`

### Example commit message
```
feat: establish dark mode color palette and Tailwind config

- Add custom Tailwind theme with neon accents (cyan, magenta, lime)
- Define glow and scan-line CSS variables for LitRPG effects
- Create demo page showcasing all palette tokens
```

**Guidelines:**
- Assignment required before starting
- PR description must include: `Closes #1`

---

## Issue #2: Status Panel Component (Health Bar / Mana Bar)

**Complexity: 150 Points**

### Description
Build a reusable `<StatusPanel />` component that displays animated progress bars (health, mana, XP, balance, etc.) with the LitRPG aesthetic. This is a core building block for the Loot Vault UI.

### Requirements and context

**Why this matters:**  
Status panels appear everywhere in the UI: vault balance display, freelancer reputation, job progress, yield accumulation. A polished, reusable component eliminates duplication and ensures consistency.

**What "done" looks like:**
- React component accepting `value`, `maxValue`, `label`, `color` props
- Animated progress bar filling/depleting smoothly (using Framer Motion)
- Glowing border effect when value changes
- Responsive: works on mobile and desktop
- TypeScript-typed with full prop documentation
- Storybook story or demo page showing 3+ variants (health, mana, balance)

**Design constraints:**
- No rounded corners (hard sci-fi look)
- Glowing border on the bar itself
- Text label on the left, percentage value on the right
- Animation duration: 0.6s for smooth fill

### Suggested execution

1. Fork the repo and create a branch: `git checkout -b feature/status-panel-component`
2. Key files to touch:
   - `frontend/src/components/StatusPanel.tsx` — component logic and styling
   - `frontend/src/app/page.tsx` — demo page or Storybook integration
   - `frontend/src/components/index.ts` — export the component

3. Implementation guidelines:
   - Use Framer Motion's `AnimatePresence` and `motion.div` for smooth transitions
   - Leverage Tailwind utility classes for the glow effect (from Issue #1)
   - Accept color as a string prop that maps to Tailwind classes
   - Include a `label` prop for accessibility (aria-label)

### Test and commit

- Verify animation plays smoothly at various values (0%, 50%, 100%)
- Test on mobile (iPhone SE, iPad) — bar should resize correctly
- Commit with: `feat: add reusable StatusPanel component with animations`

### Example commit message
```
feat: add reusable StatusPanel component with animations

- Create StatusPanel component with animated progress bars
- Integrate Framer Motion for smooth fill transitions
- Add demo showing health, mana, and balance variants
- Fully typed with TypeScript and accessible labels
```

**Guidelines:**
- Assignment required before starting
- PR description must include: `Closes #2`

---

## Issue #3: Animated Modal / Popup System

**Complexity: 150 Points**

### Description
Build a flexible modal component with entrance/exit animations that fits the LitRPG aesthetic (sliding, glitch effects, glow in/out).

### Requirements and context

**Why this matters:**  
Modals are used for wallet connection, job details, yield claim confirmations, and error messages. A unified system ensures a polished, immersive experience.

**What "done" looks like:**
- Reusable `<Modal />` component with open/close state management
- Framer Motion entrance animation (slide up + fade in)
- Glitch/scan-line effect during entrance
- Backdrop blur with click-to-close
- Accept custom content via `children` prop
- TypeScript-typed
- Demo showing 2 variants: confirmation modal, job details modal

**Design constraints:**
- Entrance animation: 400ms slide-up + fade-in with scan-line pulse
- Exit animation: fade-out + slide-down (faster, 200ms)
- Backdrop: semi-transparent with blur filter
- Modal width: 90vw max, 500px on desktop

### Suggested execution

1. Fork the repo and create a branch: `git checkout -b feature/animated-modal-system`
2. Key files to touch:
   - `frontend/src/components/Modal.tsx` — component and portal rendering
   - `frontend/src/app/page.tsx` — demo with multiple triggers
   - `frontend/src/hooks/useModal.ts` — custom hook for open/close state (optional)

3. Implementation guidelines:
   - Use React Portal for modal rendering outside the normal DOM hierarchy
   - Leverage Framer Motion `AnimatePresence` for conditional rendering
   - Add scan-line overlay CSS animation (keyframes) for the glitch effect
   - Use `useEffect` to disable body scroll when modal is open

### Test and commit

- Open multiple modals in sequence and verify animations don't stutter
- Test on mobile — modal should be readable and scrollable if content overflows
- Commit with: `feat: build animated modal system with LitRPG effects`

### Example commit message
```
feat: build animated modal system with LitRPG effects

- Create reusable Modal component with Framer Motion animations
- Add scan-line glitch effect on entrance
- Implement Portal-based rendering and backdrop blur
- Include demo showing confirmation and details modals
```

**Guidelines:**
- Assignment required before starting
- PR description must include: `Closes #3`

---

## Issue #4: Loot Pool Countdown Timer Widget

**Complexity: 150 Points**

### Description
Build a countdown timer component displaying time remaining until the next Loot Vault winner draw. Should feature a circular progress ring and pulsing glow effects.

### Requirements and context

**Why this matters:**  
The countdown is prominent on the main dashboard and creates urgency/excitement around yield draws. A visually impressive timer increases engagement and user retention.

**What "done" looks like:**
- React component accepting `endTime` (Unix timestamp) prop
- Circular SVG progress ring (filled based on time remaining)
- Large countdown text in center: "HH:MM:SS"
- Glowing border effect that pulses as time runs out (final 10 seconds)
- Updates every second without re-rendering the whole page
- Responsive: looks good on mobile and desktop
- TypeScript-typed

**Design constraints:**
- SVG progress ring (not canvas) for clarity
- Ring color: cyan (`#00D9FF`) with glow
- Final 10 seconds: pulse effect (glow intensity increases)
- Text size: adjusts to container width

### Suggested execution

1. Fork the repo and create a branch: `git checkout -b feature/countdown-timer-widget`
2. Key files to touch:
   - `frontend/src/components/CountdownTimer.tsx` — component logic
   - `frontend/src/app/page.tsx` — demo with hardcoded future timestamp
   - `frontend/src/hooks/useCountdown.ts` — custom hook for time calculation

3. Implementation guidelines:
   - Use `setInterval` to update time every second (memoize to avoid re-renders)
   - Calculate SVG stroke-dashoffset to animate ring fill
   - Use Tailwind's animation classes for the pulse effect
   - Format time with a helper function: `formatCountdown(ms)` → "02:34:18"

### Test and commit

- Verify timer counts down correctly (check terminal clock vs component clock)
- Test edge cases: 59 seconds remaining, 1 second, time elapsed (show "DRAW!" or similar)
- Test on mobile — ring should be visible and proportional
- Commit with: `feat: add countdown timer widget with glowing progress ring`

### Example commit message
```
feat: add countdown timer widget with glowing progress ring

- Create CountdownTimer component with SVG progress ring
- Implement pulsing glow effect in final 10 seconds
- Add useCountdown hook for efficient time calculations
- Include demo with future timestamp
```

**Guidelines:**
- Assignment required before starting
- PR description must include: `Closes #4`

---

## Issue #5: Quest Board Table Component (Mercenary Jobs List)

**Complexity: 200 Points**

### Description
Build a data table displaying active freelance jobs (Mercenary Board escrows). Should be sortable, filterable, and responsive with LitRPG styling.

### Requirements and context

**Why this matters:**  
The Quest Board is the central hub for the Mercenary Board protocol. A well-designed, performant table is critical to UX. Contributors must handle data fetching, sorting, pagination, and responsive design.

**What "done" looks like:**
- React table component displaying job data (title, client, bounty, status, deadline)
- Sort by bounty amount, deadline, status
- Filter by status: "Open", "In Progress", "Completed", "Disputed"
- Pagination: 10 rows per page (or lazy loading)
- Row click → opens Modal with job details
- Responsive: collapses to card view on mobile
- TypeScript-typed and fully accessible (ARIA labels, keyboard nav)
- Connected to mock data (no live Soroban calls yet—that's a later issue)

**Design constraints:**
- No rounded corners; use hard borders with neon glow
- Hover effect on rows: glow intensifies, slight scale
- Status badges with color coding: "Open" = cyan, "Completed" = lime, "Disputed" = magenta
- Mobile breakpoint: stack rows as cards, hide some columns

### Suggested execution

1. Fork the repo and create a branch: `git checkout -b feature/quest-board-table`
2. Key files to touch:
   - `frontend/src/components/QuestBoardTable.tsx` — table component
   - `frontend/src/hooks/useQuestBoard.ts` — data sorting/filtering logic
   - `frontend/src/app/page.tsx` — demo with mock job data
   - `frontend/src/types/index.ts` — define `Job` interface

3. Implementation guidelines:
   - Use React hooks (`useState`, `useCallback`) for sort/filter state
   - Create a custom `useSorted` hook to keep logic reusable
   - Build mobile view as a separate Card component that reuses row data
   - Accept mock data via props (connection to Soroban comes later)

### Test and commit

- Sort by bounty: verify descending and ascending work
- Filter by status: verify only matching rows display
- Pagination: test navigation between pages
- Mobile test: open on iPhone; cards should stack cleanly
- Keyboard test: tab through rows, space/enter to expand modal
- Commit with: `feat: build quest board table with sort, filter, responsive design`

### Example commit message
```
feat: build quest board table with sort, filter, responsive design

- Create QuestBoardTable component with sortable columns
- Implement status filtering (Open, In Progress, Completed, Disputed)
- Add pagination (10 rows/page) and mobile card view
- Include mock data for demo and full accessibility support
```

**Guidelines:**
- Assignment required before starting
- PR description must include: `Closes #5`

---

## Issue #6: Framer Motion Animation Primitives Library

**Complexity: 200 Points**

### Description
Create a collection of reusable Framer Motion animation variants (entrance, exit, hover effects) packaged as an exportable utility module that other components can consume.

### Requirements and context

**Why this matters:**  
Consistency in animations across the entire UI requires a shared library of motion presets. Without this, animations become a bottleneck and inconsistent. This accelerates future component development.

**What "done" looks like:**
- Motion utilities file: `frontend/src/lib/motionVariants.ts`
- Exported animation sets:
  - Entrance: `fadeInUp`, `slideInFromLeft`, `scaleIn`, `glitchEnter`
  - Exit: `fadeOutDown`, `slideOutToRight`, `scaleOut`
  - Hover: `hoverGlow`, `hoverScale`, `hoverPulse`
  - Staggered container animations: for lists of items
- Full TypeScript typing (return `Variants` type from Framer Motion)
- Demo page showing all animations in action
- Exported from `frontend/src/index.ts` for easy importing

**Design constraints:**
- All animations should respect the LitRPG aesthetic (no bounce easing, prefer `easeInOut`)
- Durations: entrances 400ms, exits 200ms, hovers 300ms (configurable)
- Stagger delay between child items: 50ms

### Suggested execution

1. Fork the repo and create a branch: `git checkout -b feature/motion-primitives-library`
2. Key files to touch:
   - `frontend/src/lib/motionVariants.ts` — animation definitions
   - `frontend/src/app/demo-motion.tsx` — demo page
   - `frontend/src/index.ts` or `frontend/src/lib/index.ts` — export all variants

3. Implementation guidelines:
   - Use Framer Motion's `Variants` type for strict typing
   - Group animations by category (entrance, exit, etc.)
   - Include a config object for durations (allow override)
   - Add JSDoc comments explaining each variant's visual effect

### Test and commit

- Verify all animations play smoothly without jank
- Test on low-end device (Chrome DevTools throttle) — should still feel responsive
- Test stagger delays: 5-item list should stagger visibly
- Commit with: `feat: create Framer Motion animation primitives library`

### Example commit message
```
feat: create Framer Motion animation primitives library

- Add motionVariants.ts with entrance, exit, hover, stagger animations
- Provide fully typed Variants for TypeScript consumers
- Include demo page showcasing all animation sets
- Establish consistent easing and timing across the app
```

**Guidelines:**
- Assignment required before starting
- PR description must include: `Closes #6`

---

## Issue #7: Wallet Connection UI (Freighter Integration Panel)

**Complexity: 150 Points**

### Description
Build a wallet connection UI component that prompts users to connect their Freighter wallet, displays connected account info, and provides disconnect functionality.

### Requirements and context

**Why this matters:**  
Wallet connection is the gateway to all on-chain interactions. A polished UI sets the tone for the entire experience and builds trust with users unfamiliar to Web3.

**What "done" looks like:**
- React component with two states: disconnected and connected
- Disconnected state: large button "Connect Freighter Wallet" with instructions
- Connected state: displays account address (truncated), network indicator, balance placeholder
- Styled with LitRPG theme (glowing borders, dark background)
- Error handling: show message if Freighter is not installed
- TypeScript-typed
- Mobile-responsive

**Design constraints:**
- No rounded corners; hard sci-fi aesthetic
- Connected account shown with monospace font (looks like a system ID)
- Network indicator: testnet = magenta, mainnet = cyan (when mainnet support is added)
- Button should show loading state while connecting

### Suggested execution

1. Fork the repo and create a branch: `git checkout -b feature/wallet-connection-ui`
2. Key files to touch:
   - `frontend/src/components/WalletConnection.tsx` — component
   - `frontend/src/contexts/WalletContext.tsx` — state management (optional, basic version)
   - `frontend/src/app/page.tsx` — demo

3. Implementation guidelines:
   - Use a simple `useState` for connected/loading/error states
   - Don't call Freighter API yet (that's a separate issue)—stub the `connectWallet()` function
   - Display placeholder account address (e.g., "GAAA...BBBB")
   - Show network from Freighter (testnet by default)

### Test and commit

- Verify UI renders in both connected and disconnected states
- Test mobile responsiveness: text should not overflow
- Commit with: `feat: build wallet connection UI component`

### Example commit message
```
feat: build wallet connection UI component

- Create WalletConnection component with connect/disconnect states
- Display truncated account address and network indicator
- Add error message for missing Freighter extension
- LitRPG-themed with glowing borders and monospace typography
```

**Guidelines:**
- Assignment required before starting
- PR description must include: `Closes #7`

---

## Issue #8: Glitch/Scan-Line CSS Effects Module

**Complexity: 100 Points**

### Description
Create a reusable CSS module exporting glitch and scan-line animations that can be applied to any element. Build the "visual language" of LitRPG malfunction/system startup effects.

### Requirements and context

**Why this matters:**  
Glitch effects are iconic to the LitRPG aesthetic. Packaging them as reusable CSS classes lets other components easily add visual flair without duplicating keyframes.

**What "done" looks like:**
- CSS file: `frontend/src/styles/glitchEffects.css` (or Tailwind config extension)
- Exported utility classes:
  - `.glitch` — random color shifts and horizontal displacement
  - `.scan-lines` — horizontal scan-line overlay
  - `.screen-flicker` — opacity flicker
  - `.distort` — slight skew/perspective distortion
- Each effect is 300-500ms duration, looping or one-shot variant
- Demo page in Next.js showing effect applied to text and boxes
- Fully commented explaining each keyframe

**Design constraints:**
- Use CSS `@keyframes`, not JavaScript (performance)
- Glitch displacement: ±2-4px horizontal offset
- Scan-line height: 2-3px, semi-transparent
- Effects should be subtle (not nauseating)

### Suggested execution

1. Fork the repo and create a branch: `git checkout -b feature/glitch-scanline-effects`
2. Key files to touch:
   - `frontend/src/styles/glitchEffects.css` — keyframe definitions
   - `frontend/src/app/demo-glitch.tsx` — demo page
   - `frontend/tailwind.config.ts` — extend with animation utilities (optional)

3. Implementation guidelines:
   - Define base `@keyframes` for each effect in CSS
   - Create utility classes that apply `animation` property
   - Use CSS variables for durations (allow easy customization)
   - Add one-shot and looping variants (e.g., `.glitch`, `.glitch-once`)

### Test and commit

- Verify glitch effect on multiple elements (text, boxes, buttons)
- Test performance: apply effect to 10+ elements, verify no stuttering
- Test on mobile: effect should still play smoothly
- Commit with: `feat: add glitch and scan-line CSS effects module`

### Example commit message
```
feat: add glitch and scan-line CSS effects module

- Create reusable @keyframes for glitch, scan-lines, flicker, distort
- Export utility classes for easy application to any element
- Include demo page with effects on text and box elements
- Optimize for performance using pure CSS (no JavaScript)
```

**Guidelines:**
- Assignment required before starting
- PR description must include: `Closes #8`

---

## Issue #9: Responsive Grid Layout for Inventory / Asset Display

**Complexity: 150 Points**

### Description
Build a responsive grid layout component for displaying user assets (vault balances, job earnings, NFTs, etc.) in a card format that adapts from 1 column (mobile) to 3-4 columns (desktop).

### Requirements and context

**Why this matters:**  
Users need to see their assets at a glance on any device. A flexible grid component saves time for future dashboard screens and ensures consistent spacing/alignment.

**What "done" looks like:**
- React component: `<AssetGrid />` accepting array of asset objects
- Responsive: 1 col on mobile, 2 cols on tablet, 3-4 cols on desktop
- Each card displays: asset name, amount/value, icon, status badge
- Cards have hover effect (glow intensifies)
- Auto-wrapping: no manual layout needed
- Fully TypeScript-typed
- Demo with 12 mock assets

**Design constraints:**
- No rounded corners (hard sci-fi)
- Card gap: 16px, consistent padding
- Card height: fixed (prevents layout shift on load)
- Responsive breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)

### Suggested execution

1. Fork the repo and create a branch: `git checkout -b feature/asset-grid-layout`
2. Key files to touch:
   - `frontend/src/components/AssetGrid.tsx` — grid component
   - `frontend/src/components/AssetCard.tsx` — individual card component
   - `frontend/src/app/page.tsx` — demo with mock assets
   - `frontend/src/types/index.ts` — define `Asset` interface

3. Implementation guidelines:
   - Use CSS Grid with `auto-fit` or `auto-fill` for responsive columns
   - Leverage Tailwind's `grid-cols-1` `md:grid-cols-2` `lg:grid-cols-3` pattern
   - Memoize card components (`React.memo`) to prevent unnecessary re-renders
   - Build AssetCard as a separate, reusable component

### Test and commit

- Test responsive breakpoints: resize browser, verify columns change
- Test with empty state (0 assets) and overflow (20+ assets)
- Test on actual mobile device (not just browser resize)
- Commit with: `feat: build responsive asset grid layout component`

### Example commit message
```
feat: build responsive asset grid layout component

- Create AssetGrid component with responsive columns (1/2/3/4)
- Build reusable AssetCard sub-component with hover effects
- Add demo with 12 mock assets showing various states
- Use CSS Grid with Tailwind responsive utilities
```

**Guidelines:**
- Assignment required before starting
- PR description must include: `Closes #9`

---

## Issue #10: Accessibility Audit & ARIA Label Implementation

**Complexity: 100 Points**

### Description
Audit the existing frontend components for accessibility compliance (WCAG 2.1 Level AA) and add missing ARIA labels, semantic HTML, and keyboard navigation support.

### Requirements and context

**Why this matters:**  
Accessibility ensures Loot Vault is usable by everyone, including people with disabilities. It's also legally important and improves overall UX for all users. A polished open-source project demonstrates professional standards.

**What "done" looks like:**
- Audit existing components (`StatusPanel`, `Modal`, `QuestBoardTable`, etc.) for accessibility issues
- Add `aria-label`, `aria-describedby`, `role` attributes where needed
- Ensure keyboard navigation works (Tab, Shift+Tab, Enter, Space, Escape)
- Test with screen reader (NVDA on Windows or VoiceOver on Mac)
- Fix color contrast issues (minimum WCAG AA: 4.5:1 for text)
- Update components with semantic HTML (`<button>` instead of `<div onclick>`)
- Document accessibility patterns in a new `ACCESSIBILITY.md` file

**Design constraints:**
- No ARIA attributes should be added to interactive elements without semantic meaning (e.g., use `<button>` not `<div role="button">`)
- Focus indicators should be visible (border, outline, or shadow)
- All buttons must have descriptive labels (no icon-only buttons without aria-label)

### Suggested execution

1. Fork the repo and create a branch: `git checkout -b feature/accessibility-audit`
2. Key files to touch:
   - All component files (`StatusPanel.tsx`, `Modal.tsx`, etc.)
   - `frontend/src/globals.css` — add focus styles
   - New file: `frontend/ACCESSIBILITY.md` — document patterns and guidelines
   - Update `frontend/src/app/layout.tsx` — add lang attribute to `<html>`

3. Implementation guidelines:
   - Use browser DevTools Lighthouse accessibility audit as a starting point
   - Test with `axe DevTools` Chrome extension for automated checks
   - Manually test with screen reader on at least one component
   - Fix low-contrast colors by adjusting Tailwind palette if needed

### Test and commit

- Run Lighthouse audit: target 90+ accessibility score
- Use axe DevTools to verify no critical/serious violations
- Test keyboard navigation on at least 3 components (should Tab through logically)
- Commit with: `feat: audit accessibility and add ARIA labels`

### Example commit message
```
feat: audit accessibility and add ARIA labels (WCAG 2.1 AA)

- Add ARIA labels, roles, and descriptions to all interactive components
- Implement keyboard navigation (Tab, Enter, Space, Escape)
- Fix color contrast issues to meet WCAG AA minimum (4.5:1)
- Use semantic HTML (button, a, form) instead of divs
- Add ACCESSIBILITY.md with patterns and guidelines
```

**Guidelines:**
- Assignment required before starting
- PR description must include: `Closes #10`

---

## Summary

**Batch 1 Total: 10 Issues, 1,500 Points**

| Issue | Title | Points |
|-------|-------|--------|
| #1 | Dark Mode Design System Foundation | 100 |
| #2 | Status Panel Component | 150 |
| #3 | Animated Modal System | 150 |
| #4 | Loot Pool Countdown Timer | 150 |
| #5 | Quest Board Table Component | 200 |
| #6 | Framer Motion Animation Primitives | 200 |
| #7 | Wallet Connection UI | 150 |
| #8 | Glitch/Scan-Line Effects Module | 100 |
| #9 | Responsive Grid Layout | 150 |
| #10 | Accessibility Audit & ARIA Labels | 100 |

---

**Next Steps:**
- Create these as GitHub issues in the repo
- Tag with labels: `drips-wave`, `frontend`, `good-first-issue`, `ui-component`
- Ping contributors and announce Batch 1 on socials/Discord
- Track completed issues for contributor leaderboard

