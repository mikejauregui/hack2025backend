# Frontend Product Requirements Document: User Registration & Dashboard

## Document Information
- **Project**: Face-Based Payment System - Frontend Implementation
- **Version**: 1.0
- **Date**: 2025-11-21
- **Status**: Ready for Implementation
- **Backend Integration**: Phase 1 Foundation Complete

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technical Stack](#technical-stack)
3. [Architecture Overview](#architecture-overview)
4. [Authentication Flow](#authentication-flow)
5. [Page Specifications](#page-specifications)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Routing Structure](#routing-structure)
10. [Form Validation](#form-validation)
11. [Error Handling](#error-handling)
12. [Implementation Phases](#implementation-phases)

---

## Executive Summary

This document outlines the frontend implementation for the face-based payment system, integrating with the newly implemented backend authentication system. The frontend will provide:

1. **User Registration Flow**: Sign up → Email verification → Face upload → Wallet creation
2. **Authentication**: Sign in/out with session management
3. **User Dashboard**: View wallets, transactions, and account details
4. **Profile Management**: Update profile, manage face images, manage wallets
5. **Responsive Design**: Mobile-first approach using TailwindCSS

### Integration Points
- ✅ Backend authentication system (Phase 1)
- ✅ Email verification via ZeptoMail
- ✅ Session management (5-minute expiration)
- ✅ Face image upload to S3
- ✅ Multi-wallet support (max 5 per user)
- ✅ Transaction history

---

## Technical Stack

### Current Stack (Existing)
```
Frontend:
  - React 19
  - Wouter (routing)
  - SWR (data fetching)
  - TailwindCSS 4
  - shadcn/ui components
  - lucide-react (icons)

Backend Integration:
  - Bun.serve() native routing
  - REST API endpoints
  - Bearer token authentication
```

### Color Palette

```css
@theme {
  --color-cerise-red-50: #fcf3f6;
  --color-cerise-red-100: #f9eaf0;
  --color-cerise-red-200: #f6d4e0;
  --color-cerise-red-300: #efb2c6;
  --color-cerise-red-400: #e482a0;
  --color-cerise-red-500: #d85c7e;
  --color-cerise-red-600: #c74462;
  --color-cerise-red-700: #aa2c45;
  --color-cerise-red-800: #8d273a;
  --color-cerise-red-900: #762535;
  --color-cerise-red-950: #47101a;
}
```

### No Additional Dependencies Needed
All required packages are already installed!

---

## Architecture Overview

### Directory Structure
```
src/
├── app/
│   ├── index.html                    # Entry point
│   ├── frontend.tsx                  # React initialization
│   ├── App.tsx                       # Main router (UPDATE)
│   │
│   ├── contexts/                     # NEW
│   │   └── AuthContext.tsx          # Authentication state
│   │
│   ├── hooks/                        # NEW
│   │   ├── useAuth.ts               # Auth hook
│   │   ├── useWallets.ts            # Wallets data hook
│   │   └── useTransactions.ts       # Transactions data hook
│   │
│   ├── pages/                        # Page components
│   │   ├── auth/                    # NEW - Authentication pages
│   │   │   ├── SignUpPage.tsx
│   │   │   ├── SignInPage.tsx
│   │   │   ├── VerifyEmailPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   │
│   │   ├── onboarding/              # NEW - Onboarding flow
│   │   │   ├── UploadFacePage.tsx
│   │   │   └── CreateWalletPage.tsx
│   │   │
│   │   ├── dashboard/               # NEW - User dashboard
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TransactionsPage.tsx
│   │   │   ├── TransactionDetailPage.tsx
│   │   │   ├── WalletsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   │
│   │   ├── home.tsx                 # PUBLIC - Landing page (UPDATE)
│   │   ├── grant.tsx                # EXISTING - Keep as is
│   │   └── confirm.tsx              # EXISTING - Keep as is
│   │
│   ├── components/                  # Reusable components
│   │   ├── auth/                    # NEW - Auth components
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── SessionTimer.tsx
│   │   │
│   │   ├── layout/                  # NEW - Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── Navigation.tsx
│   │   │
│   │   ├── forms/                   # NEW - Form components
│   │   │   ├── SignUpForm.tsx
│   │   │   ├── SignInForm.tsx
│   │   │   ├── WalletForm.tsx
│   │   │   └── FaceUploadForm.tsx
│   │   │
│   │   ├── dashboard/               # NEW - Dashboard components
│   │   │   ├── WalletCard.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   ├── BalanceSummary.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── Header.tsx               # EXISTING - Update for auth
│   │   ├── ListOfClients.tsx        # EXISTING - Keep as is
│   │   ├── grantFormt.tsx           # EXISTING - Keep as is
│   │   └── ui/                      # EXISTING - shadcn components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── ... (all existing)
│   │
│   ├── lib/                         # Utilities
│   │   ├── api.ts                   # NEW - API client
│   │   ├── storage.ts               # NEW - localStorage helper
│   │   └── validators.ts            # NEW - Client-side validation
│   │
│   ├── types/                       # NEW - TypeScript types
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── wallet.ts
│   │   └── transaction.ts
│   │
│   ├── fetchet.ts                   # EXISTING - SWR fetcher
│   └── styles/
│       └── globals.css              # EXISTING - Global styles
```

---

## Authentication Flow

### 1. Sign Up Flow
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Sign Up Page (/signup)                                   │
│    - Email, Name, Password, Date of Birth inputs           │
│    - Client-side validation                                 │
│    - POST /api/auth/signup                                  │
│    - Store session token in localStorage                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Check Email Page (/check-email)                         │
│    - "Please check your email to verify your account"      │
│    - Resend verification button                             │
│    - Email sent via ZeptoMail                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ User clicks link in email
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Email Verification (/verify-email?token=xxx)            │
│    - GET /api/auth/verify-email?token=xxx                  │
│    - Show success/error message                             │
│    - Auto-redirect to onboarding                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Upload Face Page (/onboarding/face)                     │
│    - Drag-and-drop or click to upload                      │
│    - Support 1-5 images                                     │
│    - POST /api/users/upload-face (FormData)                │
│    - Show upload progress                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Create Wallet Page (/onboarding/wallet)                 │
│    - Wallet name, URL, currency, initial balance           │
│    - POST /api/wallets                                      │
│    - Mark as primary wallet                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Dashboard (/dashboard)                                   │
│    - Welcome message                                        │
│    - View wallets and transactions                          │
│    - Complete onboarding!                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Sign In Flow
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Sign In Page (/signin)                                   │
│    - Email and Password inputs                              │
│    - "Forgot Password?" link                                │
│    - POST /api/auth/signin                                  │
│    - Store session token                                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─ Email not verified → Show verification notice
                 │
                 ├─ Success → Redirect to dashboard
                 │
                 └─ Error → Show error message
```

### 3. Session Management
```typescript
// Session expires after 5 minutes
// Show countdown timer in header
// Auto-refresh token before expiry (future enhancement)
// On expiry: logout and redirect to signin

Session Timeline:
[0 min] ──────────────────────────── [5 min]
 Login                               Logout
         ↑
    Show warning at 4 min
```

---

## Page Specifications

### 1. Landing Page (PUBLIC - `/`)

**Purpose**: Marketing page with sign up / sign in CTAs

**Layout**:
```
┌────────────────────────────────────────────────┐
│ [Logo] Face Payment        [Sign In] [Sign Up]│
├────────────────────────────────────────────────┤
│                                                │
│           🎯 Pay with Your Face                │
│                                                │
│     The future of biometric payments is here   │
│                                                │
│         [Get Started Free]  [Learn More]       │
│                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Secure  │ │   Fast   │ │   Easy   │      │
│  │    🔒    │ │    ⚡    │ │    😊    │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                                │
│  How it works:                                 │
│  1. Register with your email                   │
│  2. Upload your face image                     │
│  3. Create your wallet                         │
│  4. Pay with just your face!                   │
│                                                │
└────────────────────────────────────────────────┘
```

**Components**:
- Hero section with CTA buttons
- Feature cards
- How it works section
- Footer with links

**Actions**:
- "Sign Up" → Navigate to `/signup`
- "Sign In" → Navigate to `/signin`
- "Get Started" → Navigate to `/signup`

---

### 2. Sign Up Page (`/signup`)

**Layout**:
```
┌────────────────────────────────────────────────┐
│          Create Your Account                   │
│                                                │
│  Name:           [________________]            │
│                                                │
│  Email:          [________________]            │
│                                                │
│  Password:       [________________]            │
│                  (min 8 characters)            │
│                                                │
│  Date of Birth:  [__/__/____]                  │
│                  (must be 18+)                 │
│                                                │
│  [ ] I agree to Terms & Privacy Policy         │
│                                                │
│           [      Sign Up      ]                │
│                                                │
│  Already have an account? Sign in              │
└────────────────────────────────────────────────┘
```

**Validation Rules**:
- **Name**: Required, 1-255 chars, must contain letters
- **Email**: Required, valid email format
- **Password**: Required, min 8 chars
- **Date of Birth**: Required, must be 18+ years old
- **Terms**: Required, must be checked

**API Call**:
```typescript
POST /api/auth/signup
Body: {
  email: string,
  name: string,
  password: string,
  dateOfBirth: string (YYYY-MM-DD)
}
Response: {
  token: string,
  user: {
    id: string,
    email: string,
    name: string,
    email_verified: false
  }
}
```

**Actions**:
- ✅ Submit → Validate → Call API → Store token → Navigate to `/check-email`
- ❌ Error → Show error message below form
- 🔗 "Sign in" → Navigate to `/signin`

---

### 3. Check Email Page (`/check-email`)

**Layout**:
```
┌────────────────────────────────────────────────┐
│              📧 Check Your Email               │
│                                                │
│  We've sent a verification email to:           │
│                                                │
│         user@example.com                       │
│                                                │
│  Please click the link in the email to         │
│  verify your account.                          │
│                                                │
│  Didn't receive the email?                     │
│                                                │
│       [  Resend Verification Email  ]          │
│                                                │
│  Or check your spam folder.                    │
└────────────────────────────────────────────────┘
```

**Actions**:
- "Resend" → POST /api/auth/resend-verification → Show success toast
- Auto-check email verification status every 5 seconds (polling)
- On verified → Auto-navigate to `/onboarding/face`

---

### 4. Email Verification Page (`/verify-email?token=xxx`)

**Layout**:
```
┌────────────────────────────────────────────────┐
│         Verifying Your Email...                │
│                                                │
│              🔄 Loading...                     │
│                                                │
│  [After verification]                          │
│                                                │
│         ✅ Email Verified!                     │
│                                                │
│  Your email has been verified successfully.    │
│                                                │
│  Redirecting to complete your profile...       │
│                                                │
│       [  Continue to Upload Face  ]            │
└────────────────────────────────────────────────┘
```

**API Call**:
```typescript
GET /api/auth/verify-email?token=xxx
Response: {
  user: { id, email, name, email_verified: true }
}
```

**Actions**:
- On mount → Call API with token from URL
- ✅ Success → Show success message → Auto-redirect after 3 seconds
- ❌ Error (invalid/expired token) → Show error → Link to resend

---

### 5. Upload Face Page (`/onboarding/face`)

**Layout**:
```
┌────────────────────────────────────────────────┐
│  Onboarding (Step 1 of 2)                     │
│                                                │
│       Upload Your Face Photo                   │
│                                                │
│  We need at least one photo of your face       │
│  for biometric payments.                       │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │                                          │ │
│  │         📷 Click or Drag to Upload       │ │
│  │                                          │ │
│  │   Accepted formats: PNG, JPG (max 5MB)  │ │
│  │                                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Uploaded Images:                              │
│  ┌────┐ ┌────┐ ┌────┐                        │
│  │ ✓  │ │ ✓  │ │ +  │                        │
│  │Img1│ │Img2│ │Add │                        │
│  └────┘ └────┘ └────┘                        │
│                                                │
│  You can upload up to 5 images                │
│                                                │
│         [ Skip ]    [  Continue  ]             │
└────────────────────────────────────────────────┘
```

**Features**:
- Drag-and-drop file upload
- Click to browse files
- Image preview before upload
- Upload progress bar
- Support 1-5 images
- Mark one as primary (first is primary by default)

**API Call**:
```typescript
POST /api/users/upload-face
Headers: { Authorization: Bearer <token> }
Body: FormData {
  face: File,
  is_primary: boolean
}
Response: {
  face_image: {
    id: string,
    s3_key: string,
    is_primary: boolean
  }
}
```

**Actions**:
- Upload → Show progress → On success, add to uploaded list
- Continue → Navigate to `/onboarding/wallet`
- Skip → Navigate to `/onboarding/wallet` (show warning)

---

### 6. Create Wallet Page (`/onboarding/wallet`)

**Layout**:
```
┌────────────────────────────────────────────────┐
│  Onboarding (Step 2 of 2)                     │
│                                                │
│       Create Your First Wallet                 │
│                                                │
│  Wallet Name:                                  │
│  [Personal Wallet________________]             │
│                                                │
│  Wallet URL (Interledger):                     │
│  [https://ilp.interledger-test.dev/username]   │
│                                                │
│  Currency:                                     │
│  [EUR ▼] USD  GBP  JPY  CAD  AUD              │
│                                                │
│  Initial Balance (optional):                   │
│  [100.00_____] EUR                             │
│                                                │
│  ℹ️ This will be your primary wallet           │
│                                                │
│         [ Skip ]    [  Create Wallet  ]        │
└────────────────────────────────────────────────┘
```

**Validation Rules**:
- **Name**: Required, 1-100 chars
- **Wallet URL**: Required, valid HTTPS URL
- **Currency**: Required, one of supported currencies
- **Initial Balance**: Optional, positive number, max 2 decimals

**API Call**:
```typescript
POST /api/wallets
Headers: { Authorization: Bearer <token> }
Body: {
  name: string,
  wallet_url: string,
  currency_code: string,
  initial_amount: number,
  is_primary: true
}
Response: {
  wallet: { id, name, wallet_url, currency_code, current_balance, is_primary }
}
```

**Actions**:
- Submit → Validate → Call API → Navigate to `/dashboard`
- Skip → Navigate to `/dashboard` (can create wallet later)

---

### 7. Dashboard Page (`/dashboard`)

**Layout**:
```
┌────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Transactions  Wallets  Settings    │
│                                     [👤 John] [Logout] │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Welcome back, John! 👋                               │
│                                                        │
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │ Total Balance    │  │  Active Wallets  │          │
│  │  €350.75         │  │       3          │          │
│  └──────────────────┘  └──────────────────┘          │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  Your Wallets            [+ New Wallet]        │  │
│  │                                                │  │
│  │  ⭐ Personal Wallet      €250.50  EUR   [→]   │  │
│  │     Business Wallet      €100.25  EUR   [→]   │  │
│  │     USD Wallet            $50.00  USD   [→]   │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  Recent Transactions       [View All →]        │  │
│  │                                                │  │
│  │  Coffee Shop      -€5.50     11/21 3:30pm  ✓  │  │
│  │  Grocery Store   -€42.30     11/20 6:15pm  ✓  │  │
│  │  Gas Station     -€60.00     11/19 9:00am  ✓  │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  Quick Actions                                 │  │
│  │  [➕ Add Wallet]  [📷 Manage Faces]  [⚙️ Settings] │  │
│  └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Components**:
- BalanceSummary: Total balance across all wallets
- WalletList: All wallets with balance and currency
- TransactionList: Recent 5 transactions
- QuickActions: Shortcuts to common actions
- SessionTimer: Countdown showing session expiry

**API Calls**:
```typescript
// On mount
GET /api/auth/me → { user: { id, email, name, email_verified } }
GET /api/wallets → { wallets: [...] }
GET /api/transactions?limit=5 → { transactions: [...] }
```

**Actions**:
- Click wallet → Navigate to `/wallets/:id`
- Click transaction → Navigate to `/transactions/:id`
- "+ New Wallet" → Navigate to `/wallets/new`
- "View All" → Navigate to `/transactions`
- Logout → POST /api/auth/signout → Clear token → Navigate to `/`

---

### 8. Transactions Page (`/transactions`)

**Layout**:
```
┌────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Transactions  Wallets  Settings    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  All Transactions                                     │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  [All Wallets ▼]  [All Status ▼]  [Search...] │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  Nov 21, 2025                                         │
│  ┌────────────────────────────────────────────────┐  │
│  │ ☕ Coffee Shop                     3:30 PM     │  │
│  │    Personal Wallet                             │  │
│  │    -€5.50                             ✓        │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ 🛒 Online Store                   10:15 AM     │  │
│  │    Business Wallet                             │  │
│  │    -€99.99                            ✓        │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  Nov 20, 2025                                         │
│  [... more transactions ...]                          │
│                                                        │
│  [← Previous]         Page 1 of 8         [Next →]   │
└────────────────────────────────────────────────────────┘
```

**Features**:
- Filter by wallet
- Filter by status (completed, pending, failed)
- Search transactions
- Grouped by date
- Pagination (20 per page)
- Click to view details

**API Call**:
```typescript
GET /api/transactions?limit=20&offset=0&wallet_id=xxx&status=completed
Response: {
  transactions: [...],
  total: 150,
  limit: 20,
  offset: 0
}
```

---

### 9. Transaction Detail Page (`/transactions/:id`)

**Layout**:
```
┌────────────────────────────────────────────────────────┐
│ [← Back to Transactions]                              │
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
│  │  ────────────────────────────────────────     │  │
│  │                                                │  │
│  │  Date & Time:    Nov 21, 2025 at 3:30 PM     │  │
│  │  Wallet:         Personal Wallet               │  │
│  │  Currency:       EUR                           │  │
│  │  Transaction ID: abc-123-def                   │  │
│  │  Interledger:    ilp-payment-xyz               │  │
│  │  Face Match:     98.5% ✓                       │  │
│  │                                                │  │
│  │  ────────────────────────────────────────     │  │
│  │                                                │  │
│  │  Snapshot:                                     │  │
│  │  ┌──────────────┐                             │  │
│  │  │              │                             │  │
│  │  │  [Face img]  │                             │  │
│  │  │              │                             │  │
│  │  └──────────────┘                             │  │
│  │                                                │  │
│  │  Voice Transcript:                             │  │
│  │  "Five fifty please"                           │  │
│  └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**API Call**:
```typescript
GET /api/transactions/:id
Response: {
  transaction: { full details including snapshot_url, voice_url, etc. }
}
```

---

### 10. Wallets Page (`/wallets`)

**Layout**:
```
┌────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Transactions  Wallets  Settings    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Your Wallets                      [+ New Wallet]     │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  ⭐ Personal Wallet                            │  │
│  │                                                │  │
│  │  Balance:  €250.50                            │  │
│  │  Currency: EUR                                 │  │
│  │  URL:      https://ilp.interledger-test...    │  │
│  │  Created:  Nov 1, 2025                         │  │
│  │  Last used: Nov 21, 2025                       │  │
│  │                                                │  │
│  │  [View Transactions]  [⚙️ Settings]            │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  Business Wallet                               │  │
│  │                                                │  │
│  │  Balance:  €100.25                            │  │
│  │  Currency: EUR                                 │  │
│  │  ...                                           │  │
│  └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Actions**:
- "+ New Wallet" → Navigate to `/wallets/new`
- "View Transactions" → Navigate to `/transactions?wallet_id=xxx`
- "⚙️ Settings" → Open wallet settings modal (rename, set primary, close)

---

### 11. Settings Page (`/settings`)

**Layout with Tabs**:
```
┌────────────────────────────────────────────────────────┐
│ Settings                                              │
├────────────────────────────────────────────────────────┤
│  [Profile] [Security] [Face Images] [Preferences]     │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ Profile                                        │  │
│  │                                                │  │
│  │  Name:    [John Doe__________]                │  │
│  │  Email:   john@example.com (verified ✓)       │  │
│  │  Phone:   [+1234567890_______]                │  │
│  │  DOB:     Jan 1, 1990                          │  │
│  │                                                │  │
│  │            [  Save Changes  ]                  │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  [When Security tab selected]                         │
│  ┌────────────────────────────────────────────────┐  │
│  │ Change Password                                │  │
│  │                                                │  │
│  │  Current Password:  [______________]           │  │
│  │  New Password:      [______________]           │  │
│  │  Confirm Password:  [______________]           │  │
│  │                                                │  │
│  │            [  Change Password  ]               │  │
│  └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Tabs**:
1. **Profile**: Update name, email, phone
2. **Security**: Change password
3. **Face Images**: Manage uploaded faces, add/remove
4. **Preferences**: Language, timezone

---

## Component Architecture

### Reusable Components

#### 1. `<ProtectedRoute>` - Authentication Guard
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerified?: boolean;
}

// Usage:
<Route path="/dashboard">
  <ProtectedRoute requireEmailVerified>
    <DashboardPage />
  </ProtectedRoute>
</Route>
```

**Behavior**:
- Check if user is authenticated (token exists and valid)
- If not authenticated → Redirect to `/signin`
- If `requireEmailVerified` and email not verified → Redirect to `/check-email`
- Otherwise → Render children

#### 2. `<SessionTimer>` - Session Countdown
```typescript
// Shows remaining session time
// Displays warning at 1 minute remaining
// Auto-logout on expiry

<SessionTimer
  onExpiry={() => {
    // Logout user
  }}
/>
```

#### 3. `<WalletCard>` - Wallet Display
```typescript
interface WalletCardProps {
  wallet: Wallet;
  onClick?: () => void;
  showActions?: boolean;
}

<WalletCard
  wallet={wallet}
  onClick={() => navigate(`/wallets/${wallet.id}`)}
  showActions
/>
```

#### 4. `<TransactionItem>` - Transaction Display
```typescript
interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

<TransactionItem
  transaction={tx}
  onClick={() => navigate(`/transactions/${tx.id}`)}
/>
```

#### 5. `<FileUpload>` - Drag & Drop Upload
```typescript
interface FileUploadProps {
  accept: string;
  maxSize: number;
  maxFiles: number;
  onUpload: (files: File[]) => void;
}

<FileUpload
  accept="image/png,image/jpeg"
  maxSize={5 * 1024 * 1024} // 5MB
  maxFiles={5}
  onUpload={handleUpload}
/>
```

---

## State Management

### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  signout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Usage:
const { user, isAuthenticated, signin, signout } = useAuth();
```

### SWR Hooks
```typescript
// useWallets
const { data: wallets, error, isLoading, mutate } = useWallets();

// useTransactions
const { data: transactions, error, isLoading } = useTransactions({
  limit: 20,
  offset: 0,
  wallet_id: walletId,
});

// useTransaction
const { data: transaction, error, isLoading } = useTransaction(transactionId);
```

---

## API Integration

### API Client (`src/app/lib/api.ts`)
```typescript
class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;

  async get(endpoint: string, options?: RequestInit) {
    // Add Authorization header
    // Handle errors
    // Return parsed JSON
  }

  async post(endpoint: string, data: any, options?: RequestInit) {
    // ...
  }

  async put(endpoint: string, data: any, options?: RequestInit) {
    // ...
  }

  async delete(endpoint: string, options?: RequestInit) {
    // ...
  }
}

export const api = new ApiClient();
```

### API Endpoints Map
```typescript
// Auth
POST   /api/auth/signup
POST   /api/auth/signin
POST   /api/auth/signout
GET    /api/auth/me
GET    /api/auth/verify-email?token=xxx
POST   /api/auth/resend-verification
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

// Users
POST   /api/users/upload-face
GET    /api/users/face-images
DELETE /api/users/face-images/:id

// Wallets
GET    /api/wallets
POST   /api/wallets
GET    /api/wallets/:id
PATCH  /api/wallets/:id
DELETE /api/wallets/:id

// Transactions
GET    /api/transactions
GET    /api/transactions/:id

// Existing (keep)
GET    /api/clients
POST   /api/grant
GET    /api/clients/:id/confirm
```

---

## Routing Structure

### Route Tree
```
/ (Public)
  ├─ /signin (Public)
  ├─ /signup (Public)
  ├─ /check-email (Public)
  ├─ /verify-email (Public)
  ├─ /forgot-password (Public)
  ├─ /reset-password (Public)
  │
  ├─ /onboarding (Protected)
  │   ├─ /onboarding/face
  │   └─ /onboarding/wallet
  │
  ├─ /dashboard (Protected + Email Verified)
  │
  ├─ /transactions (Protected + Email Verified)
  │   └─ /transactions/:id
  │
  ├─ /wallets (Protected + Email Verified)
  │   ├─ /wallets/new
  │   └─ /wallets/:id
  │
  ├─ /settings (Protected + Email Verified)
  │
  └─ /clients (Existing - Keep)
      ├─ /clients/:id
      └─ /clients/:id/confirm
```

### Router Implementation (Wouter)
```typescript
// src/app/App.tsx
import { Route, Switch, Redirect } from "wouter";

export function App() {
  return (
    <AuthProvider>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={LandingPage} />
        <Route path="/signin" component={SignInPage} />
        <Route path="/signup" component={SignUpPage} />
        <Route path="/check-email" component={CheckEmailPage} />
        <Route path="/verify-email" component={VerifyEmailPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />

        {/* Onboarding (requires auth) */}
        <Route path="/onboarding/face">
          <ProtectedRoute>
            <UploadFacePage />
          </ProtectedRoute>
        </Route>
        <Route path="/onboarding/wallet">
          <ProtectedRoute>
            <CreateWalletPage />
          </ProtectedRoute>
        </Route>

        {/* Dashboard (requires auth + verified email) */}
        <Route path="/dashboard">
          <ProtectedRoute requireEmailVerified>
            <DashboardPage />
          </ProtectedRoute>
        </Route>

        {/* Transactions */}
        <Route path="/transactions">
          <ProtectedRoute requireEmailVerified>
            <TransactionsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/transactions/:id">
          <ProtectedRoute requireEmailVerified>
            <TransactionDetailPage />
          </ProtectedRoute>
        </Route>

        {/* Wallets */}
        <Route path="/wallets">
          <ProtectedRoute requireEmailVerified>
            <WalletsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/wallets/new">
          <ProtectedRoute requireEmailVerified>
            <CreateWalletPage />
          </ProtectedRoute>
        </Route>

        {/* Settings */}
        <Route path="/settings">
          <ProtectedRoute requireEmailVerified>
            <SettingsPage />
          </ProtectedRoute>
        </Route>

        {/* Existing admin routes */}
        <Route path="/clients" component={HomePage} />
        <Route path="/clients/:id" component={GrantPage} />
        <Route path="/clients/:id/confirm" component={ConfirmPage} />

        {/* 404 */}
        <Route component={NotFoundPage} />
      </Switch>
    </AuthProvider>
  );
}
```

---

## Form Validation

### Client-Side Validation (`src/app/lib/validators.ts`)
```typescript
export const validators = {
  email: (email: string) => {
    if (!email) return "Email is required";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return "Invalid email format";
    return null;
  },

  password: (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return null;
  },

  name: (name: string) => {
    if (!name) return "Name is required";
    if (name.length > 255) return "Name is too long";
    if (!/[a-zA-Z]/.test(name)) return "Name must contain letters";
    return null;
  },

  dateOfBirth: (dob: string) => {
    if (!dob) return "Date of birth is required";
    const date = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    if (age < 18) return "You must be at least 18 years old";
    return null;
  },

  walletUrl: (url: string) => {
    if (!url) return "Wallet URL is required";
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return "Wallet URL must use HTTPS";
      return null;
    } catch {
      return "Invalid URL format";
    }
  },

  amount: (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "Invalid amount";
    if (num <= 0) return "Amount must be greater than zero";
    if (num > 999999.99) return "Amount is too large";
    const decimals = (amount.split(".")[1] || "").length;
    if (decimals > 2) return "Amount cannot have more than 2 decimal places";
    return null;
  },
};
```

### Form Component Pattern
```typescript
// Example: SignUpForm.tsx
export function SignUpForm() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    dateOfBirth: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const emailError = validators.email(formData.email);
    if (emailError) newErrors.email = emailError;

    const nameError = validators.name(formData.name);
    if (nameError) newErrors.name = nameError;

    const passwordError = validators.password(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const dobError = validators.dateOfBirth(formData.dateOfBirth);
    if (dobError) newErrors.dateOfBirth = dobError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup(formData);
      navigate("/check-email");
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error display */}
    </form>
  );
}
```

---

## Error Handling

### Error Types
```typescript
enum ErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  SERVER_ERROR = "SERVER_ERROR",
}

class ApiError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
  }
}
```

### Error Display Component
```typescript
interface ErrorDisplayProps {
  error: Error | null;
  retry?: () => void;
}

export function ErrorDisplay({ error, retry }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="error-container">
      <p>{error.message}</p>
      {retry && <button onClick={retry}>Try Again</button>}
    </div>
  );
}
```

### Toast Notifications
```typescript
// Use toast library (could use sonner or react-hot-toast)
import { toast } from "sonner";

// Success
toast.success("Wallet created successfully!");

// Error
toast.error("Failed to upload face image");

// Loading
const toastId = toast.loading("Uploading...");
// Later: toast.success("Uploaded!", { id: toastId });
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1) - 40% Complete
**Status**: Backend complete, frontend pending

- ✅ Backend authentication system
- ✅ Database schema
- ✅ Email service
- ⏳ AuthContext setup
- ⏳ API client
- ⏳ Route structure
- ⏳ Protected route component

### Phase 2: Authentication Pages (Week 2)
**Tasks**:
1. Create AuthContext and useAuth hook
2. Create API client with token management
3. Implement ProtectedRoute component
4. Build SignUpPage with validation
5. Build SignInPage
6. Build CheckEmailPage
7. Build VerifyEmailPage
8. Build ForgotPasswordPage
9. Build ResetPasswordPage
10. Test full auth flow

**Deliverables**:
- Complete authentication flow
- Session management
- Email verification
- Password reset

### Phase 3: Onboarding Flow (Week 3)
**Tasks**:
1. Build UploadFacePage with drag-and-drop
2. Implement face image upload to S3
3. Build CreateWalletPage
4. Implement wallet creation API integration
5. Add progress indicators
6. Test onboarding flow

**Deliverables**:
- Face upload with preview
- Wallet creation
- Smooth onboarding UX

### Phase 4: Dashboard & Core Features (Week 4)
**Tasks**:
1. Build DashboardPage with summary cards
2. Create WalletCard component
3. Create TransactionList component
4. Implement useWallets hook
5. Implement useTransactions hook
6. Build TransactionsPage with filters
7. Build TransactionDetailPage
8. Build WalletsPage
9. Test dashboard features

**Deliverables**:
- User dashboard
- Transaction history
- Wallet management
- Responsive design

### Phase 5: Settings & Polish (Week 5)
**Tasks**:
1. Build SettingsPage with tabs
2. Implement profile update
3. Implement password change
4. Build face images management
5. Add session timer component
6. Implement auto-logout on session expiry
7. Add loading states everywhere
8. Add error boundaries
9. Test all features end-to-end

**Deliverables**:
- Complete settings page
- Session management with timer
- Error handling
- Production-ready frontend

---

## Success Criteria

### Functional Requirements
- ✅ User can sign up with email verification
- ✅ User can sign in and maintain session for 5 minutes
- ✅ User can upload 1-5 face images
- ✅ User can create multiple wallets (max 5)
- ✅ User can view transaction history
- ✅ User can manage profile and settings
- ✅ Session expires after 5 minutes with warning
- ✅ All forms have client-side validation
- ✅ All API errors are handled gracefully

### Non-Functional Requirements
- ✅ Mobile-responsive design
- ✅ Fast page load times (<2s)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ SEO-friendly (meta tags, semantic HTML)
- ✅ Secure (no XSS, CSRF protection)

---

## Testing Strategy

### Unit Tests
- Validation functions
- API client
- Custom hooks
- Utility functions

### Integration Tests
- Auth flow (signup → verify → signin)
- Onboarding flow (face → wallet → dashboard)
- CRUD operations (wallets, transactions)

### E2E Tests (Playwright recommended)
- Complete user registration flow
- Sign in and navigate dashboard
- Create wallet and view transactions
- Session expiry and auto-logout

---

## Next Steps

1. **Review and Approve** this frontend PRD
2. **Begin Phase 2**: Authentication pages implementation
3. **Set up project tracking** for frontend tasks
4. **Assign frontend developer** or begin implementation
5. **Schedule regular check-ins** for progress updates

---

**Document End**

**Next Phase**: Authentication Pages Implementation
**Estimated Time**: 2-3 weeks for complete frontend (Phases 2-5)
