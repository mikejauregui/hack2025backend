# PRD Updates Summary

## Document Version
- **Updated from**: v1.0 → v1.1
- **Status**: Approved - Ready for Implementation
- **Date**: 2025-11-21

---

## Key Changes Made

### 1. ✅ Email Verification - REQUIRED
**Implementation**: ZeptoMail + Liquid templates

**Added**:
- Email service integration code snippet
- Three email templates required:
  - `email-verification.liquid`
  - `password-reset.liquid`
  - `welcome.liquid`
- Environment variables for ZeptoMail
- Updated user registration flow with email verification step

**New Dependencies**:
```bash
bun add zeptomail liquidjs
```

**New Environment Variables**:
```env
ZEPTOMAIL_URL=https://api.zeptomail.com/
ZEPTOMAIL_TOKEN=your_token_here
```

---

### 2. ✅ Wallet Limits - CONFIGURABLE (5 max)
**Implementation**: Environment variable

**Added**:
```env
MAX_WALLETS_PER_USER=5
```

**Validation logic**:
```typescript
const maxWallets = parseInt(process.env.MAX_WALLETS_PER_USER || "5");
if (userWallets.length >= maxWallets) {
  return error: "Maximum 5 wallets allowed per user"
}
```

---

### 3. ❌ Transaction Limits - NOT IMPLEMENTED
**Decision**: Deferred to future phase (prototype scope)

---

### 4. ✅ Face Image Retention - EXTERNAL WORKFLOW
**Decision**: Handled externally, no implementation needed in this app

---

### 5. ✅ Minimum Age - 18+ REQUIRED
**Implementation**: Date of birth validation

**Added**:
- `validateAge()` function
- Age validation in signup flow (must be ≥ 18)
- `date_of_birth` field required in users table

**Database change**:
```sql
ALTER TABLE users ADD COLUMN date_of_birth DATE NOT NULL;
```

---

### 6. ✅ Session Duration - 5 MINUTES
**Implementation**: Short session for security

**Added**:
```typescript
const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
```

**Environment variable**:
```env
SESSION_DURATION_MINUTES=5
```

**Grant Renewal**: Added logic to renew Interledger grants before expiration using Open Payments SDK
- Reference: https://openpayments.dev/sdk/grant-continue/

---

### 7. ✅ Face Recognition Threshold - 85% MAINTAINED
**Decision**: Keep current 85% threshold (industry standard)

---

### 8. ✅ Image Storage - S3 WITH BUN MODULE
**Decision**: Continue using current implementation (already working)

**No changes needed** - Bun S3 module already in use in `src/api/upload.ts`

---

### 9. ✅ Database Scaling - NEON AUTO-SCALING
**Decision**: No manual intervention needed

**Rationale**: Neon is serverless and auto-scales

---

### 10. ✅ Backup Strategy - AUTOMATED
**Decision**: Rely on Neon and S3 automated backups

**Coverage**:
- Neon: Point-in-time recovery (PITR)
- S3: Versioning enabled

---

### 11. ✅ Merchant Onboarding - SEPARATE REPO
**Decision**: Already implemented elsewhere

**Repository**: https://github.com/mikejauregui/hack2025front

**No integration needed** in this repo

---

### 12. ⏸️ Legal & Compliance - PROTOTYPE SCOPE
**Decision**: No formal legal/compliance measures for prototype

**Deferred**:
- Terms of Service
- Privacy Policy
- GDPR compliance
- Biometric regulations
- Payment licenses
- Data residency requirements

---

## Database Schema Updates

### New Fields Added to `users` Table
```sql
-- Email verification
ALTER TABLE users ADD COLUMN email_verification_token TEXT;
ALTER TABLE users ADD COLUMN email_verification_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;

-- Age validation
ALTER TABLE users ADD COLUMN date_of_birth DATE NOT NULL;
```

---

## Updated User Registration Flow

### Before
1. Create account
2. Upload face
3. Create wallet
4. Done

### After (NEW)
1. Submit registration form **with date of birth**
2. **Validate age ≥ 18**
3. Create user account (email_verified = false)
4. **Generate verification token**
5. **Send verification email via ZeptoMail**
6. **User clicks link in email**
7. **Verify token and update email_verified = true**
8. **Send welcome email**
9. Upload face images
10. Create wallet
11. Done

---

## New Directory Structure

```
src/
├── templates/              # NEW - Liquid email templates
│   ├── email-verification.liquid
│   ├── password-reset.liquid
│   └── welcome.liquid
└── lib/
    ├── email.ts           # NEW - Email utility functions
    ├── validation.ts      # NEW - Age validation
    └── auth.ts            # Updated - 5 min session duration
```

---

## Implementation Priority Changes

### High Priority (Must Have for v1)
1. ✅ Email verification system (ZeptoMail + Liquid)
2. ✅ Age validation (18+ requirement)
3. ✅ 5-minute session duration
4. ✅ Wallet limit enforcement (5 max)
5. ✅ Grant renewal logic

### Medium Priority (Nice to Have)
- Password reset flow (uses same email templates)
- Email change verification

### Deferred (Future Phase)
- Transaction limits
- Legal compliance measures
- Advanced fraud detection

---

## Action Items for Developers

### Before Starting Phase 1
- [ ] Install new dependencies: `bun add zeptomail liquidjs`
- [ ] Set up ZeptoMail account and get API token
- [ ] Create email templates directory
- [ ] Add new environment variables to `.env`
- [ ] Run database migrations for new user fields

### Phase 1 Updates
- [ ] Create `src/lib/email.ts` with ZeptoMail integration
- [ ] Create `src/lib/validation.ts` with age validation
- [ ] Update `src/lib/auth.ts` to use 5-minute sessions
- [ ] Create email verification endpoint
- [ ] Design and code 3 Liquid email templates
- [ ] Update signup flow to include date of birth field
- [ ] Update signup endpoint to validate age
- [ ] Add email verification step after signup

### Testing Checklist
- [ ] Test ZeptoMail integration (emails sent successfully)
- [ ] Test age validation (reject under 18, accept 18+)
- [ ] Test session expiration (expires after 5 minutes)
- [ ] Test wallet limit (can't create more than 5)
- [ ] Test email verification flow (token validation)
- [ ] Test grant renewal before expiration

---

## Summary Statistics

- **Total Questions Resolved**: 16
- **New Dependencies**: 2 (zeptomail, liquidjs)
- **New Environment Variables**: 3
- **New Database Fields**: 4
- **New Files to Create**: 5+
- **External References Added**: 2

---

## Next Steps

1. **Review**: Team reviews updated PRD v1.1
2. **Setup**: Install dependencies and configure ZeptoMail
3. **Design**: Create email template designs
4. **Implement**: Begin Phase 1 with updated requirements
5. **Test**: Follow testing checklist above

---

**PRD Status**: ✅ All open questions resolved, ready for implementation!
