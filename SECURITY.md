# Security Guidelines

This document outlines the security measures implemented in Circle Pro Hub.

## Phase 1: Critical Security ✅

### XSS Protection

**Implementation:**
- `src/lib/sanitize.ts` provides `sanitizeHtml()` and `safeExternalLink()` utilities
- All user-generated or external HTML content MUST be sanitized using `sanitizeHtml()`
- External links MUST be validated using `safeExternalLink()` to prevent `javascript:` and `data:` URL attacks

**Protected Areas:**
- Legal content rendering (`src/pages/Legal.tsx`)
- Any future FAQ or service description rendering
- Admin-editable content

**Rules:**
- ❌ NEVER use `dangerouslySetInnerHTML` without sanitization
- ✅ ALWAYS sanitize HTML from external sources or user input
- ✅ ALWAYS validate external links before rendering

### Security Headers

**Implementation:**
- Content-Security-Policy (CSP) meta tag in `index.html`
- Referrer-Policy set to `strict-origin-when-cross-origin`
- X-Content-Type-Options set to `nosniff`
- X-Frame-Options set to `DENY`

**CSP Policy:**
```
default-src 'self';
img-src 'self' https: data:;
style-src 'self' 'unsafe-inline';
script-src 'self';
connect-src 'self' https://*.supabase.co;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

### Dependency Hygiene

**Pre-commit Checks:**
- TypeScript type checking (`npm run typecheck`)
- Secret scanning (prevents committing `service_role` keys)
- Linting via `lint-staged`

**Available Scripts:**
```bash
npm run typecheck      # Type check without emitting files
npm run audit          # Check for vulnerable dependencies
npm run depcheck       # Find unused dependencies
```

**Rules:**
- ❌ NEVER commit `service_role` keys or other secrets
- ❌ NEVER use `service_role` key in client-side code
- ✅ ALWAYS use `VITE_SUPABASE_ANON_KEY` for client operations
- ✅ Keep dependencies up to date and audit regularly

## Phase 2: Auth Hardening ✅

### Auth Guards

**Implementation:**
- `src/lib/guard.tsx` provides `RequireAuth`, `RequireRole`, and `RequireAuthAndRole` wrapper components
- Protected routes are wrapped with appropriate guards in `src/App.tsx`

**Guard Components:**

1. **`RequireAuth`**: Requires user authentication
   - Redirects to `/auth` if not authenticated
   - Shows loading state while checking auth
   - Example: `<RequireAuth><Cart /></RequireAuth>`

2. **`RequireRole`**: Requires specific role (admin or pro)
   - Uses `useAdminRole` hook for admin checks
   - Uses `useProMember` hook for pro checks
   - Redirects to home if role not satisfied (for admin)
   - Example: `<RequireRole role="admin"><Admin /></RequireRole>`

3. **`RequireAuthAndRole`**: Combines both guards
   - Requires authentication AND specific role
   - Example: `<RequireAuthAndRole role="admin"><Admin /></RequireAuthAndRole>`

**Protected Routes:**

*Auth-Protected (RequireAuth):*
- `/cart` - Shopping cart
- `/account/wallet` - User wallet
- `/saved` - Saved items
- `/profile` - User profile
- `/concierge/book` - Concierge booking
- `/partners/*` - All partner routes

*Admin-Only (RequireAuthAndRole):*
- `/admin` - Admin dashboard
- `/admin/bookings` - Admin bookings management

**UI Conditional Rendering:**
- Admin shield icon in navbar only visible to admin users
- Admin links hidden from non-admin users
- Pro badges shown only to pro members

**Security Rules:**
- ❌ NEVER check roles using localStorage or sessionStorage
- ❌ NEVER hardcode credentials in client code
- ✅ ALWAYS use server-side role validation via `user_roles` table
- ✅ ALWAYS use `has_role()` RPC function for role checks
- ✅ Roles stored in separate `user_roles` table (prevents privilege escalation)

### Remaining Phases

## Phase 3: Error Handling ✅

### Error Boundaries

**Implementation:**
- `src/components/ErrorBoundary.tsx` - Class component that catches React errors
- Wrapped entire app in `src/main.tsx`
- Prevents entire app from crashing when component errors occur

**Error Boundary Features:**

1. **Catches JavaScript errors anywhere in component tree**
   - Uses `componentDidCatch` lifecycle method
   - Logs errors to console in development
   - Shows user-friendly error UI

2. **Graceful degradation**
   - Shows error card with recovery options
   - "Go to Home" button - resets state and redirects
   - "Reload Page" button - full page reload
   - Error details visible in dev mode only

3. **Extensible for error tracking**
   - Ready for Sentry integration via `VITE_SENTRY_DSN` env var
   - Optional `onError` callback prop
   - Structured error logging

**Usage:**
```tsx
// App-level (already implemented in main.tsx)
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Route-level (for critical paths)
<ErrorBoundary fallback={<CustomErrorUI />}>
  <CriticalComponent />
</ErrorBoundary>
```

### UX Event Logging

**Implementation:**
- `src/lib/analytics.ts` - Lightweight event logging utilities
- Integrated into key user flows

**Logged Events:**
- `PricingModeChosen` - When user selects pricing mode in AddToCartModal
- `CartItemAdded` - When item added to cart
- `CartItemRemoved` - When item removed from cart (TODO: implement)
- `VendorPartnerSelected` - When user selects co-pay partner
- `BookingCreated` - When booking is created (TODO: implement)
- `ServiceViewed` - Service detail page views (TODO: implement)
- `SearchPerformed` - Search queries (TODO: implement)
- `ShareLinkCreated` - Share link generation (TODO: implement)
- `ProUpgradeClicked` - Pro upgrade CTA clicks (TODO: implement)

**Logging Functions:**
```typescript
logUXEvent({ type: 'PricingModeChosen', mode: 'copay', serviceId: '123' });
logPerformanceMetric({ name: 'page-load', value: 1234, unit: 'ms' });
logError(new Error('API failed'), { endpoint: '/api/services' });
```

**Future Integration:**
- Ready for analytics service integration (Google Analytics, Mixpanel, etc.)
- Ready for Sentry error tracking
- Console logs in development, silent in production by default

## Phase 4: Presigned Uploads ✅

### Storage Adapter with Presigned URLs

**Implementation:**
- `src/adapters/storage.ts` - Secure storage adapter with presigned upload support
- `src/lib/fileValidation.ts` - Client-side file validation utilities
- BFF endpoint `/api/uploads/presign` generates secure upload URLs
- Files uploaded directly to storage (no app proxy)

**Architecture:**

1. **Client requests presigned URL from BFF:**
   ```typescript
   POST /api/uploads/presign
   Authorization: Bearer <jwt>
   Body: { key: "user/123/avatar.jpg", contentType: "image/jpeg" }
   ```

2. **BFF verifies JWT and returns presigned URL:**
   ```typescript
   Response: { uploadUrl: "https://storage...", key: "...", bucket: "..." }
   ```

3. **Client uploads directly to storage:**
   ```typescript
   PUT <uploadUrl>
   Content-Type: image/jpeg
   Body: <file-data>
   ```

4. **Client gets public URL and updates database**

**Security Benefits:**
- ✅ No file data proxied through app (bandwidth savings)
- ✅ JWT verification required for presigned URL
- ✅ Content-Type validation enforced
- ✅ Size limits enforced client-side
- ✅ Rate limiting on presign endpoint
- ✅ No service_role key in client

**File Validation:**

All files validated before upload using `validateFile()`:
```typescript
import { validateImageFile } from '@/lib/fileValidation';

const validation = validateImageFile(file, 5); // 5MB max
if (!validation.valid) {
  throw new Error(validation.error);
}
```

**Supported File Types:**
- Images: JPEG, PNG, WebP, GIF (up to 10MB)
- Extensions: .jpg, .jpeg, .png, .webp, .gif

**Usage Examples:**

```typescript
import { storage } from '@/adapters/storage';
import { generateSafeFilename } from '@/lib/fileValidation';

// Upload avatar
const path = generateSafeFilename(file.name, userId);
const uploaded = await storage.upload(file, path, 'avatars');

// Get public URL
const url = storage.getPublicUrl(path, 'avatars');

// Delete file
await storage.delete(path, 'avatars');
```

**Fallback Mode:**

When `VITE_API_BASE` is not set (local dev):
- Falls back to direct Supabase upload
- Still validates files client-side
- Useful for development without BFF

**Integration Points:**

Currently integrated in:
- ✅ Profile avatar upload (`src/pages/Profile.tsx`)
- 🔄 TODO: Admin service image uploads
- 🔄 TODO: Vendor logo uploads

### Phase 5: BFF Migration (ONGOING)
- [x] Read operations via data facades
- [ ] Move write operations to BFF endpoints
- [ ] Keep Supabase client only in `src/data/*`

## Reporting Security Issues

If you discover a security vulnerability, please email security@circleprohub.com. Do not create public GitHub issues for security vulnerabilities.

## Security Checklist

Before deploying to production:

- [x] All user input is validated and sanitized
- [x] No `service_role` keys in client code (pre-commit hook enforced)
- [x] CSP headers are properly configured
- [ ] RLS policies are enabled on all Supabase tables
- [x] Auth guards protect sensitive routes
- [x] Error boundaries catch React errors
- [ ] Dependencies are audited and up to date
- [x] Secrets are managed via environment variables
- [x] File uploads use presigned URLs (when BFF enabled)
- [x] External links are validated

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Content Security Policy Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
