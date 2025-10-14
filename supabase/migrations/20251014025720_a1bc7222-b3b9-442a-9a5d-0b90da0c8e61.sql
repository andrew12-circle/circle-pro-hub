-- Add Stripe customer tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
ON public.profiles(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for subscription management';