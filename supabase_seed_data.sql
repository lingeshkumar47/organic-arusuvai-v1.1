-- 1. Enable pgcrypto extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create the Customer User (customer1@example.com / customer123)
DO $$
DECLARE
  cust_id uuid := gen_random_uuid();
  admin_id uuid := gen_random_uuid();
BEGIN
  -- Insert Customer 1 into auth.users
  INSERT INTO auth.users (
    id, instance_id, role, aud, email, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, encrypted_password, email_confirmed_at, created_at, updated_at
  )
  VALUES (
    cust_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'customer1@example.com', 
    '{"provider":"email","providers":["email"]}', '{"full_name": "Customer 1"}', 
    false, crypt('customer123', gen_salt('bf')), now(), now(), now()
  );

  -- Ensure the new user is correctly labeled as 'customer' in the profiles table.
  -- (This table handles its own trigger insertion via handle_new_user(), but we can ensure the role is set manually if the trigger is slightly delayed).
  UPDATE public.profiles SET role = 'customer' WHERE id = cust_id;

  -- Insert Master Admin into auth.users
  INSERT INTO auth.users (
    id, instance_id, role, aud, email, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, encrypted_password, email_confirmed_at, created_at, updated_at
  )
  VALUES (
    admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'masteradmin@example.com', 
    '{"provider":"email","providers":["email"]}', '{"full_name": "Master Admin"}', 
    false, crypt('masteradmin123', gen_salt('bf')), now(), now(), now()
  );

  -- Update profiles to grant Admin Privileges to this account
  -- (Requires small sleep if the trigger hasn't fired yet, but usually synchronous)
  UPDATE public.profiles SET role = 'admin' WHERE id = admin_id;

END $$;

-- 3. Insert some dummy products into categories & products tables for UI testing
DO $$
DECLARE
  spice_cat_id BIGINT;
  oil_cat_id BIGINT;
BEGIN
  -- Insert dummy Categories
  INSERT INTO public.categories (name, slug, description, sort_order)
  VALUES 
    ('Spices', 'spices', 'Organic spices straight from the farm', 1),
    ('Cold Pressed Oils', 'cold-pressed-oils', 'Traditional stone-ground oils', 2)
  RETURNING id INTO spice_cat_id;
  
  -- The second RETURNING behavior in PL/pgSQL needs individual selects or distinct inserts.
  SELECT id INTO oil_cat_id FROM public.categories WHERE slug = 'cold-pressed-oils';

  -- Insert dummy Products
  INSERT INTO public.products (category_id, name, slug, base_price, discount_price, is_featured, is_active)
  VALUES 
    (spice_cat_id, 'Organic Turmeric Powder', 'organic-turmeric-powder', 199.00, 149.00, true, true),
    (oil_cat_id, 'Cold Pressed Coconut Oil', 'cold-pressed-coconut-oil', 449.00, 349.00, true, true),
    (spice_cat_id, 'Organic Black Pepper', 'organic-black-pepper', 279.00, 199.00, true, true),
    (oil_cat_id, 'Groundnut Oil (1L)', 'groundnut-oil-1l', 350.00, 279.00, true, true);
END $$;
