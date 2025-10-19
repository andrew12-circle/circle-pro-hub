import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema (must match frontend exactly)
const ZCard = z.object({
  title: z.string().min(3).max(90),
  subtitle: z.string().max(140).optional().default(""),
  badges: z.array(z.string()).max(6).default([]),
  category: z.string().min(2),
  tags: z.array(z.string()).max(12).default([]),
  thumbnail: z.string().url().optional(),
  gallery: z.array(z.string().url()).max(8).default([]),
  highlights: z.array(z.string()).max(8).default([]),
  cta: z.object({
    type: z.enum(["book", "link", "add_to_cart"]),
    label: z.string().min(2).max(40),
    url: z.string().url().optional(),
  }),
  flags: z.object({
    active: z.boolean().default(true),
    verified: z.boolean().default(false),
    affiliate: z.boolean().default(false),
    booking: z.boolean().default(false),
  }),
  complianceNotes: z.string().max(1000).optional().default(""),
});

const ZPricing = z.object({
  currency: z.string().length(3).default("USD"),
  tiers: z.array(z.object({
    id: z.string().min(2),
    name: z.string().min(2).max(40),
    price: z.number().nonnegative(),
    unit: z.string().min(1),
    includes: z.array(z.string()).default([]),
    upsells: z.array(z.object({ name: z.string(), price: z.number().nonnegative() })).default([]),
    ribbon: z.string().max(20).optional(),
  })).min(1),
  billing: z.object({
    terms: z.string().max(500).optional().default(""),
    anchors: z.array(z.string()).max(3).default([]),
  }),
});

const ZFunnel = z.object({
  steps: z.array(z.object({
    kind: z.enum(["hero", "proof", "package-chooser", "faq", "cta", "custom"]),
    headline: z.string().max(120).optional(),
    subhead: z.string().max(200).optional(),
    bullets: z.array(z.string()).max(10).optional(),
    media: z.string().url().optional(),
    tier_refs: z.array(z.string()).optional(),
    cta_type: z.enum(["book", "link", "add_to_cart"]).optional(),
    label: z.string().max(40).optional(),
    target: z.string().optional(),
  })).max(30),
});

const ZServiceDraft = z.object({
  row_version: z.number().int().positive(),
  card: ZCard,
  pricing: ZPricing,
  funnel: ZFunnel,
});

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[admin-services] Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // GET /admin/services/:id
    if (req.method === 'GET' && pathParts[0] === 'admin' && pathParts[1] === 'services' && pathParts[2]) {
      const serviceId = pathParts[2];

      // Query for draft
      const { data: drafts, error: draftError } = await supabase
        .from('service_versions')
        .select('*')
        .eq('service_id', serviceId)
        .eq('state', 'draft')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (draftError) {
        console.error('[admin-services] Draft query error:', draftError);
        return new Response(JSON.stringify({ error: draftError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let draft;

      if (!drafts || drafts.length === 0) {
        // No draft exists, create one with defaults
        console.log('[admin-services] No draft found, creating blank draft for service:', serviceId);

        const blankDraft = {
          service_id: serviceId,
          state: 'draft',
          row_version: 1,
          card: {
            title: "New Service",
            subtitle: "",
            badges: [],
            category: "General",
            tags: [],
            gallery: [],
            highlights: [],
            cta: { type: "book", label: "Book Now" },
            flags: { active: true, verified: false, affiliate: false, booking: false },
            complianceNotes: "",
          },
          pricing: {
            currency: "USD",
            tiers: [
              { id: "base", name: "Base Package", price: 0, unit: "project", includes: [], upsells: [] }
            ],
            billing: { terms: "", anchors: [] },
          },
          funnel: { steps: [] },
        };

        const { data: insertedDraft, error: insertError } = await supabase
          .from('service_versions')
          .insert(blankDraft)
          .select()
          .single();

        if (insertError) {
          console.error('[admin-services] Insert draft error:', insertError);
          return new Response(JSON.stringify({ error: insertError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        draft = insertedDraft;
      } else {
        draft = drafts[0];
        
        // Transform old schema to new if needed
        if (draft.card && !draft.card.title && draft.card.name) {
          console.log('[admin-services] Migrating old card schema to new');
          draft.card = {
            title: draft.card.name || "Untitled Service",
            subtitle: draft.card.tagline || "",
            badges: draft.card.badges || [],
            category: draft.card.category || "General",
            tags: draft.card.tags || [],
            thumbnail: draft.card.thumbnail || draft.card.image,
            gallery: draft.card.gallery || [],
            highlights: draft.card.highlights || [],
            cta: draft.card.cta || { type: "book", label: "Book Now" },
            flags: {
              active: draft.card.active ?? true,
              verified: draft.card.verified ?? false,
              affiliate: draft.card.affiliate ?? false,
              booking: true,
            },
            complianceNotes: draft.card.complianceNotes || "",
          };
        }
        
        // Transform old pricing to new if needed
        if (draft.pricing && !draft.pricing.tiers && draft.pricing.retail) {
          console.log('[admin-services] Migrating old pricing schema to new');
          const retail = draft.pricing.retail.amount || 0;
          draft.pricing = {
            currency: draft.pricing.retail.currency || "USD",
            tiers: [
              {
                id: "retail",
                name: "Retail",
                price: retail,
                unit: "service",
                includes: [],
                upsells: [],
                ribbon: "Standard"
              }
            ],
            billing: { terms: "", anchors: [] },
          };
        }
        
        // Ensure funnel has steps array
        if (draft.funnel && !draft.funnel.steps) {
          console.log('[admin-services] Migrating old funnel schema to new');
          draft.funnel = { steps: [] };
        }
      }

      // Return only what the UI needs
      const response = {
        draft: {
          row_version: draft.row_version,
          card: draft.card,
          pricing: draft.pricing,
          funnel: draft.funnel,
        },
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /admin/services/:id
    if (req.method === 'PUT' && pathParts[0] === 'admin' && pathParts[1] === 'services' && pathParts[2]) {
      const serviceId = pathParts[2];
      const body = await req.json();

      // Validate payload
      const parseResult = ZServiceDraft.safeParse(body);
      if (!parseResult.success) {
        console.error('[admin-services] Validation error:', parseResult.error.errors);
        return new Response(JSON.stringify({
          error: 'Invalid payload',
          details: parseResult.error.errors,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const draft = parseResult.data;

      // Get current draft for version check
      const { data: currentDrafts, error: fetchError } = await supabase
        .from('service_versions')
        .select('id, row_version')
        .eq('service_id', serviceId)
        .eq('state', 'draft')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('[admin-services] Fetch current draft error:', fetchError);
        return new Response(JSON.stringify({ error: fetchError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!currentDrafts || currentDrafts.length === 0) {
        return new Response(JSON.stringify({ error: 'No draft found to update' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const currentDraft = currentDrafts[0];

      // Optimistic concurrency check
      if (currentDraft.row_version !== draft.row_version) {
        console.error('[admin-services] Version conflict:', {
          expected: draft.row_version,
          current: currentDraft.row_version,
        });
        return new Response(JSON.stringify({
          error: 'Version conflict',
          expected: draft.row_version,
          current: currentDraft.row_version,
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update all three fields in one write (trigger will bump row_version)
      const { data: updated, error: updateError } = await supabase
        .from('service_versions')
        .update({
          card: draft.card,
          pricing: draft.pricing,
          funnel: draft.funnel,
        })
        .eq('id', currentDraft.id)
        .select()
        .single();

      if (updateError) {
        console.error('[admin-services] Update error:', updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const response = {
        draft: {
          row_version: updated.row_version,
          card: updated.card,
          pricing: updated.pricing,
          funnel: updated.funnel,
        },
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 404 for unmatched routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[admin-services] Unhandled error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
