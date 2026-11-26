# Authentication and Authorization

## Goal

Add account registration and login to the Rails API and React app. Protect book operations so each signed-in user can view and manage only their own books.

Authentication answers **“Who is making this request?”** Authorization answers **“What is this user allowed to do?”** Rails must enforce both. React can present the appropriate interface, but hiding a button does not protect an API endpoint.

## Design decisions

- Rails owns identity, password verification, token creation, and access checks.
- Store passwords as secure password digests using Rails’ `has_secure_password`; never store or return plain-text passwords.
- Use a signed JWT as a short-lived access token.
- Keep the access token in React memory for the first version. A page refresh will require the user to log in again. Consider a refresh-token design later.
- Require authentication for book endpoints and associate every book with its owner.
- Check ownership on every request that reads, edits, or deletes an individual book.
- Deny access when the token is missing, invalid, expired, or belongs to a user who cannot access the requested book.

JWTs are signed, not automatically encrypted. Do not put passwords, secrets, or other sensitive information in their claims. Keep the signing secret out of source control and configure it through environment variables. Use HTTPS in production.

## Phase 1: User accounts

1. Add a `User` model with:
   - A unique email address.
   - A password digest.
   - Secure password handling with Rails `has_secure_password`.
2. Add a database migration and run it in the development environment.
3. Validate that:
   - Email is present and unique, using a case-insensitive comparison.
   - Password meets the chosen minimum length.
4. Add model specs for valid and invalid users.

**Complete when:** users can be persisted with a password digest, duplicate emails are rejected, and the plain-text password is not stored.

## Phase 2: Registration endpoint

1. Add an API endpoint for creating an account, for example `POST /api/v1/users`.
2. Accept only the email and password fields needed for registration.
3. Return a safe user representation; never serialize the password or password digest.
4. Return clear validation errors and appropriate HTTP status codes.
5. Add request specs for successful registration, invalid input, and duplicate email.

**Complete when:** a client can register an account and the response contains no password fields.

## Phase 3: Login and JWT issuance

1. Add a login endpoint, for example `POST /api/v1/login`.
2. Find the user by email and verify the password with Rails’ password-checking method.
3. Return the same generic authentication error for an unknown email and a wrong password.
4. On success, issue a signed JWT containing only necessary claims, such as:
   - `sub`: the user’s ID.
   - `iat`: when the token was issued.
   - `exp`: when it expires.
5. Choose and document a short access-token lifetime.
6. Keep the signing secret in environment configuration, not in the repository.
7. Add request specs for valid credentials, invalid credentials, and token expiry behavior.

**Complete when:** valid credentials produce a token, invalid credentials do not, and the token contains no password or other secret data.

## Phase 4: Authentication for protected requests

1. Add a reusable authentication component, such as an `ApplicationController` before-action.
2. Read the token from the `Authorization: Bearer <token>` request header.
3. Verify the token’s signature and expiry using the configured secret.
4. Find the user from the verified subject claim and make that user available to controllers.
5. Return `401 Unauthorized` for missing, malformed, invalid, expired, or unrecognized-user tokens.
6. Leave only explicitly public endpoints, such as registration and login, unauthenticated.
7. Add request specs for each failure case and for a valid token.

**Complete when:** book endpoints reject requests without a valid token and accept requests with one.

## Phase 5: Book ownership and authorization

1. Add a required `user_id` foreign key to books.
2. Add the Rails associations:
   - A user has many books.
   - A book belongs to a user.
3. Decide how to handle existing books before making `user_id` required. For local development, you may reset or migrate the sample data; document what you chose.
4. Scope book collection queries through the authenticated user.
5. Find individual books through that user’s books association. Do not look up an arbitrary book globally and assume its ID is sufficient authorization.
6. Ensure book creation assigns the authenticated user on the server. Do not accept `user_id` from the client.
7. Add request specs proving:
   - A user sees only their own books.
   - A user cannot show, update, or delete another user’s book.
   - A user cannot create a book for another user by submitting a different `user_id`.

**Complete when:** ownership is enforced by Rails for every book action, including attempts to guess another book’s ID.

## Phase 6: React integration

1. Add a registration screen and a login screen.
2. Keep the current user and access token in React state or a small authentication context.
3. Add a shared API request helper that attaches:
   `Authorization: Bearer <token>`
4. Handle `401 Unauthorized` responses by clearing the signed-in state and returning the user to login.
5. Show useful validation and login errors without exposing server internals.
6. Add a logout action that clears the in-memory token and user state.
7. Verify that refreshing the page requires logging in again in this first version.

**Complete when:** a user can register, log in, manage their own books, and log out through the UI.

## Phase 7: Security and regression review

- Confirm every protected route is authenticated.
- Confirm every book lookup is scoped to the current user.
- Confirm neither user responses nor logs expose passwords, password digests, or access tokens.
- Confirm secrets are provided through environment configuration and excluded from Git.
- Confirm tokens expire and invalid tokens fail closed.
- Review CORS settings so only the intended frontend origin is allowed.
- Run the full RSpec suite and verify the normal books CRUD behavior still works.

## Later improvements

Keep these out of the first implementation unless the basic flow is complete:

- Refresh tokens and persistent sessions.
- Password reset and email verification.
- Rate limiting for login attempts.
- Role-based permissions if the product later needs roles such as administrator.
- Production deployment settings, HTTPS, secret rotation, audit logging, and security monitoring.

## Review checklist

Before calling the feature complete, be ready to explain:

- How Rails verifies a password without storing the original password.
- What the JWT signature proves, and what it does not prove.
- How Rails identifies the current user on each request.
- Where the ownership check happens for each book action.
- Why the browser never gets to choose the owner of a new book.
- What happens when a token expires or a user tries another user’s book.
- Which tests demonstrate these protections.
