# Deployment Guide

This guide covers deploying Circle Pro Hub to production with all security hardening in place.

## Prerequisites

- [ ] Lovable project published
- [ ] BFF deployed (see `BFF_REFERENCE.md`)
- [ ] Custom domain configured (optional)
- [ ] All secrets configured

## Step 1: Deploy BFF

The BFF (Backend For Frontend) must be deployed first. See `BFF_REFERENCE.md` for:

- Cloudflare Workers (recommended)
- Fly.io
- Vercel Edge Functions

Once deployed, note your BFF URL (e.g., `https://bff.circlenetwork.com`).

## Step 2: Configure Environment

In your Lovable project settings (NOT in code!), set:

```bash
# BFF Configuration
VITE_API_BASE=https://bff.circlenetwork.com

# Feature Flags (adjust as needed)
VITE_FEATURE_WALLET=true
VITE_FEATURE_COPAY=true
VITE_FEATURE_AFFILIATE=true
VITE_FEATURE_SHARE=true
VITE_FEATURE_DEGRADED_MODE=false

# Adapter Configuration
VITE_DB_PRIMARY=search
VITE_CACHE_ENABLED=true
VITE_QUEUE_ENABLED=true
VITE_SEARCH_ENABLED=true

# CDN (if using)
VITE_STORAGE_CDN_URL=https://cdn.circlenetwork.com

# Production
VITE_ENV=production
VITE_ORIGIN=https://circlenetwork.com
```

## Step 3: Update CSP Headers

The BFF URL must be added to CSP in `index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self'; 
  img-src 'self' https: data:; 
  style-src 'self' 'unsafe-inline'; 
  script-src 'self'; 
  connect-src 'self' https://*.supabase.co https://bff.circlenetwork.com;
  frame-ancestors 'none'; 
  base-uri 'self'; 
  form-action 'self' https://bff.circlenetwork.com;
">
```

## Step 4: Deploy Frontend

1. **Publish in Lovable:**
   - Click "Publish" button
   - Wait for build to complete
   - Test at your staging URL

2. **Connect Custom Domain (optional):**
   - Go to Project > Settings > Domains
   - Add your domain
   - Update DNS records as instructed

## Step 5: Smoke Test Production

### Critical Paths to Test:

```bash
# Health check
curl https://circlenetwork.com/

# Services load from BFF
# Check browser DevTools Network tab - should see requests to BFF

# Auth flow
# 1. Sign up with email
# 2. Verify email auto-confirms (if enabled)
# 3. Upload avatar (should use presigned URLs)
# 4. Check console for errors

# Service detail
# 1. Browse to a service
# 2. Add to cart with different pricing modes
# 3. Complete booking flow

# Admin (if applicable)
# 1. Sign in as admin
# 2. Check admin dashboard access
# 3. Verify non-admins can't access
```

## Step 6: Monitor

### Key Metrics:

- **Response times:**
  - Lists: p95 ≤ 250ms
  - Details: p95 ≤ 250ms
  - Writes: p95 ≤ 350ms

- **Cache hit ratio:** Target ≥ 80% for GET requests

- **Error rates:** Target < 0.1%

### Monitoring Tools:

- **BFF:** Cloudflare Analytics / Fly Metrics
- **Frontend:** Lovable Analytics
- **Database:** Supabase Dashboard
- **Errors:** Sentry (if configured)

## Step 7: Degraded Mode Plan

If a critical dependency fails, enable degraded mode:

```bash
# In Lovable environment settings
VITE_FEATURE_DEGRADED_MODE=true
```

This will:
- Hide Co-Pay and Points options
- Keep Retail and Pro pricing active
- Show warning banner to users
- Log errors for investigation

## Security Checklist

Before going live, verify:

- [ ] No `.env` file in git
- [ ] `.env.example` has no real secrets
- [ ] Pre-commit hook blocks `service_role` in code
- [ ] BFF rate limiting is active
- [ ] BFF CORS restricted to production domain
- [ ] CSP headers include BFF domain
- [ ] All API calls use HTTPS
- [ ] Auth required on sensitive routes
- [ ] RLS policies tested in database
- [ ] File uploads use presigned URLs only
- [ ] Input validation on all forms
- [ ] Error messages don't leak sensitive data
- [ ] Service role key NEVER in frontend code

## Rollback Plan

If issues occur:

1. **Revert Lovable deployment:**
   - Go to project history
   - Click "Revert" on last working version

2. **Disable features via flags:**
   ```bash
   VITE_FEATURE_COPAY=false
   VITE_FEATURE_WALLET=false
   ```

3. **Enable degraded mode:**
   ```bash
   VITE_FEATURE_DEGRADED_MODE=true
   ```

4. **BFF rollback:**
   ```bash
   # Cloudflare Workers
   wrangler rollback
   
   # Fly.io
   fly releases rollback
   ```

## Performance Optimization

### After Initial Launch:

1. **Enable CDN for storage:**
   - Set `VITE_STORAGE_CDN_URL`
   - Configure CloudFlare R2 or CloudFront

2. **Add search index:**
   - Integrate Algolia or OpenSearch
   - Set `VITE_SEARCH_ENABLED=true`

3. **Add Redis cache:**
   - Deploy Redis instance
   - Set `VITE_CACHE_ENABLED=true`

4. **Add queue for async work:**
   - Set up Cloudflare Queues or BullMQ
   - Set `VITE_QUEUE_ENABLED=true`

## Support

- **Lovable:** [docs.lovable.dev](https://docs.lovable.dev)
- **Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Cloudflare Workers:** [developers.cloudflare.com](https://developers.cloudflare.com)
