-- Create vendors table
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo text,
  verified boolean DEFAULT false,
  calendar_link text,
  
  -- Sponsorship/Ad features
  ad_budget_min bigint,
  ad_budget_max bigint,
  budget_currency text DEFAULT 'USD',
  
  -- Discovery
  is_active boolean NOT NULL DEFAULT true,
  sort_order int DEFAULT 1000,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_active ON public.vendors(is_active, sort_order);

-- Create services table
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  
  -- Core fields (normalized for filtering/sorting)
  name text NOT NULL,
  tagline text,
  category text,
  rating numeric(3,2) DEFAULT 0,
  reviews int DEFAULT 0,
  review_highlight text,
  
  -- Discovery
  featured boolean DEFAULT false,
  badges text[] DEFAULT '{}',
  service_areas text[] DEFAULT '{}',
  city_scope text DEFAULT 'any',
  
  is_active boolean NOT NULL DEFAULT true,
  sort_order int DEFAULT 1000,
  
  -- Complex nested data (JSONB - matches ServiceFunnel contract exactly)
  pricing jsonb NOT NULL,
  packages jsonb,
  faq jsonb,
  media jsonb,
  compliance jsonb,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_active ON public.services(is_active, featured, sort_order);
CREATE INDEX idx_services_category ON public.services(category) WHERE is_active = true;
CREATE INDEX idx_services_vendor ON public.services(vendor_id);
CREATE INDEX idx_services_rating ON public.services(rating DESC) WHERE is_active = true;

-- Create vendor_partners table
CREATE TABLE public.vendor_partners (
  id text PRIMARY KEY,
  name text NOT NULL,
  markets text[] DEFAULT '{}',
  min_agent_deals_per_year int DEFAULT 0,
  allowed_service_ids text[] DEFAULT '{}',
  prohibited_service_ids text[] DEFAULT '{}',
  
  -- Co-pay policy (JSONB matches fixture)
  copay_policy jsonb NOT NULL,
  
  -- Intake
  booking_link text,
  contact_email text,
  
  visibility text DEFAULT 'public',
  
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendor_partners_active ON public.vendor_partners(is_active);

-- Triggers for updated_at
CREATE TRIGGER touch_vendors BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER touch_services BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER touch_vendor_partners BEFORE UPDATE ON public.vendor_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_partners ENABLE ROW LEVEL SECURITY;

-- Public read for active items
CREATE POLICY vendors_read_active ON public.vendors
  FOR SELECT USING (is_active = true);

CREATE POLICY services_read_active ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY vendor_partners_read_active ON public.vendor_partners
  FOR SELECT USING (is_active = true);

-- Admin full access (using existing has_role function)
CREATE POLICY vendors_admin_all ON public.vendors
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY services_admin_all ON public.services
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY vendor_partners_admin_all ON public.vendor_partners
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));