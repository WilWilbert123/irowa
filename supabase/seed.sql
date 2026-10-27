-- supabase/seed.sql
-- Seed data for IroWa - Irosin Water Resources Map

-- 1. Insert Initial Application Settings
INSERT INTO public.application_settings (key, value)
VALUES
  ('general', '{"app_name": "IroWa", "tagline": "Irosin Water Resources Map", "emergency_hotline": "0917-123-4567", "alert_banner_enabled": true, "alert_banner_text": "Water Advisory: Regular conservation guidelines in effect for low-elevation barangays."}'::jsonb),
  ('map', '{"default_center": [12.7042, 124.0326], "default_zoom": 13, "min_zoom": 11, "max_zoom": 18}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Insert Approved Published Water Sources in Irosin
INSERT INTO public.water_sources (
  id, name, slug, category, description, latitude, longitude, address, barangay,
  availability_status, verification_status, operating_hours, contact_information,
  is_published, published_at, last_verified_at
) VALUES
(
  'a1111111-1111-4111-a111-111111111111',
  'Bitang Waterfall',
  'bitang-waterfall',
  'Waterfall',
  'A pristine natural cascade surrounded by lush forest greenery. Cool, crystal-clear mountain water flowing year-round, ideal for sightseeing and nature retreats.',
  12.7125,
  124.0150,
  'Sitio Bitang, Barangay Liang',
  'Liang',
  'Available',
  'Verified',
  '6:00 AM - 5:00 PM Daily',
  'Brgy. Liang Tourism Desk: 0919-876-5432',
  true,
  now(),
  now()
),
(
  'b2222222-2222-4222-b222-222222222222',
  'Mapaso Hot Springs',
  'mapaso-hot-springs',
  'Spring',
  'Geothermally heated natural sulfuric springs emerging from the slopes of Mt. Bulusan. Known for rejuvenating minerals and continuous thermal flow.',
  12.6980,
  124.0480,
  'National Road, Barangay Monbon',
  'Monbon',
  'Available',
  'Verified',
  '24/7 Public Bathing Areas',
  'Irosin Tourism Office: (056) 555-0192',
  true,
  now(),
  now()
),
(
  'c3333333-3333-4333-c333-333333333333',
  'Maasim River',
  'maasim-river',
  'River',
  'A clean, flowing river with clear rocky shallows, popular for community laundry, cooling off, and nature exploration during warm seasons.',
  12.7190,
  124.0280,
  'Barangay Gabao Riverbank',
  'Gabao',
  'Available',
  'Verified',
  'Open daily to public',
  'Barangay Hall Gabao',
  true,
  now(),
  now()
),
(
  'd4444444-4444-4444-d444-444444444444',
  'San Mateo Cold Spring Resort',
  'san-mateo-cold-spring-resort',
  'Resort',
  'Natural cold spring pools fed directly by Bulusan volcano aquifers. Features shaded cottages and picnic spots.',
  12.6910,
  124.0530,
  'Brgy. Monbon Upper Valley',
  'Monbon',
  'Available',
  'Verified',
  '7:00 AM - 6:00 PM',
  '0920-112-2334',
  true,
  now(),
  now()
),
(
  'e5555555-5555-4555-e555-555555555555',
  'Irosin Town Water Refilling Station',
  'irosin-town-water-refilling-station',
  'Water Refilling Station',
  'Purified drinking water refilling station providing 5-gallon container deliveries and walk-in bottle fills with UV filtration and alkaline options.',
  12.7045,
  124.0320,
  'Rizal Street, Poblacion Zone 2',
  'San Pedro',
  'Available',
  'Verified',
  '7:00 AM - 7:00 PM (Mon-Sat)',
  '0918-345-6789',
  true,
  now(),
  now()
),
(
  'f6666666-6666-4666-f666-666666666666',
  'Bacolod Community Deep Well',
  'bacolod-community-deep-well',
  'Deep Well',
  'High-output solar-assisted deep well pump providing clean tap water for household use during dry spells and El Niño alerts.',
  12.7090,
  124.0385,
  'Near Bacolod Elementary School, Brgy. Bacolod',
  'Bacolod',
  'Available',
  'Verified',
  '5:00 AM - 9:00 PM',
  'Bacolod Water Committee',
  true,
  now(),
  now()
),
(
  '77777777-7777-4777-a777-777777777777',
  'Patag Barangay Water Point',
  'patag-barangay-water-point',
  'Community Water Point',
  'Gravity-fed spring water communal faucet system accessible for local residents and farmers in upper Patag.',
  12.7250,
  124.0090,
  'Barangay Plaza, Brgy. Patag',
  'Patag',
  'Limited Supply',
  'Verified',
  'Open daylight hours',
  'Barangay Patag Captain Office',
  true,
  now(),
  now()
),
(
  '88888888-8888-4888-a888-888888888888',
  'Cadacan River View Point',
  'cadacan-river-view-point',
  'River',
  'Major river system coursing through central Irosin valley with multiple natural water filtration gravel beds and fishing points.',
  12.7015,
  124.0250,
  'Cadacan Bridge Area, Brgy. San Julian',
  'San Julian',
  'Available',
  'Verified',
  'Public access',
  'Irosin MDRRMO',
  true,
  now(),
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Create Corresponding Chat Rooms for each Water Source
INSERT INTO public.chat_rooms (id, water_source_id, is_active)
SELECT 
  gen_random_uuid(),
  ws.id,
  true
FROM public.water_sources ws
ON CONFLICT (water_source_id) DO NOTHING;

-- 4. Insert Initial Community Chat Messages
INSERT INTO public.chat_messages (chat_room_id, visitor_id, display_name, message, status)
SELECT 
  cr.id,
  'v_visitor_001',
  'Maria Santos',
  'May I ask if the water level at Maasim River is still good for swimming this weekend?',
  'published'
FROM public.chat_rooms cr
JOIN public.water_sources ws ON ws.id = cr.water_source_id
WHERE ws.slug = 'maasim-river'
LIMIT 1;

INSERT INTO public.chat_messages (chat_room_id, visitor_id, display_name, message, status)
SELECT 
  cr.id,
  'v_visitor_002',
  'Rizal Dela Cruz',
  'Yes, it is still good! The water is clear and safe as of this morning.',
  'published'
FROM public.chat_rooms cr
JOIN public.water_sources ws ON ws.id = cr.water_source_id
WHERE ws.slug = 'maasim-river'
LIMIT 1;

-- 5. Insert Official Announcements
INSERT INTO public.announcements (
  id, title, body, priority, status, published_at
) VALUES
(
  'bbbbbbbb-1111-4bbb-bbbb-111111111111',
  'El Niño Preparedness & Water Conservation Advisory',
  'Due to prolonged dry weather conditions, the Municipal Environment & Disaster Office reminds all residents in Irosin to report any low pressure or leaks in community water points. Deep wells in Bacolod and Gabao remain on full standby.',
  'high',
  'published',
  now()
),
(
  'bbbbbbbb-2222-4bbb-bbbb-222222222222',
  'San Mateo Springs Routine Maintenance Complete',
  'Maintenance and sanitization of the public channels at San Mateo have concluded. All pools and cold spring spouts are fully operational.',
  'normal',
  'published',
  now() - interval '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Insert System Notifications
INSERT INTO public.notifications (
  title, body, type, water_source_id, is_read
) VALUES
(
  'New Water Source Verified',
  'Bitang Waterfall in Brgy. Liang has been officially verified and added to the IroWa interactive map.',
  'new_water_source',
  'a1111111-1111-4111-a111-111111111111',
  false
),
(
  'Water Advisory Broadcast',
  'Municipal advisory on water conservation during peak afternoon hours is currently in effect.',
  'advisory',
  NULL,
  false
);
