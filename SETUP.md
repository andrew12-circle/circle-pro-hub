# Circle Pro Hub - Setup Guide

## Step 0: Hardening & Contracts ✅

This document outlines the implementation of the foundational architecture and tooling for Circle Pro Hub.

### What Was Implemented

#### 1. **Tooling & Quality Gates**
- ✅ **Prettier**: Configured with `.prettierrc.json` and `.prettierignore`
- ✅ **ESLint**: Enhanced with stricter rules and Prettier integration
- ✅ **Lint-staged**: Configured to run on pre-commit (`.lintstagedrc.json`)
- ✅ **Husky**: Pre-commit hook setup in `.husky/pre-commit`
- ⚠️ **TypeScript Strict Mode**: Cannot enable (tsconfig files are read-only)

**Note**: Run `npm run prepare` after cloning to initialize Husky hooks.

#### 2. **Architecture Documentation**
- ✅ `ARCHITECTURE.md` created with:
  - Complete route structure
  - Module boundaries (UI, Domain, Data, Adapters, Contracts)
  - Data flow patterns
  - Feature flags strategy
  - Performance budgets
  - Security & compliance guidelines

#### 3. **Type Contracts** (`contracts/*`)
All contracts use Zod for runtime validation:

- ✅ `contracts/common.ts` - Money type
- ✅ `contracts/marketplace.ts` - ServiceCard, PricePlan, ServiceFunnel
- ✅ `contracts/ui/pricing-page.ts` - PricingPageConfig, PricingTier
- ✅ `contracts/forms/vendor-intake.ts` - ServiceListingForm, CoPartnerForm
- ✅ `contracts/affiliates/core.ts` - Attribution, Affiliate
- ✅ `contracts/content/legal.ts` - LegalDoc, LegalBundle
- ✅ `contracts/account/favorites.ts` - Favorite
- ✅ `contracts/share/share.ts` - ShareLink
- ✅ `contracts/index.ts` - Barrel export for all contracts

#### 4. **Data Layer Facades** (`src/data/*`)
Interface definitions with "Not implemented" stubs:

- ✅ `src/data/services.ts` - Service listing and detail retrieval
- ✅ `src/data/vendors.ts` - Vendor directory and profiles
- ✅ `src/data/wallet.ts` - Points balance and transactions
- ✅ `src/data/bookings.ts` - Booking creation and retrieval
- ✅ `src/data/favorites.ts` - Favorites management

#### 5. **Feature Flags**
- ✅ `src/lib/featureFlags.ts` - Environment-driven feature toggles
- ✅ `.env.example` - Template with all feature flags

### Available NPM Scripts

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format

# Check formatting (CI)
npm run format:check

# Initialize Husky (run once after clone)
npm run prepare
```

### Feature Flags

Set these in your `.env` file:

```env
VITE_FEATURE_WALLET=false      # Points wallet system
VITE_FEATURE_COPAY=true        # Co-pay pricing visibility
VITE_FEATURE_AFFILIATE=false   # Affiliate tracking
VITE_FEATURE_SHARE=true        # Social sharing
VITE_FEATURE_DEGRADED_MODE=false # Fallback to fixtures
```

### Next Steps

The following steps are planned for implementation:

1. **Step 1**: Refactor existing components to use contracts
2. **Step 2**: Implement data/* facades with real logic
3. **Step 3**: Add adapters/* for cache/db/queue/search/storage
4. **Step 4**: Wire up RLS policies and auth guards

### Known Limitations

- ⚠️ TypeScript strict mode cannot be enabled (tsconfig files are read-only by Lovable)
- ⚠️ Contract imports use relative paths (`../../contracts/*`) instead of aliases
- ⚠️ Data facades are stubs - implementation comes in Step 2

### Definition of Done ✅

- ✅ Dependencies installed (prettier, husky, lint-staged, eslint plugins)
- ✅ Prettier, ESLint, and lint-staged configured
- ✅ Git pre-commit hook created
- ✅ `ARCHITECTURE.md` documenting system design
- ✅ All contract files with Zod schemas compile
- ✅ All data facade interfaces defined (stubs)
- ✅ Feature flags implemented
- ✅ `.env.example` created with all flags

### Manual Setup Required

After pulling this code:

1. Copy `.env.example` to `.env` and configure feature flags
2. Run `npm install` to install new dependencies
3. Run `npm run prepare` to initialize Husky
4. Verify setup with `npm run typecheck && npm run lint`

---

**Architecture is now self-documenting and enforceable. Ready for Step 1 implementation.**
