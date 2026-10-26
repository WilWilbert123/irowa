-- 004_create_water_submissions.sql
CREATE TABLE IF NOT EXISTS public.water_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  submitter_name TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Public Water Source',
    'Spring',
    'River',
    'Waterfall',
    'Resort',
    'Water Refilling Station',
    'Deep Well',
    'Community Water Point',
    'Other'
  )),
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  barangay TEXT,
  availability_status TEXT NOT NULL DEFAULT 'Available' CHECK (
    availability_status IN ('Available', 'Limited Supply', 'Temporarily Unavailable', 'Seasonal', 'Unknown')
  ),
  operating_hours TEXT,
  contact_information TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'duplicate')
  ),
  reviewed_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  published_water_source_id UUID REFERENCES public.water_sources(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER set_water_submissions_updated_at
BEFORE UPDATE ON public.water_submissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- submission_photos
CREATE TABLE IF NOT EXISTS public.submission_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.water_submissions(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
