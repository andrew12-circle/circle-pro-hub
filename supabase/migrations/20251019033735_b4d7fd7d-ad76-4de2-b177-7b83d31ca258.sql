-- Fix security warning: Set search_path on bump_version_on_update function
CREATE OR REPLACE FUNCTION bump_version_on_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.row_version = OLD.row_version + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;