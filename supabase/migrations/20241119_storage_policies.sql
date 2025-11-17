-- Storage policies para buckets: service-photos, portfolio-images, chat-uploads
-- Execute este script após criar os buckets

-- ============================================
-- BUCKET: service-photos
-- ============================================

-- Policy: Usuários autenticados podem fazer upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload service photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can upload service photos" ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = ''service-photos'' AND
        auth.role() = ''authenticated''
      )';
  END IF;
END $$;

-- Policy: Download público
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Service photos are viewable by everyone'
  ) THEN
    EXECUTE 'CREATE POLICY "Service photos are viewable by everyone" ON storage.objects
      FOR SELECT
      USING (bucket_id = ''service-photos'')';
  END IF;
END $$;

-- Policy: Usuários podem deletar suas próprias fotos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own service photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete own service photos" ON storage.objects
      FOR DELETE
      USING (
        bucket_id = ''service-photos'' AND
        auth.role() = ''authenticated''
      )';
  END IF;
END $$;

-- ============================================
-- BUCKET: portfolio-images
-- ============================================

-- Policy: Apenas profissionais podem fazer upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Professionals can upload portfolio images'
  ) THEN
    EXECUTE 'CREATE POLICY "Professionals can upload portfolio images" ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = ''portfolio-images'' AND
        auth.role() = ''authenticated'' AND
        EXISTS (
          SELECT 1 FROM public.professionals
          WHERE id = auth.uid()
        )
      )';
  END IF;
END $$;

-- Policy: Download público
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Portfolio images are viewable by everyone'
  ) THEN
    EXECUTE 'CREATE POLICY "Portfolio images are viewable by everyone" ON storage.objects
      FOR SELECT
      USING (bucket_id = ''portfolio-images'')';
  END IF;
END $$;

-- Policy: Profissionais podem deletar suas próprias imagens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Professionals can delete own portfolio images'
  ) THEN
    EXECUTE 'CREATE POLICY "Professionals can delete own portfolio images" ON storage.objects
      FOR DELETE
      USING (
        bucket_id = ''portfolio-images'' AND
        auth.role() = ''authenticated'' AND
        EXISTS (
          SELECT 1 FROM public.professionals
          WHERE id = auth.uid()
        )
      )';
  END IF;
END $$;

-- ============================================
-- BUCKET: chat-uploads
-- ============================================

-- Policy: Participantes da conversa podem fazer upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Conversation participants can upload'
  ) THEN
    EXECUTE 'CREATE POLICY "Conversation participants can upload" ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = ''chat-uploads'' AND
        auth.role() = ''authenticated'' AND
        EXISTS (
          SELECT 1 FROM public.conversation_participants cp
          WHERE cp.user_id = auth.uid()
          AND (storage.foldername(name))[1] = cp.conversation_id::text
        )
      )';
  END IF;
END $$;

-- Policy: Apenas participantes da conversa podem fazer download
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Conversation participants can download'
  ) THEN
    EXECUTE 'CREATE POLICY "Conversation participants can download" ON storage.objects
      FOR SELECT
      USING (
        bucket_id = ''chat-uploads'' AND
        auth.role() = ''authenticated'' AND
        EXISTS (
          SELECT 1 FROM public.conversation_participants cp
          WHERE cp.user_id = auth.uid()
          AND (storage.foldername(name))[1] = cp.conversation_id::text
        )
      )';
  END IF;
END $$;

-- Policy: Remetente pode deletar suas próprias mensagens com anexos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own chat uploads'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete own chat uploads" ON storage.objects
      FOR DELETE
      USING (
        bucket_id = ''chat-uploads'' AND
        auth.role() = ''authenticated'' AND
        (storage.foldername(name))[2] = auth.uid()::text
      )';
  END IF;
END $$;

