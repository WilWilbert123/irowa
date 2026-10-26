-- 009_create_saved_water_sources.sql
CREATE TABLE IF NOT EXISTS public.saved_water_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  water_source_id UUID NOT NULL REFERENCES public.water_sources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_visitor_saved_source UNIQUE (visitor_id, water_source_id)
);
