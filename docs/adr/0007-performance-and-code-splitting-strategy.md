# 7. Performance and Code Splitting Strategy

Date: 2026-05-25
Status: Accepted

## Context
The PSMS frontend employs heavy dependencies to deliver its "Premium Bento Box" experience, including `@schedule-x/react` (for complex calendar grids and date math), `react-hook-form` and `zod` (for complex form validation), and `framer-motion` (for fluid animations). Bundling all of these dependencies into the initial page load would result in a massive JavaScript payload, causing severe delays in the Time to Interactive (TTI), particularly on slower networks or mobile devices. We need a strategy to achieve an instant perceived load time without sacrificing UI fluidity or features.

## Decision
We have adopted a highly aggressive code-splitting architecture composed of two core techniques:

1. **Deferred Interactive Loading**:
   - We will aggressively utilize `next/dynamic` (or `React.lazy`) to code-split massive UI components that are not immediately necessary for the first paint.
   - **The Calendar Grid:** The `@schedule-x/react` instance will be lazy-loaded. During its fetch phase, a premium Skeleton UI will be displayed within the Bento box to provide immediate visual feedback without blocking the main thread.
   - **The Fluid Modal (Event Form):** The component responsible for the appointment creation form (containing Zod, react-hook-form, and complex DatePickers) will **not** be included in the initial page bundle. This significantly slims down the core dashboard's footprint.

2. **Hover-Intent Prefetching**:
   - Lazy loading the Fluid Modal introduces a UX risk: a 100-300ms network delay when the user clicks the "Create Event" button, which breaks the "premium" 60FPS illusion.
   - To counteract this, we implement **Hover-Intent Prefetching**. By binding the dynamic `import()` call to the `onMouseEnter` or `onFocus` events of the "Create Event" trigger button, the system will begin downloading the JavaScript chunk in the background *before* the user actually clicks.
   - Because human reaction time (from hover to click) averages 200-400ms, this golden window usually provides enough time for the chunk to finish downloading, resulting in a **0ms delay** when the click event finally fires.

## Consequences
- **Positive:** Exceptional First Contentful Paint (FCP) and Time to Interactive (TTI) scores, as the initial JavaScript bundle is kept incredibly lean.
- **Positive:** The application feels instantaneously responsive, gracefully masking the complexity and weight of the underlying dependencies via psychological trickery (hover-intent).
- **Negative/Risk:** Developers must meticulously manage `next/dynamic` imports and ensure hover-intent handlers are properly attached to all interactive triggers. If an intent-prefetch is missed, the user experiences an ungraceful stutter upon clicking.
