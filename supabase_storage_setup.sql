-- ==========================================
-- CREATE STORAGE BUCKET FOR AVATARS
-- ==========================================

-- 1. Create the 'avatars' bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Configure RLS Policies for the bucket objects
-- Allow public read access to all avatars
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload new avatars
CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update own avatars" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete own avatars" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'avatars' AND auth.uid() = owner);
