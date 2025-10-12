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

## Remaining Phases

### Phase 2: Auth Hardening (TODO)
- [ ] Create `RequireAuth` and `RequireRole` wrapper components
- [ ] Protect admin routes with role guards
- [ ] Hide sensitive UI elements conditionally

### Phase 3: Error Handling (TODO)
- [ ] Add React Error Boundaries
- [ ] Optional Sentry integration
- [ ] UX event logging

### Phase 4: Storage & Uploads (TODO)
- [ ] Implement presigned upload flow
- [ ] Client-side file validation (size, MIME type)
- [ ] Remove direct uploads through app

### Phase 5: BFF Migration (ONGOING)
- [x] Read operations via data facades
- [ ] Move write operations to BFF endpoints
- [ ] Keep Supabase client only in `src/data/*`

## Reporting Security Issues

If you discover a security vulnerability, please email security@circleprohub.com. Do not create public GitHub issues for security vulnerabilities.

## Security Checklist

Before deploying to production:

- [ ] All user input is validated and sanitized
- [ ] No `service_role` keys in client code
- [ ] CSP headers are properly configured
- [ ] RLS policies are enabled on all Supabase tables
- [ ] Auth guards protect sensitive routes
- [ ] Error boundaries catch React errors
- [ ] Dependencies are audited and up to date
- [ ] Secrets are managed via environment variables
- [ ] File uploads use presigned URLs only
- [ ] External links are validated

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Content Security Policy Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
