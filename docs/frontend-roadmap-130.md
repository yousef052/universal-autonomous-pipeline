# Enterprise Frontend Architect (Modern Web 130-Step Master Roadmap)

This document provides the complete, unabridged **130-Step Engineering Master Roadmap** for constructing, auditing, and defending flagship **Modern Frontend Applications** (React / Next.js / TypeScript), aligned strictly with the five core pillars of frontend engineering excellence.

---

## 🏛️ The 5 Pillars of Enterprise Frontend Engineering

- **[PERF] Performance & Core Web Vitals:** Sub-second Largest Contentful Paint (LCP < 2.0s), zero layout shifts (CLS < 0.05), instant Interaction to Next Paint (INP < 150ms), route-level dynamic chunking, tree-shaking, DOM virtualization, and memory leak prevention.
- **[A11Y] Accessibility & Inclusivity:** Strict WCAG 2.2 AA conformance, semantic HTML5 landmarks, comprehensive ARIA live regions, focus trap containment, screen reader announcements, and 4.5:1 / 3:1 accessible color contrast ratios.
- **[SEC] Frontend Security & Zero-Trust Boundary:** In-memory token management with HttpOnly cookie rotation to defeat XSS, DOMPurify sanitization, hardened Content Security Policy (CSP), anti-clickjacking headers, and client-side payload boundary validation.
- **[REL] Reliability & State Resilience:** Granular React Error Boundaries with isolated fallback states, stale-while-revalidate server state caching (TanStack Query), optimistic UI mutations with automated rollback, and offline-first recovery.
- **[OPS] Operational Excellence, DX & Governance:** Strict TypeScript configurations (`strict: true`, `noUncheckedIndexedAccess`), Design Token governance (Tailwind/CSS Variables), Storybook documentation, and automated Playwright E2E and visual regression pipelines.

---

## 🗺️ The Complete 130-Step Master Roadmap

---

### Phase 0: System Architecture, UX Blueprint & Visual Diagrams (Steps 0.1–0.10)
*Executed at the very start before writing a single line of component code. Generates architectural specifications and user journeys in `/docs`.*

0.1. **[OPS]** Define the **Product Scope, User Personas**, and core value delivery milestones across responsive viewports.  
0.2. **[OPS, A11Y]** Document **Granular User Journeys** with explicit happy paths, edge cases, error states, and empty states.  
0.3. **[PERF, REL]** Establish measurable **Client-Side Service Level Objectives (SLOs)**: LCP < 2.0s, INP < 150ms, CLS = 0, initial bundle < 120KB gzipped.  
0.4. **[OPS]** Author **C4 Client-Context Diagram** (in Mermaid.js) mapping browser clients, CDN edge, BFF / Web APIs, and third-party SaaS integrations.  
0.5. **[OPS, REL]** Author **State Machine Transition Diagrams** (using Mermaid stateDiagram) for high-complexity interactive flows (e.g. Multi-step checkout, Onboarding).  
0.6. **[SEC, REL]** Author **Authentication & Token Lifecycle Sequence Diagram** illustrating silent refresh, multi-tab sync, and session expiration.  
0.7. **[OPS]** Formulate the **Information Architecture (IA)** and Page Routing Tree mapping URL slugs to layouts, loaders, and auth requirements.  
0.8. **[OPS]** Establish Design Token Taxonomy: define semantic scales for colors, typography, spacing, shadows, and z-index layers.  
0.9. **[OPS]** Establish `/docs/architecture` inside the repository as the living home for diagrams, wireframes, and ADRs.  
0.10. **[OPS]** Author Architecture Decision Record **ADR-001** justifying the chosen rendering strategy (CSR vs SSR vs ISR/SSG) and state architecture against engineering pillars.

> **Phase 0 Starter Prompt:**
> ```markdown
> Role: Principal Frontend Architect & Design Systems Lead.
> Strict Rules:
> 1. Work strictly one micro-step/document per response. Explain WHY (UX, accessibility, performance, security) BEFORE every artifact.
> 2. Zero-compromise TypeScript + Modern React / Next.js standards.
> 3. Use Mermaid.js syntax for all visual diagrams so they render natively in GitHub Markdown.
> 
> Project Idea: [Insert frontend project concept]
> 
> Task: We are starting Phase 0 (Steps 0.1–0.10): System Architecture & UX Blueprint. Break Steps 0.1 to 0.10 down into concrete micro-steps and wait for my approval to start Step 0.1.
> ```

---

### Phase 1: Tooling Foundation, Code Standards & Design Tokens (Steps 1–10)
1. **[OPS]** Initialize repository with strict **TypeScript Configuration** (`strict: true`, `noUncheckedIndexedAccess`, `isolatedModules`, `verbatimModuleSyntax`).
2. **[OPS]** Configure package manager governance (`pnpm` or `npm workspaces`) with locked engine versions and dependency audits.
3. **[OPS]** Configure **ESLint + Prettier** with strict rules: `@typescript-eslint/recommended-type-checked`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-react-hooks`.
4. **[OPS]** Configure strict import boundaries enforcing **Clean Frontend Architecture** (Layered: `domain`, `application`, `ui/components`, `infrastructure/api`).
5. **[OPS]** Setup path aliases (`@/components`, `@/features`, `@/hooks`, `@/lib`, `@/types`) in `tsconfig.json` and bundler config.
6. **[PERF, OPS]** Configure **Tailwind CSS / CSS Variables Design Token System** encapsulating semantic color tokens with HSL color-mix for automatic dark mode.
7. **[OPS]** Implement standardized **Z-Index Layer Hierarchy** (`tokens/z-index.ts`) to permanently eradicate arbitrary `z-50` or `z-9999` bugs.
8. **[OPS, REL]** Configure global environment variable parsing using `@t3-oss/env-core` or **Zod** to catch missing API keys during build/startup.
9. **[PERF]** Configure modern bundler (Vite or Next.js Turbopack) with visual bundle analyzer plugins to monitor chunk sizes.
10. **[A11Y, OPS]** Configure automated accessibility linter (`jsx-a11y`) to throw hard build errors on missing alt tags, invalid roles, or broken keyboard handlers.

---

### Phase 2: Domain Modeling, Contracts & Type Safety (Steps 11–20)
11. **[OPS, REL]** Define core immutable domain models as TypeScript `type` / `interface` primitives with branded types for IDs (`type OrderId = string & { readonly brand: unique symbol }`).
12. **[SEC, REL]** Author **Zod Validation Schemas** for every domain model, establishing a runtime validation firewall against backend payload drift.
13. **[REL]** Model complex UI component states using **Discriminated Unions** (`type ViewState = { status: 'idle' } | { status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: T }`) eliminating impossible boolean states (`isLoading && isError`).
14. **[REL, OPS]** Implement functional **Result / Either Pattern** (`Result<T, AppError>`) for predictable client-side error handling without unhandled promise rejections.
15. **[OPS]** Establish standardized `AppError` taxonomy: `NetworkError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`.
16. **[SEC, OPS]** Implement safe URL parameter builders and search param parsers with runtime type coercion using Zod.
17. **[OPS]** Build centralized HTTP Client abstraction (`apiClient`) with standardized request/response interceptors and typed abort signals.
18. **[REL]** Enforce strict `AbortSignal` propagation across all API service functions to cancel in-flight requests on component unmount.
19. **[OPS]** Implement deterministic Date/Time formatting utilities using native `Intl.DateTimeFormat` with explicit timezone and locale safety.
20. **[OPS]** Setup contract-driven Mock Service Worker (MSW) handlers to enable autonomous frontend development against offline API contracts.

---

### Phase 2.5: Design Tokens, Layout Grid & Component Hierarchy (Steps 2.5.1–2.5.10)
*Executed after Phase 2 (Domain contracts) and before Phase 3 (UI component implementation).*

2.5.1. **[A11Y, OPS]** Define accessible fluid typography scale with clamped font sizing (`clamp()`) for seamless responsive scaling.  
2.5.2. **[A11Y]** Audit and enforce WCAG 2.2 color contrast ratios: 4.5:1 for body copy and 3:1 for graphical UI elements in light and dark palettes.  
2.5.3. **[OPS]** Build the **Master Application Layout Shell** containing responsive Header, Collapsible Sidebar, Main Content, and Footer.  
2.5.4. **[A11Y]** Implement accessible **"Skip to Main Content"** link as the first focusable element for keyboard and screen-reader users.  
2.5.5. **[PERF]** Implement zero-flash light/dark theme provider injecting early blocking script to eliminate the Flash of Unstyled Theme (FOUT/FOUC).  
2.5.6. **[OPS]** Build the **Component Hierarchy Tree** mapping atomic primitives to compound layout widgets and full feature screens.  
2.5.7. **[A11Y]** Establish standardized **Keyboard Focus Ring System** (`focus-visible:ring-2 focus-visible:ring-offset-2`) across all interactive targets.  
2.5.8. **[OPS]** Define responsive breakpoints grid standard (`sm`, `md`, `lg`, `xl`, `2xl`) and enforce mobile-first CSS utility rules.  
2.5.9. **[PERF, OPS]** Document component composition guidelines: prefer slot pattern / children composition over deep prop-drilling.  
2.5.10. **[OPS]** Author `/docs/design-system/tokens.md` detailing full token specifications and responsive layout rules.

> **Phase 2.5 Transition Prompt:**
> ```markdown
> --- CHECKPOINT: PHASE 2 COMPLETED ---
> Current State: Phase 0 Blueprint, Phase 1 Tooling foundation, and Phase 2 Domain abstractions & Zod runtime contracts are complete.
> Rules Reminder: One artifact/micro-step per response + explain WHY (a11y, layout stability, responsive behavior) first.
> 
> Next Task: Before writing UI primitives in Phase 3, branch Phase 2.5 (Steps 2.5.1–2.5.10): Design Tokens, Layout Grid & Component Hierarchy into concrete micro-steps and wait for my approval.
> ```

---

### Phase 3: Core UI Primitives & Headless Atomic Components (Steps 21–30)
21. **[A11Y, OPS]** Build headless primitive foundation using **Radix UI / React Aria** to guarantee accessibility compliance out-of-the-box.
22. **[A11Y, OPS]** Implement accessible **Button / IconButton** with explicit states (idle, loading, disabled, pressed) and ARIA attributes (`aria-busy`).
23. **[A11Y, REL]** Build **Modal Dialog** component featuring automated focus trap, focus restoration on close, and escape key listener.
24. **[A11Y]** Build accessible **Dropdown Menu & Select** primitives with full arrow-key keyboard navigation and `aria-activedescendant`.
25. **[A11Y]** Build accessible **Tabs** component conforming to WAI-ARIA tab pattern (`tablist`, `tab`, `tabpanel`) with manual/automatic selection.
26. **[A11Y, OPS]** Implement **Toast Notification System** leveraging `aria-live="polite"` / `role="status"` with stacked timer dismissal.
27. **[A11Y, REL]** Build accessible **Tooltip & Popover** primitives featuring collision detection, boundary flipping, and arrow indicators.
28. **[PERF, A11Y]** Build customizable **Skeleton Loader** primitives mirroring final UI dimensions to eliminate Cumulative Layout Shift (CLS).
29. **[OPS]** Implement polymorphic component capability (`asChild` pattern) allowing clean composition without redundant wrapping `<div>`s.
30. **[A11Y]** Implement custom accessible **Checkbox, Switch, and RadioGroup** primitives with native keyboard spacebar toggles.

---

### Phase 4: Data-Fetching Layer, Server State & Cache Invalidation (Steps 31–40)
31. **[PERF, REL]** Configure **TanStack Query (React Query)** with production defaults: explicit `staleTime`, `gcTime`, and non-blocking background refetching.
32. **[OPS]** Build centralized **Query Key Factory** (`queryKeys`) enforcing strictly typed, hierarchical query keys to prevent invalidation leaks.
33. **[SEC, REL]** Enforce automated **Zod Validation** inside query functions, catching breaking API changes before they reach components.
34. **[REL, PERF]** Implement **Optimistic UI Mutations** with automated rollback (`onMutate`, `onError`, `onSettled`) for instant sub-50ms UI feedback.
35. **[REL]** Implement targeted **Cache Invalidation & Direct Cache Updates** (`queryClient.setQueryData`) to avoid redundant server roundtrips.
36. **[PERF]** Build infinite scrolling & cursor-based pagination hook (`useInfiniteQuery`) with scroll position restoration.
37. **[REL]** Configure automated network retry strategy with exponential backoff and jitter for transient 5xx server errors.
38. **[PERF]** Implement client-side request deduplication and query cancellation bound to component unmounting via `AbortController`.
39. **[REL]** Build **Offline Mutation Queue** storing critical actions locally and synchronizing upon network reconnection.
40. **[PERF]** Implement strategic **Query Prefetching** on button hover / route link prefetch to deliver instant page transitions.

---

### Phase 5: Authentication, Session Lifecycle & Secure Storage (Steps 41–50)
41. **[SEC]** Implement secure token architecture: store short-lived Access Tokens **strictly in memory** (React state/closure) and Refresh Tokens in **HttpOnly, Secure, SameSite=Strict cookies**.
42. **[SEC]** Build Axios / Fetch **Silent Refresh Interceptor**: automatically pause queued requests, refresh the token via refresh endpoint, and replay failed calls.
43. **[SEC]** Implement **Cross-Tab Session Synchronization** using `BroadcastChannel` or `storage` events to synchronize login/logout across all open tabs.
44. **[SEC]** Build **Inactivity / Idle Auto-Logout Hook** terminating sessions after prolonged user inactivity with early warning prompt.
45. **[SEC]** Implement strict **Input Sanitization** utilizing **DOMPurify** before rendering any user-generated HTML, completely blocking stored XSS.
46. **[SEC, REL]** Implement **PKCE (Proof Key for Code Exchange)** authorization code flow for third-party OAuth2 authentication.
47. **[SEC]** Build authenticated user context provider exposing `user`, `isAuthenticated`, `roles`, and `permissions` securely.
48. **[SEC]** Implement secure **Logout Routine**: invalidate server-side refresh tokens, wipe client memory state, and clear query cache.
49. **[SEC]** Sanitize client-side error telemetry to ensure auth tokens, passwords, and sensitive PII are stripped before logging.
50. **[SEC, OPS]** Build password strength indicator evaluating entropy, common dictionary passwords, and complexity rules.

---

### Phase 6: Authorization, RBAC & Client-Side Route Guards (Steps 51–60)
51. **[SEC]** Design declarative Role-Based (`RBAC`) and Permission-Based (`PBAC`) authorization model.
52. **[SEC, OPS]** Build `<Can />` or `<Authorize />` permission boundary component to conditionally render UI actions based on user permissions.
53. **[SEC]** Build high-order component (HOC) or custom hook (`usePermission('orders:write')`) for conditional programmatic logic.
54. **[SEC, REL]** Build **Protected Route Guard Component** intercepting unauthorized navigation and redirecting to login with a preserved `returnUrl`.
55. **[SEC]** Enforce Defense-in-Depth UI Masking: hide privileged UI elements while acknowledging client-side checks can be bypassed, ensuring server enforcement.
56. **[SEC]** Build dedicated **Forbidden (403)** and **Not Found (404)** page layouts with contextual back-navigation buttons.
57. **[SEC]** Enforce anti-tampering guards: validate URL parameter IDs against current user permissions to eliminate client-side IDOR attempts.
58. **[PERF, SEC]** Implement permission-aware route prefetching: skip prefetching routes and data chunks the user is not authorized to visit.
59. **[OPS]** Build administrative role switcher / impersonation banner for multi-tenant and support debugging in staging environments.
60. **[SEC]** Configure client-side **Content Security Policy (CSP)** meta tags restricting frame ancestors to block UI Redressing (Clickjacking).

---

### Phase 7: Forms, Schema Validation & User Experience (Steps 61–70)
61. **[PERF, OPS]** Standardize on **React Hook Form** with uncontrolled inputs to eliminate unnecessary re-renders on every keystroke.
62. **[SEC, REL]** Integrate **Zod Resolver** (`@hookform/resolvers/zod`) to unify client and API contract validation rules.
63. **[A11Y]** Connect form inputs to error messages via `aria-invalid` and `aria-describedby` pointing to error element IDs.
64. **[UX, A11Y]** Implement auto-focus on the first invalid field upon form submission to assist keyboard and screen reader users.
65. **[UX, REL]** Implement **Unsaved Changes Navigation Blocker**: warn users with an accessible prompt before they discard dirty form state.
66. **[PERF]** Implement **Debounced Async Field Validation** (e.g. check username availability) with loading spinners and abort signals.
67. **[UX]** Build **Multi-Step Form Wizard** with persistent step state in URL or session storage, allowing back-and-forth review.
68. **[UX, REL]** Implement formatted numeric, phone, and currency mask inputs with non-destructive cursor positioning.
69. **[UX, REL]** Build accessible, drag-and-drop **File Upload** component with client-side mime-type validation, size limits, and image previews.
70. **[UX, PERF]** Provide immediate inline feedback upon field blur (`mode: 'onBlur'`) instead of frustrating aggressive validation on initial keystroke.

---

### Phase 8: Performance Engineering, Web Vitals & Optimization (Steps 71–80)
71. **[PERF]** Implement **Route-Level Code Splitting** via `React.lazy()` / `next/dynamic` with Suspense fallbacks.
72. **[PERF]** Implement **Component & Heavy Library Lazy Loading** (e.g. charts, rich text editors) loading only when scrolled into view.
73. **[PERF]** Implement **DOM Virtualization** for lists exceeding 50 items using `@tanstack/react-virtual` to keep DOM nodes < 1500.
74. **[PERF]** Optimize Web Fonts using `font-display: swap`, local subsetting (woff2), and preloading critical font weights to eliminate layout shift.
75. **[PERF]** Enforce responsive image optimization: modern formats (AVIF/WebP), explicit `width`/`height` attributes, and `loading="lazy"`.
76. **[PERF]** Add `fetchpriority="high"` and preload tags on above-the-fold hero images to crush Largest Contentful Paint (LCP < 2.0s).
77. **[PERF]** Prevent layout instability: reserve explicit aspect-ratio containers for dynamic banners and asynchronous ad/widget slots (CLS = 0).
78. **[PERF]** Optimize expensive computations using `useMemo` and stable callbacks using `useCallback`, verified with React Profiler.
79. **[PERF]** Audit event listeners and subscriptions (`window.addEventListener`, intervals, websockets) ensuring clean teardown in `useEffect`.
80. **[PERF, COST]** Configure bundle size budgets (`bundlesize` or `@next/bundle-analyzer`) failing CI builds if JS chunk exceeds 150KB.

---

### Phase 9: Telemetry, Observability & Error Boundaries (Steps 81–90)
81. **[REL]** Build **Granular Error Boundary Hierarchy**: Root App Boundary, Route-Level Boundary, and Widget/Component-Level Boundary.
82. **[REL, UX]** Design user-friendly Error Fallback UI with contextual retry action (`resetErrorBoundary()`) and error report feedback form.
83. **[OPS]** Configure client-side telemetry integration (Sentry / Datadog / OpenTelemetry) capturing uncaught errors with component stack traces.
84. **[OPS]** Build **Trace Context Propagator**: inject `X-Correlation-ID` into all outgoing API requests to trace user actions through microservices.
85. **[OPS, SEC]** Configure telemetry data scrubbers: redact credit cards, passwords, tokens, and PII from breadcrumbs and stack traces.
86. **[PERF, OPS]** Implement **Core Web Vitals Telemetry Reporter** (`web-vitals` library) streaming real-user LCP, INP, and CLS to analytics.
87. **[REL, UX]** Build **Offline Detection Banner** monitoring `navigator.onLine` and informing users when operating in degraded offline mode.
88. **[OPS]** Implement custom client logger (`logger.info`, `logger.warn`, `logger.error`) disabled in production except for fatal exceptions.
89. **[REL]** Implement unhandled promise rejection and global error event listeners (`window.onerror`) routing to central error boundary.
90. **[REL]** Build self-healing session recovery: automatically purge corrupt local cache and reload if consecutive fatal startup crashes occur.

---

### Phase 10: Automated Testing, Visual Regression & Accessibility (Steps 91–100)
91. **[REL, OPS]** Configure **Vitest / Jest** with `@testing-library/react` and `jsdom` for blazingly fast unit and integration testing.
92. **[REL]** Write unit tests for custom hooks (`renderHook`) asserting state transitions, error recovery, and unmount cleanup.
93. **[A11Y, REL]** Write component integration tests targeting the accessibility tree using `getByRole('button', { name: ... })` (no test IDs).
94. **[A11Y]** Integrate **`jest-axe` / `axe-core`** to run automated WCAG 2.2 accessibility audits against all component test suites.
95. **[REL, OPS]** Configure **Playwright** for End-to-End (E2E) testing across Chromium, Firefox, and WebKit on responsive viewports.
96. **[REL]** Author E2E test suites for critical revenue paths: User Authentication, Checkout/Payment Flow, and Form Submissions.
97. **[OPS]** Implement automated **Visual Regression Testing** (Playwright screenshots or Percy) capturing pixel-level UI regressions.
98. **[A11Y]** Author automated keyboard navigation E2E tests asserting tab index sequences, focus containment, and modal escapes.
99. **[REL, OPS]** Configure MSW in integration tests to simulate server delays, 500 errors, and malformed payloads, asserting fallback states.
100. **[OPS]** Configure CI pipeline to execute tests concurrently and enforce **>85% coverage threshold** on domain logic and utility modules.

---

### Phase 11: Production Hardening, CI/CD, Storybook & Developer Portal (Steps 11.1–11.10)
*Executed after Phase 10 as the professional project capstone for engineering leads and technical interviews.*

11.1. **[OPS]** Author **Architecture Decision Records (ADRs 001–005)** documenting key trade-offs (State Architecture, Design System Tokens, Silent Refresh, Server vs Client Rendering, TanStack Query Cache Strategy).  
11.2. **[OPS]** Build comprehensive **Storybook Documentation Catalog** showcasing every atomic component with interactive controls, themes, and viewport toggles.  
11.3. **[A11Y, OPS]** Integrate `@storybook/addon-a11y` inside Storybook to provide live accessibility feedback during UI development.  
11.4. **[COST, SEC]** Write **Multi-Stage Production `Dockerfile`** using non-root Nginx or Node alpine image, stripping source code and dev dependencies.  
11.5. **[SEC, OPS]** Configure production **Nginx / Edge Headers**: enforce strict `Content-Security-Policy`, `HSTS`, `X-Content-Type-Options: nosniff`, and `Permissions-Policy`.  
11.6. **[PERF, COST]** Configure static asset caching rules: 1-year immutable cache headers (`Cache-Control: public, max-age=31536000, immutable`) for hashed assets, `no-cache` for `index.html`.  
11.7. **[OPS, REL]** Build **GitHub Actions CI/CD Pipeline** running Lint, Typecheck, Unit Tests, a11y audit, E2E tests, and Lighthouse CI score validation.  
11.8. **[OPS]** Author **Frontend Contribution & Architecture Guide** (`/docs/contributing.md`) detailing component scaffolding, token usage, and naming conventions.  
11.9. **[OPS]** Construct the enterprise-grade flagship **`README.md`** showcasing live demo links, architecture diagram, Web Vitals scorecards, Storybook link, and setup commands.  
11.10. **[OPS, SEC]** Conduct a final **Repository Security & Quality Audit**: verify zero hardcoded secrets, confirm all dependencies are vulnerability-free (`npm audit`), and assert green CI badges.

> **Phase 11 Transition Prompt:**
> ```markdown
> --- CHECKPOINT: PHASE 10 COMPLETED ---
> Current State: Phases 0 through 10 are fully implemented, tested with Vitest + Playwright, audited for WCAG 2.2 a11y, and passing all quality gates.
> Rules Reminder: One documentation artifact/micro-step per response + explain WHY it matters for team scale and architectural longevity.
> 
> Next Task: Branch Phase 11 (Steps 11.1–11.10): Production Hardening, CI/CD, Storybook & Developer Portal into concrete micro-steps and wait for my approval.
> ```
