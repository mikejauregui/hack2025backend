# PRD: Neon Auth Integration & Migration

## 1. Objective
Replace the current custom authentication system (based on local `users` and `user_sessions` tables) with **Neon Auth** (powered by Stack Auth). This will offload user management, session handling, and security maintenance while providing a robust, managed authentication solution that syncs directly with our Neon Postgres database.

## 2. Current State Analysis
*   **Existing Auth:** Custom implementation in `src/lib/auth.ts`.
    *   Uses `bcrypt` for password hashing.
    *   Manages sessions in `user_sessions` table.
    *   Manages users in `users` table (columns: `id`, `email`, `name`, `password_hash`, `date_of_birth`, `email_verified`, etc.).
*   **Frontend:** React application (`src/app/`) interacting with an Elysia backend.
*   **Database:** `users` and `user_sessions` tables defined in migrations 001 and 002.

## 3. Proposed Architecture

### 3.1. Authentication Flow
1.  **Frontend:** Use `@stackframe/react` to handle Sign Up, Sign In, and Session Management.
2.  **Backend:** Use `@stackframe/js` (or direct DB checks) to validate user sessions/tokens attached to requests.
3.  **Database:**
    *   **`neon_auth.users_sync`**: Read-only view/table provided by Neon Auth containing core identity data (id, name, email, created_at, etc.).
    *   **`public.users` (Refactored)**: Will store application-specific profile data not handled by Neon Auth (e.g., `date_of_birth`, `wallet_info`). This table will have a 1:1 "soft relationship" with `neon_auth.users_sync`.

### 3.2. Data Model Changes
*   **Deprecate:** `user_sessions` table (Neon Auth handles sessions).
*   **Modify:** `users` table.
    *   Remove: `password_hash`, `email_verification_token`, `email_verified`, `last_login_at` (handled by Neon).
    *   Keep/Migrate: `date_of_birth`.
    *   Primary Key: Change `id` to match the text-based ID format from Neon Auth (or map Neon Auth ID to a column `auth_user_id`). *Recommendation:* Use the Neon Auth ID as the Primary Key for the local `users` table for simplicity.

## 4. Implementation Plan

### Phase 1: Setup & Configuration
1.  **Neon Console:**
    *   Enable "Auth" in the Neon project dashboard.
    *   Copy Environment Variables: `NEXT_PUBLIC_STACK_PROJECT_ID`, `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`, `STACK_SECRET_SERVER_KEY`, `DATABASE_URL`.
2.  **Environment:** Update `.env` (and `.env.example`) with these new keys.

### Phase 2: Frontend Integration (`src/app/`)
1.  **Install SDK:** `bun add @stackframe/react`
2.  **Configure Provider:**
    *   Wrap the main application (in `src/app/frontend.tsx` or `src/app/App.tsx`) with `<StackProvider>`.
    *   Configure it with the environment variables.
3.  **Update UI:**
    *   Replace `src/app/pages/grant.tsx` (or login pages) to use Neon Auth's `<CredentialSignIn />` or hooks `useStackApp()`.
    *   Add a route for the "Stack Handler" (required by Neon Auth for callbacks/redirects) if not using the hosted UI completely. *Note: Neon Auth usually requires a specific route handler in Next.js, but for a SPA (React + Vite/Bun), we configure the `handler` prop or dedicated route.*
    *   Update `Header.tsx` to show user state using `useUser()` hook.

### Phase 3: Backend Integration (`src/index.ts` & `src/lib/`)
1.  **Install SDK:** `bun add @stackframe/js`
2.  **Update `src/lib/auth.ts`:**
    *   Refactor `validateSession` to verify the incoming token using `@stackframe/js` or by checking the header.
    *   Update `getUserById` to query `neon_auth.users_sync` join `users`.
3.  **API Middleware:** Ensure protected routes verify the Neon Auth token.

### Phase 4: Database Migration
1.  **Create Migration `009_migrate_to_neon_auth.sql`:**
    *   **Step 1:** Drop `user_sessions` table.
    *   **Step 2:** Alter `users` table:
        *   Drop `password_hash`, `email_verification_token`, etc.
        *   Alter `id` column type if necessary (Neon IDs are strings like `user_...`).
        *   *Crucial:* If preserving existing users is required, we would need a script to migrate them to Neon Auth via API (create user) and then link them. **For this roadmap, we assume a fresh start or manual migration for simplicity unless specified otherwise.**
2.  **Sync Logic:** Ensure that when a user signs up via Neon Auth, a corresponding row is created in `public.users` (for `date_of_birth`) if needed. This can be done via a webhook or an "on-login" check in the application logic.

## 5. Migration Steps (Detailed)

### Step 1: Dependencies
```bash
bun add @stackframe/react @stackframe/js
```

### Step 2: Database Migration File (`playground/migrations/009_migrate_to_neon_auth.sql`)
```sql
-- Drop session management (handled by Neon)
DROP TABLE IF EXISTS user_sessions;

-- Refactor users table to store only profile data
-- Assuming we wipe existing users for clean slate, or backup first.
-- If keeping data, we need a complex migration strategy.
-- Here is the 'Soft Relation' approach:

ALTER TABLE users RENAME TO profiles;

-- Remove auth columns
ALTER TABLE profiles 
  DROP COLUMN password_hash,
  DROP COLUMN email_verification_token,
  DROP COLUMN email_verification_expires_at,
  DROP COLUMN email_verified,
  DROP COLUMN last_login_at;

-- Ensure ID matches Neon Auth ID format (Text)
-- If it was UUID, we might need to change it or add a 'neon_user_id' column
-- ALTER TABLE profiles ADD COLUMN neon_user_id TEXT UNIQUE;
-- UPDATE profiles SET neon_user_id = ... (Manual mapping if needed)
```

### Step 3: Code Refactoring
*   **`src/lib/auth.ts`**: Rewrite to export helper functions that use `StackServerApp`.
*   **`src/lib/db.ts`**: Update user queries to join `neon_auth.users_sync` and `profiles`.

## 6. Future Considerations
*   **Webhooks:** Setup Neon Auth webhooks to automatically create/delete rows in `profiles` when users are created/deleted in Auth.
*   **Row Level Security (RLS):** Use the authenticated user ID in Postgres RLS policies for robust security.
