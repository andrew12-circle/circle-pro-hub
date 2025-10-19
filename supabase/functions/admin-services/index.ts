import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin, idempotency-key',
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

// Schema migration helpers
function migrateCardSchema(oldCard: any): any {
  if (!oldCard) return null;
  
  return {
    title: oldCard.title || oldCard.name || "",
    subtitle: oldCard.subtitle || oldCard.tagline || "",
    badges: oldCard.badges || [],
    category: oldCard.category || "General",
    tags: oldCard.tags || [],
    thumbnail: oldCard.thumbnail || oldCard.image || "",
    gallery: oldCard.gallery || [],
    highlights: oldCard.highlights || [],
    cta: oldCard.cta || { type: "book", label: "Book Now", url: "" },
    flags: {
      active: oldCard.flags?.active ?? oldCard.active ?? true,
      verified: oldCard.flags?.verified ?? oldCard.verified ?? false,
      affiliate: oldCard.flags?.affiliate ?? false,
      booking: oldCard.flags?.booking ?? true
    },
    complianceNotes: oldCard.complianceNotes || ""
  };
}

function migratePricingSchema(oldPricing: any): any {
  if (!oldPricing || !oldPricing.tiers) {
    return {
      currency: "USD",
      tiers: [{ id: "base", name: "Base", price: 0, unit: "project", includes: [], upsells: [] }],
      billing: { terms: "", anchors: [] }
    };
  }
  
  return {
    ...oldPricing,
    currency: oldPricing.currency || "USD",
    tiers: oldPricing.tiers || [],
    billing: oldPricing.billing || { terms: "", anchors: [] }
  };
}

function migrateFunnelSchema(oldFunnel: any): any {
  if (!oldFunnel || !oldFunnel.steps) {
    return { steps: [] };
  }
  return oldFunnel;
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
    // GET /admin/services/:id - Fetch service draft + published
    if (req.method === 'GET' && url.pathname.match(/\/admin\/services\/[^/]+$/)) {
      const serviceId = url.pathname.split('/').pop()!;
      
      const result = await logTiming(logger, 'fetch-service-draft', async () => {
        const { data: service, error: serviceError } = await supabase
          .from('services')
          .select('id, published_version_id')
          .eq('id', serviceId)
          .single();
        
        if (serviceError) throw serviceError;
        
        // Get or create draft
        let { data: draft } = await supabase
          .from('service_versions')
          .select('id, row_version, card, pricing, funnel')
          .eq('service_id', serviceId)
          .eq('state', 'draft')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!draft) {
          // Seed from published or create empty
          if (service.published_version_id) {
            const { data: pub } = await supabase
              .from('service_versions')
              .select('card, pricing, funnel')
              .eq('id', service.published_version_id)
              .single();
            
            if (pub) {
              const { data: created } = await supabase
                .from('service_versions')
                .insert({
                  service_id: serviceId,
                  state: 'draft',
                  card: pub.card,
                  pricing: pub.pricing,
                  funnel: pub.funnel,
                  created_by: user.id
                })
                .select('id, row_version, card, pricing, funnel')
                .single();
              draft = created;
            }
          } else {
            // Create empty draft
            const seed = {
              card: { title: "", category: "General", cta: { type: "book", label: "Book" }, flags: { active: true, verified: false, affiliate: false, booking: false } },
              pricing: { currency: "USD", tiers: [{ id: "base", name: "Base", price: 0, unit: "project", includes: [], upsells: [] }], billing: { terms: "", anchors: [] } },
              funnel: { steps: [] }
            };
            const { data: created } = await supabase
              .from('service_versions')
              .insert({
                service_id: serviceId,
                state: 'draft',
                ...seed,
                created_by: user.id
              })
              .select('id, row_version, card, pricing, funnel')
              .single();
            draft = created;
          }
        }

        // Get published
        let published = null;
        if (service.published_version_id) {
          const { data } = await supabase
            .from('service_versions')
            .select('id, row_version, card, pricing, funnel')
            .eq('id', service.published_version_id)
            .single();
          published = data;
        }

        // Apply schema migrations
        if (draft) {
          draft.card = migrateCardSchema(draft.card);
          draft.pricing = migratePricingSchema(draft.pricing);
          draft.funnel = migrateFunnelSchema(draft.funnel);
        }
        if (published) {
          published.card = migrateCardSchema(published.card);
          published.pricing = migratePricingSchema(published.pricing);
          published.funnel = migrateFunnelSchema(published.funnel);
        }

        return { draft, published };
      });
      
      return createCachedJsonResponse(result, {
        corsHeaders,
        maxAge: 10,
        sMaxAge: 10,
        staleWhileRevalidate: 30
      });
    }

    // GET legacy /admin-services/:id (old path for compatibility)
    if (req.method === 'GET' && url.pathname.match(/\/admin-services\/[^/]+$/)) {
      const serviceId = url.pathname.split('/').pop()!;
      
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

    // PATCH /admin/services/:id/card - Update draft card with optimistic concurrency
    if (req.method === 'PATCH' && url.pathname.match(/\/admin\/services\/[^/]+\/card$/)) {
      const serviceId = url.pathname.split('/')[3];
      const rowVersion = Number(url.searchParams.get('row_version'));
      const body = await req.json();
      
      const { data: current } = await supabase
        .from('service_versions')
        .select('row_version')
        .eq('service_id', serviceId)
        .eq('state', 'draft')
        .single();

      if (current && current.row_version !== rowVersion) {
        return new Response(JSON.stringify({ error: 'Version conflict' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from('service_versions')
        .update({ card: body })
        .eq('service_id', serviceId)
        .eq('state', 'draft')
        .eq('row_version', rowVersion)
        .select('id, row_version, card, pricing, funnel')
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'ETag': `W/"${data.row_version}"` }
      });
    }

    // PATCH legacy /admin-services/:id/card
    if (req.method === 'PATCH' && url.pathname.match(/\/admin-services\/[^/]+\/card$/)) {
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

    // PATCH /admin/services/:id/pricing - Update draft pricing with optimistic concurrency
    if (req.method === 'PATCH' && url.pathname.match(/\/admin\/services\/[^/]+\/pricing$/)) {
      const serviceId = url.pathname.split('/')[3];
      const rowVersion = Number(url.searchParams.get('row_version'));
      const body = await req.json();
      
      const { data: current } = await supabase
        .from('service_versions')
        .select('row_version')
        .eq('service_id', serviceId)
        .eq('state', 'draft')
        .single();

      if (current && current.row_version !== rowVersion) {
        return new Response(JSON.stringify({ error: 'Version conflict' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from('service_versions')
        .update({ pricing: body })
        .eq('service_id', serviceId)
        .eq('state', 'draft')
        .eq('row_version', rowVersion)
        .select('id, row_version, card, pricing, funnel')
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'ETag': `W/"${data.row_version}"` }
      });
    }

    // PATCH legacy /admin-services/:id/pricing
    if (req.method === 'PATCH' && url.pathname.match(/\/admin-services\/[^/]+\/pricing$/)) {
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

    // PATCH /admin/services/:id/funnel - Update draft funnel with optimistic concurrency
    if (req.method === 'PATCH' && url.pathname.match(/\/admin\/services\/[^/]+\/funnel$/)) {
      const serviceId = url.pathname.split('/')[3];
      const rowVersion = Number(url.searchParams.get('row_version'));
      const body = await req.json();
      
      const { data: current } = await supabase
        .from('service_versions')
        .select('row_version')
        .eq('service_id', serviceId)
        .eq('state', 'draft')
        .single();

      if (current && current.row_version !== rowVersion) {
        return new Response(JSON.stringify({ error: 'Version conflict' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from('service_versions')
        .update({ funnel: body })
        .eq('service_id', serviceId)
        .eq('state', 'draft')
        .eq('row_version', rowVersion)
        .select('id, row_version, card, pricing, funnel')
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'ETag': `W/"${data.row_version}"` }
      });
    }

    // PATCH legacy /admin-services/:id/funnel
    if (req.method === 'PATCH' && url.pathname.match(/\/admin-services\/[^/]+\/funnel$/)) {
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

    // POST /admin/service-versions/:versionId/publish - Publish version (new path)
    if (req.method === 'POST' && url.pathname.match(/\/admin\/service-versions\/[^/]+\/publish$/)) {
      const versionId = url.pathname.split('/')[3];
      
      const { data: version, error: versionError } = await supabase
        .from('service_versions')
        .select('service_id')
        .eq('id', versionId)
        .single();

      if (versionError || !version) {
        return new Response(JSON.stringify({ error: 'Version not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      await supabase
        .from('service_versions')
        .update({ state: 'published', published_at: new Date().toISOString() })
        .eq('id', versionId);

      await supabase
        .from('services')
        .update({ published_version_id: versionId })
        .eq('id', version.service_id);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST legacy /admin-services/versions/:versionId/publish
    if (req.method === 'POST' && url.pathname.match(/\/admin-services\/versions\/[^/]+\/publish$/)) {
      const versionId = url.pathname.match(/\/versions\/([^\/]+)\/publish/)?.[1];
      if (!versionId) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

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

    // POST /admin/services/:id/rollback - Rollback to version (new path)
    if (req.method === 'POST' && url.pathname.match(/\/admin\/services\/[^/]+\/rollback$/)) {
      const serviceId = url.pathname.split('/')[3];
      const body = await req.json();
      const toVersionId = body.to;

      if (!toVersionId) {
        return new Response(JSON.stringify({ error: 'Missing version' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      await supabase
        .from('services')
        .update({ published_version_id: toVersionId })
        .eq('id', serviceId);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST legacy /admin-services/:id/rollback
    if (req.method === 'POST' && url.pathname.match(/\/admin-services\/[^/]+\/rollback$/)) {
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
