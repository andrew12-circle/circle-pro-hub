-- Add missing columns to services table
ALTER TABLE services
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS roi_note text,
ADD COLUMN IF NOT EXISTS time_to_value text,
ADD COLUMN IF NOT EXISTS cover_image text;

-- Generate slugs for existing services
UPDATE services
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot int NOT NULL,
  kind text NOT NULL DEFAULT 'service',
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  title text,
  subtitle text,
  image_url text,
  href text,
  cta_label text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promotions_slot ON promotions(slot);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);

-- Create service cards view for marketplace
CREATE OR REPLACE VIEW service_cards AS
SELECT
  s.id,
  s.slug,
  s.name AS title,
  s.tagline AS subtitle,
  s.category,
  s.badges,
  s.roi_note,
  s.time_to_value,
  s.cover_image,
  s.rating,
  s.reviews AS review_count,
  s.featured AS is_featured,
  v.name AS vendor_name,
  v.logo AS vendor_logo,
  s.pricing
FROM services s
LEFT JOIN vendors v ON v.id = s.vendor_id
WHERE s.is_active = true;

-- Create promoted cards view for homepage
CREATE OR REPLACE VIEW promoted_cards AS
SELECT
  p.slot,
  s.id,
  s.slug,
  s.name AS title,
  s.tagline AS subtitle,
  s.category,
  s.badges,
  s.roi_note,
  s.time_to_value,
  s.cover_image,
  s.rating,
  s.reviews AS review_count,
  v.name AS vendor_name,
  v.logo AS vendor_logo,
  s.pricing
FROM promotions p
JOIN services s ON s.id = p.service_id
LEFT JOIN vendors v ON v.id = s.vendor_id
WHERE p.is_active = true AND p.kind = 'service' AND s.is_active = true
ORDER BY p.slot ASC;

-- Enable RLS on promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read active promotions"
ON promotions FOR SELECT
USING (is_active = true);

-- Admin write access
CREATE POLICY "Admins can manage promotions"
ON promotions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some example data
UPDATE services
SET 
  slug = 'professional-home-inspection',
  roi_note = 'Sell homes 40% faster',
  time_to_value = '24 hours',
  cover_image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
WHERE name = 'Professional Home Inspection' AND slug IS NULL;

-- Create initial promotions for existing services
INSERT INTO promotions (slot, kind, service_id, is_active)
SELECT 1, 'service', id, true
FROM services 
WHERE is_active = true 
ORDER BY rating DESC, reviews DESC 
LIMIT 1
ON CONFLICT DO NOTHING;