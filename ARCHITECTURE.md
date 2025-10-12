# Circle Pro Hub - Architecture

## Prime Directive
Thin UI shell, fat services. Every feature must be: contract-first, cacheable, idempotent, and swappable via env-driven adapters. Prefer composition over configuration; prefer deletion over cleverness.

## Route Structure

### Public Routes
- `/` - Home page with hero, category grid, featured vendors
- `/marketplace` - Service listing/search (marketplace)
- `/services` - Service listing (alias for marketplace)
- `/services/[id]` - Individual service detail view
- `/vendors` - Vendor directory
- `/vendors/[id]` - Vendor profile page
- `/pricing` - Pricing page (Retail vs Pro vs Co-Pay comparison)
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/s/[id]` - Short link share resolver (redirects to service/vendor)

### Agent/User Routes
- `/auth` - Authentication (login/signup)
- `/concierge/book` - Concierge booking flow
- `/account/settings` - User settings
- `/saved` - Saved/favorited services
- `/account/wallet` - Points wallet & history
- `/account/billing` - Billing history & payment methods
- `/profile` - User profile

### Partner Routes
- `/partners/start` - Partner onboarding landing
- `/partners/apply/service` - Service provider application
- `/partners/apply/copartner` - Co-pay partner application

### Support/Legal
- `/support` - Help center
- `/legal` - Legal document viewer (terms, privacy, etc.)

### Admin Routes
- `/admin/*` - Admin dashboard and tools (role-gated)

## Module Boundaries

### UI Layer (`src/components/*`, `src/pages/*`)
- Presentational only
- NO direct database/API calls
- Imports from `data/*` facades only
- Uses `ui/primitives/*` and design tokens from `index.css`

### Domain Layer (`src/lib/*`)
- Pure functions, no I/O
- Business logic and calculations
- Type guards and validators

### Data Facades (`src/data/*`)
- Read/write interfaces per domain
- Examples: `data/services.ts`, `data/vendors.ts`, `data/wallet.ts`
- Orchestrates caching, validation, adapters

### Infrastructure Adapters (`src/adapters/*`)
- `db.ts` - Database client (Supabase)
- `cache.ts` - Redis/in-memory cache
- `queue.ts` - Job queue (stub)
- `search.ts` - Search engine (Algolia/OpenSearch stub)
- `storage.ts` - File storage (Supabase Storage)
- `auth.ts` - Authentication helpers

### Contracts (`contracts/*`)
- TypeScript interfaces + Zod schemas
- Single source of truth for data shapes
- No logic, just types

## Data Flow Pattern

```
UI Component
  ↓
data/* facade (getServices, createBooking)
  ↓
adapters/* (cache.getOrSet → db.query)
  ↓
Supabase / External API
```

## Feature Flags (`lib/featureFlags.ts`)
- `wallet` - Points wallet enabled
- `copay` - Co-pay pricing visible
- `affiliate` - Affiliate/share tracking enabled
- `share` - Social sharing enabled
- `degraded_mode` - Fallback to fixtures if services down

## Performance Budget
- List endpoints: p95 ≤ 250ms
- Detail endpoints: p95 ≤ 250ms
- Write operations: p95 ≤ 350ms (enqueue)
- Initial TTI: ≤ 2.0s (mid-range, throttled)

## Non-Negotiables

1. Do not access databases, queues, storage, or search directly from UI. Route all data through `data/*` interfaces and `adapters/*`.

2. Do not add ad-hoc props or hardcoded page constants. All feature content comes from typed contracts and fixtures/config.

3. Do not block the UI on heavy work. All heavy work is enqueued.

4. Do not introduce new one-off styles. Reuse primitives and tokens only.

## Error Containment

- Route-level error boundaries
- Never crash the app for optional features (co-pay, share, wallet)
- Degrade gracefully when dependencies are down

## Security & Compliance

- Short-lived JWT access token; rotating refresh cookie
- Store revocation/session metadata in cache
- No secrets in client bundles
- Legal content only from LegalBundle contract
- No RESPA/UDAP claims in public UI text
- Keep valuations of points out of UI
