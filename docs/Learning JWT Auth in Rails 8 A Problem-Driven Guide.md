# Learning JWT Auth in Rails 8: A Problem-Driven Guide

*A step-by-step learning path for Deepak: React web app now, mobile clients later.*

Each phase has the same shape: **build** a small thing, **break it** on purpose to feel the limitation, **understand why**, then look at the **ways to fix it**. Don't move on until you've reproduced the problem yourself. That's where the learning happens.

## Phase 0: Foundations (before any JWT)

**Build**

- A User model with a secure password (hashed, never stored plain).
- A couple of protected resources (e.g. posts) so you have something to protect.

**Understand first**

- Authentication = *who are you?* Authorization = *what are you allowed to do?* They are separate problems and fail in different ways (401 vs 403).
- What a JWT actually is: three parts (header, payload, signature). Decode one by hand at jwt.io. Notice the payload is **readable by anyone**; the signature only proves it wasn't **tampered with**.

**Question to answer before moving on:** if the payload isn't secret, what must never go in it?

## Phase 1: Authentication with a short-lived access token only

**Build**

- A login endpoint that checks credentials and returns a signed token with an expiry.
- A check that runs before every protected request: read the token, verify signature and expiry, identify the user.
- Return the right status codes for missing, malformed, expired and tampered tokens.

**Break it on purpose**

1. Take a valid token and edit one character in the payload. Send it. (Signature check should reject it.)
2. Wait for expiry. Send it. What does the client experience?
3. Set the expiry to 15 minutes, then imagine using the app for an hour.
4. Log in, then change the user's password or delete the user in the DB. Does the old token still work?
5. Imagine the token is stolen (leaked log, shared screen, XSS). What can the attacker do, and for how long?

**Limitations you should now see**

- **Stateless means unrevocable.** The server can't "log out" a token before it expires.
- **Short expiry = bad UX.** The user is thrown back to the login screen every N minutes.
- **Long expiry = bigger theft window.** You're trading security against convenience with a single knob.
- **Stale data in the token.** Anything put in the payload (role, email) is frozen until expiry.

**Ways to think about solving it (you'll pick one in later phases)**

- Accept the tradeoff and keep tokens very short (pairs with Phase 3).
- Look up the user in the DB on every request, so deleted or disabled users fail immediately.
- Maintain a denylist of revoked token IDs (adds state back, defeating some of the point of JWT).
- Don't use JWT at all for first-party apps (see the industry section).

**Decisions to make and write down:** signing algorithm (symmetric vs asymmetric), where the secret lives, what claims you include, access token lifetime.

## Phase 2: Authorization

**Build**

- Roles (e.g. member, admin) and one or two rules: "you can edit your own post", "admins can delete anything".
- Enforce them server-side on every action, and scope list queries so users only see what they should.

**Break it on purpose**

1. Log in as user A, request user B's resource by changing the ID in the URL. (This is IDOR/broken object-level authorization, the number one API vulnerability on the OWASP API list.)
2. Hit an admin endpoint as a regular user.
3. Promote or demote a user in the DB. Does an already-issued token reflect it?
4. Forget to add the check on one new action. How would you ever notice?

**Limitations you should now see**

- **Authorization checks scattered across controllers are easy to forget.** One missed check is a hole.
- **Role in the token goes stale** (same problem as Phase 1, now with security consequences).
- **Roles alone get coarse fast.** "Editor of project X but viewer of project Y" doesn't fit a single role column.
- **Authentication succeeding says nothing about authorization.** Test them separately.

**Ways to solve it**

- Policy objects, one per resource, with a "verify that authorization happened" safety net so forgotten checks fail loudly (Pundit-style).
- Declarative abilities in one place (CanCanCan-style).
- Fine-grained models: RBAC (roles), ABAC (attributes), ReBAC (relationships), or a dedicated authorization service for large systems.
- Scopes on queries as defense in depth.

**Key learning:** deny by default; authorization is decided on the server from fresh data, not from what the client claims.

## Phase 3: Refresh tokens

**Why this phase exists:** you've now felt the Phase 1 dilemma. Short tokens are secure but annoying, long tokens are convenient but risky. Refresh tokens resolve it by splitting the job: a short-lived token to *access* the API, and a long-lived one that can only *get a new access token*.

**Build (in sub-steps, each exposing its own problem)**

**3a. Naive version:** issue a long-lived refresh token alongside the access token, and a refresh endpoint that returns a new access token.

- **Problem:** if the refresh token leaks, the attacker has 30 days of access and you can't tell. You've just recreated the long-lived token problem.

**3b. Store refresh tokens server-side (hashed) so they can be revoked.**

- **Problem:** how do you log out? How do you "log out everywhere"? What if the DB leaks (hence storing only a hash)?

**3c. Rotation:** every refresh issues a new refresh token and invalidates the old one.

- **Problem:** a stolen token can still be used once before the real user's next refresh. And how do you know it was stolen?

**3d. Reuse detection:** if an already-used refresh token shows up again, treat it as theft and revoke that whole chain.

- **Problem:** a legitimate client with a flaky network retries after a lost response and now gets logged out. Also, two browser tabs refreshing simultaneously will trigger false positives.

**3e. Handling the races:** single-flight refresh on the client, and optionally a short grace window on the server.

**Break it on purpose**

- Use a refresh token twice. Fire two refresh requests in parallel. Revoke a token and see how long the access token still lives (answer: until expiry, which is why access tokens stay short).
- Log in on two devices, log out on one. What should happen on the other?

**Limitations you should now see**

- Access tokens are *still* unrevocable within their lifetime. You've bounded the damage, not eliminated it.
- You now have state (a table), so you've traded some of JWT's statelessness for control. That is a normal and intended tradeoff.
- Where the refresh token lives on the client is now the most security-critical decision (next phase).

**Housekeeping to learn:** expired token cleanup, absolute vs sliding session lifetime, revoking everything on password change.

## Phase 4: Multiple clients (web now, mobile later)

**Build**

- Make the same API serve a browser SPA and native mobile apps, and give each client its own session.

**Break it on purpose / questions to explore**

1. **Where can a browser safely keep a token?** Compare localStorage, sessionStorage, memory, and HttpOnly cookies against XSS and CSRF. No option is free: XSS can read localStorage, while cookies bring CSRF into play.
2. **Where can a mobile app keep it?** Look at Keychain/Keystore versus plain app storage, and why the answer differs from the browser.
3. **Can one login flow serve both?** Notice that cookies make sense for browsers and are awkward for native apps, so you may need different refresh-token transport for each.
4. **Per-device sessions:** a user logs in on laptop and phone. Can they see and revoke each one?
5. **CORS:** make the React app call the API from a different origin and read the failure messages. Understand what CORS protects (browsers) and what it doesn't (mobile apps, curl).
6. **Old mobile app versions** can't be force-updated. What happens when you change the token format or auth flow?
7. **Third-party clients:** if someone else's app wants access to your users' data, should they ever see the user's password? (This leads directly to OAuth, below.)

**Limitations you should now see**

- One-size-fits-all token handling is either insecure for one client or impractical for the other.
- Without a device/session concept, "log out" and "revoke" are all-or-nothing.
- API versioning stops being optional once clients you don't control are in the wild.

**Ways to solve it**

- Client-type-aware refresh transport (cookie for web, secure storage for mobile).
- Token families per device, with a session management endpoint.
- Versioned API routes and a deprecation policy.
- Backend-for-Frontend pattern for browsers (see below).

## Industry standards: what the world actually does

Worth reading *after* you've hit the problems above, because it will make sense instead of feeling like jargon.

### Authentication

- **Passwords:** hash with a slow, salted algorithm (bcrypt, Argon2). Rate-limit and lock out on repeated failures. Follow NIST SP 800-63B (length over complexity rules, check against breached-password lists).
- **MFA:** TOTP, WebAuthn/passkeys (the direction the industry is heading), SMS as a weak last resort.
- **Don't build it yourself when you don't have to:** managed identity providers (Auth0, Clerk, Cognito, Keycloak, WorkOS) exist because auth is high-risk and heavily regulated. Knowing how it works, which is what you're doing, is what lets you evaluate them.
- **Sessions vs JWT:** for a first-party web app, server-side sessions or opaque tokens are often the simpler and safer default because they're instantly revocable. JWT's real strength is stateless verification across services. Many teams use JWT because it's trendy, not because they need it. Be able to argue both sides.

### Protocols to know by name

- **OAuth 2.0 / OAuth 2.1:** a framework for *delegated authorization* ("let this app act on my behalf without my password"). Current best practice is Authorization Code flow with **PKCE**; the Implicit flow is deprecated.
- **OpenID Connect (OIDC):** a layer on top of OAuth 2.0 that adds *authentication* (ID tokens, "Sign in with Google").
- **RFC 9068 / JWT best current practices (RFC 8725):** pin algorithms, validate `exp`, `iss`, `aud`, avoid `alg: none`, keep payloads small and non-sensitive.
- **JWKS:** publishing public keys so other services can verify your tokens without sharing a secret.
- **OAuth 2.0 for browser apps (IETF draft):** recommends the **BFF (Backend-for-Frontend)** pattern, where the browser never sees tokens at all and holds only an HttpOnly session cookie while a thin server handles tokens. Read about it and compare with what you built in Phase 4.
- **OAuth for native apps (RFC 8252):** system browser plus PKCE, tokens in secure OS storage.

### Authorization

- **Principle of least privilege** and **deny by default**.
- **RBAC → ABAC → ReBAC** progression. Google's Zanzibar model (and open-source implementations like OpenFGA, SpiceDB) for relationship-based permissions at scale.
- **Scopes** in OAuth (what a *token* may do) are different from **roles/permissions** (what a *user* may do). Learn the distinction.
- **Policy engines** (OPA, Cedar) for centralizing rules across services.
- **OWASP API Security Top 10:** read it. Broken object-level authorization, broken authentication and broken function-level authorization are the top entries and map directly onto Phases 1 and 2.

### Operational practice

- Audit logging of auth events, alerting on refresh-token reuse, key rotation, short-lived tokens, HTTPS everywhere, and security headers.

## How to work through it

For each phase, keep a short notes file with three headings: **What I built**, **How I broke it**, **What I'd change and why**. Write the "limitation" in your own words before reading the "ways to solve it". If you can't explain why a refresh token needs rotation without looking, you haven't finished Phase 3.

Suggested pacing: Phases 1 and 2 are a day each; Phase 3 is the meatiest, so give it two or three sittings; Phase 4 is mostly experiments and reading.
