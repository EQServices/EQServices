-- Storage policies for avatar-images bucket
-- Allow authenticated users to upload their own avatars
-- Allow public read access

-- Policy: Anyone can view avatars (public bucket)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Avatar images are viewable by everyone'
  ) THEN
    EXECUTE 'CREATE POLICY "Avatar images are viewable by everyone" ON storage.objects
      FOR SELECT
      USING (bucket_id = ''avatar-images'')';
  END IF;
END $$;

-- Policy: Authenticated users can upload their own avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload own avatar'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload own avatar" ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = ''avatar-images'' AND
        auth.role() = ''authenticated'' AND
        (storage.foldername(name))[1] = ''avatars'' AND
        (
          (storage.foldername(name))[2] = ''client'' OR
          (storage.foldername(name))[2] = ''professional''
        ) AND
        (storage.foldername(name))[3] = auth.uid()::text
      )';
  END IF;
END $$;

-- Policy: Users can update their own avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update own avatar'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own avatar" ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = ''avatar-images'' AND
        auth.role() = ''authenticated'' AND
        (storage.foldername(name))[1] = ''avatars'' AND
        (
          (storage.foldername(name))[2] = ''client'' OR
          (storage.foldername(name))[2] = ''professional''
        ) AND
        (storage.foldername(name))[3] = auth.uid()::text
      )';
  END IF;
END $$;

-- Policy: Users can delete their own avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own avatar'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete own avatar" ON storage.objects
      FOR DELETE
      USING (
        bucket_id = ''avatar-images'' AND
        auth.role() = ''authenticated'' AND
        (storage.foldername(name))[1] = ''avatars'' AND
        (
          (storage.foldername(name))[2] = ''client'' OR
          (storage.foldername(name))[2] = ''professional''
        ) AND
        (storage.foldername(name))[3] = auth.uid()::text
      )';
  END IF;
END $$;

