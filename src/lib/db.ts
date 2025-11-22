import { sql } from "bun";

// User Interface
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  date_of_birth?: string;
  email_verified: boolean;
  email_verification_token?: string;
  email_verification_expires_at?: Date;
  password_reset_token?: string;
  password_reset_expires_at?: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

// User Session Interface
export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: Date;
  is_active: boolean;
  created_at: Date;
  last_used_at: Date;
  device_info?: string;
  ip_address?: string;
}

// Face Image Interface
export interface FaceImage {
  id: string;
  user_id: string;
  s3_key: string;
  rekognition_image_id?: string;
  is_primary: boolean;
  match_count: number;
  created_at?: Date;
  uploaded_at?: Date;
  last_used_at?: Date;
  status: string;
}

// Wallet Interface
export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  wallet_url: string;
  currency_code: string;
  current_balance: number;
  is_primary: boolean;
  status: string;
  created_at: Date;
  updated_at: Date;
  last_used_at?: Date;
}

/* --- User Operations --- */

export async function createUser(user: Partial<User>) {
  const [newUser] = await sql<User[]>`
    INSERT INTO users (email, password_hash, name, date_of_birth, email_verification_token, email_verification_expires_at)
    VALUES (${user.email}, ${user.password_hash}, ${user.name}, ${user.date_of_birth}, ${user.email_verification_token}, ${user.email_verification_expires_at})
    RETURNING *;
  `;
  return newUser;
}

export async function getUserByEmail(email: string) {
  const [user] = await sql<User[]>`
    SELECT * FROM users WHERE email = ${email};
  `;
  return user;
}

export async function getUserById(id: string) {
  const [user] = await sql<User[]>`
    SELECT * FROM users WHERE id = ${id};
  `;
  return user;
}

export async function getUserByVerificationToken(token: string) {
  const [user] = await sql<User[]>`
    SELECT * FROM users 
    WHERE email_verification_token = ${token} 
    AND email_verification_expires_at > NOW();
  `;
  return user;
}

export async function verifyUserEmail(id: string) {
  const [user] = await sql<User[]>`
    UPDATE users 
    SET email_verified = true, 
        email_verification_token = NULL, 
        email_verification_expires_at = NULL,
        status = 'active',
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *;
  `;
  return user;
}

export async function updateUserPassword(id: string, passwordHash: string) {
  const [user] = await sql<User[]>`
    UPDATE users
    SET password_hash = ${passwordHash},
        password_reset_token = NULL,
        password_reset_expires_at = NULL,
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *;
  `;
  return user;
}

/* --- Session Operations --- */

export async function createSession(session: Partial<UserSession>) {
  const [newSession] = await sql<UserSession[]>`
    INSERT INTO user_sessions (user_id, session_token, expires_at, device_info, ip_address)
    VALUES (${session.user_id}, ${session.session_token}, ${session.expires_at}, ${session.device_info}, ${session.ip_address})
    RETURNING *;
  `;
  return newSession;
}

export async function getSessionByToken(token: string) {
  const [session] = await sql<UserSession[]>`
    SELECT * FROM user_sessions 
    WHERE session_token = ${token} 
    AND is_active = true 
    AND expires_at > NOW();
  `;
  return session;
}

export async function invalidateSession(token: string) {
  await sql`
    UPDATE user_sessions
    SET is_active = false
    WHERE session_token = ${token};
  `;
}

export async function invalidateAllUserSessions(userId: string) {
  await sql`
    UPDATE user_sessions
    SET is_active = false
    WHERE user_id = ${userId};
  `;
}

/* --- Wallet Operations --- */

export async function createWallet(wallet: Partial<Wallet>) {
  const [newWallet] = await sql<Wallet[]>`
    INSERT INTO wallets (user_id, name, wallet_url, currency_code, current_balance, is_primary)
    VALUES (${wallet.user_id}, ${wallet.name}, ${wallet.wallet_url}, ${wallet.currency_code}, ${wallet.current_balance || 0}, ${wallet.is_primary || false})
    RETURNING *;
  `;
  return newWallet;
}

export async function getWalletsByUserId(userId: string) {
  return await sql<Wallet[]>`
    SELECT * FROM wallets WHERE user_id = ${userId} AND status = 'active' ORDER BY is_primary DESC, created_at DESC;
  `;
}

export async function getWalletById(id: string) {
  const [wallet] = await sql<Wallet[]>`
    SELECT * FROM wallets WHERE id = ${id};
  `;
  return wallet;
}

/* --- Face Image Operations --- */

export async function createFaceImage(face: Partial<FaceImage>) {
  const [newFace] = await sql<FaceImage[]>`
    INSERT INTO face_images (user_id, s3_key, rekognition_image_id, is_primary)
    VALUES (${face.user_id}, ${face.s3_key}, ${face.rekognition_image_id}, ${face.is_primary || false})
    RETURNING *;
  `;
  return newFace;
}

export async function getFaceImagesByUserId(userId: string) {
  return await sql<FaceImage[]>`
    SELECT
      id,
      user_id,
      s3_key,
      rekognition_image_id,
      is_primary,
      match_count,
      uploaded_at,
      uploaded_at AS created_at,
      last_used_at,
      status
    FROM face_images
    WHERE user_id = ${userId}
      AND status = 'active'
    ORDER BY is_primary DESC, uploaded_at DESC NULLS LAST;
  `;
}

// Existing Transaction Interface
export interface Transaction {
  id?: string;
  user_id?: string;
  wallet_id?: string;
  amount: number;
  currency: string;
  store?: number;
  store_id?: string;
  merchant_name?: string;
  snapshot?: string;
  snapshot_id?: string;
  snapshot_s3_key?: string;
  transcript?: string | null;
  payment_type?: string;
  payment_status?: string;
  interledger_payment_id?: string | null;
  grant_id?: string | null;
  face_image_id?: string | null;
  face_match_confidence?: number | null;
  voice_s3_key?: string | null;
  created_at?: Date;
  completed_at?: Date | null;
  metadata?: Record<string, unknown> | null;
  notes?: string | null;
}

export async function insertTransaction(request: Transaction) {
  const [transaction] = await sql<Transaction[]>`
    INSERT INTO transactions (
      user_id,
      wallet_id,
      amount,
      currency,
      store,
      snapshot,
      transcript,
      payment_type,
      payment_status,
      interledger_payment_id,
      grant_id,
      snapshot_s3_key,
      face_image_id,
      face_match_confidence,
      voice_s3_key,
      created_at,
      completed_at,
      notes,
      metadata
    )
    VALUES (
      ${request.user_id || null},
      ${request.wallet_id || null},
      ${request.amount},
      ${request.currency},
      ${request.store || null},
      ${request.snapshot_id || request.snapshot || null},
      ${request.transcript || null},
      ${request.payment_type || "outgoing"},
      ${request.payment_status || "completed"},
      ${request.interledger_payment_id || null},
      ${request.grant_id || null},
      ${request.snapshot_s3_key || null},
      ${request.face_image_id || null},
      ${request.face_match_confidence || null},
      ${request.voice_s3_key || null},
      ${request.created_at || new Date()},
      ${request.completed_at || null},
      ${request.notes || null},
      ${request.metadata ? JSON.stringify(request.metadata) : null}
    )
    RETURNING *;
  `;
  return transaction;
}

export async function getTransactions() {
  const transactions = await sql<Transaction[]>`
    SELECT * FROM transactions ORDER BY created_at DESC NULLS LAST, timestamp DESC NULLS LAST;
  `;
  return transactions;
}

export async function getTransactionsByUserId(userId: string) {
  const transactions = await sql<Transaction[]>`
    SELECT *
    FROM transactions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC NULLS LAST, timestamp DESC NULLS LAST;
  `;
  return transactions;
}

export async function getTransactionById(id: string) {
  const [transaction] = await sql<Transaction[]>`
    SELECT * FROM transactions WHERE id = ${id};
  `;
  return transaction;
}

// "clients" (
//   "id" uuid PRIMARY KEY DEFAULT gen_random_uuid (),
//   "name" text,
//   "grant_token" text,
// "wallet" text
// );

export interface Client {
  id: string;
  name: string;
  grant_token: string;
  wallet: string;
}

export function insertClient(
  name: string,
  grant_token: string,
  wallet: string,
) {
  return sql`
    INSERT INTO clients (name, grant_token, wallet)
    VALUES (${name}, ${grant_token}, ${wallet})
    RETURNING *;
  `;
}

export async function getClients() {
  const clients = await sql<Client[]>`
    SELECT * FROM clients;
  `;
  return clients;
}

export async function getClientById(id: string) {
  const [client] = await sql<Client[]>`
    SELECT * FROM clients WHERE id = ${id};
  `;
  return client;
}

export async function getGrantTokenByClientId(id: string) {
  const [client] = await sql<Client[]>`
    SELECT * FROM clients WHERE id = ${id};
  `;
  return client?.grant_token;
}

export async function updateGrantTokenByClientId(
  id: string,
  grant_token: string,
) {
  const [client] = await sql<Client[]>`
    UPDATE clients
    SET grant_token = ${grant_token}
    WHERE id = ${id}
    RETURNING *;
  `;
  return client;
}

// "grants_manager" (
//   "id" uuid PRIMARY KEY,
//   "uri" text,
//   "value" text,
//   "client_id" uuid,
// timestamp with time zone DEFAULT now()
// );

export interface Grant {
  id: string;
  uri: string;
  value: string;
  client_id: string;
  timestamp: Date;
}

export async function insertGrant(
  id: string,
  uri: string,
  value: string,
  client_id: string,
) {
  return sql<Grant[]>`
    INSERT INTO grants_manager (id, uri, value, client_id)
    VALUES (${id}, ${uri}, ${value}, ${client_id})
    RETURNING *;
  `;
}

export async function getGrantById(id: string) {
  // get the mnewost recent grant by client_id
  const [grant] = await sql<Grant[]>`
    SELECT * FROM grants_manager WHERE client_id = ${id};
  `;
  return grant;
}
