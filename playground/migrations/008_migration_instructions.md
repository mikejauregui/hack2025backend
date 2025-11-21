# Database Migration Instructions

## Overview
These migrations create the complete database schema for the user registration and wallet management system.

## Migration Files
1. `001_create_users_table.sql` - Core user accounts
2. `002_create_user_sessions_table.sql` - Session management
3. `003_create_face_images_table.sql` - Face image tracking
4. `004_create_wallets_table.sql` - Multi-wallet support
5. `005_enhance_transactions_table.sql` - Add relationships to transactions
6. `006_create_stores_table.sql` - Store/merchant information
7. `007_enhance_grants_manager_table.sql` - Enhance grant tracking

## Prerequisites
- Neon PostgreSQL database URL configured in `.env`
- Database connection working
- Existing tables: `clients`, `transactions`, `grants_manager`

## Running Migrations

### Option 1: Manual Execution (Recommended for first time)

Connect to your Neon database and execute each migration file in order:

```bash
# Using psql
psql $DATABASE_URL -f playground/migrations/001_create_users_table.sql
psql $DATABASE_URL -f playground/migrations/002_create_user_sessions_table.sql
psql $DATABASE_URL -f playground/migrations/003_create_face_images_table.sql
psql $DATABASE_URL -f playground/migrations/004_create_wallets_table.sql
psql $DATABASE_URL -f playground/migrations/005_enhance_transactions_table.sql
psql $DATABASE_URL -f playground/migrations/006_create_stores_table.sql
psql $DATABASE_URL -f playground/migrations/007_enhance_grants_manager_table.sql
```

### Option 2: Using Neon Console

1. Log into your Neon console
2. Navigate to your `pagacarita` database
3. Go to SQL Editor
4. Copy and paste each migration file content
5. Execute them in order (001 → 007)

### Option 3: Using Bun Script

```bash
# Run all migrations
bun run migrate

# Or run specific migration
bun run playground/migrations/run-migrations.ts
```

## Data Migration Notes

### Migrating Existing Data

After running the migrations, you'll need to migrate existing data from the `clients` table:

```sql
-- Migrate existing clients to users
-- Note: This creates users WITHOUT passwords (they'll need to reset password)
INSERT INTO users (id, name, email, status, created_at)
SELECT
  id,
  name,
  COALESCE(name || '@temp.local', 'user' || id || '@temp.local') as email,
  'active',
  now()
FROM clients
WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.id = clients.id);

-- Migrate client wallets to wallets table
INSERT INTO wallets (user_id, name, wallet_url, currency_code, is_primary, current_grant_token, created_at)
SELECT
  id as user_id,
  'Primary Wallet' as name,
  wallet as wallet_url,
  'EUR' as currency_code,
  true as is_primary,
  grant_token as current_grant_token,
  now()
FROM clients
WHERE wallet IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM wallets
  WHERE wallets.user_id = clients.id
  AND wallets.is_primary = true
);
```

### Updating Existing Transactions

After creating wallets, link existing transactions:

```sql
-- Link transactions to users and wallets
-- This assumes transactions belong to users based on face recognition
-- You may need to adjust this based on your data

UPDATE transactions t
SET
  user_id = (
    SELECT user_id FROM face_images fi
    WHERE fi.rekognition_image_id = t.snapshot::text
    LIMIT 1
  ),
  wallet_id = (
    SELECT id FROM wallets w
    WHERE w.user_id = (
      SELECT user_id FROM face_images fi
      WHERE fi.rekognition_image_id = t.snapshot::text
      LIMIT 1
    )
    AND w.is_primary = true
    LIMIT 1
  ),
  created_at = COALESCE(t.timestamp, now()),
  payment_status = 'completed'
WHERE user_id IS NULL;
```

## Verification

After running migrations, verify the schema:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_sessions', 'face_images', 'wallets', 'transactions', 'stores', 'grants_manager')
ORDER BY table_name;

-- Check indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_sessions', 'face_images', 'wallets', 'transactions', 'stores', 'grants_manager')
ORDER BY tablename, indexname;

-- Check foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

## Rollback

If you need to rollback the migrations:

```sql
-- WARNING: This will delete all data!
-- Run in reverse order

DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS face_images CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
-- Don't drop transactions or grants_manager, just remove added columns
ALTER TABLE transactions
  DROP COLUMN IF EXISTS user_id,
  DROP COLUMN IF EXISTS wallet_id,
  DROP COLUMN IF EXISTS store_id,
  DROP COLUMN IF EXISTS payment_type,
  DROP COLUMN IF EXISTS payment_status,
  DROP COLUMN IF EXISTS interledger_payment_id,
  DROP COLUMN IF EXISTS grant_id,
  DROP COLUMN IF EXISTS snapshot_s3_key,
  DROP COLUMN IF EXISTS face_image_id,
  DROP COLUMN IF EXISTS face_match_confidence,
  DROP COLUMN IF EXISTS voice_s3_key,
  DROP COLUMN IF EXISTS created_at,
  DROP COLUMN IF EXISTS completed_at,
  DROP COLUMN IF EXISTS notes,
  DROP COLUMN IF EXISTS metadata;

ALTER TABLE grants_manager
  DROP COLUMN IF EXISTS user_id,
  DROP COLUMN IF EXISTS wallet_id,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS grant_type,
  DROP COLUMN IF EXISTS amount_authorized,
  DROP COLUMN IF EXISTS currency,
  DROP COLUMN IF EXISTS created_at,
  DROP COLUMN IF EXISTS accepted_at,
  DROP COLUMN IF EXISTS expires_at,
  DROP COLUMN IF EXISTS used_at,
  DROP COLUMN IF EXISTS interact_redirect_url,
  DROP COLUMN IF EXISTS interact_nonce;

DROP TABLE IF EXISTS users CASCADE;
```

## Post-Migration Steps

1. ✅ Verify all tables created successfully
2. ✅ Verify indexes created
3. ✅ Verify foreign key constraints
4. ✅ Migrate existing data from `clients` table
5. ✅ Test database connections from application
6. ✅ Update environment variables
7. ✅ Install new dependencies
8. ✅ Implement authentication endpoints

## Troubleshooting

### Error: "column already exists"
- This means the migration was partially run. Check which columns exist and comment out those lines.

### Error: "relation does not exist"
- Make sure migrations are run in order (001 → 007)
- Some migrations depend on previous ones

### Error: "constraint violation"
- Data migration may have issues. Check existing data quality
- Some users/wallets may not have required fields

### Performance Issues
- Ensure all indexes are created
- Check query execution plans
- Consider adding more indexes based on query patterns

## Next Steps

After successful migration:
1. Install dependencies: `bun add zeptomail liquidjs`
2. Create authentication utilities
3. Implement API endpoints
4. Test the authentication flow
