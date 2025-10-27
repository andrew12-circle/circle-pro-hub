-- Fix security definer views by setting them to security invoker
-- This ensures views run with querying user's permissions, not creator's

DROP VIEW IF EXISTS service_cards;
CREATE VIEW service_cards 
WITH (security_invoker=true) AS
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

DROP VIEW IF EXISTS promoted_cards;
CREATE VIEW promoted_cards 
WITH (security_invoker=true) AS
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