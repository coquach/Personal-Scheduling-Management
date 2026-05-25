# 1. Premium Bento UI Architecture & Calendar Integration

Date: 2026-05-25
Status: Accepted

## Context
The Personal Scheduling Management System (PSMS) requires a highly engaging, modern user interface that stands out from standard corporate calendar applications (like Google Calendar or Outlook). The previous wireframes utilized a traditional static sidebar and topbar layout which felt safe but lacked a premium, modern feel. 

Furthermore, the core calendar logic is handled by `@schedule-x/react`. This library is robust but outputs a DOM structure and default UI that mimics standard, flat web calendars. We needed a strategic approach to merge an ambitious visual aesthetic with the technical constraints of the chosen calendar library without reinventing the wheel.

## Decision
We have decided to adopt a **Premium Bento Box & Floating Elements** visual direction, supported by the following structural and technical decisions:

1. **Layout Paradigm**: We are discarding the static left sidebar. Primary navigation will be handled by a bottom/side **Floating Dock** (glassmorphism style). Context-heavy information (Tags, Today's Agenda) will be housed in a **Toggable Bento Sidebar** (right-aligned) that floats off the edge of the screen to maintain an airy feel.
2. **Motion & Interactions**: We will implement **Fluid Modals** (modals that expand seamlessly from the clicked target using backdrop blur) and **Physics-based Drag-and-Drop** (elements tilt and cast deeper shadows when dragged) to provide a highly tactile, app-like experience.
3. **Calendar Integration (Aggressive Overriding)**: Instead of building a complex calendar grid from scratch, we will retain `@schedule-x/react` for its date math and overlap resolution. However, we will:
   - **Aggressively override** its default CSS variables and class names using Tailwind CSS v4 and vanilla CSS to inject our Bento Box aesthetics (large border-radii, floating gaps, soft backgrounds).
   - **Disable** the library's built-in event creation and edit popups.
   - Intercept `onEventClick` and `onDateClick` events to render our own custom Fluid Modals using Shadcn UI and modern animation patterns (e.g., Framer Motion / View Transitions API).

## Consequences
- **Positive**: We achieve a visually distinctive, state-of-the-art UI that wows users, while safely offloading complex, error-prone calendar logic to a proven library.
- **Negative/Risk**: Upgrading `@schedule-x/react` in the future carries the risk of breaking our custom CSS overrides if their internal DOM structure or class names change. This will require manual UI regression testing during version bumps.
- **Negative/Risk**: We must build and maintain custom forms for event creation/editing that manually sync state back into the Schedule-X instance, which adds frontend complexity.
