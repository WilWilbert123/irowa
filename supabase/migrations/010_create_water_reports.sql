-- 010_create_water_reports.sql
CREATE TABLE IF NOT EXISTS public.water_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  water_source_id UUID NOT NULL REFERENCES public.water_sources(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'Incorrect location',
    'Resource no longer exists',
    'Incorrect availability',
    'Duplicate marker',
    'Incorrect information',
    'Potential safety concern',
    'Inappropriate photo or content',
    'Other'
  )),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
