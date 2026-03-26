-- ==========================================================
-- MASTER ADMIN SETUP & PERMISSIONS
-- ==========================================================

DO $$
DECLARE
  master_admin_id uuid := gen_random_uuid();
  admin_email TEXT := 'organic.arusuvai@gmail.com';
BEGIN
  -- 1. Insert/Update into auth.users
  -- check if user exists first to avoid duplicates if script is re-run
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    INSERT INTO auth.users (
      id, instance_id, role, aud, email, raw_app_meta_data, raw_user_meta_data, 
      is_super_admin, encrypted_password, email_confirmed_at, created_at, updated_at
    )
    VALUES (
      master_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', admin_email, 
      '{"provider":"email","providers":["email"]}', '{"full_name": "Master Admin"}', 
      false, crypt('masteradmin123', gen_salt('bf')), now(), now(), now()
    );
  ELSE
    SELECT id INTO master_admin_id FROM auth.users WHERE email = admin_email;
  END IF;

  -- 2. Ensure Role is Admin in Profiles
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (master_admin_id, 'Master Admin', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

END $$;

-- Enable RLS for user management via profiles
-- Admins should be able to see all profiles and update roles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
