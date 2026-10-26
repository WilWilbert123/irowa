-- 007_create_notifications.sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT, -- nullable for system broadcasts
  type TEXT NOT NULL CHECK (
    type IN ('new_water_source', 'status_update', 'advisory', 'submission_review', 'announcement', 'general')
  ),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  water_source_id UUID REFERENCES public.water_sources(id) ON DELETE SET NULL,
  announcement_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
