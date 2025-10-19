-- Assign Andrew Heisley as admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('3e792453-16ba-4457-88bf-2425159de21e', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update the trigger function to assign admin to first user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_first_user BOOLEAN;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- Check if this is the first user (no admins exist yet)
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) INTO v_is_first_user;
  
  -- Assign roles
  IF v_is_first_user THEN
    -- First user gets admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin');
  END IF;
  
  -- All users get default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;