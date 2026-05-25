# 2. Frontend State Management & Form Architecture

Date: 2026-05-25
Status: Accepted

## Context
The PSMS frontend requires a highly interactive "Premium Bento Box" UI with custom Fluid Modals for appointment manipulation. This ambition creates two major technical challenges:
1. Frequent, rapid state updates for UI interactions (like modal X/Y positioning and drag-and-drop shadows) which could cause unacceptable re-renders if managed improperly, especially given the heavy DOM structure of the underlying `@schedule-x/react` calendar.
2. High complexity in data entry for recurring events, tags, and reminders, which risks overwhelming the user if presented in a single dense form.

## Decision
We decided to adopt a **hybrid state management strategy** combined with a **Progressive Disclosure** UX pattern:

1. **State Management Boundary (Signal-driven UI + React Query Sync)**:
   - **Client/UI State**: We will use `@preact/signals` strictly for ephemeral, high-frequency UI states (e.g., Fluid Modal coordinates, toggle states, layout transitions). Signals allow bypassing the React render tree, ensuring the heavy Calendar Grid remains running smoothly at 60 FPS.
   - **Server State**: We will use `@tanstack/react-query` exclusively for async data fetching and mutation (creating/updating appointments). Once a mutation succeeds, React Query will invalidate the cache, triggering a sync with the Schedule-X internal state manager.

2. **Form Architecture & Validation**:
   - We strictly adhere to the `react-hook-form` and `zod` stack (with schemas residing in `model/validation/`).
   - **UX Pattern**: We will implement **Progressive Disclosure in a Single-Pane Bento**. The appointment creation modal will initially present only core fields (Title, Start/End times). Advanced features (Recurrence rules, Reminders, Multi-select Tags) will be hidden behind smooth, expanding accordions or "More options" toggles. This prevents cognitive overload while avoiding the friction of a multi-step wizard.

3. **Color Philosophy**:
   - **Monochrome Core & Vivid Pastel Accents**: The core layout relies on clean Slate/Zinc gradients and glassmorphism. Functional data (Tags, Event Chips, Badges) will use carefully curated Vivid Pastels (Lavender, Mint, Soft Coral, Ice Blue) to ensure rapid visual scanning without eye fatigue during prolonged use.

## Consequences
- **Positive:** UI components remain highly decoupled. The calendar never needlessly re-renders during modal interactions or typing.
- **Positive:** Users experience a minimalist interface that gracefully scales to complex workflows.
- **Negative/Risk:** Developers must be disciplined in not leaking server data into Signals, or UI state into React Query. The boundary must be strictly maintained or state desynchronization will occur.
