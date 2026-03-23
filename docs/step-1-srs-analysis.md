# Step 1: SRS Analysis

## Sources Reviewed

- `document/COS Document/1-COS Vision and Scope.docx`
- `document/COS Document/2-COS Business Rules.docx`
- `document/COS Document/3-COS Use Cases.docx`
- `document/COS Document/4-COS SRS.docx`
- `document/Backlog/Project Infomation.docx`
- `document/Backlog/*.xlsx`
- `document/Diagram/**/*.puml`
- `document/MockupUI/wireframes/*.md`
- `document/MockupUI/html/*.html`

Binary `.docx`, `.xlsx`, and `.png` assets were reviewed through their extracted text or matching textual source files (`.puml`, `.md`, `.html`) so the implementation can stay source-backed.

## Source Precedence

When documents disagree, use this order:

1. SRS
2. Use Cases
3. Business Rules
4. Sequence/Class diagrams
5. Wireframes/HTML mockups
6. Vision and Scope / backlog artifacts

This keeps tests aligned to the most explicit behavioral requirements.

## Confirmed Product Features

### Core release scope for implementation and Playwright coverage

- Authentication: register, login, logout, forgot password, reset password, profile management.
- Appointment management: create, update, delete, list, search, filter, status updates.
- Recurring appointments: daily, weekly, monthly with instance-vs-series decisions on edit/delete.
- Calendar views: Day, Week, Month, Agenda.
- Tags: create, rename, delete, assign to appointments.
- Reminders: multiple reminders per appointment, snooze, notification log.
- Statistics: completion rate, appointments by tag, productive time slots, period switching.
- Export: filtered CSV export with preview/count.
- Responsive authenticated web UI with stable feedback states.

### Secondary scope present in UI docs but under-specified in SRS

- Profile timezone and default calendar preference.
- Avatar upload.
- Delete account flow.
- Reminder defaults page and default snooze duration.
- Notification bulk actions: mark all as read, clear all.

These should be treated as P1 unless a later step re-prioritizes them.

## Primary User Flows

1. Register account -> verify success banner -> return to login.
2. Login -> redirect to calendar dashboard -> navigate via sidebar/top nav.
3. Open appointment form from calendar or appointments page -> create appointment -> view it in calendar/list.
4. Edit appointment -> resolve recurrence scope when needed -> persist changes.
5. Delete appointment -> confirm delete -> handle single instance vs entire series.
6. Search/filter appointments -> clear filters -> return to default data set.
7. Create/manage tags -> use tags for filtering and appointment organization.
8. Add reminders -> receive notification -> snooze or dismiss -> inspect notification history.
9. Open statistics dashboard -> change time period -> inspect updated analytics or empty state.
10. Apply export filters -> preview matching rows -> download CSV.
11. Open profile -> update personal info/password/preferences.

## Edge Cases and Failure Paths

- Duplicate email on registration.
- Invalid login credentials or unverified account.
- Forgot-password email not found.
- Expired or invalid reset token.
- Appointment start after end.
- Appointment start in the past.
- Overlapping appointment on create/update.
- Invalid recurrence rule or invalid recurrence end condition.
- Recurring update/delete must ask for single instance vs whole series.
- No search results.
- Duplicate tag name.
- Reminder scheduled after appointment start.
- Empty statistics data set.
- Empty export result.
- Authenticated-only routes must reject unauthenticated access.
- API failure states must preserve form input and show actionable feedback.

## Document Conflicts and Decisions

### 1. Calendar scope conflict

- `Vision and Scope` says Release 1 includes Day/Week and Release 2 adds Month/Agenda.
- `SRS`, `Use Cases`, diagrams, and wireframes all require Day/Week/Month/Agenda now.
- Decision: implement and test all four views.

### 2. Appointment status conflict

- `BR-14` says Completed/Pending.
- `SRS` data model and functional requirements include `SCHEDULED`, `COMPLETED`, `CANCELLED`, and `MISSED`.
- Decision: keep the model/test contract on `SCHEDULED | COMPLETED | CANCELLED | MISSED`. The first UI slice can expose completed/pending semantics while preserving room for cancelled/missed.

### 3. Reminder email support conflict

- Reminder settings wireframe shows email reminder opt-in.
- `SRS` communications interfaces say email reminder integration is a future release.
- Decision: do not require live email reminder delivery in the initial Playwright suite. If shown in UI, treat it as disabled or informational.

### 4. Profile and account settings depth

- SRS only commits to viewing/updating non-critical profile info.
- Wireframes add timezone, password update, default view preference, and delete account.
- `DI-2` explicitly requires cascading removal when an account is deleted.
- Decision: treat password update as P0 profile coverage, and timezone/default view/delete account as P1 until implementation begins.

### 5. Offline draft recovery

- `ROB-1` requires local draft recovery during connectivity loss.
- No wireframe or use case describes the recovery UI.
- Decision: document as deferred robustness coverage; do not block the first app slice on it.

## Route Contract for the App Router

These route names are implementation inferences from the documents and are now the proposed UI contract for later steps:

- `/auth`
- `/forgot-password`
- `/reset-password`
- `/calendar`
- `/appointments`
- `/tags`
- `/reminders`
- `/notifications`
- `/statistics`
- `/export`
- `/profile`

## API Mocking Contract for Tests

The Playwright suite should mock frontend API traffic and never call a real backend. Initial endpoint contract inferred from the sequence diagrams:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/logout`
- `GET /profile`
- `PUT /profile`
- `PUT /profile/password`
- `DELETE /profile`
- `GET /appointments`
- `POST /appointments`
- `PUT /appointments/:id`
- `DELETE /appointments/:id`
- `PATCH /appointments/:id/status`
- `POST /appointments/:id/recurrence`
- `POST /appointments/:id/reminders`
- `POST /reminders/:id/snooze`
- `GET /notifications`
- `PATCH /notifications/mark-all-read`
- `DELETE /notifications`
- `GET /tags`
- `POST /tags`
- `PUT /tags/:id`
- `DELETE /tags/:id`
- `GET /statistics`
- `GET /appointments/export`

## Recommended Step 2 Focus

- Scaffold the project into `/app`, `/components`, `/lib`, `/api`, `/query`, `/tests`, `/docs`.
- Install and configure Playwright before feature implementation.
- Build a shared mock data model that covers appointments, tags, reminders, notifications, and statistics.
- Add `data-testid` contracts that match the cases defined in `tests/e2e/srs-test-cases.ts`.
