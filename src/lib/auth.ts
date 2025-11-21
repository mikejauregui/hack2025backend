/**
 * Authentication Utilities
 * User authentication, session management, and password hashing
 */

import { sql } from "bun";
import { generateToken } from "./validation";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
}

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: Date;
}

export interface UserWithPassword {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  email_verified: boolean;
  status: string;
}

/**
 * Hash password using Bun's native bcrypt implementation
 */
export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10, // bcrypt cost factor (4-31, 10 is recommended)
  });
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}

/**
 * Generate session token (UUID v7)
 */
export function generateSessionToken(): string {
  return Bun.randomUUIDv7();
}

/**
 * Create new session for user
 * Sessions expire after 5 minutes
 */
export async function createSession(
  userId: string,
  deviceInfo?: {
    device_type?: string;
    device_name?: string;
    user_agent?: string;
    ip_address?: string;
  }
): Promise<Session> {
  const token = generateSessionToken();
  const sessionDuration = parseInt(process.env.SESSION_DURATION_MINUTES || "5");
  const expiresAt = new Date(Date.now() + sessionDuration * 60 * 1000);

  const [session] = await sql<Session[]>`
    INSERT INTO user_sessions (
      user_id,
      session_token,
      expires_at,
      device_type,
      device_name,
      user_agent,
      ip_address
    )
    VALUES (
      ${userId},
      ${token},
      ${expiresAt},
      ${deviceInfo?.device_type || null},
      ${deviceInfo?.device_name || null},
      ${deviceInfo?.user_agent || null},
      ${deviceInfo?.ip_address || null}
    )
    RETURNING id, user_id, session_token, expires_at;
  `;

  return session;
}

/**
 * Validate session token and return user
 * Returns null if session is invalid or expired
 */
export async function validateSession(
  token: string
): Promise<AuthUser | null> {
  const [result] = await sql`
    SELECT
      s.id as session_id,
      s.user_id,
      s.expires_at,
      u.id,
      u.email,
      u.name,
      u.email_verified
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ${token}
      AND s.expires_at > NOW()
      AND s.is_active = true
      AND u.status = 'active';
  `;

  if (!result) {
    return null;
  }

  // Update last activity timestamp
  await sql`
    UPDATE user_sessions
    SET last_activity_at = NOW()
    WHERE session_token = ${token};
  `;

  return {
    id: result.id,
    email: result.email,
    name: result.name,
    email_verified: result.email_verified,
  };
}

/**
 * Delete session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  await sql`
    UPDATE user_sessions
    SET is_active = false
    WHERE session_token = ${token};
  `;
}

/**
 * Delete all sessions for a user (e.g., on password change)
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await sql`
    UPDATE user_sessions
    SET is_active = false
    WHERE user_id = ${userId};
  `;
}

/**
 * Get user by email
 */
export async function getUserByEmail(
  email: string
): Promise<UserWithPassword | null> {
  const [user] = await sql<UserWithPassword[]>`
    SELECT id, email, name, password_hash, email_verified, status
    FROM users
    WHERE email = ${email};
  `;

  return user || null;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  const [user] = await sql<AuthUser[]>`
    SELECT id, email, name, email_verified
    FROM users
    WHERE id = ${userId} AND status = 'active';
  `;

  return user || null;
}

/**
 * Create new user
 */
export async function createUser(
  email: string,
  name: string,
  password: string,
  dateOfBirth: string
): Promise<AuthUser> {
  const passwordHash = await hashPassword(password);

  const [user] = await sql<AuthUser[]>`
    INSERT INTO users (
      email,
      name,
      password_hash,
      date_of_birth,
      email_verified,
      status
    )
    VALUES (
      ${email},
      ${name},
      ${passwordHash},
      ${dateOfBirth},
      false,
      'active'
    )
    RETURNING id, email, name, email_verified;
  `;

  return user;
}

/**
 * Generate email verification token
 */
export async function generateEmailVerificationToken(
  userId: string
): Promise<string> {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await sql`
    UPDATE users
    SET
      email_verification_token = ${token},
      email_verification_expires_at = ${expiresAt}
    WHERE id = ${userId};
  `;

  return token;
}

/**
 * Verify email with token
 */
export async function verifyEmailToken(
  token: string
): Promise<AuthUser | null> {
  const [user] = await sql<AuthUser[]>`
    UPDATE users
    SET
      email_verified = true,
      email_verified_at = NOW(),
      email_verification_token = NULL,
      email_verification_expires_at = NULL
    WHERE email_verification_token = ${token}
      AND email_verification_expires_at > NOW()
      AND email_verified = false
    RETURNING id, email, name, email_verified;
  `;

  return user || null;
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await sql`
    UPDATE users
    SET last_login_at = NOW()
    WHERE id = ${userId};
  `;
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const passwordHash = await hashPassword(newPassword);

  await sql`
    UPDATE users
    SET password_hash = ${passwordHash}, updated_at = NOW()
    WHERE id = ${userId};
  `;

  // Invalidate all sessions (user must log in again)
  await deleteAllUserSessions(userId);
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(
  email: string
): Promise<string | null> {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  await sql`
    UPDATE users
    SET
      email_verification_token = ${token},
      email_verification_expires_at = ${expiresAt}
    WHERE id = ${user.id};
  `;

  return token;
}

/**
 * Reset password with token
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<AuthUser | null> {
  // Verify token is valid
  const [user] = await sql<UserWithPassword[]>`
    SELECT id, email, name, email_verified
    FROM users
    WHERE email_verification_token = ${token}
      AND email_verification_expires_at > NOW();
  `;

  if (!user) {
    return null;
  }

  // Change password
  await changePassword(user.id, newPassword);

  // Clear reset token
  await sql`
    UPDATE users
    SET
      email_verification_token = NULL,
      email_verification_expires_at = NULL
    WHERE id = ${user.id};
  `;

  return user;
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await sql`
    UPDATE user_sessions
    SET is_active = false
    WHERE expires_at < NOW()
      AND is_active = true;
  `;

  return result.length;
}
