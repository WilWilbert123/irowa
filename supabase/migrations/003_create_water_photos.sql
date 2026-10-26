-- 003_create_water_photos.sql
CREATE TABLE IF NOT EXISTS public.water_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  water_source_id UUID NOT NULL REFERENCES public.water_sources(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
