# Product Requirements Document: User Registration & Wallet Management System

## Document Information
- **Project**: Face-Based Payment System - User Registration & Onboarding
- **Version**: 1.1
- **Date**: 2025-11-21
- **Last Updated**: 2025-11-21
- **Status**: Approved - Ready for Implementation

### Changelog
- **v1.1** (2025-11-21): Resolved all open questions with stakeholder decisions
  - Added ZeptoMail + Liquid templates for email verification
  - Set wallet limit to 5 (configurable via env)
  - Set session duration to 5 minutes
  - Added grant renewal logic reference
  - Clarified prototype scope (no legal compliance needed yet)
  - Added age validation requirement (18+)
- **v1.0** (2025-11-21): Initial PRD draft

---

## Executive Summary

This PRD outlines the requirements for implementing a complete user registration and onboarding system for the face-based payment platform. The system will enable new users to:
1. Register with email and password (using Neon Auth patterns)
2. Upload facial images for biometric authentication
3. Create and manage multiple payment wallets
4. View transactions and account balance on their home dashboard

The implementation will enhance the existing face-recognition payment system by adding proper user management, authentication, and multi-wallet support.

---

## Table of Contents
1. [Background & Context](#background--context)
2. [Goals & Objectives](#goals--objectives)
3. [User Personas](#user-personas)
4. [User Stories](#user-stories)
5. [Functional Requirements](#functional-requirements)
6. [Technical Architecture](#technical-architecture)
7. [Database Schema](#database-schema)
8. [API Specifications](#api-specifications)
9. [User Interface Specifications](#user-interface-specifications)
10. [User Flows](#user-flows)
11. [Security & Privacy](#security--privacy)
12. [Implementation Phases](#implementation-phases)
13. [Success Metrics](#success-metrics)
14. [Open Questions](#open-questions)

---

## Background & Context

### Current State
The system currently has:
- ✅ Face recognition via AWS Rekognition
- ✅ Payment processing via Interledger Open Payments
- ✅ Basic transaction recording
- ✅ Manual user registration (database insertion)
- ❌ No user registration UI
- ❌ No authentication system
- ❌ Single wallet per user
- ❌ No user dashboard

### Problem Statement
Users cannot self-register for the payment system. All user onboarding is manual:
1. Admin manually inserts user record into database
2. Admin manually uploads face image to S3
3. Admin manually indexes face in AWS Rekognition
4. User has no way to view their transactions or manage their account

### Opportunity
By implementing self-service registration and user dashboards, we can:
- Scale user acquisition without manual intervention
- Improve user experience with self-service account management
- Support multiple wallets per user (different currencies, purposes)
- Provide transaction history and spending insights
- Enable proper authentication and session management

---

## Goals & Objectives

### Primary Goals
1. **Enable Self-Service Registration**: Users can create accounts without admin intervention
2. **Implement Authentication**: Secure email/password authentication with session management
3. **Biometric Enrollment**: Users can upload face images during onboarding
4. **Multi-Wallet Support**: Users can create and manage multiple payment wallets
5. **User Dashboard**: Users can view transactions, balances, and account details

### Secondary Goals
1. Email verification for account security
2. Profile management (update name, email, avatar)
3. Wallet management (add, rename, set primary, close)
4. Transaction filtering and search
5. Export transaction history

### Non-Goals (Future Phases)
- OAuth social login (Google, GitHub, etc.)
- Two-factor authentication (2FA)
- Multi-language support
- Mobile app
- Transaction disputes or chargebacks
- Currency exchange within the platform

---

## User Personas

### Persona 1: New User (Primary Target)
- **Name**: Sarah
- **Age**: 28
- **Occupation**: Software Developer
- **Tech Savviness**: High
- **Goals**:
  - Quick and easy account creation
  - Secure payment method for online purchases
  - Track spending across different categories
- **Pain Points**:
  - Frustrated with traditional payment methods
  - Wants biometric security without hardware tokens
  - Needs to manage personal and business expenses separately
- **Motivations**: Convenience, security, innovation

### Persona 2: Existing User (Manual Registration)
- **Name**: Mike
- **Age**: 35
- **Occupation**: Small Business Owner
- **Tech Savviness**: Medium
- **Goals**:
  - Access to account dashboard to view transactions
  - Ability to add additional face images for better recognition
  - Separate wallets for business and personal use
- **Pain Points**:
  - Currently has no visibility into account or transaction history
  - Cannot manage account without contacting admin
  - Has only one wallet, mixing personal and business payments
- **Motivations**: Financial organization, business management

### Persona 3: Store Owner (Merchant)
- **Name**: Diana
- **Age**: 42
- **Occupation**: Retail Store Owner
- **Tech Savviness**: Low-Medium
- **Goals**:
  - Accept face-based payments from customers
  - Track incoming payments
  - Simple setup process
- **Pain Points**:
  - Complex payment terminal setup
  - High transaction fees from traditional processors
  - Lack of customer payment insights
- **Motivations**: Cost reduction, customer satisfaction

---

## User Stories

### Registration & Onboarding

#### US-1: New User Sign Up
**As a** new user
**I want to** create an account with my email and password
**So that** I can access the face-based payment system

**Acceptance Criteria:**
- User can navigate to sign-up page
- User enters email, name, and password
- Password must be at least 8 characters
- Email must be unique in the system
- User receives session token upon successful registration
- User is redirected to face upload page

#### US-2: Face Image Upload
**As a** new user
**I want to** upload one or more photos of my face
**So that** I can be identified for biometric payments

**Acceptance Criteria:**
- User can upload 1-5 face images
- Images are validated (contains face, acceptable quality)
- Images are stored in S3
- Faces are indexed in AWS Rekognition
- User can designate one image as primary
- User sees confirmation when faces are successfully enrolled
- User can proceed to wallet creation

#### US-3: Wallet Creation
**As a** new user
**I want to** create my first payment wallet
**So that** I can start making payments

**Acceptance Criteria:**
- User provides wallet name (e.g., "Personal Wallet")
- User provides Interledger wallet URL
- User selects currency (EUR, USD, etc.)
- User optionally sets initial balance
- Wallet is created and marked as primary
- User is redirected to home dashboard

#### US-4: User Sign In
**As a** returning user
**I want to** sign in with my email and password
**So that** I can access my account

**Acceptance Criteria:**
- User enters email and password
- System validates credentials
- User receives session token
- User is redirected to home dashboard
- Invalid credentials show clear error message
- Session persists for 30 days or until logout

### Dashboard & Account Management

#### US-5: View Dashboard
**As a** logged-in user
**I want to** see my account overview
**So that** I can understand my financial status

**Acceptance Criteria:**
- Dashboard shows total balance across all wallets
- Dashboard shows list of all wallets with balances
- Dashboard shows recent transactions (last 10)
- Dashboard shows wallet count and face image count
- Dashboard has navigation to other sections

#### US-6: View All Transactions
**As a** logged-in user
**I want to** view all my transaction history
**So that** I can track my spending

**Acceptance Criteria:**
- Transactions are listed newest first
- Each transaction shows: date, amount, currency, wallet used, store name, status
- Transactions are paginated (20 per page)
- User can click transaction to view details
- Empty state shown when no transactions exist

#### US-7: View Transaction Details
**As a** logged-in user
**I want to** view detailed information about a specific transaction
**So that** I can understand the payment context

**Acceptance Criteria:**
- Shows full transaction details: ID, timestamp, amount, currency, wallet, store
- Shows snapshot image used for face recognition
- Shows face match confidence score
- Shows payment status and Interledger payment ID
- Shows voice transcript if available
- Includes link to store details

#### US-8: Create Additional Wallet
**As a** logged-in user
**I want to** create additional wallets
**So that** I can separate different types of payments

**Acceptance Criteria:**
- User navigates to "Add Wallet" page
- User provides: name, Interledger wallet URL, currency, initial balance
- User can optionally set as primary wallet
- Wallet is created and appears in wallet list
- User can create up to 10 wallets

#### US-9: Manage Wallets
**As a** logged-in user
**I want to** manage my existing wallets
**So that** I can organize my payment methods

**Acceptance Criteria:**
- User can view list of all wallets
- User can rename a wallet
- User can set a different wallet as primary
- User can close a wallet (soft delete, not if has balance)
- User can view wallet transaction history
- Changes are reflected immediately

#### US-10: Add Additional Face Images
**As a** logged-in user
**I want to** add more face images to my account
**So that** face recognition is more accurate

**Acceptance Criteria:**
- User navigates to "Face Images" section
- User can upload new face images (up to 5 total)
- User can set a different image as primary
- User can delete non-primary images
- Each image shows: upload date, usage count, last used
- Changes are synced with AWS Rekognition

### Payment Flow (Enhanced)

#### US-11: Make Payment with Face Recognition
**As a** logged-in user
**I want to** make a payment by showing my face
**So that** I can pay quickly without typing credentials

**Acceptance Criteria:**
- Existing `/api/upload` endpoint is enhanced
- System identifies user via face recognition
- System checks if user is authenticated (optional: require active session)
- Payment is processed from user's primary wallet (or specified wallet)
- Transaction is linked to user_id, wallet_id, and face_image_id
- User receives transaction confirmation
- Transaction appears in user's dashboard immediately

### Account Settings

#### US-12: Update Profile
**As a** logged-in user
**I want to** update my profile information
**So that** my account details are current

**Acceptance Criteria:**
- User can update: name, email, phone, date of birth, avatar
- Email change requires verification
- User sees confirmation when changes are saved
- Updated information is reflected throughout the app

#### US-13: Change Password
**As a** logged-in user
**I want to** change my password
**So that** I can maintain account security

**Acceptance Criteria:**
- User enters current password
- User enters new password (twice for confirmation)
- New password must meet strength requirements
- Current password must be valid
- User is logged out of other sessions after password change
- User receives confirmation email

#### US-14: Sign Out
**As a** logged-in user
**I want to** sign out of my account
**So that** my session is terminated

**Acceptance Criteria:**
- User clicks "Sign Out" button
- Session token is invalidated in database
- User is redirected to sign-in page
- Local storage is cleared
- User must sign in again to access account

---

## Functional Requirements

### FR-1: Authentication System
- **FR-1.1**: System shall support email/password authentication
- **FR-1.2**: Passwords shall be hashed using Bun's native bcrypt implementation
- **FR-1.3**: Sessions shall be stored in PostgreSQL with 30-day expiration
- **FR-1.4**: Session tokens shall be validated on protected endpoints
- **FR-1.5**: Sessions shall be invalidated on logout

### FR-2: User Registration
- **FR-2.1**: System shall validate email format
- **FR-2.2**: System shall enforce password minimum length of 8 characters
- **FR-2.3**: System shall prevent duplicate email registration
- **FR-2.4**: System shall create user record with status "active"
- **FR-2.5**: System shall generate session token on successful registration

### FR-3: Face Enrollment
- **FR-3.1**: System shall accept image uploads in PNG/JPG format
- **FR-3.2**: System shall validate presence of face in image using AWS Rekognition
- **FR-3.3**: System shall store images in S3 bucket
- **FR-3.4**: System shall index faces in AWS Rekognition collection
- **FR-3.5**: System shall support up to 5 face images per user
- **FR-3.6**: System shall track which face image is primary
- **FR-3.7**: System shall record face image metadata in `face_images` table

### FR-4: Wallet Management
- **FR-4.1**: System shall support multiple wallets per user
- **FR-4.2**: System shall require wallet name, URL, and currency on creation
- **FR-4.3**: System shall validate Interledger wallet URL format
- **FR-4.4**: System shall allow up to 10 wallets per user
- **FR-4.5**: System shall maintain one primary wallet per user
- **FR-4.6**: System shall prevent deletion of wallets with positive balance
- **FR-4.7**: System shall track wallet balance changes

### FR-5: Transaction Management
- **FR-5.1**: System shall link all transactions to user_id and wallet_id
- **FR-5.2**: System shall record face_image_id and match confidence for each transaction
- **FR-5.3**: System shall store snapshot and voice recordings in S3
- **FR-5.4**: System shall track payment status (pending, completed, failed)
- **FR-5.5**: System shall record Interledger payment ID for completed payments
- **FR-5.6**: System shall update wallet balance on transaction completion

### FR-6: User Dashboard
- **FR-6.1**: System shall display aggregate balance across all wallets
- **FR-6.2**: System shall list all user wallets with individual balances
- **FR-6.3**: System shall show recent transaction history
- **FR-6.4**: System shall provide navigation to account sections
- **FR-6.5**: Dashboard shall refresh data on each page load

### FR-7: Authorization
- **FR-7.1**: System shall require authentication for all user-specific endpoints
- **FR-7.2**: System shall verify user owns resources before granting access
- **FR-7.3**: System shall return 401 for invalid/expired tokens
- **FR-7.4**: System shall return 403 for unauthorized resource access

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                           │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Auth    │  │Onboarding│  │Dashboard │  │ Settings │          │
│  │  Pages   │  │   Flow   │  │   Page   │  │   Page   │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────┐        │
│  │           AuthContext (Session Management)             │        │
│  └───────────────────────────────────────────────────────┘        │
│                                                                     │
└────────────────────────────┬────────────────────────────────────────┘
                            │ HTTP/JSON
                            │ Bearer Token Auth
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Backend (Bun.serve)                           │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Auth Middleware                         │   │
│  │         (Validates session tokens on protected routes)     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐      │
│  │  Auth Routes   │  │  User Routes   │  │Payment Routes  │      │
│  │  /api/auth/*   │  │  /api/users/*  │  │  /api/upload   │      │
│  └────────────────┘  └────────────────┘  └────────────────┘      │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐      │
│  │Wallet Routes   │  │  Transaction   │  │  Grant Routes  │      │
│  │/api/wallets/*  │  │    Routes      │  │  /api/grant/*  │      │
│  └────────────────┘  └────────────────┘  └────────────────┘      │
│                                                                     │
└────────────┬───────────────────┬──────────────────┬─────────────────┘
            │                   │                  │
            ▼                   ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Neon Postgres   │  │    AWS Services   │  │   Interledger    │
│                  │  │                   │  │   Open Payments  │
│  • users         │  │  • S3 (Images)    │  │                  │
│  • wallets       │  │  • Rekognition    │  │  • Grants        │
│  • transactions  │  │    (Faces)        │  │  • Quotes        │
│  • face_images   │  │                   │  │  • Payments      │
│  • sessions      │  │                   │  │                  │
│  • grants        │  │                   │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Runtime | Bun | Fast, native TypeScript support, built-in APIs |
| Backend Framework | Bun.serve() | Native HTTP server with routing |
| Frontend | React 19 | Component-based UI, large ecosystem |
| Router | Wouter | Lightweight, no external dependencies |
| Styling | TailwindCSS 4 | Utility-first, fast development |
| UI Components | shadcn/ui | Pre-built accessible components |
| Database | Neon PostgreSQL | Serverless, auto-scaling, Bun.sql support |
| Database Client | Bun.sql | Native Bun PostgreSQL client |
| Face Recognition | AWS Rekognition | Industry-leading accuracy |
| Image Storage | AWS S3 | Scalable, durable object storage |
| Payment Protocol | Interledger | Open standard for payments |
| Password Hashing | Bun.password | Native bcrypt implementation |

### Data Flow: User Registration

```
User Browser                Backend                Database            AWS
     │                         │                      │                 │
     │──(1) POST /auth/signup──>                      │                 │
     │    {email, name, pwd}    │                      │                 │
     │                         │                      │                 │
     │                         │──(2) Hash password   │                 │
     │                         │    (Bun.password)    │                 │
     │                         │                      │                 │
     │                         │──(3) INSERT user────>│                 │
     │                         │                      │                 │
     │                         │<─(4) User created────│                 │
     │                         │                      │                 │
     │                         │──(5) Create session─>│                 │
     │                         │                      │                 │
     │                         │<─(6) Session token───│                 │
     │                         │                      │                 │
     │<─(7) {token, user}──────│                      │                 │
     │                         │                      │                 │
     │──(8) Upload face img───>│                      │                 │
     │                         │                      │                 │
     │                         │──(9) Upload to S3────────────────────>│
     │                         │                      │                 │
     │                         │<─(10) S3 key─────────────────────────│
     │                         │                      │                 │
     │                         │──(11) Index face─────────────────────>│
     │                         │     (Rekognition)    │                 │
     │                         │                      │                 │
     │                         │<─(12) Face ID────────────────────────│
     │                         │                      │                 │
     │                         │──(13) Save metadata─>│                 │
     │                         │     to face_images   │                 │
     │                         │                      │                 │
     │<─(14) Success───────────│                      │                 │
     │                         │                      │                 │
     │──(15) Create wallet────>│                      │                 │
     │                         │                      │                 │
     │                         │──(16) INSERT wallet─>│                 │
     │                         │                      │                 │
     │<─(17) Wallet created────│                      │                 │
     │                         │                      │                 │
```

### Data Flow: Face-Based Payment

```
User Camera              Backend              Database           AWS         Interledger
     │                      │                     │               │               │
     │─(1) Capture photo   │                     │               │               │
     │                      │                     │               │               │
     │─(2) POST /api/upload─>                    │               │               │
     │    {snapshot, amount}│                     │               │               │
     │                      │                     │               │               │
     │                      │─(3) Upload to S3────────────────>│               │
     │                      │                     │               │               │
     │                      │<─(4) S3 key─────────────────────│               │
     │                      │                     │               │               │
     │                      │─(5) Search face─────────────────>│               │
     │                      │    (Rekognition)    │               │               │
     │                      │                     │               │               │
     │                      │<─(6) User ID────────────────────│               │
     │                      │    + Confidence     │               │               │
     │                      │                     │               │               │
     │                      │─(7) Get user + wallet──────>│               │
     │                      │                     │               │               │
     │                      │<─(8) User data──────│               │               │
     │                      │                     │               │               │
     │                      │─(9) Create payment────────────────────────────────>│
     │                      │    (Interledger)    │               │               │
     │                      │                     │               │               │
     │                      │<─(10) Payment ID────────────────────────────────────│
     │                      │                     │               │               │
     │                      │─(11) INSERT txn─────>               │               │
     │                      │    (user_id, wallet_id, face_image_id, etc.)       │
     │                      │                     │               │               │
     │                      │─(12) UPDATE wallet──>               │               │
     │                      │    balance          │               │               │
     │                      │                     │               │               │
     │<─(13) Success────────│                     │               │               │
     │    {transaction}     │                     │               │               │
```

---

## Database Schema

See [playground/proposed-db-structure.md](./playground/proposed-db-structure.md) for complete schema.

### Key Tables Summary

#### 1. **users**
Primary user information table with authentication and profile data.

**Key Fields**: `id`, `email`, `password_hash`, `name`, `email_verified`, `neon_auth_user_id`, `created_at`, `status`

#### 2. **user_sessions**
Session management for authentication.

**Key Fields**: `id`, `user_id`, `session_token`, `expires_at`, `is_active`, `device_info`

#### 3. **face_images**
Tracks face images for biometric authentication.

**Key Fields**: `id`, `user_id`, `s3_key`, `rekognition_image_id`, `is_primary`, `match_count`, `status`

#### 4. **wallets**
Multiple wallets per user with balance tracking.

**Key Fields**: `id`, `user_id`, `name`, `wallet_url`, `currency_code`, `current_balance`, `is_primary`, `status`

#### 5. **transactions** (Enhanced)
All payment transactions with full relationships.

**Key Fields**: `id`, `user_id`, `wallet_id`, `store_id`, `amount`, `payment_status`, `face_image_id`, `face_match_confidence`, `interledger_payment_id`

#### 6. **stores**
Merchant/store information.

**Key Fields**: `id`, `name`, `wallet_url`, `category`, `status`

#### 7. **grants_manager** (Enhanced)
Interledger payment grants with status tracking.

**Key Fields**: `id`, `user_id`, `wallet_id`, `status`, `amount_authorized`, `expires_at`

### Entity Relationships

```
users (1) ──< (N) user_sessions
users (1) ──< (N) face_images
users (1) ──< (N) wallets
users (1) ──< (N) transactions
users (1) ──< (N) grants_manager

wallets (1) ──< (N) transactions
wallets (1) ──< (N) grants_manager

face_images (1) ──< (N) transactions

stores (1) ──< (N) transactions

grants_manager (1) ──< (N) transactions
```

---

## API Specifications

### Authentication Endpoints

#### POST /api/auth/signup
Create new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "token": "uuid-session-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "email_verified": false
  }
}
```

**Errors:**
- `400`: Invalid input (email format, password length)
- `409`: Email already registered

---

#### POST /api/auth/signin
Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "token": "uuid-session-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "email_verified": true
  }
}
```

**Errors:**
- `400`: Missing email or password
- `401`: Invalid credentials

---

#### POST /api/auth/signout
End user session.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response (200):**
```json
{
  "message": "Signed out successfully"
}
```

---

#### GET /api/auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "email_verified": true,
  "avatar_url": "https://...",
  "created_at": "2025-11-21T10:00:00Z"
}
```

**Errors:**
- `401`: Invalid or expired token

---

### User Endpoints

#### POST /api/users/upload-face
Upload face image for user.

**Headers:**
```
Authorization: Bearer {session_token}
Content-Type: multipart/form-data
```

**Request (FormData):**
```
face: <image file>
is_primary: true/false
```

**Response (200):**
```json
{
  "face_image": {
    "id": "uuid",
    "user_id": "uuid",
    "s3_key": "face-uuid.png",
    "rekognition_image_id": "user-uuid",
    "is_primary": true,
    "uploaded_at": "2025-11-21T10:05:00Z"
  }
}
```

**Errors:**
- `400`: Invalid image format or no face detected
- `401`: Not authenticated
- `409`: Maximum face images (5) reached

---

#### GET /api/users/face-images
Get all face images for current user.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response (200):**
```json
{
  "face_images": [
    {
      "id": "uuid",
      "s3_key": "face-uuid.png",
      "is_primary": true,
      "uploaded_at": "2025-11-21T10:05:00Z",
      "last_used_at": "2025-11-21T15:30:00Z",
      "match_count": 42
    }
  ]
}
```

---

#### DELETE /api/users/face-images/:id
Delete a face image (cannot delete primary if it's the only one).

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response (200):**
```json
{
  "message": "Face image deleted successfully"
}
```

**Errors:**
- `400`: Cannot delete primary/only face image
- `404`: Face image not found

---

### Wallet Endpoints

#### POST /api/wallets
Create new wallet for user.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Request:**
```json
{
  "name": "Personal EUR Wallet",
  "wallet_url": "https://ilp.interledger-test.dev/username",
  "currency_code": "EUR",
  "initial_amount": 100.00,
  "is_primary": false
}
```

**Response (200):**
```json
{
  "wallet": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Personal EUR Wallet",
    "wallet_url": "https://ilp.interledger-test.dev/username",
    "currency_code": "EUR",
    "current_balance": 100.00,
    "is_primary": false,
    "created_at": "2025-11-21T10:10:00Z",
    "status": "active"
  }
}
```

**Errors:**
- `400`: Invalid wallet URL or currency
- `409`: Maximum wallets (10) reached

---

#### GET /api/wallets
Get all wallets for current user.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response (200):**
```json
{
  "wallets": [
    {
      "id": "uuid",
      "name": "Primary Wallet",
      "wallet_url": "https://...",
      "currency_code": "EUR",
      "current_balance": 250.50,
      "is_primary": true,
      "created_at": "2025-11-21T10:00:00Z",
      "last_used_at": "2025-11-21T15:30:00Z",
      "status": "active"
    }
  ]
}
```

---

#### PATCH /api/wallets/:id
Update wallet details.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Request:**
```json
{
  "name": "Updated Wallet Name",
  "is_primary": true
}
```

**Response (200):**
```json
{
  "wallet": { /* updated wallet object */ }
}
```

---

#### DELETE /api/wallets/:id
Close a wallet (soft delete, only if balance is 0).

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response (200):**
```json
{
  "message": "Wallet closed successfully"
}
```

**Errors:**
- `400`: Cannot close wallet with balance > 0
- `404`: Wallet not found

---

### Transaction Endpoints

#### GET /api/transactions
Get all transactions for current user.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Query Parameters:**
```
?limit=20&offset=0&wallet_id=uuid&status=completed
```

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "wallet_id": "uuid",
      "wallet_name": "Personal Wallet",
      "store_id": "uuid",
      "store_name": "Coffee Shop",
      "amount": 5.50,
      "currency": "EUR",
      "payment_status": "completed",
      "face_match_confidence": 98.5,
      "created_at": "2025-11-21T15:30:00Z",
      "completed_at": "2025-11-21T15:30:05Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

#### GET /api/transactions/:id
Get specific transaction details.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response (200):**
```json
{
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "wallet_id": "uuid",
    "wallet_name": "Personal Wallet",
    "store_id": "uuid",
    "store_name": "Coffee Shop",
    "amount": 5.50,
    "currency": "EUR",
    "payment_type": "outgoing",
    "payment_status": "completed",
    "interledger_payment_id": "ilp-payment-id",
    "snapshot_url": "https://s3.../snapshot-uuid.png",
    "face_image_id": "uuid",
    "face_match_confidence": 98.5,
    "voice_url": "https://s3.../voice-uuid.wav",
    "transcript": "Five fifty please",
    "created_at": "2025-11-21T15:30:00Z",
    "completed_at": "2025-11-21T15:30:05Z",
    "metadata": {}
  }
}
```

**Errors:**
- `403`: Not authorized to view this transaction
- `404`: Transaction not found

---

### Enhanced Payment Endpoint

#### POST /api/upload (Enhanced)
Process payment with face recognition (existing endpoint, enhanced with user context).

**Headers:**
```
Authorization: Bearer {session_token} (optional, for known sessions)
Content-Type: multipart/form-data
```

**Request (FormData):**
```
snapshot: <image file>
amount: "10.50"
currency: "EUR"
wallet_id: "uuid" (optional, defaults to primary)
transcript: "optional voice transcript"
voice: <audio file> (optional)
```

**Response (200):**
```json
{
  "message": "Payment completed successfully",
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "wallet_id": "uuid",
    "amount": 10.50,
    "currency": "EUR",
    "payment_status": "completed",
    "face_match_confidence": 97.8,
    "created_at": "2025-11-21T15:30:00Z"
  },
  "user": {
    "id": "uuid",
    "name": "John Doe"
  }
}
```

**Errors:**
- `400`: No face detected in image
- `401`: Face not recognized
- `402`: Insufficient wallet balance
- `500`: Payment processing failed

---

## User Interface Specifications

### Page Hierarchy

```
/ (Landing/Home - Public)
├── /signin
├── /signup
│
└── /app (Authenticated Area)
    ├── /dashboard (Home)
    ├── /transactions
    │   └── /transactions/:id (Transaction Detail)
    ├── /wallets
    │   ├── /wallets/new
    │   └── /wallets/:id
    ├── /face-images
    │   └── /face-images/upload
    ├── /settings
    │   ├── /settings/profile
    │   ├── /settings/security
    │   └── /settings/preferences
    │
    └── /onboarding (First-time user flow)
        ├── /onboarding/upload-face
        └── /onboarding/create-wallet
```

### Wireframes & Specifications

#### 1. Sign Up Page (`/signup`)

**Layout:**
```
┌────────────────────────────────────────┐
│         Face-Based Payment System      │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │      Create Your Account         │ │
│  │                                  │ │
│  │  Name:     [____________]        │ │
│  │                                  │ │
│  │  Email:    [____________]        │ │
│  │                                  │ │
│  │  Password: [____________]        │ │
│  │           (min 8 characters)    │ │
│  │                                  │ │
│  │         [   Sign Up   ]          │ │
│  │                                  │ │
│  │  Already have an account?        │ │
│  │        Sign in here              │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Components:**
- Form with name, email, password fields
- Client-side validation (email format, password length)
- Submit button (disabled while loading)
- Error message display area
- Link to sign-in page

---

#### 2. Upload Face Page (`/onboarding/upload-face`)

**Layout:**
```
┌────────────────────────────────────────┐
│  Onboarding (Step 1 of 2)             │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   Upload Your Face Photo         │ │
│  │                                  │ │
│  │   We need at least one photo     │ │
│  │   of your face for payments      │ │
│  │                                  │ │
│  │   ┌────────────────────────┐     │ │
│  │   │                        │     │ │
│  │   │   [Camera Icon]        │     │ │
│  │   │   Click to upload      │     │ │
│  │   │                        │     │ │
│  │   └────────────────────────┘     │ │
│  │                                  │ │
│  │   Uploaded: ✓ Photo 1            │ │
│  │             + Add another (0/4)  │ │
│  │                                  │ │
│  │         [   Continue   ]         │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Components:**
- File upload dropzone (accepts PNG, JPG)
- Preview of uploaded images
- Validation indicator (face detected)
- Option to upload multiple images (up to 5)
- Progress indicator (Step 1 of 2)
- Continue button (enabled when ≥1 image uploaded)

---

#### 3. Create Wallet Page (`/onboarding/create-wallet`)

**Layout:**
```
┌────────────────────────────────────────┐
│  Onboarding (Step 2 of 2)             │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   Create Your First Wallet       │ │
│  │                                  │ │
│  │  Wallet Name:                    │ │
│  │  [Personal Wallet___________]    │ │
│  │                                  │ │
│  │  Wallet URL:                     │ │
│  │  [https://ilp.interledger-...]   │ │
│  │                                  │ │
│  │  Currency:                       │ │
│  │  [EUR ▼]                         │ │
│  │                                  │ │
│  │  Initial Balance (optional):     │ │
│  │  [100.00____________]            │ │
│  │                                  │ │
│  │         [Create Wallet]          │ │
│  │                                  │ │
│  │         Skip for now →           │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Components:**
- Form fields: name, URL, currency, initial balance
- Currency dropdown (EUR, USD, GBP, etc.)
- URL validation (Interledger format)
- Create button
- Skip link (creates default wallet)

---

#### 4. Dashboard Page (`/app/dashboard`)

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  [Logo] Dashboard  Transactions  Wallets  Settings    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Welcome back, John! 👋                               │
│                                                        │
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │  Total Balance   │  │  Wallets         │          │
│  │                  │  │                  │          │
│  │  €350.75        │  │  3 active        │          │
│  └──────────────────┘  └──────────────────┘          │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  Your Wallets                    [+ New Wallet]│  │
│  │                                                │  │
│  │  Primary Wallet              €250.50  EUR  ★  │  │
│  │  Business Wallet             €100.25  EUR     │  │
│  │  USD Wallet                    $50.00  USD     │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  Recent Transactions         [View All →]     │  │
│  │                                                │  │
│  │  Coffee Shop           -€5.50    11/21 3:30pm│  │
│  │  Grocery Store        -€42.30    11/20 6:15pm│  │
│  │  Gas Station          -€60.00    11/19 9:00am│  │
│  └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Components:**
- Navigation header
- Welcome message with user name
- Summary cards (total balance, wallet count)
- Wallets list (name, balance, currency, primary indicator)
- Recent transactions list (store, amount, timestamp)
- "View All" link for transactions
- "+ New Wallet" button

---

#### 5. Transactions Page (`/app/transactions`)

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  [Logo] Dashboard  Transactions  Wallets  Settings    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  All Transactions                                     │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │  Filter:  [All Wallets ▼]  [All Status ▼]   │    │
│  │           [Search transactions___________]   │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  Nov 21, 2025                                  │  │
│  │                                                │  │
│  │  ┌──────────────────────────────────────────┐ │  │
│  │  │ Coffee Shop                     3:30 PM  │ │  │
│  │  │ Personal Wallet                          │ │  │
│  │  │ -€5.50                            ✓      │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  │                                                │  │
│  │  ┌──────────────────────────────────────────┐ │  │
│  │  │ Online Store                   10:15 AM  │ │  │
│  │  │ Business Wallet                          │ │  │
│  │  │ -€99.99                           ✓      │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  │                                                │  │
│  │  Nov 20, 2025                                  │  │
│  │  [... more transactions ...]                  │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  [← Previous]           Page 1 of 8       [Next →]   │
└────────────────────────────────────────────────────────┘
```

**Components:**
- Filter controls (wallet, status, search)
- Transactions list grouped by date
- Transaction cards showing: store, wallet, amount, status, time
- Click to view details
- Pagination controls

---

#### 6. Transaction Detail Page (`/app/transactions/:id`)

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  [← Back to Transactions]                             │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Transaction Details                                  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │                                                │  │
│  │  Coffee Shop                                   │  │
│  │  €5.50                                         │  │
│  │  ✓ Completed                                   │  │
│  │                                                │  │
│  │  ─────────────────────────────────────────    │  │
│  │                                                │  │
│  │  Date & Time: Nov 21, 2025 at 3:30 PM        │  │
│  │  Wallet: Personal Wallet                       │  │
│  │  Currency: EUR                                 │  │
│  │  Transaction ID: abc-123-def                   │  │
│  │  Interledger ID: ilp-payment-xyz               │  │
│  │  Face Match: 98.5%                             │  │
│  │                                                │  │
│  │  ─────────────────────────────────────────    │  │
│  │                                                │  │
│  │  Snapshot:                                     │  │
│  │  ┌──────────────┐                             │  │
│  │  │              │                             │  │
│  │  │  [Face photo]│                             │  │
│  │  │              │                             │  │
│  │  └──────────────┘                             │  │
│  │                                                │  │
│  │  Voice Transcript:                             │  │
│  │  "Five fifty please"                           │  │
│  └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Components:**
- Back button
- Transaction summary (store, amount, status)
- Detailed information (date, wallet, IDs, confidence)
- Snapshot image display
- Voice transcript (if available)

---

#### 7. Wallets Page (`/app/wallets`)

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  [Logo] Dashboard  Transactions  Wallets  Settings    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Your Wallets                        [+ New Wallet]   │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  Primary Wallet                    ★           │  │
│  │                                                │  │
│  │  Balance: €250.50                             │  │
│  │  Currency: EUR                                 │  │
│  │  URL: https://ilp.interledger-test.dev/...    │  │
│  │  Created: Nov 1, 2025                          │  │
│  │  Last used: Nov 21, 2025                       │  │
│  │                                                │  │
│  │  [View Transactions]  [Settings]               │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  Business Wallet                               │  │
│  │                                                │  │
│  │  Balance: €100.25                             │  │
│  │  Currency: EUR                                 │  │
│  │  URL: https://ilp.interledger-test.dev/...    │  │
│  │  Created: Nov 15, 2025                         │  │
│  │  Last used: Nov 20, 2025                       │  │
│  │                                                │  │
│  │  [View Transactions]  [Settings]               │  │
│  └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Components:**
- List of wallet cards
- Each card shows: name, balance, currency, URL, dates
- Primary wallet indicator (star)
- Action buttons: View Transactions, Settings
- "+ New Wallet" button

---

### Design System

#### Colors
- **Primary**: Blue (#2563eb)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Background**: White (#ffffff)
- **Surface**: Light Gray (#f9fafb)
- **Text Primary**: Dark Gray (#111827)
- **Text Secondary**: Medium Gray (#6b7280)

#### Typography
- **Font Family**: System fonts (Inter, -apple-system, BlinkMacSystemFont)
- **Headings**: Bold, larger sizes
- **Body**: Regular, 16px base
- **Small**: 14px for secondary text

#### Spacing
- **Base unit**: 4px
- **Standard spacing**: 4px, 8px, 16px, 24px, 32px, 48px

#### Components (shadcn/ui)
- Button: Primary, secondary, ghost, outline variants
- Card: Container for content sections
- Input: Text fields with label and validation
- Select: Dropdown menus
- Dialog: Modal overlays
- Toast: Notification messages

---

## User Flows

### Flow 1: New User Registration & Onboarding

```
1. User visits site (landing page)
   │
   ├─→ Clicks "Sign Up"
   │
2. Sign Up Page (/signup)
   │
   ├─→ Enters: name, email, password
   ├─→ Clicks "Sign Up"
   │
   ├─→ [Validation]
   │   ├─→ Email format valid?
   │   ├─→ Password ≥8 characters?
   │   └─→ Email not already registered?
   │
   ├─→ [Success]
   │   ├─→ User created in database
   │   ├─→ Session token generated
   │   └─→ Token stored in localStorage
   │
3. Upload Face Page (/onboarding/upload-face)
   │
   ├─→ Clicks "Upload Photo"
   ├─→ Selects image file(s)
   │
   ├─→ [Processing]
   │   ├─→ Upload to S3
   │   ├─→ Validate face detected (Rekognition)
   │   └─→ Index face in Rekognition collection
   │
   ├─→ [Success]
   │   ├─→ Face image metadata saved
   │   └─→ Shows checkmark confirmation
   │
   ├─→ (Optional) Upload additional images
   │
   ├─→ Clicks "Continue"
   │
4. Create Wallet Page (/onboarding/create-wallet)
   │
   ├─→ Enters: wallet name, URL, currency, initial balance
   ├─→ Clicks "Create Wallet"
   │
   ├─→ [Validation]
   │   └─→ Wallet URL format valid?
   │
   ├─→ [Success]
   │   ├─→ Wallet created in database
   │   └─→ Set as primary wallet
   │
5. Dashboard (/app/dashboard)
   │
   └─→ User is fully onboarded and can start making payments
```

### Flow 2: Returning User Sign In

```
1. User visits site
   │
   ├─→ Clicks "Sign In"
   │
2. Sign In Page (/signin)
   │
   ├─→ Enters: email, password
   ├─→ Clicks "Sign In"
   │
   ├─→ [Authentication]
   │   ├─→ Get user by email
   │   ├─→ Verify password hash
   │   └─→ Create new session
   │
   ├─→ [Success]
   │   ├─→ Session token generated
   │   ├─→ Token stored in localStorage
   │   └─→ Update last_login_at
   │
3. Dashboard (/app/dashboard)
   │
   └─→ User sees account overview and recent activity
```

### Flow 3: Face-Based Payment (Enhanced)

```
1. User at Point of Sale (external device/kiosk)
   │
   ├─→ Amount displayed: €10.50
   ├─→ Camera captures user's face
   │
2. [Payment Processing]
   │
   ├─→ POST /api/upload
   │   ├─→ snapshot image
   │   ├─→ amount
   │   └─→ currency
   │
   ├─→ [Backend Processing]
   │   │
   │   ├─→ Upload snapshot to S3
   │   │
   │   ├─→ AWS Rekognition Search
   │   │   ├─→ Find matching face
   │   │   └─→ Return user_id + confidence
   │   │
   │   ├─→ [Face Recognized?]
   │   │   ├─→ No: Return 401 "Face not recognized"
   │   │   └─→ Yes: Continue
   │   │
   │   ├─→ Get user and primary wallet from database
   │   │
   │   ├─→ Check wallet balance ≥ amount
   │   │   ├─→ Insufficient: Return 402 "Insufficient balance"
   │   │   └─→ Sufficient: Continue
   │   │
   │   ├─→ Create Interledger Payment
   │   │   ├─→ Get incoming payment grant
   │   │   ├─→ Create incoming payment
   │   │   ├─→ Get quote grant
   │   │   ├─→ Create quote
   │   │   ├─→ Use stored grant token (or request new)
   │   │   └─→ Create outgoing payment
   │   │
   │   ├─→ [Payment Success?]
   │   │   ├─→ No: Return 500 "Payment failed"
   │   │   └─→ Yes: Continue
   │   │
   │   ├─→ Create transaction record
   │   │   ├─→ Link to user_id
   │   │   ├─→ Link to wallet_id
   │   │   ├─→ Link to face_image_id
   │   │   ├─→ Store confidence score
   │   │   ├─→ Store Interledger payment ID
   │   │   └─→ Set status: "completed"
   │   │
   │   └─→ Update wallet balance
   │       └─→ current_balance -= amount
   │
3. [Response to User]
   │
   ├─→ Display: "Payment Successful!"
   ├─→ Show: Amount, User name
   └─→ Receipt generated
```

### Flow 4: Create Additional Wallet

```
1. User on Dashboard
   │
   ├─→ Clicks "Wallets" in navigation
   │
2. Wallets Page (/app/wallets)
   │
   ├─→ Sees list of existing wallets
   ├─→ Clicks "+ New Wallet"
   │
3. Create Wallet Page (/app/wallets/new)
   │
   ├─→ Enters: name, URL, currency, initial balance
   ├─→ (Optional) Checks "Set as primary"
   ├─→ Clicks "Create Wallet"
   │
   ├─→ [Validation]
   │   ├─→ All required fields filled?
   │   ├─→ URL format valid?
   │   ├─→ User has < 10 wallets?
   │   └─→ If setting as primary, update other wallets
   │
   ├─→ [Success]
   │   ├─→ Wallet created
   │   └─→ Redirect to Wallets page
   │
4. Wallets Page
   │
   └─→ New wallet appears in list
```

### Flow 5: View Transaction History

```
1. User on Dashboard
   │
   ├─→ Clicks "View All" under Recent Transactions
   │   OR
   ├─→ Clicks "Transactions" in navigation
   │
2. Transactions Page (/app/transactions)
   │
   ├─→ Sees list of all transactions (paginated)
   │
   ├─→ (Optional) Filter by wallet
   ├─→ (Optional) Filter by status
   ├─→ (Optional) Search transactions
   │
   ├─→ Clicks on a transaction
   │
3. Transaction Detail Page (/app/transactions/:id)
   │
   ├─→ Views full transaction details
   ├─→ Sees snapshot image
   ├─→ Sees face match confidence
   ├─→ Sees voice transcript (if available)
   │
   └─→ Clicks "Back" to return to list
```

---

## Security & Privacy

### Authentication Security

#### Password Security
- **Hashing**: Bun.password.hash with bcrypt algorithm
- **Cost Factor**: 10 (industry standard)
- **Salt**: Automatically handled by bcrypt
- **Minimum Length**: 8 characters (should add complexity requirements)

#### Session Management
- **Token Generation**: UUID v7 (time-ordered, cryptographically secure)
- **Storage**: PostgreSQL with server-side validation
- **Expiration**: 30 days default (configurable)
- **Invalidation**: On logout, password change
- **Token Transmission**: HTTP Authorization header (Bearer token)
- **HTTPS Only**: All auth endpoints must use HTTPS in production

#### Rate Limiting
**Critical Endpoints:**
- `/api/auth/signup`: 5 requests per hour per IP
- `/api/auth/signin`: 10 requests per hour per email
- `/api/auth/me`: 100 requests per hour per token
- `/api/upload`: 20 requests per hour per user (payment fraud prevention)

**Implementation**: Use in-memory cache or Redis for rate limiting counters.

### Face Recognition Security

#### Data Privacy
- **Storage**: Face images stored in private S3 bucket (not public)
- **Encryption**: S3 server-side encryption (AES-256)
- **Access Control**: IAM policies restrict access to backend only
- **Retention**: Face images retained while account is active
- **Deletion**: Face images deleted within 30 days of account closure

#### Recognition Accuracy
- **Threshold**: 85% confidence minimum for face match
- **False Positive Rate**: < 0.01% (Rekognition specification)
- **False Negative Rate**: ~2-5% (typical for biometric systems)
- **Quality Validation**: Images must pass Rekognition quality checks

#### Biometric Data Protection (GDPR/CCPA)
- **Consent**: Explicit consent obtained during onboarding
- **Right to Access**: Users can view all their face images
- **Right to Delete**: Users can delete face images (if not only image)
- **Right to Export**: Users can download their face images
- **Data Portability**: Face image metadata available via API

### Payment Security

#### Transaction Security
- **Authorization**: All payments require face recognition OR active session
- **Fraud Detection**:
  - Maximum amount per transaction (configurable, e.g., €500)
  - Maximum daily spending limit per wallet (e.g., €1000)
  - Alert on unusual spending patterns
- **Idempotency**: Use transaction IDs to prevent duplicate payments
- **Audit Trail**: All transactions logged with timestamps and source IPs

#### Wallet Security
- **Private Keys**: Interledger private keys stored in secure environment variables
- **Key Rotation**: Private keys should be rotated every 90 days
- **Grant Expiration**: Payment grants expire after 1 hour
- **Balance Validation**: Check balance before processing payment

### API Security

#### Input Validation
- **Email**: Regex validation, max 255 characters
- **Password**: Min 8 characters, max 128 characters
- **Amounts**: Positive numbers only, max 6 digits before decimal
- **URLs**: Validate Interledger URL format
- **Images**: Validate file type (PNG, JPG), max size 5MB

#### Output Sanitization
- **Error Messages**: Generic messages for auth failures (don't leak user existence)
- **SQL Injection**: Use parameterized queries (Bun.sql handles this)
- **XSS Prevention**: React handles output escaping automatically

#### CORS Policy
- **Development**: Allow `http://localhost:3000`
- **Production**: Whitelist specific domains only
- **Credentials**: Allow credentials for authenticated requests

### Compliance

#### GDPR Compliance
- **Legal Basis**: Consent for biometric processing
- **Data Minimization**: Only collect necessary data
- **Purpose Limitation**: Use data only for stated purposes
- **Storage Limitation**: Delete data when no longer needed
- **Accuracy**: Allow users to update their information
- **Security**: Implement appropriate technical measures

#### PCI DSS Considerations
- **Scope**: Not directly applicable (no credit card data)
- **Network Security**: Use HTTPS, secure server configuration
- **Access Control**: Implement strong authentication
- **Monitoring**: Log all payment transactions
- **Testing**: Regular security testing and audits

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up authentication and database schema

**Tasks:**
1. **Database Schema**
   - [ ] Create migration scripts for new tables
   - [ ] Run migrations on Neon database
   - [ ] Verify schema with test data
   - [ ] Create indexes for performance

2. **Authentication Backend**
   - [ ] Implement password hashing functions (Bun.password)
   - [ ] Create auth utility functions (signup, signin, validate session)
   - [ ] Build auth API endpoints (/auth/signup, /auth/signin, /auth/signout, /auth/me)
   - [ ] Test authentication flow end-to-end

3. **Database Layer Updates**
   - [ ] Update `db.ts` with new interfaces (User, Wallet, FaceImage, etc.)
   - [ ] Create CRUD functions for users
   - [ ] Create CRUD functions for wallets
   - [ ] Create CRUD functions for face_images
   - [ ] Create CRUD functions for user_sessions

4. **Testing**
   - [ ] Write tests for auth functions
   - [ ] Test password hashing and verification
   - [ ] Test session creation and validation
   - [ ] Test error cases (duplicate email, wrong password)

**Deliverables:**
- Working authentication system
- Updated database schema
- API endpoints for auth
- Unit tests for auth functions

---

### Phase 2: User Registration & Onboarding (Week 3-4)
**Goal**: Enable user self-service registration and face enrollment

**Tasks:**
1. **Face Upload Backend**
   - [ ] Create `/api/users/upload-face` endpoint
   - [ ] Integrate with existing `indexarRostro()` function
   - [ ] Update face indexing to use new database schema
   - [ ] Add validation (max 5 faces, file size, format)
   - [ ] Store face metadata in `face_images` table

2. **Wallet Creation Backend**
   - [ ] Create `/api/wallets` POST endpoint
   - [ ] Validate wallet URL format
   - [ ] Create wallet record in database
   - [ ] Handle primary wallet logic
   - [ ] Add wallet creation tests

3. **Frontend - Auth Pages**
   - [ ] Create Sign Up page component
   - [ ] Create Sign In page component
   - [ ] Create AuthContext for session management
   - [ ] Implement client-side validation
   - [ ] Handle loading and error states
   - [ ] Store session token in localStorage

4. **Frontend - Onboarding Flow**
   - [ ] Create Upload Face page
   - [ ] Implement file upload with drag-and-drop
   - [ ] Show upload progress and validation status
   - [ ] Allow multiple face uploads
   - [ ] Create Wallet Creation page
   - [ ] Build wallet form with validation
   - [ ] Add progress indicator (Step 1 of 2, etc.)

5. **Testing**
   - [ ] Test complete registration flow
   - [ ] Test face upload and indexing
   - [ ] Test wallet creation
   - [ ] Test error handling (bad images, invalid URLs)
   - [ ] Test mobile responsiveness

**Deliverables:**
- Complete user registration flow
- Face enrollment functionality
- Wallet creation interface
- Onboarding UI

---

### Phase 3: User Dashboard & Transaction Management (Week 5-6)
**Goal**: Build user dashboard and transaction history

**Tasks:**
1. **Transaction Backend Updates**
   - [ ] Update `/api/upload` to link transactions to users/wallets
   - [ ] Update `/api/transactions` to filter by current user
   - [ ] Create `/api/transactions/:id` endpoint for details
   - [ ] Add pagination to transactions endpoint
   - [ ] Add wallet balance updates on transactions

2. **Wallet Backend**
   - [ ] Create `/api/wallets` GET endpoint (list user wallets)
   - [ ] Create `/api/wallets/:id` PATCH endpoint (update wallet)
   - [ ] Create `/api/wallets/:id` DELETE endpoint (close wallet)
   - [ ] Add balance calculation and caching

3. **Frontend - Dashboard**
   - [ ] Create Dashboard page component
   - [ ] Build summary cards (total balance, wallet count)
   - [ ] Create wallet list component
   - [ ] Create recent transactions component
   - [ ] Add navigation header
   - [ ] Implement SWR for data fetching

4. **Frontend - Transactions**
   - [ ] Create Transactions page
   - [ ] Build transaction list with grouping by date
   - [ ] Add filters (wallet, status, search)
   - [ ] Implement pagination
   - [ ] Create Transaction Detail page
   - [ ] Show snapshot image and metadata

5. **Frontend - Wallets**
   - [ ] Create Wallets page
   - [ ] Build wallet card component
   - [ ] Create New Wallet page
   - [ ] Add wallet management (rename, set primary, close)

6. **Testing**
   - [ ] Test dashboard data loading
   - [ ] Test transaction filtering and search
   - [ ] Test wallet management operations
   - [ ] Test balance calculations
   - [ ] Test pagination

**Deliverables:**
- User dashboard with account overview
- Transaction history page
- Wallet management interface
- Transaction detail view

---

### Phase 4: Enhanced Face Recognition & Settings (Week 7-8)
**Goal**: Improve face recognition and add account settings

**Tasks:**
1. **Face Management Backend**
   - [ ] Create `/api/users/face-images` GET endpoint
   - [ ] Create `/api/users/face-images/:id` DELETE endpoint
   - [ ] Update face indexing to handle multiple images
   - [ ] Add face usage tracking (update last_used_at, match_count)

2. **User Profile Backend**
   - [ ] Create `/api/users/profile` PATCH endpoint
   - [ ] Add email change workflow (requires verification)
   - [ ] Create `/api/users/password` PATCH endpoint
   - [ ] Invalidate sessions on password change

3. **Frontend - Face Images**
   - [ ] Create Face Images page
   - [ ] Show all user face images with metadata
   - [ ] Allow upload of additional faces
   - [ ] Allow deletion of non-primary faces
   - [ ] Show usage statistics per face

4. **Frontend - Settings**
   - [ ] Create Settings page with tabs
   - [ ] Build Profile settings (name, email, avatar)
   - [ ] Build Security settings (password change)
   - [ ] Build Preferences (language, timezone)
   - [ ] Add confirmation dialogs for destructive actions

5. **Enhanced Payment Flow**
   - [ ] Update `/api/upload` to record face_image_id
   - [ ] Add face match confidence to transaction records
   - [ ] Update transaction history to show confidence
   - [ ] Add fallback for low-confidence matches

6. **Testing**
   - [ ] Test face image management
   - [ ] Test profile updates
   - [ ] Test password change flow
   - [ ] Test enhanced payment flow with multiple faces
   - [ ] Test face usage tracking

**Deliverables:**
- Face image management interface
- User profile settings
- Password change functionality
- Enhanced transaction metadata

---

### Phase 5: Polish, Security & Launch Prep (Week 9-10)
**Goal**: Finalize features, improve security, prepare for launch

**Tasks:**
1. **Security Hardening**
   - [ ] Implement rate limiting on auth endpoints
   - [ ] Add HTTPS enforcement
   - [ ] Implement CORS whitelist for production
   - [ ] Add input sanitization middleware
   - [ ] Audit environment variables (no secrets in code)
   - [ ] Implement secure session token handling

2. **Error Handling**
   - [ ] Improve error messages (user-friendly)
   - [ ] Add error logging (console/external service)
   - [ ] Create error boundary components
   - [ ] Add retry logic for failed API calls
   - [ ] Implement toast notifications for errors

3. **Performance Optimization**
   - [ ] Add database indexes for common queries
   - [ ] Optimize image uploads (compression, thumbnails)
   - [ ] Implement lazy loading for images
   - [ ] Add loading skeletons for better UX
   - [ ] Optimize bundle size (code splitting)

4. **UI/UX Polish**
   - [ ] Design consistency review
   - [ ] Mobile responsiveness testing
   - [ ] Add loading states everywhere
   - [ ] Improve empty states
   - [ ] Add success animations
   - [ ] Accessibility audit (WCAG 2.1 AA)

5. **Documentation**
   - [ ] API documentation (OpenAPI/Swagger)
   - [ ] User guide (how to register, make payments)
   - [ ] Developer documentation (architecture, setup)
   - [ ] Deployment guide
   - [ ] Privacy policy and terms of service

6. **Testing & QA**
   - [ ] End-to-end testing (Playwright or Cypress)
   - [ ] Security testing (penetration testing)
   - [ ] Load testing (handle concurrent users)
   - [ ] Browser compatibility testing
   - [ ] Mobile device testing

7. **Deployment**
   - [ ] Set up production environment
   - [ ] Configure production database (Neon)
   - [ ] Deploy backend (Bun server)
   - [ ] Deploy frontend (static hosting or same server)
   - [ ] Set up monitoring (uptime, errors)
   - [ ] Configure backups

**Deliverables:**
- Production-ready application
- Comprehensive documentation
- Deployed and accessible system
- Monitoring and alerting setup

---

### Future Enhancements (Post-Launch)

#### Phase 6: Advanced Features
- **Email Verification**: Send verification emails on signup
- **Password Reset**: Forgot password flow via email
- **Two-Factor Authentication**: TOTP or SMS-based 2FA
- **OAuth Social Login**: Google, GitHub, Facebook integration
- **Transaction Disputes**: Allow users to report fraudulent transactions
- **Spending Insights**: Analytics dashboard with charts and graphs
- **Export Transactions**: CSV/PDF export for accounting
- **Webhooks**: Notify external services of transactions
- **API Keys**: Allow developers to integrate with the platform

#### Phase 7: Mobile & International
- **Mobile App**: Native iOS/Android app
- **Multi-Language Support**: i18n for global users
- **Currency Exchange**: Built-in currency conversion
- **International Wallets**: Support more Interledger providers
- **Offline Mode**: Queue payments for later processing

#### Phase 8: Business Features
- **Merchant Portal**: Store owner dashboard
- **Invoicing**: Generate and send invoices
- **Recurring Payments**: Subscription support
- **Team Accounts**: Multi-user business accounts
- **Advanced Reporting**: Sales reports, tax documents

---

## Success Metrics

### Key Performance Indicators (KPIs)

#### User Acquisition
- **New Registrations**: # of new users per day/week/month
- **Activation Rate**: % of registered users who complete onboarding (upload face + create wallet)
- **Time to Activation**: Average time from signup to first payment
- **Target**: 80% activation rate within 24 hours

#### User Engagement
- **Daily Active Users (DAU)**: # of users making payments daily
- **Weekly Active Users (WAU)**: # of users making payments weekly
- **Payments per User**: Average # of payments per user per month
- **Target**: 5+ payments per user per month

#### Payment Success
- **Face Recognition Accuracy**: % of successful face matches
- **Payment Success Rate**: % of payments completed without errors
- **Average Payment Time**: Time from face capture to payment completion
- **Target**: 95%+ face recognition accuracy, 98%+ payment success rate, <5 seconds payment time

#### User Satisfaction
- **Net Promoter Score (NPS)**: User likelihood to recommend
- **User Retention**: % of users still active after 30/60/90 days
- **Support Tickets**: # of support requests per user
- **Target**: NPS > 50, 70%+ 30-day retention

#### Technical Performance
- **API Response Time**: Average response time for API endpoints
- **Uptime**: % of time system is available
- **Error Rate**: % of API requests resulting in errors
- **Target**: <200ms API response, 99.9% uptime, <1% error rate

### Analytics Implementation

#### Event Tracking
- User signup completed
- Face image uploaded
- Wallet created
- Payment initiated
- Payment completed
- Payment failed
- User signs in
- User signs out
- Settings updated

#### Tools
- **Backend Logging**: Bun console + external service (LogRocket, Sentry)
- **Frontend Analytics**: Posthog, Mixpanel, or Google Analytics
- **Error Tracking**: Sentry for frontend and backend errors
- **Monitoring**: Uptime monitoring (UptimeRobot, Pingdom)

---

## Resolved Questions & Decisions

### Product Decisions

#### 1. Email Verification ✅ REQUIRED
**Decision**: Email verification is **required** using ZeptoMail with Liquid templates.

**Implementation**:
```typescript
// src/lib/email.ts
import { SendMailClient } from "zeptomail";
import { Liquid } from "liquidjs";

const url = import.meta.env.ZEPTOMAIL_URL || "";
const token = import.meta.env.ZEPTOMAIL_TOKEN || "";
const client = new SendMailClient({ url, token });

export const engine = new Liquid({
  root: "src/templates/",
  extname: ".liquid",
});

export async function sendVerificationEmail(recipient: string, name: string, verificationLink: string) {
  const content = await engine.renderFile("email-verification", {
    name,
    verificationLink,
  });

  const response = await client.sendMail({
    from: {
      address: "noreply@dbug.mx",
      name: "noreply",
    },
    to: [{
      email_address: {
        address: recipient,
        name: name,
      },
    }],
    subject: "Verify Your Email Address",
    htmlbody: content,
  });

  return response;
}
```

**Required Templates**:
- `src/templates/email-verification.liquid` - Email verification
- `src/templates/password-reset.liquid` - Password reset
- `src/templates/welcome.liquid` - Welcome email after verification

**Environment Variables**:
```env
ZEPTOMAIL_URL=https://api.zeptomail.com/
ZEPTOMAIL_TOKEN=your_zeptomail_token
```

---

#### 2. Wallet Limits ✅ CONFIGURABLE
**Decision**: Maximum wallets per user is **configurable via environment variable**.

**Implementation**:
```env
# Max wallets per user (default: 5)
MAX_WALLETS_PER_USER=5
```

**Validation**:
```typescript
// src/api/wallets/create.ts
const maxWallets = parseInt(process.env.MAX_WALLETS_PER_USER || "5");
const userWallets = await getUserWallets(userId);

if (userWallets.length >= maxWallets) {
  return ClientResponse.json(
    { error: `Maximum ${maxWallets} wallets allowed per user` },
    { status: 409 }
  );
}
```

---

#### 3. Transaction Limits ❌ NOT IMPLEMENTED
**Decision**: No transaction limits for now (deferred to future phase).

**Rationale**: Prototype phase, limits can be added later based on usage patterns and fraud analysis.

---

#### 4. Face Image Retention ✅ HANDLED EXTERNALLY
**Decision**: Face image retention is **handled by external workflow**.

**Implementation**: No action required in this application. External service manages:
- Face image lifecycle
- GDPR compliance (right to be forgotten)
- Automatic deletion after account closure

---

#### 5. Minimum Age ✅ 18+ REQUIRED
**Decision**: All users must be **at least 18 years old**.

**Implementation**:
```typescript
// src/lib/validation.ts
export function validateAge(dateOfBirth: Date): boolean {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 18;
}

// In signup endpoint
if (!validateAge(dateOfBirth)) {
  return ClientResponse.json(
    { error: "You must be at least 18 years old to register" },
    { status: 400 }
  );
}
```

**Database**: `date_of_birth` field required in users table.

---

### Technical Decisions

#### 6. Session Duration ✅ 5 MINUTES
**Decision**: User sessions expire after **5 minutes** for security.

**Implementation**:
```typescript
// src/lib/auth.ts
export async function createSession(userId: string): Promise<Session> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const [session] = await sql<Session[]>`
    INSERT INTO user_sessions (user_id, session_token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt})
    RETURNING id, user_id, session_token, expires_at;
  `;

  return session;
}
```

**Grant Management**: For Interledger payment grants, use the Open Payments SDK to **renew grants before expiration**:
```typescript
// src/lib/grant.ts
import { continueGrant } from '@interledger/open-payments';

// Renew grant before it expires
export async function renewGrantIfNeeded(grant: Grant) {
  const expiresIn = new Date(grant.expires_at).getTime() - Date.now();
  const renewThreshold = 60 * 1000; // Renew if expires in < 1 minute

  if (expiresIn < renewThreshold) {
    const client = await createClient(grant.user_id);
    const renewed = await client.grant.continue({
      url: grant.uri,
      accessToken: grant.value,
    });

    // Update grant in database
    await updateGrant(grant.id, {
      value: renewed.access_token.value,
      expires_at: renewed.access_token.expires_at,
    });
  }
}
```

**Reference**: https://openpayments.dev/sdk/grant-continue/

---

#### 7. Face Recognition Threshold ✅ 85% MAINTAINED
**Decision**: Maintain **85% confidence threshold** (current implementation).

**Rationale**: Industry standard, balances security with usability.

---

#### 8. Image Storage ✅ S3 WITH BUN MODULE
**Decision**: Continue using **S3 with Bun's native module** (current implementation).

**Implementation** (already in place):
```typescript
// src/api/upload.ts
import { s3, type S3File } from "bun";

const fileName = `snapshot-${randomId}.png`;
const s3file: S3File = s3.file(fileName);
await s3file.write(snapshot);
```

**No thumbnails needed** - store originals only for face recognition accuracy.

---

#### 9. Database Scaling ✅ NEON AUTO-SCALING
**Decision**: **No manual scaling required** - Neon handles this automatically.

**Rationale**: Neon is serverless and auto-scales based on demand. No action required.

---

#### 10. Backup Strategy ✅ AUTOMATED
**Decision**: **Rely on Neon and S3 automated backups**.

**Details**:
- **Neon Database**: Automatic point-in-time recovery (PITR) backups
- **S3 Storage**: Versioning enabled for snapshot recovery
- **No manual backup needed**: Both services handle this automatically

---

### Business Decisions

#### 11. Pricing Model ⏸️ PROTOTYPE PHASE
**Decision**: Deferred - this is a **prototype**, no monetization yet.

---

#### 12. Merchant Onboarding ✅ SEPARATE REPO
**Decision**: Merchant onboarding is **already implemented in separate frontend**.

**Repository**: https://github.com/mikejauregui/hack2025front

**No integration needed** - merchant flow is independent from user registration flow.

---

#### 13. Chargebacks ⏸️ FUTURE PHASE
**Decision**: Deferred to post-launch phase.

---

#### 14. KYC/AML ⏸️ PROTOTYPE PHASE
**Decision**: Not required for prototype.

---

#### 15. Insurance ⏸️ PROTOTYPE PHASE
**Decision**: Not required for prototype.

---

### Legal & Compliance

#### 16. All Legal Questions ⏸️ PROTOTYPE PHASE
**Decision**: This is a **prototype** - no formal legal or compliance measures implemented.

**Rationale**:
- No terms of service needed for prototype
- No GDPR DPO required
- No biometric law compliance needed yet
- No payment licenses needed for testing
- No data residency restrictions

**Future Consideration**: Legal framework will be established before production launch.

---

## Implementation Updates Based on Decisions

### Updated Environment Variables
```env
# Email Service (ZeptoMail)
ZEPTOMAIL_URL=https://api.zeptomail.com/
ZEPTOMAIL_TOKEN=your_token_here

# Wallet Configuration
MAX_WALLETS_PER_USER=5

# Session Configuration
SESSION_DURATION_MINUTES=5

# Existing variables...
DATABASE_URL=...
S3_ACCESS_KEY_ID=...
KEY_ID=...
```

### Updated Dependencies
```json
{
  "dependencies": {
    "zeptomail": "^1.0.0",
    "liquidjs": "^10.0.0",
    // ... existing dependencies
  }
}
```

### New Required Directories
```
src/
├── templates/           # Liquid email templates
│   ├── email-verification.liquid
│   ├── password-reset.liquid
│   └── welcome.liquid
└── lib/
    └── email.ts        # Email utility functions
```

### Updated User Registration Flow
1. User submits registration form with **date of birth**
2. Validate age ≥ 18
3. Create user account (email_verified = false)
4. Generate verification token
5. **Send verification email via ZeptoMail**
6. User clicks link in email
7. Verify token and update email_verified = true
8. Send welcome email
9. Proceed to face upload and wallet creation

### Updated Database Schema
```sql
-- Add email verification fields to users table
ALTER TABLE users ADD COLUMN email_verification_token TEXT;
ALTER TABLE users ADD COLUMN email_verification_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;

-- Add date_of_birth (required for age validation)
ALTER TABLE users ADD COLUMN date_of_birth DATE NOT NULL;
```

---

## Appendices

### Appendix A: Current vs. Proposed Database Comparison

| Aspect | Current State | Proposed State |
|--------|--------------|----------------|
| User Table | `clients` (4 fields) | `users` (15 fields) |
| Authentication | None | Email/password + sessions |
| Wallets | Embedded in clients table | Separate `wallets` table, multi-wallet support |
| Face Images | S3 only, no DB records | `face_images` table with metadata |
| Transactions | Basic, no user link | Enhanced with user_id, wallet_id, face_image_id |
| Foreign Keys | None | Full relationships with constraints |
| Stores | ID only | Complete `stores` table with details |
| Grants | Basic tracking | Enhanced with status and metadata |

### Appendix B: Technology Comparison

See [playground/neon-auth-integration.md](./playground/neon-auth-integration.md) for detailed Neon Auth integration analysis.

### Appendix C: Database Migration Scripts

Database migration scripts will be created in `playground/migrations/` during implementation.

### Appendix D: API Examples

Complete API request/response examples are documented in the [API Specifications](#api-specifications) section above.

### Appendix E: References

- **Neon Auth Documentation**: https://neon.com/docs/neon-auth/quick-start/react
- **Interledger Open Payments**: https://openpayments.guide/
- **AWS Rekognition**: https://docs.aws.amazon.com/rekognition/
- **Bun Documentation**: https://bun.sh/docs
- **React Documentation**: https://react.dev/
- **shadcn/ui Components**: https://ui.shadcn.com/

---

## Conclusion

This PRD outlines a comprehensive plan to transform the face-based payment system from a prototype requiring manual user setup into a production-ready platform with self-service registration, multi-wallet support, and full user account management.

The proposed implementation is broken into 5 phases over 10 weeks, with clear deliverables and success metrics. The system will maintain the innovative face recognition payment flow while adding the essential features users expect from modern financial applications.

**Next Steps:**
1. Review and approve PRD with stakeholders
2. Resolve open questions
3. Begin Phase 1 implementation (database schema + authentication)
4. Set up project tracking (Jira, Linear, GitHub Projects)
5. Assign development team and set sprint schedules

---

**Document End**
