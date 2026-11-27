# Book Tracker: React Authentication Roadmap

*Architect review of the full project (api + frontend) and a step-by-step learning path · prepared for Deepak · 27 November 2026*

I read every file in the zip. I could not run the project (no runtime for your stack in my sandbox), so anything marked **verify** is an inference from reading code, and each has a one-minute check. As agreed, API improvements and RSpec are deferred; this document is about the React side.

## 1. Summary

- **API:** authentication is in good shape for a first version: JWT issue and verify, ownership scoping through `current_user.books`, rate limits, and a JSON error handler. The known gaps (one error envelope, refresh tokens, tests) are deferred.
- **Frontend:** a tidy CRUD app with feature folders, an API module and a single MUI theme. It has no authentication yet, and **it is out of sync with the API contract**, so creating and editing books will probably fail even before auth is added (section 2, F1).
- **Standards:** the current best-practice document for browser apps is **RFC 10017 (BCP 212, August 2026)**. It ranks three patterns by security: a backend-for-frontend (BFF) with cookie sessions, then a token-mediating backend, then tokens held in the browser. Your plan (JWT in memory first) is a sound *learning* stage, but it is not the end state for the web app.
- **Path:** Step 0 stabilise the foundation, 1 HTTP client, 2 auth state, 3 forms, 4 routing, 5 token and 401 handling, 6 server state with TanStack Query, 7 persistence across reloads, 8 hardening, 9 quality upgrades.

## 2. Frontend review

### What is good

- Feature-based structure (`features/books`) and API access isolated in `BooksApi.js`.
- Presentational components that receive props, controlled form inputs, functional state updates for delete and edit, stable `key`s.
- Accessibility instincts: `aria-label`s on buttons, `role="alert"`, semantic `component` props on MUI elements.
- Current toolchain: React 19, Vite 8, StrictMode on, oxlint with the rules-of-hooks rule, and CI that lints and builds.
- The form keeps the user’s input when a save fails. That is the right behaviour.

### Problems, in priority order

**F1. The frontend and the API disagree on the contract (blocker, verify with curl).**

- The frontend wraps the body as `{ book: {...} }`. The API now reads flat top-level keys (`params.permit(:title, ...)`). Rails only auto-wraps JSON when the wrapper key is absent, so as I read it the API sees none of the attributes: create fails validation, and update appears to succeed while changing nothing.
- The frontend sends the status `want-to-read` (hyphens). The API enum is `want_to_read` (underscores) and validates, so it is rejected.
- The frontend sends `rating: null`. The API validates numericality with no allowance for nil.
- **Decision for you:** pick one convention (wrapped or flat), document it in the README, and keep the wire format knowledge inside the API module so components never see it.

**F2. Error handling in `BooksApi.js`.**

- `response.text()` is not awaited, so the error message becomes “\[object Promise\]”.
- The API returns JSON errors in several shapes, so the client should parse JSON and normalise to one error object (status, code, message, per-field errors, request id).
- `fetch` only rejects on network failure. Handling 4xx and 5xx is your job.

**F3. `App.jsx` carries too much, and has small state bugs.**

- `loading` starts as `false`, so the “Your library is waiting” empty state flashes before the first load.
- One `error` string serves every operation and is never cleared. It is rendered twice (a paragraph in `App` and an alert in `BookList`) and always says “Could not load books”, even when a delete failed.
- `handleEdit` catches `err` but rethrows `error`, which is the state string.
- Fetching, mutations and UI state all live in one component. Step 6 replaces most of this.
- After create, the whole list is refetched because the API returns `{}`. The API should return the created book (later, on the API side).

**F4. Base URL and environment.** `VITE_API_URL` holds the full books URL. Auth needs a base URL plus resource paths. Also remember that Vite ships every `VITE_` variable to the browser, so never put secrets in one.

**F5. Data-type gotcha.** Rails serialises the decimal `rating` as a string such as “0.0”, so unrated books show “★ 0.0”. Decide how “unrated” is represented (null or 0) and keep the conversion in one place.

**F6. Missing foundations.** No router, no auth state, no tests, JavaScript only, and the page title is still “frontend”. The Docker image uses the floating `node:22-alpine` tag, while React Router v8 requires Node 22.22 or later, so pin it.

## 3. API gaps that matter to React (deferred; we will fix them together)

The frontend will work around these for now.

- Login failure returns 422 (should be 401), and error bodies come in several shapes. The target is one envelope, ideally RFC 9457 problem details.
- The token response key is `token`. Rename it to `access_token` plus `expires_in` before any client ships, because deployed mobile apps cannot be renamed.
- There is no `GET /me` endpoint. React needs “who am I?” after login and after a reload.
- There is no refresh or logout. The 15-minute token forces a re-login, which is a useful thing to feel first.
- A 401 does not say why (expired versus invalid), so React cannot choose between “refresh” and “log out”.
- CORS: browser JavaScript cannot read headers such as `Retry-After`, the request id or `Location` unless they are exposed. The 429 from `rate_limit` has an empty body.
- Registration returns 200 instead of 201.

## 4. Standards snapshot (November 2026)

Items marked **checked** I verified against the source in this session. Items marked **common practice** are widely adopted, but you should confirm the current version when you install them.

- **Browser auth architecture (checked):** RFC 10017 / BCP 212, published August 2026. Malicious JavaScript (XSS) is the central threat model. Patterns in decreasing order of security: BFF, token-mediating backend, browser-based OAuth client. The BFF is “strongly recommended for business applications, sensitive applications, and applications that handle personal data”. It also states that first-party apps on a common domain often do not need OAuth at all and can use server-side cookie sessions (section 7.1). Cookie guidance for the BFF: `Secure`, `HttpOnly`, `SameSite=Strict`, and the `__Host-Http-` name prefix.
- **Password rules (checked):** NIST SP 800-63B-4, final July 2025. Minimum 15 characters when the password is the only factor, 8 when it is part of MFA. Verifiers must accept at least 64 characters, must not impose composition rules, and need a blocklist of known-compromised passwords. Phishing-resistant options (passkeys) are required at the higher assurance level.
- **React (checked):** React 19.2 added Activity and `useEffectEvent`. React Compiler 1.0 is stable (October 2025) and the React team says new apps should use it. The compiler’s lint rules ship in `eslint-plugin-react-hooks`. You use oxlint, so check what it covers.
- **Routing (checked):** React Router v8 (June 2026). The package is `react-router`; `react-router-dom` is gone. It needs React 19.2.7 or later and Node 22.22 or later. There are three modes: declarative, data and framework. For an existing Vite SPA, declarative or data mode fits. v6 is end-of-life.
- **Server state (checked):** TanStack Query describes itself as the server-state standard for modern frontend apps (cache, deduplication, retries, mutations, invalidation).
- **Common practice:** TypeScript for new professional React code. React 19 form Actions (`useActionState`) for simple forms, or a form library plus schema validation. Vitest, React Testing Library and Mock Service Worker for tests. Playwright for end-to-end tests.
- **Browser-side controls the RFC names:** a nonce-based or hash-based Content Security Policy, Subresource Integrity, strict output encoding, and avoiding unchecked third-party scripts. React escapes output by default, so avoid injecting raw HTML.

## 5. The key decision: where does the web app keep its credentials?

**Option A: access token in JavaScript memory only (your current plan).**

- Simple, and a good first stage.
- A reload logs you out. Malicious script can read the token while the page is open.

**Option B: option A plus a refresh token in an HttpOnly, Secure, SameSite cookie, scoped to the auth endpoints, with rotation.**

- Survives reloads, and JavaScript never sees the refresh token.
- Malicious script can still call the refresh endpoint and send requests as the user. The RFC treats this as less secure than a BFF.

**Option C: cookie session or BFF, where JavaScript holds no tokens.**

- Best XSS posture for the web. Needs the SPA and API on the same site, plus CSRF defences (`SameSite=Strict` plus a custom request header, per the RFC).
- Mobile clients would still use tokens in Keychain or Keystore, so the API would support two client types.

**My recommendation:** build A through Steps 1 to 6, upgrade to B in Step 7 (you need the token endpoints for mobile anyway), then do a deliberate review of C before any production launch. For a personal book tracker, B is more than adequate. C matters as data sensitivity or compliance needs grow.

Be honest about the limit: no pattern stops malicious script from using the user’s session while the page is open. That is why Step 8 (CSP and output hygiene) exists.

## 6. Step-by-step guide

Work on one branch per step. Each step follows the same loop: **Build** a small thing, **Break it** on purpose so you see the problem, **Learn** why it happens, and finish when the **Done when** line is true. CI already lints and builds, so every step gets a safety net.

### Step 0: Make the foundation trustworthy

- **Build:** register a user with curl, take the token, and replay exactly what the UI sends for create, update and delete. Fix the contract (F1), the error parsing (F2), the state bugs (F3), the base URL (F4) and the rating display (F5). Set the page title.
- **Break it:** call the API with no token and with a stopped server. Make it return a 500. What does the UI tell the user?
- **Learn:** why `fetch` does not throw on 404, why effects run twice in development under StrictMode, and why values like “loading” and “is empty” should be derived instead of stored.
- **Done when:** every request the UI makes succeeds when replayed with curl using a valid token, and every failure path shows a real message.

### Step 1: One HTTP client

- **Build:** a single module that owns the base URL, JSON encoding and decoding, error normalisation, cancellation (`AbortController`), a hook for attaching credentials, and a hook for reacting to a 401. The books module and a new auth module both use it.
- **Break it:** HTML 500 pages, network down, a 204 with no body, invalid JSON, and a slow response when the user navigates away.
- **Learn:** promises and async/await, module boundaries, request cancellation.
- **Done when:** no component calls `fetch`, and every error has one shape.

### Step 2: Auth state with Context

- **Build:** a provider that exposes the current user, a status (unknown, anonymous, authenticated) and login, register and logout actions. Keep the token in memory outside React state (never in `localStorage`). Place the provider at the app root, above the router.
- **Break it:** reload the page (you are logged out, which is the Phase 1 limitation, now felt in the UI). Open a second tab. Read the token during render and watch for stale values.
- **Learn:** the Context API, custom hooks, `useReducer` and explicit states (a state-machine mindset), refs versus state, and why browser storage is risky (RFC 10017 sections 5 and 8).
- **Done when:** components call `useAuth()` and never see the token.

### Step 3: Register and login screens

- **Build:** two forms. Map server errors to the right field or to a general message, show a clear message for rate limiting (429), show a pending state, and prevent double submits.
- **Break it:** wrong password, duplicate email, rapid repeated clicks, slow network, a password manager, a screen reader.
- **Learn:** controlled forms (you already do this well), React 19 form Actions and `useActionState` versus a form library, client validation (for UX) versus server validation (the authority), and accessibility (labels, `autoComplete` values, `aria-invalid`, `aria-describedby`, moving focus to the first error).
- **Password UX per NIST:** allow paste, offer show/hide, no composition rules, welcome long passphrases, and guide toward 15 or more characters.
- **Done when:** API errors appear next to the correct fields.

### Step 4: Routing and protected routes (React Router v8)

- **Build:** routes for login, register, books (protected) and a not-found page. Use a layout route for the header. Add a guard that waits while the status is unknown, then redirects to login and remembers the original location. Send already-authenticated users away from login.
- **Break it:** deep-link to the books page while logged out, look for a flash of protected content, press Back after logout, and refresh on a protected URL.
- **Learn:** declarative versus data mode, nested routes and `Outlet`, navigation and replace semantics, error boundaries. Remember the point in your own plan: a guard is UX, not security. The API is what protects the data.
- **Done when:** logged-out users never see protected content, and a successful login returns them to where they were going.

### Step 5: Attach credentials and handle 401

- **Build:** the HTTP client attaches the Bearer token from the auth module. A single 401 handler clears the auth state and sends the user to login with a message. Logout clears the token.
- **Break it:** shorten the token lifetime to about a minute in development. Fire several parallel requests as it expires, let it expire mid-form, and send a tampered token.
- **Learn:** callback registration to avoid circular imports, making the 401 handler fire once, what to do with unsaved input, and why “expired” and “invalid” need different server codes (a later API task).
- **Done when:** expiry mid-session produces one clean redirect.

### Step 6: Server state with TanStack Query

- **Build:** a query provider at the root, a books query keyed by the current user, create, update and delete mutations with cache invalidation (optimistic updates later), loading and error UI taken from query state, and a rule that logout clears the entire cache. Configure retries so 401, 403 and 404 are not retried.
- **Break it:** log in as user A, log out, log in as user B. Does B ever glimpse A’s books (cache leakage)? Also watch the double fetch under StrictMode and a stale response overwriting a newer one in your current effect-based code.
- **Learn:** server state versus client state, query keys, `staleTime`, invalidation, the mutation lifecycle, and why you no longer need `useEffect` for fetching.
- **Done when:** `App.jsx` is a thin layout and the books page gets its data from a hook.

### Step 7: Staying signed in across reloads

This needs the API’s refresh-token phase (an HttpOnly refresh cookie plus `GET /me`), which we will build together.

- **Build:** an app bootstrap that asks the API whether a session exists and shows a loading gate until it answers. Add a single-flight refresh so parallel 401s share one refresh call. Send credentials on auth calls. In development, use the Vite dev-server proxy so the app and API share an origin, and keep CORS limited to exact origins.
- **Break it:** refresh two tabs at once (rotation can look like token reuse), log out in one tab, and test with strict browser privacy settings.
- **Learn:** bootstrap flows, Suspense and loading gates, fetch credential modes, site versus origin, SameSite behaviour, the CSRF custom-header defence, and the `__Host-` cookie prefix. Cross-tab logout with `BroadcastChannel` is optional.
- **Done when:** a reload keeps you signed in, and logout behaves predictably.

### Step 8: Frontend hardening

- Add a nonce-based or hash-based Content Security Policy, and avoid inline scripts.
- Never render untrusted HTML. Never put tokens in URLs, logs or browser storage.
- Remember `VITE_` variables are public.
- Dependency hygiene: `npm ci`, automated updates, regular audits.
- Add error boundaries and keep third-party scripts to a minimum.
- Set security headers on whatever serves the app. Clear caches on logout.

### Step 9: Quality and platform upgrades (can run in parallel)

- **Tests:** Vitest, React Testing Library and Mock Service Worker for the auth flows (login, 401, logout, protected route). Playwright for an end-to-end path: register, add a book, log out, log in as someone else.
- **TypeScript:** migrate incrementally, starting with the HTTP client and auth types.
- **React Compiler:** adopt it, and check how your linter covers its rules.
- **CI:** add typecheck and test jobs, and the coverage threshold from your roadmap.
- **Accessibility:** a keyboard-only pass, focus management and contrast.
- **Reuse:** keep the HTTP client and auth logic free of DOM and MUI code, so a React Native or Expo app can reuse them later.

## 7. Decisions for us to settle together

- The request-body convention: wrapped under the resource name, or flat.
- The error envelope shape (RFC 9457 problem details) and the stable error codes the UI will branch on.
- Token response naming, and the `GET /me` endpoint.
- The web target architecture (B now, with C reviewed before production).
- Router mode (declarative or data) and the timing of the TypeScript migration.

## 8. What to do first

1. Replay one create request with curl to confirm F1.
2. Fix the contract and the small state bugs (Step 0).
3. Decide the request-body convention and the target web architecture, then start Step 1.

## 9. References

- RFC 10017 / BCP 212: OAuth 2.0 for Browser-Based Applications (August 2026).
- NIST SP 800-63B-4: Digital Identity Guidelines, Authentication and Authenticator Management (final, July 2025).
- React Router v8 changelog and docs (June 2026).
- React Compiler 1.0 announcement (October 2025) and the React 19.2 release notes.
- TanStack Query documentation.
