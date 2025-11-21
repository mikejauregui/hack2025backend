# Current Database Structure Analysis

## Database: `pagacarita` (Neon PostgreSQL)

### Overview
The current database supports a face-based payment system with three main tables for managing clients, transactions, and payment grants.

---

## Table 1: `clients`

### Purpose
Stores registered users who can make payments via facial recognition.

### Schema
```sql
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  grant_token text,
  wallet text
);
```

### Columns
- **id** (UUID, Primary Key): Unique identifier for the client
- **name** (text): Client's display name
- **grant_token** (text): Current active payment grant token (used for Interledger payments)
- **wallet** (text): Interledger wallet URL (e.g., `https://ilp.interledger-test.dev/username`)

### Current Data
- Client records are manually created
- Face images are stored in AWS S3 and indexed in AWS Rekognition with the client UUID
- No email, phone, or additional contact information stored
- No password or authentication credentials

### Current Issues
1. **Missing User Information**:
   - No email field
   - No phone number
   - No date of birth or verification status
   - No creation timestamp
   - No last login tracking

2. **Single Wallet Limitation**:
   - Only one wallet URL stored directly in the clients table
   - No support for multiple wallets per user
   - No wallet metadata (name, currency, balance)

3. **No Face Image Metadata**:
   - Face images are stored in S3, but there's no database record
   - Cannot track when faces were added or updated
   - Cannot support multiple face images per user

---

## Table 2: `transactions`

### Purpose
Records all payment transactions processed through the system.

### Schema
```sql
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount int,
  currency varchar(20),
  store int,
  timestamp timestamp with time zone DEFAULT now(),
  snapshot uuid,
  transcript text
);
```

### Columns
- **id** (UUID, Primary Key): Unique identifier for the transaction
- **amount** (int): Payment amount in cents (e.g., 1050 = $10.50 or €10.50)
- **currency** (varchar[20]): Currency code (e.g., "EUR", "USD")
- **store** (int): Store identifier (currently hardcoded to 1)
- **timestamp** (timestamp with time zone): When the transaction occurred (auto-set)
- **snapshot** (uuid): Reference to the S3 snapshot file used for face recognition
- **transcript** (text, nullable): Optional voice transcript from the payment

### Current Issues
1. **Missing Foreign Keys**:
   - No `client_id` field to link transactions to users
   - Cannot query "all transactions by user"
   - Cannot calculate user spending patterns

2. **No Payment Metadata**:
   - No Interledger payment ID
   - No grant ID reference
   - No payment status (pending, completed, failed)
   - No merchant/receiver information

3. **Store Field Limitations**:
   - `store` is just an integer, not a foreign key
   - No store/merchant table
   - Cannot track store details or merchant information

4. **No Wallet Reference**:
   - Cannot track which wallet was used for the payment
   - Important for users with multiple wallets

---

## Table 3: `grants_manager`

### Purpose
Manages Interledger payment grants for the interactive grant flow.

### Schema
```sql
CREATE TABLE grants_manager (
  id uuid PRIMARY KEY,
  uri text,
  value text,
  client_id uuid,
  timestamp timestamp with time zone DEFAULT now()
);
```

### Columns
- **id** (UUID, Primary Key): Transaction/grant identifier
- **uri** (text): Grant continuation URI for finalizing the grant
- **value** (text): Grant access token value
- **client_id** (uuid): Reference to the client (not a foreign key constraint)
- **timestamp** (timestamp with time zone): When the grant was created

### Current Issues
1. **No Foreign Key Constraint**:
   - `client_id` exists but is not enforced as a foreign key
   - Risk of orphaned grants

2. **No Grant Status**:
   - Cannot track if grant is pending, accepted, or expired
   - No expiration timestamp

3. **No Link to Transactions**:
   - Cannot correlate grants with the transactions they enabled
   - Important for auditing and reconciliation

---

## Database Relationships

### Current State
```
clients (id) --?--> grants_manager (client_id)  [No FK constraint]

transactions                                     [No relationships]
```

### Issues
- **No foreign key constraints**: Data integrity is not enforced
- **transactions table is isolated**: Cannot link transactions to clients or grants
- **No cascading deletes**: Deleting a client won't clean up related records

---

## Connection Details

### Configuration
```typescript
// From src/lib/db.ts
import { sql } from "bun";

// Connection via environment variable
// DATABASE_URL=postgresql://neondb_owner:...@ep-dry-wind-ah9y6ssy-pooler.c-3.us-east-1.aws.neon.tech/pagacarita?sslmode=require&channel_binding=require&autosave=conservative
```

### Usage Pattern
```typescript
// Query with tagged template literals
const clients = await sql<Client[]>`SELECT * FROM clients`;

// Parameterized insert
await sql`
  INSERT INTO transactions (amount, currency, store, snapshot, transcript)
  VALUES (${amount}, ${currency}, ${store}, ${snapshot_id}, ${transcript})
  RETURNING *;
`;
```

### Connection Type
- **Provider**: Neon (Serverless PostgreSQL)
- **Client**: `Bun.sql` (built-in PostgreSQL client)
- **Pooling**: Neon connection pooler enabled
- **SSL**: Required with channel binding

---

## Missing Tables for Full System

### 1. User Authentication Table
Currently missing - needed for:
- Email/password authentication
- Email verification status
- Account creation dates
- Last login tracking

### 2. Wallets Table
Currently missing - needed for:
- Multiple wallets per user
- Wallet names and descriptions
- Currency codes
- Initial and current balances
- Wallet creation dates

### 3. Face Images Table
Currently missing - needed for:
- Multiple face images per user
- S3 file references
- Rekognition face IDs
- Upload timestamps
- Primary/secondary face designation

### 4. Stores/Merchants Table
Currently missing - needed for:
- Store details (name, address)
- Store wallet information
- Store categories
- Operating hours

### 5. Sessions Table
Currently missing - needed for:
- User session management
- JWT tokens or session IDs
- Expiration tracking
- Device information

---

## Recommendations for New Schema

See [proposed-db-structure.md](./proposed-db-structure.md) for the complete proposed schema with:
- Proper foreign key relationships
- Additional user fields (email, phone, etc.)
- Dedicated wallets table
- Face images tracking
- Enhanced transaction metadata
- Stores/merchants table
- User sessions table
- Neon Auth integration fields
