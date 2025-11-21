# Neon Auth Integration Analysis

## Overview
This document analyzes how to integrate Neon Auth into the face-based payment system, comparing the Neon Auth React quick-start with our current Bun + React stack.

---

## Neon Auth Quick Start Analysis

### Official Documentation
- **URL**: https://neon.com/docs/neon-auth/quick-start/react
- **Stack**: React + Vite + TypeScript + Neon Postgres
- **Authentication**: Email/Password with session tokens

### Key Components

#### 1. Authentication Flow
```
1. User signs up/signs in
2. Credentials sent to API endpoint
3. API validates credentials
4. Session token created and stored in database
5. Token returned to client
6. Client stores token (localStorage/cookies)
7. Token sent with subsequent requests
```

#### 2. Database Schema (from Neon Auth docs)
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. API Endpoints Structure (Neon Auth pattern)
```typescript
// Sign up
POST /api/auth/signup
Body: { email, password }
Response: { token, user }

// Sign in
POST /api/auth/signin
Body: { email, password }
Response: { token, user }

// Sign out
POST /api/auth/signout
Headers: { Authorization: Bearer <token> }
Response: { message }

// Get current user
GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user }
```

---

## Adapting Neon Auth to Our Stack

### Current Stack vs. Neon Auth Stack

| Component | Neon Auth Quick Start | Our Stack | Compatibility |
|-----------|----------------------|-----------|---------------|
| Runtime | Node.js | Bun | ✅ Compatible |
| Framework | Vite | Bun native | ✅ Compatible |
| Database Client | `@neondatabase/serverless` | `bun:sql` (Bun.sql) | ⚠️ Different API |
| Frontend | React | React | ✅ Same |
| Routing | React Router | Bun.server router[^1] | ⚠️ Different API |
| Server | Express/Next.js | Bun.serve() | ⚠️ Different API |
| Password Hashing | bcrypt | Need to add | ❌ Missing |
| Session Storage | PostgreSQL | PostgreSQL | ✅ Same |

[^1]: https://bun.com/docs/runtime/http/server

### Key Differences

#### 1. Database Client
**Neon Auth uses:**
```typescript
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

// Query
const users = await sql`SELECT * FROM users WHERE email = ${email}`;
```

**We use:**
```typescript
import { sql } from 'bun';

// Query (same syntax!)
const users = await sql`SELECT * FROM users WHERE email = ${email}`;
```

**Verdict**: ✅ Nearly identical! Tagged template literal syntax is the same.

#### 2. Server/API Structure
**Neon Auth uses (Express-style):**
```typescript
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  // ...
});
```

**We use (Bun.serve):**
```typescript
Bun.serve({
  routes: {
    "/api/auth/signup": {
      POST: async (req) => {
        const { email, password } = await req.json();
        // ...
        return new Response(JSON.stringify({ token, user }));
      }
    }
  }
});
```

**Verdict**: ⚠️ Different API, but straightforward to adapt.

#### 3. Password Hashing
**Neon Auth uses:**
```typescript
import bcrypt from 'bcrypt';

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

**We need to add:**
```bash
bun add bcrypt
```

Or use Bun's built-in crypto (native, faster):
```typescript
// Hash password with Bun's crypto
const hashedPassword = await Bun.password.hash(password);

// Verify password
const isValid = await Bun.password.verify(password, hashedPassword);
```

**Verdict**: ✅ Bun has native password hashing!

---

## Proposed Neon Auth Integration

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Sign Up     │  │  Sign In     │  │  User Home   │      │
│  │  Component   │  │  Component   │  │  Component   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                   │              │
│         └─────────────────┴───────────────────┘              │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Bun.serve)                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Auth Endpoints                          │   │
│  │  • POST /api/auth/signup                             │   │
│  │  • POST /api/auth/signin                             │   │
│  │  • POST /api/auth/signout                            │   │
│  │  • GET  /api/auth/me                                 │   │
│  │  • POST /api/auth/verify-email                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         User Registration Endpoints                   │   │
│  │  • POST /api/users/register (full registration)      │   │
│  │  • POST /api/users/upload-face                       │   │
│  │  • POST /api/users/create-wallet                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Neon PostgreSQL Database                   │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   users    │  │  sessions  │  │   wallets  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐                            │
│  │face_images │  │transactions│                            │
│  └────────────┘  └────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Step 1: Database Schema Updates

```sql
-- Add password_hash to users table
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Ensure email is unique and not null
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
-- Already have: CREATE INDEX idx_users_email ON users(email);

-- Sessions table already proposed in previous document
-- (see user_sessions table in proposed-db-structure.md)
```

### Step 2: Create Auth Utility Functions

```typescript
// src/lib/auth.ts
import { sql } from "bun";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: Date;
}

// Hash password using Bun's native crypto
export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10, // bcrypt cost factor
  });
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}

// Generate session token
export function generateSessionToken(): string {
  return Bun.randomUUIDv7();
}

// Create session
export async function createSession(userId: string): Promise<Session> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const [session] = await sql<Session[]>`
    INSERT INTO user_sessions (user_id, session_token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt})
    RETURNING id, user_id, session_token, expires_at;
  `;

  return session;
}

// Validate session
export async function validateSession(token: string): Promise<AuthUser | null> {
  const [session] = await sql`
    SELECT s.*, u.id, u.email, u.name
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ${token}
      AND s.expires_at > NOW()
      AND s.is_active = true;
  `;

  if (!session) return null;

  // Update last activity
  await sql`
    UPDATE user_sessions
    SET last_activity_at = NOW()
    WHERE session_token = ${token};
  `;

  return {
    id: session.id,
    email: session.email,
    name: session.name,
  };
}

// Delete session (logout)
export async function deleteSession(token: string): Promise<void> {
  await sql`
    UPDATE user_sessions
    SET is_active = false
    WHERE session_token = ${token};
  `;
}

// Get user by email
export async function getUserByEmail(email: string) {
  const [user] = await sql`
    SELECT id, email, name, password_hash, email_verified
    FROM users
    WHERE email = ${email};
  `;
  return user;
}

// Create user
export async function createUser(email: string, name: string, password: string) {
  const passwordHash = await hashPassword(password);

  const [user] = await sql`
    INSERT INTO users (email, name, password_hash, email_verified, status)
    VALUES (${email}, ${name}, ${passwordHash}, false, 'active')
    RETURNING id, email, name, email_verified;
  `;

  return user;
}
```

### Step 3: Create Auth API Endpoints

```typescript
// src/api/auth/signup.ts
import { createUser, createSession } from "../../lib/auth";
import { ClientResponse } from "../../lib/Response";
import type { BunRequest } from "bun";

export async function signup(req: BunRequest) {
  try {
    const { email, name, password } = await req.json();

    // Validate input
    if (!email || !name || !password) {
      return ClientResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ClientResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return ClientResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return ClientResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser(email, name, password);

    // Create session
    const session = await createSession(user.id);

    return ClientResponse.json({
      token: session.session_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return ClientResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// src/api/auth/signin.ts
import { getUserByEmail, verifyPassword, createSession } from "../../lib/auth";
import { ClientResponse } from "../../lib/Response";
import type { BunRequest } from "bun";

export async function signin(req: BunRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return ClientResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return ClientResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return ClientResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    const session = await createSession(user.id);

    // Update last login
    await sql`
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = ${user.id};
    `;

    return ClientResponse.json({
      token: session.session_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return ClientResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// src/api/auth/signout.ts
import { deleteSession } from "../../lib/auth";
import { ClientResponse } from "../../lib/Response";
import type { BunRequest } from "bun";

export async function signout(req: BunRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ClientResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    await deleteSession(token);

    return ClientResponse.json({ message: "Signed out successfully" });
  } catch (error) {
    console.error("Signout error:", error);
    return ClientResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// src/api/auth/me.ts (replace existing hardcoded version)
import { validateSession } from "../../lib/auth";
import { getUserById } from "../../lib/db";
import { ClientResponse } from "../../lib/Response";
import type { BunRequest } from "bun";

export async function me(req: BunRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ClientResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await validateSession(token);

    if (!user) {
      return ClientResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get full user details
    const fullUser = await getUserById(user.id);

    return ClientResponse.json({
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      email_verified: fullUser.email_verified,
      avatar_url: fullUser.avatar_url,
      created_at: fullUser.created_at,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return ClientResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Step 4: Update Server Routes

```typescript
// src/index.ts (update)
import { signup } from "./api/auth/signup";
import { signin } from "./api/auth/signin";
import { signout } from "./api/auth/signout";
import { me } from "./api/auth/me";

Bun.serve({
  routes: {
    // Auth routes
    "/api/auth/signup": { POST: signup },
    "/api/auth/signin": { POST: signin },
    "/api/auth/signout": { POST: signout },
    "/api/auth/me": { GET: me },

    // Existing routes...
    "/api/upload": { POST: upload },
    "/api/transactions": { GET: getTransactions },
    // ... etc
  },
  // ... rest of config
});
```

### Step 5: Create Frontend Auth Context

```typescript
// src/app/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchCurrentUser(authToken: string) {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token invalid, clear it
        localStorage.removeItem("auth_token");
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  }

  async function signin(email: string, password: string) {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Sign in failed");
    }

    const { token: authToken, user: userData } = await response.json();
    localStorage.setItem("auth_token", authToken);
    setToken(authToken);
    setUser(userData);
  }

  async function signup(email: string, name: string, password: string) {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Sign up failed");
    }

    const { token: authToken, user: userData } = await response.json();
    localStorage.setItem("auth_token", authToken);
    setToken(authToken);
    setUser(userData);
  }

  async function signout() {
    if (token) {
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signin, signup, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

### Step 6: Create Auth Pages

```typescript
// src/app/pages/signup.tsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export function SignUpPage() {
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(email, name, password);
      setLocation("/onboarding/upload-face");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Sign up for a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
            <p className="text-sm text-center">
              Already have an account?{" "}
              <a href="/signin" className="text-blue-500 hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// src/app/pages/signin.tsx
// Similar structure to signup...
```

---

## Key Differences from Standard Neon Auth

### 1. No Email Verification (Initial Implementation)
- Standard Neon Auth: Sends verification emails
- Our implementation: Email verification can be added later
- Reason: Focus on core functionality first

### 2. Bun-Native Password Hashing
- Standard Neon Auth: Uses bcrypt package
- Our implementation: Uses `Bun.password.hash()`
- Benefit: Native implementation, no additional dependencies, faster

### 3. Session Storage Strategy
- Standard Neon Auth: Often uses cookies
- Our implementation: Uses Authorization headers with Bearer tokens
- Reason: Better for API-first architecture, easier to use with face recognition flow

### 4. Face-First Authentication
- Standard Neon Auth: Email/password only
- Our implementation: Email/password + face recognition
- Flow: Sign in with email/password, then use face for payments

---

## Security Considerations

### 1. Password Requirements
- Minimum 8 characters
- Could add: uppercase, lowercase, number, special character requirements

### 2. Session Expiration
- Default: 30 days
- Should implement: Refresh tokens for longer sessions

### 3. Rate Limiting
- Add rate limiting on auth endpoints to prevent brute force attacks

### 4. HTTPS Only
- Ensure all auth endpoints use HTTPS in production

### 5. CORS Configuration
- Restrict CORS to specific domains in production

---

## Next Steps

1. Implement auth endpoints
2. Create frontend auth pages
3. Add face upload to onboarding flow
4. Add wallet creation to onboarding flow
5. Protect existing endpoints with auth middleware
6. Add email verification (optional, later)
7. Add OAuth providers (Google, GitHub) via Neon Auth (optional, later)

---

## Comparison: Our Stack vs Neon Auth Stack

| Feature | Neon Auth (Docs) | Our Implementation | Status |
|---------|------------------|-------------------|--------|
| Database | Neon Postgres | Neon Postgres | ✅ Same |
| Query Syntax | Tagged templates | Tagged templates | ✅ Same |
| Password Hash | bcrypt package | Bun.password | ✅ Better |
| Server | Express/Next | Bun.serve | ⚠️ Different |
| Frontend | React + Vite | React + Bun | ⚠️ Different |
| Sessions | Cookies/Headers | Bearer tokens | ⚠️ Different |
| Auth Flow | Email/Password | Email/Pass + Face | ➕ Enhanced |

**Conclusion**: Our stack is highly compatible with Neon Auth patterns. The main differences are in server/bundler implementation, but the core concepts and database operations remain the same.
