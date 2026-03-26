-- ==========================================================
-- TYPO-PROOF MASTER ADMIN FIX
-- ==========================================================

-- 1. Redefine the new user handler 
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT := 'customer';
BEGIN
  -- Check for master admin email (covering both typos)
  IF (new.email = 'organic.arusuvai@gmail.com' OR new.email = 'organi.arusuvai@gmail.com') THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Force upgrade existing profiles for both variants
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('organic.arusuvai@gmail.com', 'organi.arusuvai@gmail.com')
);

-- 3. Backfill missing profiles
INSERT INTO public.profiles (id, full_name, role)
SELECT id, raw_user_meta_data->>'full_name', 'admin'
FROM auth.users
WHERE email IN ('organic.arusuvai@gmail.com', 'organi.arusuvai@gmail.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
