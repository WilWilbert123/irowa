-- 016_add_lake_category.sql
-- Allow 'Lake' in category check constraint for water_sources and water_submissions

ALTER TABLE public.water_sources DROP CONSTRAINT IF EXISTS water_sources_category_check;
ALTER TABLE public.water_sources ADD CONSTRAINT water_sources_category_check CHECK (category IN (
  'Public Water Source',
  'Spring',
  'River',
  'Waterfall',
  'Resort',
  'Lake',
  'Water Refilling Station',
  'Deep Well',
  'Community Water Point',
  'Other'
));

ALTER TABLE public.water_submissions DROP CONSTRAINT IF EXISTS water_submissions_category_check;
ALTER TABLE public.water_submissions ADD CONSTRAINT water_submissions_category_check CHECK (category IN (
  'Public Water Source',
  'Spring',
  'River',
  'Waterfall',
  'Resort',
  'Lake',
  'Water Refilling Station',
  'Deep Well',
  'Community Water Point',
  'Other'
));

