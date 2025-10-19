import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Logger {
  error: (message: string, meta?: any) => void;
}

function createLogger(name: string): Logger {
  return {
    error: (message, meta) => console.error(`[${name}] ${message}`, meta)
  };
}

async function logTiming<T>(logger: Logger, name: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    console.log(`[${name}] took ${Date.now() - start}ms`);
  }
}

async function checkRateLimit(url: string, key: string, rateLimitKey: string, window: number, max: number) {
  // Simplified rate limit check - returns allowed for now
  return { allowed: true, remaining: max, resetAt: Date.now() + window };
}

function getRateLimitHeaders(result: { remaining: number; resetAt: number }) {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
  };
}

function handleConditionalRequest(headers: Headers, data: any, corsHeaders: Record<string, string>) {
  // Simplified - no ETag handling for now
  return null;
}

function createCachedJsonResponse(data: any, options: { corsHeaders: Record<string, string>; maxAge: number; sMaxAge: number; staleWhileRevalidate: number }) {
  return new Response(JSON.stringify(data), {
    headers: {
      ...options.corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${options.maxAge}, s-maxage=${options.sMaxAge}, stale-while-revalidate=${options.staleWhileRevalidate}`
    }
  });
}

const logger = createLogger('admin-services');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Auth check: admin only
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
    _user_id: user.id,
    _role: 'admin'
  });
  
  if (roleError || !isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Rate limit
  const rateLimitKey = `admin-services:${user.id}`;
  const rateLimit = await checkRateLimit(supabaseUrl, supabaseServiceKey, rateLimitKey, 60000, 100);
  
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 
        ...corsHeaders,
        ...getRateLimitHeaders(rateLimit),
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // GET /admin-services/:id - Fetch service with draft + published versions
    if (req.method === 'GET') {
      const pathMatch = url.pathname.match(/\/admin-services\/([^\/]+)$/);
      if (!pathMatch) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const serviceId = pathMatch[1];
      
      const result = await logTiming(logger, 'fetch-service-versions', async () => {
        const { data: service, error: serviceError } = await supabase
          .from('services')
          .select('*, vendor:vendors (id, name, logo, verified, calendar_link)')
          .eq('id', serviceId)
          .single();
        
        if (serviceError) throw serviceError;
        
        const { data: versions, error: versionsError } = await supabase
          .from('service_versions')
          .select('*')
          .eq('service_id', serviceId)
          .order('created_at', { ascending: false });
        
        if (versionsError) throw versionsError;
        
        const draft = versions.find(v => v.state === 'draft') || null;
        const published = versions.find(v => v.id === service.published_version_id) || null;
        
        return {
          service,
          draft,
          published,
          history: versions.slice(0, 10)
        };
      });
      
      const conditional = handleConditionalRequest(req.headers, result, corsHeaders);
      if (conditional) return conditional;
      
      return createCachedJsonResponse(result, {
        corsHeaders,
        maxAge: 10,
        sMaxAge: 10,
        staleWhileRevalidate: 30
      });
    }

    // PATCH /admin-services/:id/card - Update draft card
    if (req.method === 'PATCH' && url.pathname.includes('/card')) {
      const serviceId = url.pathname.match(/\/admin-services\/([^\/]+)\/card/)?.[1];
      if (!serviceId) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await req.json();
      
      const { data, error } = await supabase
        .from('service_versions')
        .upsert({
          service_id: serviceId,
          state: 'draft',
          card: body.card,
          pricing: body.pricing || {},
          created_by: user.id
        }, {
          onConflict: 'service_id,state',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PATCH /admin-services/:id/pricing - Update draft pricing
    if (req.method === 'PATCH' && url.pathname.includes('/pricing')) {
      const serviceId = url.pathname.match(/\/admin-services\/([^\/]+)\/pricing/)?.[1];
      if (!serviceId) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await req.json();
      
      const { data, error } = await supabase
        .from('service_versions')
        .upsert({
          service_id: serviceId,
          state: 'draft',
          pricing: body.pricing,
          card: body.card || {},
          created_by: user.id
        }, {
          onConflict: 'service_id,state',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PATCH /admin-services/:id/funnel - Update draft funnel
    if (req.method === 'PATCH' && url.pathname.includes('/funnel')) {
      const serviceId = url.pathname.match(/\/admin-services\/([^\/]+)\/funnel/)?.[1];
      if (!serviceId) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await req.json();
      
      const { data, error } = await supabase
        .from('service_versions')
        .upsert({
          service_id: serviceId,
          state: 'draft',
          funnel: body.funnel,
          card: body.card || {},
          pricing: body.pricing || {},
          created_by: user.id
        }, {
          onConflict: 'service_id,state',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /admin-services/:id/submit - Submit for review
    if (req.method === 'POST' && url.pathname.includes('/submit')) {
      const serviceId = url.pathname.match(/\/admin-services\/([^\/]+)\/submit/)?.[1];
      if (!serviceId) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from('service_versions')
        .update({ 
          state: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('service_id', serviceId)
        .eq('state', 'draft')
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /admin-services/versions/:versionId/publish - Publish version
    if (req.method === 'POST' && url.pathname.includes('/versions/') && url.pathname.includes('/publish')) {
      const versionId = url.pathname.match(/\/versions\/([^\/]+)\/publish/)?.[1];
      if (!versionId) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update version state
      const { data: version, error: versionError } = await supabase
        .from('service_versions')
        .update({ 
          state: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', versionId)
        .select()
        .single();

      if (versionError) throw versionError;

      // Update services.published_version_id pointer
      const { error: serviceError } = await supabase
        .from('services')
        .update({ published_version_id: versionId })
        .eq('id', version.service_id);

      if (serviceError) throw serviceError;

      return new Response(JSON.stringify(version), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /admin-services/:id/rollback?to=versionId - Rollback to version
    if (req.method === 'POST' && url.pathname.includes('/rollback')) {
      const serviceId = url.pathname.match(/\/admin-services\/([^\/]+)\/rollback/)?.[1];
      const toVersionId = url.searchParams.get('to');
      
      if (!serviceId || !toVersionId) {
        return new Response(JSON.stringify({ error: 'Invalid path or missing version' }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { error } = await supabase
        .from('services')
        .update({ published_version_id: toVersionId })
        .eq('id', serviceId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Request failed', { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
