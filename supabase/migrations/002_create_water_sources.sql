-- 002_create_water_sources.sql
CREATE TABLE IF NOT EXISTS public.water_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
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
  verification_status TEXT NOT NULL DEFAULT 'Verified' CHECK (
    verification_status IN ('Verified', 'Pending', 'Unverified', 'Rejected')
  ),
  operating_hours TEXT,
  contact_information TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  last_verified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  reverify_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  archived_at TIMESTAMPTZ
);

CREATE TRIGGER set_water_sources_updated_at
BEFORE UPDATE ON public.water_sources
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
