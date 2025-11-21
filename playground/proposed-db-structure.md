# Proposed Database Structure

## Overview
This document proposes a comprehensive database schema for the face-based payment system with user registration, multi-wallet support, and Neon Auth integration.

---

## Table 1: `users`

### Purpose
Core user information with authentication and profile data.

### Schema
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  email_verified boolean DEFAULT false,
  name text NOT NULL,
  phone varchar(50),
  phone_verified boolean DEFAULT false,
  date_of_birth date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login_at timestamp with time zone,
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),

  -- Neon Auth integration fields
  neon_auth_user_id text UNIQUE,
  neon_auth_provider varchar(50),

  -- Profile
  avatar_url text,
  language varchar(10) DEFAULT 'en',
  timezone varchar(50) DEFAULT 'UTC'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_neon_auth_user_id ON users(neon_auth_user_id);
CREATE INDEX idx_users_status ON users(status);
```

### New Fields Explained
- **email**: Primary contact and login identifier
- **email_verified**: Whether email has been verified
- **phone**: Optional phone number for 2FA or notifications
- **phone_verified**: Whether phone has been verified
- **date_of_birth**: For age verification and KYC compliance
- **created_at/updated_at**: Audit timestamps
- **last_login_at**: Track user activity
- **status**: Account status (active, suspended, deleted)
- **neon_auth_user_id**: Unique ID from Neon Auth
- **neon_auth_provider**: Auth provider (e.g., 'neon', 'google', 'github')
- **avatar_url**: Profile picture (separate from face recognition images)
- **language**: User's preferred language
- **timezone**: For displaying timestamps correctly

---

## Table 2: `face_images`

### Purpose
Track face images used for biometric authentication, supporting multiple images per user.

### Schema
```sql
CREATE TABLE face_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  s3_key text NOT NULL,
  s3_bucket varchar(100) DEFAULT 'hacky-ando',
  rekognition_face_id text,
  rekognition_image_id text,
  is_primary boolean DEFAULT false,
  uploaded_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  match_count int DEFAULT 0,
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted'))
);

CREATE INDEX idx_face_images_user_id ON face_images(user_id);
CREATE INDEX idx_face_images_rekognition_image_id ON face_images(rekognition_image_id);
CREATE UNIQUE INDEX idx_one_primary_per_user ON face_images(user_id) WHERE is_primary = true;
```

### Fields Explained
- **user_id**: Links to the users table
- **s3_key**: S3 object key (e.g., "snapshot-uuid.png")
- **s3_bucket**: S3 bucket name
- **rekognition_face_id**: AWS Rekognition Face ID
- **rekognition_image_id**: AWS Rekognition External Image ID (currently the user UUID)
- **is_primary**: Primary face image (only one per user)
- **uploaded_at**: When the face was registered
- **last_used_at**: Last successful face match
- **match_count**: Number of successful authentications
- **status**: Image status (active, inactive, deleted)

---

## Table 3: `wallets`

### Purpose
Store multiple wallets per user with metadata and balance tracking.

### Schema
```sql
CREATE TABLE wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  wallet_url text NOT NULL UNIQUE,
  currency_code varchar(10) NOT NULL,
  initial_amount numeric(15, 2) DEFAULT 0,
  current_balance numeric(15, 2) DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),

  -- Interledger metadata
  asset_code varchar(10),
  asset_scale int,
  auth_server text,
  resource_server text,

  -- Grant token (moved from clients table)
  current_grant_token text,
  grant_expires_at timestamp with time zone
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_currency_code ON wallets(currency_code);
CREATE INDEX idx_wallets_status ON wallets(status);
CREATE UNIQUE INDEX idx_one_primary_wallet_per_user ON wallets(user_id) WHERE is_primary = true;
```

### Fields Explained
- **user_id**: Links to the users table
- **name**: User-friendly wallet name (e.g., "My EUR Wallet", "Savings")
- **wallet_url**: Interledger wallet URL (e.g., `https://ilp.interledger-test.dev/username`)
- **currency_code**: Currency (e.g., "EUR", "USD")
- **initial_amount**: Starting balance when wallet was created
- **current_balance**: Current balance (updated after each transaction)
- **is_primary**: Primary wallet for the user (only one per user)
- **created_at/updated_at**: Audit timestamps
- **last_used_at**: Last transaction date
- **status**: Wallet status (active, frozen, closed)
- **asset_code/asset_scale**: Interledger asset information
- **auth_server/resource_server**: Interledger server URLs
- **current_grant_token**: Active payment grant token
- **grant_expires_at**: When the current grant expires

---

## Table 4: `transactions` (Enhanced)

### Purpose
Record all payment transactions with full metadata and relationships.

### Schema
```sql
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  store_id uuid REFERENCES stores(id) ON DELETE SET NULL,

  -- Amount information
  amount numeric(15, 2) NOT NULL,
  amount_cents int NOT NULL,
  currency varchar(10) NOT NULL,

  -- Payment metadata
  payment_type varchar(20) DEFAULT 'outgoing' CHECK (payment_type IN ('outgoing', 'incoming', 'transfer')),
  payment_status varchar(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  interledger_payment_id text,
  grant_id uuid REFERENCES grants_manager(id) ON DELETE SET NULL,

  -- Biometric data
  snapshot_s3_key text,
  face_image_id uuid REFERENCES face_images(id) ON DELETE SET NULL,
  face_match_confidence numeric(5, 2),

  -- Voice/transcript data
  voice_s3_key text,
  transcript text,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,

  -- Additional metadata
  notes text,
  metadata jsonb
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_store_id ON transactions(store_id);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_metadata ON transactions USING gin(metadata);
```

### New/Modified Fields
- **user_id**: Links to users table (NEW - critical for user queries)
- **wallet_id**: Links to wallets table (NEW - supports multiple wallets)
- **store_id**: Links to stores table (NEW - proper foreign key)
- **amount**: Decimal amount for display
- **amount_cents**: Integer amount in cents (existing, for precise calculations)
- **payment_type**: outgoing, incoming, or transfer
- **payment_status**: pending, completed, failed, cancelled
- **interledger_payment_id**: Interledger payment reference
- **grant_id**: Links to grants_manager table
- **snapshot_s3_key**: S3 key instead of just UUID
- **face_image_id**: Links to the face_images table
- **face_match_confidence**: Rekognition match confidence score
- **voice_s3_key**: S3 key for voice recording
- **created_at/completed_at**: Separate timestamps for creation and completion
- **notes**: Optional notes about the transaction
- **metadata**: JSONB field for flexible additional data

---

## Table 5: `stores` (NEW)

### Purpose
Store information about merchants/stores where payments are made.

### Schema
```sql
CREATE TABLE stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  wallet_url text,

  -- Contact information
  email varchar(255),
  phone varchar(50),
  website text,

  -- Location
  address_line1 text,
  address_line2 text,
  city varchar(100),
  state varchar(100),
  postal_code varchar(20),
  country varchar(2),

  -- Business info
  category varchar(50),
  logo_url text,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'))
);

CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_category ON stores(category);
CREATE INDEX idx_stores_status ON stores(status);
```

### Fields Explained
- **name**: Store/merchant name
- **description**: Business description
- **wallet_url**: Store's Interledger wallet for receiving payments
- **email/phone/website**: Contact information
- **address_***: Physical location
- **category**: Business category (e.g., "restaurant", "retail", "online")
- **logo_url**: Store branding
- **status**: Store operational status

---

## Table 6: `grants_manager` (Enhanced)

### Purpose
Track payment grants with status and relationships.

### Schema
```sql
CREATE TABLE grants_manager (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,

  uri text NOT NULL,
  value text NOT NULL,

  -- Grant status
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'used')),

  -- Grant metadata
  grant_type varchar(30) DEFAULT 'outgoing_payment',
  amount_authorized numeric(15, 2),
  currency varchar(10),

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  expires_at timestamp with time zone,
  used_at timestamp with time zone,

  -- Interledger metadata
  interact_redirect_url text,
  interact_nonce text
);

CREATE INDEX idx_grants_user_id ON grants_manager(user_id);
CREATE INDEX idx_grants_wallet_id ON grants_manager(wallet_id);
CREATE INDEX idx_grants_status ON grants_manager(status);
CREATE INDEX idx_grants_created_at ON grants_manager(created_at DESC);
```

### New/Modified Fields
- **user_id**: Links to users table (NEW)
- **wallet_id**: Links to wallets table (NEW)
- **status**: Grant lifecycle status (NEW)
- **grant_type**: Type of grant (NEW)
- **amount_authorized**: Amount the grant is for (NEW)
- **currency**: Currency of the grant (NEW)
- **created_at/accepted_at/expires_at/used_at**: Full timestamp tracking (NEW)
- **interact_redirect_url**: Redirect URL for user acceptance (NEW)
- **interact_nonce**: Interaction nonce (NEW)

---

## Table 7: `user_sessions` (NEW)

### Purpose
Manage user authentication sessions (for Neon Auth integration).

### Schema
```sql
CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session data
  session_token text UNIQUE NOT NULL,
  refresh_token text,

  -- Device/client info
  device_type varchar(50),
  device_name varchar(100),
  user_agent text,
  ip_address inet,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,

  -- Status
  is_active boolean DEFAULT true
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_sessions_is_active ON user_sessions(is_active);
```

### Fields Explained
- **user_id**: Links to users table
- **session_token**: JWT or session identifier
- **refresh_token**: Token for refreshing expired sessions
- **device_type**: "mobile", "desktop", "tablet"
- **device_name**: User-friendly device name
- **user_agent**: Browser/app user agent
- **ip_address**: IP address for security tracking
- **created_at**: Session creation time
- **last_activity_at**: Last API call with this session
- **expires_at**: When the session expires
- **is_active**: Whether session is still valid

---

## Table 8: `wallet_transactions` (NEW)

### Purpose
Track balance changes and wallet-to-wallet transfers separate from payment transactions.

### Schema
```sql
CREATE TABLE wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,

  transaction_type varchar(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'payment', 'refund')),
  amount numeric(15, 2) NOT NULL,
  currency varchar(10) NOT NULL,

  -- Balance tracking
  balance_before numeric(15, 2) NOT NULL,
  balance_after numeric(15, 2) NOT NULL,

  -- Related records
  payment_transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  related_wallet_id uuid REFERENCES wallets(id) ON DELETE SET NULL,

  -- Metadata
  description text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
```

### Purpose
- Track all balance changes to wallets
- Maintain audit trail for financial reconciliation
- Support wallet-to-wallet transfers
- Link to payment transactions

---

## Updated Entity Relationship Diagram

```
users (1) ----< (N) face_images
  |
  |----< (N) wallets
  |       |
  |       |----< (N) wallet_transactions
  |       |----< (N) grants_manager
  |       |----< (N) transactions
  |
  |----< (N) user_sessions
  |----< (N) transactions
  |----< (N) grants_manager

stores (1) ----< (N) transactions

grants_manager (1) ----< (N) transactions

face_images (1) ----< (N) transactions
```

---

## Migration Strategy

### Phase 1: Add new tables without breaking existing functionality
```sql
-- 1. Create users table
CREATE TABLE users (...);

-- 2. Migrate existing clients to users
INSERT INTO users (id, name, neon_auth_user_id, created_at)
SELECT id, name, NULL, now() FROM clients;

-- 3. Create wallets table
CREATE TABLE wallets (...);

-- 4. Migrate client wallets to wallets table
INSERT INTO wallets (user_id, name, wallet_url, currency_code, is_primary, current_grant_token)
SELECT id, 'Primary Wallet', wallet, 'EUR', true, grant_token FROM clients;
```

### Phase 2: Enhance existing tables
```sql
-- 1. Add new columns to transactions
ALTER TABLE transactions
  ADD COLUMN user_id uuid,
  ADD COLUMN wallet_id uuid,
  ADD COLUMN store_id uuid,
  ADD COLUMN payment_status varchar(20) DEFAULT 'completed',
  ADD COLUMN interledger_payment_id text,
  ADD COLUMN grant_id uuid,
  ADD COLUMN face_image_id uuid,
  ADD COLUMN face_match_confidence numeric(5, 2),
  ADD COLUMN snapshot_s3_key text,
  ADD COLUMN voice_s3_key text,
  ADD COLUMN created_at timestamp with time zone DEFAULT now(),
  ADD COLUMN completed_at timestamp with time zone,
  ADD COLUMN notes text,
  ADD COLUMN metadata jsonb;

-- 2. Backfill snapshot_s3_key from snapshot UUID
UPDATE transactions SET snapshot_s3_key = 'snapshot-' || snapshot || '.png';

-- 3. Add foreign key constraints (after data migration)
ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_user_id FOREIGN KEY (user_id) REFERENCES users(id),
  ADD CONSTRAINT fk_transactions_wallet_id FOREIGN KEY (wallet_id) REFERENCES wallets(id);
```

### Phase 3: Create new supporting tables
```sql
CREATE TABLE face_images (...);
CREATE TABLE stores (...);
CREATE TABLE user_sessions (...);
CREATE TABLE wallet_transactions (...);
```

### Phase 4: Enhance grants_manager
```sql
ALTER TABLE grants_manager
  ADD COLUMN user_id uuid,
  ADD COLUMN wallet_id uuid,
  ADD COLUMN status varchar(20) DEFAULT 'pending',
  ADD COLUMN grant_type varchar(30) DEFAULT 'outgoing_payment',
  ADD COLUMN amount_authorized numeric(15, 2),
  ADD COLUMN currency varchar(10),
  ADD COLUMN created_at timestamp with time zone DEFAULT now(),
  ADD COLUMN accepted_at timestamp with time zone,
  ADD COLUMN expires_at timestamp with time zone,
  ADD COLUMN used_at timestamp with time zone,
  ADD COLUMN interact_redirect_url text,
  ADD COLUMN interact_nonce text;

-- Rename 'timestamp' to avoid ambiguity
-- (In PostgreSQL, can't have both 'timestamp' and 'created_at')
```

### Phase 5: Deprecate clients table
```sql
-- Once all code is updated to use users and wallets tables
DROP TABLE clients;
```

---

## Database Connection Example with Bun.sql

```typescript
// src/lib/db.ts (updated)
import { sql } from "bun";

// Connection is automatic via DATABASE_URL environment variable

export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  name: string;
  phone?: string;
  phone_verified: boolean;
  date_of_birth?: string;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
  status: 'active' | 'suspended' | 'deleted';
  neon_auth_user_id?: string;
  neon_auth_provider?: string;
  avatar_url?: string;
  language: string;
  timezone: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  wallet_url: string;
  currency_code: string;
  initial_amount: number;
  current_balance: number;
  is_primary: boolean;
  created_at: Date;
  updated_at: Date;
  last_used_at?: Date;
  status: 'active' | 'frozen' | 'closed';
  asset_code?: string;
  asset_scale?: number;
  auth_server?: string;
  resource_server?: string;
  current_grant_token?: string;
  grant_expires_at?: Date;
}

export interface FaceImage {
  id: string;
  user_id: string;
  s3_key: string;
  s3_bucket: string;
  rekognition_face_id?: string;
  rekognition_image_id?: string;
  is_primary: boolean;
  uploaded_at: Date;
  last_used_at?: Date;
  match_count: number;
  status: 'active' | 'inactive' | 'deleted';
}

// User operations
export async function createUser(userData: Partial<User>) {
  const [user] = await sql<User[]>`
    INSERT INTO users (email, name, phone, date_of_birth, neon_auth_user_id, neon_auth_provider)
    VALUES (${userData.email}, ${userData.name}, ${userData.phone}, ${userData.date_of_birth}, ${userData.neon_auth_user_id}, ${userData.neon_auth_provider})
    RETURNING *;
  `;
  return user;
}

export async function getUserById(id: string) {
  const [user] = await sql<User[]>`
    SELECT * FROM users WHERE id = ${id};
  `;
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await sql<User[]>`
    SELECT * FROM users WHERE email = ${email};
  `;
  return user;
}

// Wallet operations
export async function createWallet(walletData: Partial<Wallet>) {
  const [wallet] = await sql<Wallet[]>`
    INSERT INTO wallets (user_id, name, wallet_url, currency_code, initial_amount, current_balance, is_primary)
    VALUES (${walletData.user_id}, ${walletData.name}, ${walletData.wallet_url}, ${walletData.currency_code}, ${walletData.initial_amount}, ${walletData.current_balance}, ${walletData.is_primary})
    RETURNING *;
  `;
  return wallet;
}

export async function getUserWallets(userId: string) {
  const wallets = await sql<Wallet[]>`
    SELECT * FROM wallets WHERE user_id = ${userId} ORDER BY is_primary DESC, created_at ASC;
  `;
  return wallets;
}

export async function getPrimaryWallet(userId: string) {
  const [wallet] = await sql<Wallet[]>`
    SELECT * FROM wallets WHERE user_id = ${userId} AND is_primary = true;
  `;
  return wallet;
}

// Face image operations
export async function addFaceImage(faceData: Partial<FaceImage>) {
  const [face] = await sql<FaceImage[]>`
    INSERT INTO face_images (user_id, s3_key, s3_bucket, rekognition_image_id, is_primary)
    VALUES (${faceData.user_id}, ${faceData.s3_key}, ${faceData.s3_bucket}, ${faceData.rekognition_image_id}, ${faceData.is_primary})
    RETURNING *;
  `;
  return face;
}

export async function getUserFaceImages(userId: string) {
  const faces = await sql<FaceImage[]>`
    SELECT * FROM face_images WHERE user_id = ${userId} AND status = 'active' ORDER BY is_primary DESC, uploaded_at DESC;
  `;
  return faces;
}

// Transaction operations (enhanced)
export async function createTransaction(txData: any) {
  const [transaction] = await sql`
    INSERT INTO transactions (
      user_id, wallet_id, store_id, amount, amount_cents, currency,
      payment_type, payment_status, snapshot_s3_key, face_image_id,
      face_match_confidence, voice_s3_key, transcript
    )
    VALUES (
      ${txData.user_id}, ${txData.wallet_id}, ${txData.store_id},
      ${txData.amount}, ${txData.amount_cents}, ${txData.currency},
      ${txData.payment_type}, ${txData.payment_status}, ${txData.snapshot_s3_key},
      ${txData.face_image_id}, ${txData.face_match_confidence},
      ${txData.voice_s3_key}, ${txData.transcript}
    )
    RETURNING *;
  `;
  return transaction;
}

export async function getUserTransactions(userId: string) {
  const transactions = await sql`
    SELECT t.*, w.name as wallet_name, s.name as store_name
    FROM transactions t
    LEFT JOIN wallets w ON t.wallet_id = w.id
    LEFT JOIN stores s ON t.store_id = s.id
    WHERE t.user_id = ${userId}
    ORDER BY t.created_at DESC;
  `;
  return transactions;
}
```

---

## Benefits of Proposed Structure

1. **User Management**
   - Proper user profiles with email and authentication
   - Integration with Neon Auth
   - Support for multiple authentication providers

2. **Multi-Wallet Support**
   - Users can have multiple wallets
   - Different currencies per wallet
   - Balance tracking per wallet

3. **Enhanced Face Recognition**
   - Multiple face images per user
   - Track usage statistics
   - Primary/secondary face designation

4. **Better Transaction Tracking**
   - Link transactions to users and wallets
   - Payment status tracking
   - Store/merchant information
   - Comprehensive metadata

5. **Audit Trail**
   - Timestamp tracking for all entities
   - Grant lifecycle management
   - Wallet transaction history
   - Session management

6. **Data Integrity**
   - Foreign key constraints
   - Cascading deletes where appropriate
   - Status fields for soft deletes
   - Unique constraints where needed

7. **Scalability**
   - JSONB fields for flexible metadata
   - Indexes on common query patterns
   - Efficient relationship management
   - Support for future features
