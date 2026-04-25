-- Create the "avatars" storage bucket for user profile images.
-- Avatars MUST be stored in Supabase Storage, NEVER as base64 data URLs
-- in user_metadata (which bloats JWTs/cookies and causes 502 errors).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,                          -- public bucket so avatar URLs work without auth
  2097152,                       -- 2 MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS: authenticated users can upload/update their own avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.filename(name)) LIKE auth.uid()::text || '.%'
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.filename(name)) LIKE auth.uid()::text || '.%'
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.filename(name)) LIKE auth.uid()::text || '.%'
  );

-- RLS: anyone can read avatars (public bucket)
CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
