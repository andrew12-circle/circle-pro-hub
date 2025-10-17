-- Create rate_limits table for distributed rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON public.rate_limits(reset_at);

-- Enable RLS (but allow service role access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage rate limits
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Function to atomically increment rate limit
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  p_key TEXT,
  p_window_ms INTEGER DEFAULT 60000,
  p_max_requests INTEGER DEFAULT 100
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record RECORD;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_reset_at TIMESTAMP WITH TIME ZONE;
  v_remaining INTEGER;
  v_allowed BOOLEAN;
BEGIN
  -- Calculate reset time
  v_reset_at := v_now + (p_window_ms || ' milliseconds')::INTERVAL;
  
  -- Try to get existing record
  SELECT * INTO v_record
  FROM public.rate_limits
  WHERE key = p_key
  FOR UPDATE;
  
  -- If no record exists or it's expired, create/reset
  IF v_record IS NULL OR v_now >= v_record.reset_at THEN
    INSERT INTO public.rate_limits (key, count, reset_at)
    VALUES (p_key, 1, v_reset_at)
    ON CONFLICT (key) DO UPDATE
    SET count = 1, reset_at = v_reset_at
    RETURNING * INTO v_record;
    
    RETURN json_build_object(
      'allowed', true,
      'remaining', p_max_requests - 1,
      'resetAt', EXTRACT(EPOCH FROM v_record.reset_at) * 1000
    );
  END IF;
  
  -- Check if limit exceeded
  IF v_record.count >= p_max_requests THEN
    RETURN json_build_object(
      'allowed', false,
      'remaining', 0,
      'resetAt', EXTRACT(EPOCH FROM v_record.reset_at) * 1000
    );
  END IF;
  
  -- Increment count
  UPDATE public.rate_limits
  SET count = count + 1
  WHERE key = p_key
  RETURNING * INTO v_record;
  
  v_remaining := p_max_requests - v_record.count;
  
  RETURN json_build_object(
    'allowed', true,
    'remaining', v_remaining,
    'resetAt', EXTRACT(EPOCH FROM v_record.reset_at) * 1000
  );
END;
$$;

-- Cleanup function for expired rate limits (optional, can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE reset_at < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;