# 6. Responsive and Multi-Device Strategy

Date: 2026-05-25
Status: Accepted

## Context
The "Premium Bento Box" UI architecture defined in ADR 0001 heavily relies on spacious layout elements—such as a floating dock and a wide context sidebar. While these look spectacular on desktop and tablet monitors, they are physically impossible to fit on a mobile screen (< 768px width) without drastically breaking usability. We need a robust strategy to seamlessly morph the UI into a native-mobile experience when viewed on smaller devices.

## Decision
We have adopted a **"Morph-to-Native" Responsive Strategy** for all core layout components:

1. **Floating Dock ➡️ Bottom Tab Bar**:
   - On desktop, the main navigation is a `Floating Dock` hovering elegantly near the bottom center of the screen.
   - On mobile screens (`< 768px`), this dock will morph into a **Native-like Bottom Tab Bar**. It will snap flush to the bottom edge (`bottom: 0`), stretch to 100% width, remove its bottom rounded corners, and justify its icons evenly. This preserves precious vertical screen real estate for the calendar while mirroring standard iOS/Android UX patterns.

2. **Bento Sidebar ➡️ Swipe-up Bottom Sheet**:
   - On desktop, "Today's Agenda" and context tools live in a persistent, togglable `Bento Sidebar` on the right side of the screen.
   - On mobile screens, the sidebar will be completely extracted from the horizontal layout flow. Instead, it will be rendered as a **Swipe-up Bottom Sheet**. Triggered via a floating action button or header icon, it will slide up from the bottom of the screen, overlaying the calendar. This allows for quick, glanceable access to the day's tasks before being swiped away naturally by the user's thumb.

3. **Calendar Grid Adaptive Views**:
   - The `@schedule-x/react` grid component will be configured to default to `Day View` or `Agenda View` on mobile viewports. Rendering a full `Month View` on a narrow screen creates impossibly small hit-targets for touch interactions and will be restricted.

## Consequences
- **Positive:** Users experience a fully optimized, touch-friendly, native-feeling mobile interface without us needing to maintain a separate React Native codebase.
- **Positive:** Critical screen real estate is preserved entirely for the core functional component (the Calendar).
- **Negative/Risk:** The code complexity within the Layout components (`AppShell`, `FloatingDock`, `BentoSidebar`) increases significantly, as they must handle complex CSS media queries and potentially disparate Framer Motion animation variants to handle the morphing effects.
