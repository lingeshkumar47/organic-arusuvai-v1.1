-- ==========================================================
-- SUPREME ADMIN GOD-MODE TRIGGER
-- ==========================================================
-- 1. Redefine the new user handler with a super-priority email check
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE assigned_role TEXT := 'customer';
BEGIN -- Check for master admin email
IF (new.email = 'organic.arusuvai@gmail.com') THEN assigned_role := 'admin';
END IF;
INSERT INTO public.profiles (id, full_name, avatar_url, role)
VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    assigned_role
  ) ON CONFLICT (id) DO
UPDATE
SET role = EXCLUDED.role;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 2. Force update existing profiles if they exist but have the wrong role
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
    SELECT id
    FROM auth.users
    WHERE email = 'organic.arusuvai@gmail.com'
  );
-- 3. If the profile doesn't exist yet but the auth user does
INSERT INTO public.profiles (id, full_name, role)
SELECT id,
  raw_user_meta_data->>'full_name',
  'admin'
FROM auth.users
WHERE email = 'organic.arusuvai@gmail.com' ON CONFLICT (id) DO
UPDATE
SET role = 'admin';