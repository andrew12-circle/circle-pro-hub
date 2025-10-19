-- Phase 1: Data Contracts & Versioning

-- Version state enum
CREATE TYPE service_version_state AS ENUM ('draft', 'submitted', 'approved', 'published', 'archived');

-- Versioned content table
CREATE TABLE public.service_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  state service_version_state NOT NULL DEFAULT 'draft',
  row_version INTEGER NOT NULL DEFAULT 1,
  
  -- Content blobs (matches existing services JSONB columns)
  card JSONB NOT NULL,
  pricing JSONB NOT NULL,
  funnel JSONB,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- Optimistic locking
  CONSTRAINT version_check CHECK (row_version > 0)
);

-- Published pointer on services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS published_version_id UUID REFERENCES public.service_versions(id);

-- Indexes for performance
CREATE INDEX idx_service_versions_service_state ON public.service_versions(service_id, state);
CREATE INDEX idx_service_versions_vendor ON public.service_versions((card->>'vendor_id'));
CREATE INDEX idx_service_versions_created ON public.service_versions(created_at DESC);

-- Auto-increment row_version on update
CREATE OR REPLACE FUNCTION bump_version_on_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.row_version = OLD.row_version + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bump_version
BEFORE UPDATE ON public.service_versions
FOR EACH ROW EXECUTE FUNCTION bump_version_on_update();

-- Enable RLS
ALTER TABLE public.service_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins: full access
CREATE POLICY "Admins manage all versions" ON public.service_versions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Vendors: own drafts only (future)
CREATE POLICY "Vendors manage own drafts" ON public.service_versions
FOR ALL USING (
  state = 'draft' AND 
  created_by = auth.uid()
);