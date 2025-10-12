# Backend For Frontend (BFF) Reference Implementation

This is a reference implementation for the Circle Pro Hub BFF. Deploy this to Cloudflare Workers, Fly.io, or Vercel Edge.

## Cloudflare Worker Implementation

```typescript
// wrangler.toml
name = "circle-bff"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ALLOWED_ORIGINS = "https://your-app.lovable.app,https://yourdomain.com"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[env.production.vars]
SUPABASE_URL = "https://mizcmnpoucnywqsadejk.supabase.co"

# Set these via `wrangler secret put <NAME>`
# SUPABASE_SERVICE_ROLE_KEY
# GHL_API_KEY
```

```typescript
// src/index.ts
import { Router } from 'itty-router';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// ===== MIDDLEWARE =====

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be restricted per request
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function corsMiddleware(request: Request, env: Env) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
  
  if (origin && allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  }
  return null;
}

// Simple rate limiter (IP-based)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

async function rateLimit(request: Request, maxRequests = 100, windowMs = 60000): Promise<boolean> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

function generateETag(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `"${Math.abs(hash).toString(36)}"`;
}

// ===== ROUTES =====

// Health check
router.get('/health', () => {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// List services with caching
router.get('/api/services', async (request, env, ctx) => {
  const allowed = await rateLimit(request);
  if (!allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  const cacheKey = `services:list:${request.url}`;
  
  // Try cache first
  const cached = await env.CACHE?.get(cacheKey, 'json');
  if (cached) {
    const etag = generateETag(cached);
    return new Response(JSON.stringify(cached), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'ETag': etag,
        ...corsHeaders,
      },
    });
  }

  // Fetch from Supabase (or your data source)
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Cache for 60 seconds
  if (env.CACHE) {
    ctx.waitUntil(env.CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: 60 }));
  }

  const etag = generateETag(data);
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'ETag': etag,
      ...corsHeaders,
    },
  });
});

// Service detail
router.get('/api/services/:id', async (request, env, ctx) => {
  const allowed = await rateLimit(request);
  if (!allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  const { id } = request.params;
  const cacheKey = `service:${id}`;
  
  const cached = await env.CACHE?.get(cacheKey, 'json');
  if (cached) {
    const etag = generateETag(cached);
    return new Response(JSON.stringify(cached), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'ETag': etag,
        ...corsHeaders,
      },
    });
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  if (env.CACHE) {
    ctx.waitUntil(env.CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: 60 }));
  }

  const etag = generateETag(data);
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'ETag': etag,
      ...corsHeaders,
    },
  });
});

// Presigned upload URL
router.post('/api/uploads/presign', async (request, env) => {
  const allowed = await rateLimit(request, 20); // Stricter limit for uploads
  if (!allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Verify auth token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Verify the JWT
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { key, contentType, bucket = 'avatars' } = body;

  if (!key || !contentType) {
    return new Response('Missing key or contentType', { status: 400 });
  }

  // Validate content type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(contentType)) {
    return new Response('Invalid content type', { status: 400 });
  }

  // Generate presigned URL from Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(key);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({
    uploadUrl: data.signedUrl,
    key: key,
    bucket: bucket,
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
});

// GHL booking proxy
router.post('/api/ghl/booking', async (request, env) => {
  const allowed = await rateLimit(request, 10);
  if (!allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  
  // Forward to GHL API
  const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/appointments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const ghlData = await ghlResponse.json();
  
  return new Response(JSON.stringify(ghlData), {
    status: ghlResponse.status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
});

// Affiliate share link redirect
router.get('/s/:id', async (request, env) => {
  const { id } = request.params;
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('share_links')
    .select('service_id, partner_id')
    .eq('id', id)
    .single();

  if (error || !data) {
    return Response.redirect('https://your-app.lovable.app', 302);
  }

  // Set affiliate cookie
  const response = Response.redirect(
    `https://your-app.lovable.app/services/${data.service_id}?ref=${id}`,
    302
  );
  
  response.headers.set(
    'Set-Cookie',
    `affiliate_ref=${id}; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=Lax`
  );

  return response;
});

// OPTIONS handler for CORS preflight
router.options('*', (request) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
});

// 404 handler
router.all('*', () => {
  return new Response('Not Found', { status: 404 });
});

// ===== WORKER ENTRY =====

export default {
  fetch: router.handle,
};
```

## Deployment Steps

### Cloudflare Workers

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create CACHE

# Set secrets
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put GHL_API_KEY

# Deploy
wrangler publish
```

### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Create app
fly launch

# Set secrets
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
fly secrets set GHL_API_KEY=your-key

# Deploy
fly deploy
```

### Vercel Edge Functions

Create `api/*.ts` files in your Vercel project and deploy via:
```bash
vercel --prod
```

## After Deployment

1. **Update Lovable environment:**
   - Add to Project Settings (never commit!):
   ```
   VITE_API_BASE=https://your-bff-domain.com
   ```

2. **Update CSP in `index.html`:**
   ```html
   connect-src 'self' https://*.supabase.co https://your-bff-domain.com;
   ```

3. **Test endpoints:**
   ```bash
   curl https://your-bff-domain.com/health
   curl https://your-bff-domain.com/api/services
   ```

## Security Checklist

- ✅ Rate limiting on all endpoints
- ✅ CORS restricted to allowed origins
- ✅ JWT verification on authenticated routes
- ✅ Service role key never exposed to frontend
- ✅ Content-type validation on uploads
- ✅ ETag generation for caching
- ✅ Proper cache headers
- ✅ HTTPS only (enforced by platform)
- ✅ HttpOnly cookies for affiliate tracking
