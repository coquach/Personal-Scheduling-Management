# Personal Scheduling Management (PSMS)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Playwright](https://img.shields.io/badge/Playwright-E2E-green?logo=playwright)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=github-actions)

PSMS is a modern, production-ready personal scheduling management application built with **Next.js 16 (App Router)** and **React 19**. It features a rich dashboard for managing appointments, calendars, reminders, and notifications. 

This project demonstrates clean architecture, robust state management, and a highly reliable testing infrastructure using Playwright BDD.

## ✨ Core Features

- **🗓️ Smart Calendar & Scheduling:** 
  - Manage personal and team appointments.
  - Interactive drag-and-drop calendar interface powered by `@schedule-x/calendar`.
  - Advanced time conflict detection and recurring event logic.
- **🔔 Intelligent Reminders & Notifications:** 
  - Granular notification settings (global and chat-specific).
  - Push notifications and real-time alerts.
- **📊 Analytics & Productivity:** 
  - Real-time user statistics and productivity tracking.
  - Bento-styled profile infrastructure and advanced tagging system.

## 🏗️ Architecture & Tech Stack Highlights

This project avoids generic MVC patterns in favor of modern frontend architecture:

- **State Management Separation:** 
  - **Server State:** Handled by `TanStack Query` for robust caching, background updates, and revalidation.
  - **Client State:** Powered by `@preact/signals` for lightweight, reactive, and thread-safe UI updates without unnecessary re-renders.
- **100% Type-Safe Forms:** End-to-end type safety using `Zod` schemas for both frontend validation (`react-hook-form`) and backend API payload verification.
- **Testing Trophy Strategy:** Minimal implementation-coupled unit tests. Heavy emphasis on **End-to-End (E2E) testing via Playwright** (mocking APIs in-browser) to guarantee high confidence for a "Release-Ready" status.
- **Styling:** `Tailwind CSS v4` combined with `Shadcn UI` for a scalable, accessible, and highly customizable design system.

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher

### Installation & Local Development

1. **Clone the repository and install dependencies:**
   ```bash
   npm ci
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   *Default configurations:*
   - `NEXT_PUBLIC_PSMS_API_URL=http://localhost:4000/api/v1`
   - `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000`

3. **Install Playwright Browsers (for local E2E):**
   ```bash
   npx playwright install chromium
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🧪 Testing

The testing suite heavily relies on Playwright to ensure UI reliability. The backend API is mocked directly in the browser during tests.

- `npm run test:e2e` - Run Playwright E2E tests in headless mode.
- `npm run test:e2e:ui` - Open Playwright UI mode for debugging.
- `npm run test` - Run Jest unit and integration tests only.

## 🚢 CI/CD & Deployment

This repository is equipped with an automated GitHub Actions CI/CD pipeline (`.github/workflows/ci-cd.yml`):

- **CI:** On `push` or `pull_request` to `main`, the pipeline automatically builds the Next.js app, runs ESLint, Jest, and Playwright E2E tests. Playwright artifacts are uploaded automatically on failure.
- **CD (Vercel):** Upon a successful build on `main`, the application is automatically deployed to Vercel (Requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` in repository secrets).

## 🤝 Contributing Guidelines

We welcome contributions! To maintain the quality of the project, please adhere to the following rules:

1. **Conventional Commits:** All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification (e.g., `feat:`, `fix:`, `chore:`).
2. **Testing Mandate:** Before opening a Pull Request, you **MUST** ensure all tests pass locally. Run `npm run test:e2e` and ensure 100% P0 test coverage is maintained.
3. **CI/CD Checks:** GitHub Actions will strictly block any PR that fails linting, type-checking, or E2E tests. Please review the pipeline logs if your PR is blocked.

---
*Built with ❤️ utilizing Next.js 16 and modern React ecosystem.*
