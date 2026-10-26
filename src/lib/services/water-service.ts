// src/lib/services/water-service.ts
import { createClient, isSupabaseConfigured } from "../supabase/client";
import { createAdminClient } from "../supabase/admin";
import { WaterSourceWithPhotos, WaterFilterState } from "@/types/water";
import { Database, WaterCategory, WaterAvailabilityStatus } from "@/types/database.types";
import { slugify } from "../utils/formatters";

// Default curated Irosin data used when database is in demo/fallback mode
export const MOCK_IROSIN_WATER_SOURCES: WaterSourceWithPhotos[] = [
  {
    id: "a1111111-1111-4111-a111-111111111111",
    name: "Bitang Waterfall",
    slug: "bitang-waterfall",
    category: "Waterfall",
    description: "A pristine natural cascade surrounded by lush forest greenery. Cool, crystal-clear mountain water flowing year-round, ideal for sightseeing and nature retreats.",
    latitude: 12.7125,
    longitude: 124.0150,
    address: "Sitio Bitang, Barangay Liang",
    barangay: "Liang",
    availability_status: "Available",
    verification_status: "Verified",
    operating_hours: "6:00 AM - 5:00 PM Daily",
    contact_information: "Brgy. Liang Tourism Desk: 0919-876-5432",
    is_published: true,
    published_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    reverify_at: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    photos: [
      {
        id: "p1",
        water_source_id: "a1111111-1111-4111-a111-111111111111",
        storage_path: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
        caption: "Bitang Falls lower cascade and pool",
        is_primary: true,
        uploaded_by: null,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "b2222222-2222-4222-b222-222222222222",
    name: "Mapaso Hot Springs",
    slug: "mapaso-hot-springs",
    category: "Spring",
    description: "Geothermally heated natural sulfuric springs emerging from the slopes of Mt. Bulusan. Known for rejuvenating minerals and continuous thermal flow.",
    latitude: 12.6980,
    longitude: 124.0480,
    address: "National Road, Barangay Monbon",
    barangay: "Monbon",
    availability_status: "Available",
    verification_status: "Verified",
    operating_hours: "24/7 Public Bathing Areas",
    contact_information: "Irosin Tourism Office: (056) 555-0192",
    is_published: true,
    published_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    reverify_at: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    photos: [
      {
        id: "p2",
        water_source_id: "b2222222-2222-4222-b222-222222222222",
        storage_path: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
        caption: "Mapaso thermal bath steam rising",
        is_primary: true,
        uploaded_by: null,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "c3333333-3333-4333-c333-333333333333",
    name: "Maasim River",
    slug: "maasim-river",
    category: "River",
    description: "A clean, flowing river with clear rocky shallows, popular for community laundry, cooling off, and nature exploration during warm seasons.",
    latitude: 12.7190,
    longitude: 124.0280,
    address: "Barangay Gabao Riverbank",
    barangay: "Gabao",
    availability_status: "Available",
    verification_status: "Verified",
    operating_hours: "Open daily to public",
    contact_information: "Barangay Hall Gabao",
    is_published: true,
    published_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    reverify_at: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    photos: [
      {
        id: "p3",
        water_source_id: "c3333333-3333-4333-c333-333333333333",
        storage_path: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        caption: "Maasim river clear waters and lush riverbank",
        is_primary: true,
        uploaded_by: null,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "d4444444-4444-4444-d444-444444444444",
    name: "San Mateo Cold Spring Resort",
    slug: "san-mateo-cold-spring-resort",
    category: "Resort",
    description: "Natural cold spring pools fed directly by Bulusan volcano aquifers. Features shaded cottages and picnic spots.",
    latitude: 12.6910,
    longitude: 124.0530,
    address: "Brgy. Monbon Upper Valley",
    barangay: "Monbon",
    availability_status: "Available",
    verification_status: "Verified",
    operating_hours: "7:00 AM - 6:00 PM",
    contact_information: "0920-112-2334",
    is_published: true,
    published_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    reverify_at: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    photos: [
      {
        id: "p4",
        water_source_id: "d4444444-4444-4444-d444-444444444444",
        storage_path: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        caption: "San Mateo natural cold spring swimming pools",
        is_primary: true,
        uploaded_by: null,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "e5555555-5555-4555-e555-555555555555",
    name: "Irosin Town Water Refilling Station",
    slug: "irosin-town-water-refilling-station",
    category: "Water Refilling Station",
    description: "Purified drinking water refilling station providing 5-gallon container deliveries and walk-in bottle fills with UV filtration and alkaline options.",
    latitude: 12.7045,
    longitude: 124.0320,
    address: "Rizal Street, Poblacion Zone 2",
    barangay: "San Pedro",
    availability_status: "Available",
    verification_status: "Verified",
    operating_hours: "7:00 AM - 7:00 PM (Mon-Sat)",
    contact_information: "0918-345-6789",
    is_published: true,
    published_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    reverify_at: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    photos: [
      {
        id: "p5",
        water_source_id: "e5555555-5555-4555-e555-555555555555",
        storage_path: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=800&q=80",
        caption: "Clean purified water station equipment",
        is_primary: true,
        uploaded_by: null,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "f6666666-6666-4666-f666-666666666666",
    name: "Bacolod Community Deep Well",
    slug: "bacolod-community-deep-well",
    category: "Deep Well",
    description: "High-output solar-assisted deep well pump providing clean tap water for household use during dry spells and El Niño alerts.",
    latitude: 12.7090,
    longitude: 124.0385,
    address: "Near Bacolod Elementary School, Brgy. Bacolod",
    barangay: "Bacolod",
    availability_status: "Available",
    verification_status: "Verified",
    operating_hours: "5:00 AM - 9:00 PM",
    contact_information: "Bacolod Water Committee",
    is_published: true,
    published_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    reverify_at: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    photos: [
      {
        id: "p6",
        water_source_id: "f6666666-6666-4666-f666-666666666666",
        storage_path: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
        caption: "Bacolod community water pump",
        is_primary: true,
        uploaded_by: null,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "77777777-7777-4777-a777-777777777777",
    name: "Patag Barangay Water Point",
    slug: "patag-barangay-water-point",
    category: "Community Water Point",
    description: "Gravity-fed spring water communal faucet system accessible for local residents and farmers in upper Patag.",
    latitude: 12.7250,
    longitude: 124.0090,
    address: "Barangay Plaza, Brgy. Patag",
    barangay: "Patag",
    availability_status: "Limited Supply",
    verification_status: "Verified",
    operating_hours: "Open daylight hours",
    contact_information: "Barangay Patag Captain Office",
    is_published: true,
    published_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    reverify_at: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    photos: [
      {
        id: "p7",
        water_source_id: "77777777-7777-4777-a777-777777777777",
        storage_path: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        caption: "Mountain spring water tap",
        is_primary: true,
        uploaded_by: null,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "88888888-8888-4888-a888-888888888888",
    name: "Cadacan River View Point",
    slug: "cadacan-river-view-point",
    category: "River",
    description: "Major river system coursing through central Irosin valley with multiple natural water filtration gravel beds and fishing points.",
    latitude: 12.7015,
    longitude: 124.0250,
    address: "Cadacan Bridge Area, Brgy. San Julian",
    barangay: "San Julian",
    availability_status: "Available",
    verification_status: "Verified",
    operating_hours: "Public access",
    contact_information: "Irosin MDRRMO",
    is_published: true,
    published_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    reverify_at: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    photos: [
      {
        id: "p8",
        water_source_id: "88888888-8888-4888-a888-888888888888",
        storage_path: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80",
        caption: "Cadacan river water basin",
        is_primary: true,
        uploaded_by: null,
        created_at: new Date().toISOString(),
      },
    ],
  },
];

export async function getPublishedWaterSources(filters?: Partial<WaterFilterState>): Promise<WaterSourceWithPhotos[]> {
  if (!isSupabaseConfigured()) {
    return filterMockSources(MOCK_IROSIN_WATER_SOURCES, filters);
  }

  try {
    const supabase = createClient();
    let query = supabase
      .from("water_sources")
      .select("*, photos:water_photos(*)")
      .eq("is_published", true)
      .is("archived_at", null);

    if (filters?.category && filters.category !== "All") {
      query = query.eq("category", filters.category as WaterCategory);
    }
    if (filters?.availability && filters.availability !== "All") {
      query = query.eq("availability_status", filters.availability as WaterAvailabilityStatus);
    }
    if (filters?.barangay && filters.barangay !== "All") {
      query = query.eq("barangay", filters.barangay);
    }
    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,barangay.ilike.%${filters.searchQuery}%`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      // Return filtered mock data if database is not seeded or offline
      return filterMockSources(MOCK_IROSIN_WATER_SOURCES, filters);
    }
    return data as WaterSourceWithPhotos[];
  } catch {
    return filterMockSources(MOCK_IROSIN_WATER_SOURCES, filters);
  }
}

function filterMockSources(sources: WaterSourceWithPhotos[], filters?: Partial<WaterFilterState>): WaterSourceWithPhotos[] {
  let result = [...sources];
  if (filters?.category && filters.category !== "All") {
    result = result.filter((s) => s.category === filters.category);
  }
  if (filters?.availability && filters.availability !== "All") {
    result = result.filter((s) => s.availability_status === filters.availability);
  }
  if (filters?.barangay && filters.barangay !== "All") {
    result = result.filter((s) => s.barangay?.toLowerCase() === filters.barangay?.toLowerCase());
  }
  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.barangay?.toLowerCase().includes(q)
    );
  }
  return result;
}

export async function getWaterSourceBySlug(slug: string): Promise<WaterSourceWithPhotos | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_IROSIN_WATER_SOURCES.find((s) => s.slug === slug) || null;
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("water_sources")
      .select("*, photos:water_photos(*)")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return MOCK_IROSIN_WATER_SOURCES.find((s) => s.slug === slug) || null;
    }
    return data as WaterSourceWithPhotos;
  } catch {
    return MOCK_IROSIN_WATER_SOURCES.find((s) => s.slug === slug) || null;
  }
}

export async function getWaterSourceById(id: string): Promise<WaterSourceWithPhotos | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_IROSIN_WATER_SOURCES.find((s) => s.id === id) || null;
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("water_sources")
      .select("*, photos:water_photos(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return MOCK_IROSIN_WATER_SOURCES.find((s) => s.id === id) || null;
    }
    return data as WaterSourceWithPhotos;
  } catch {
    return MOCK_IROSIN_WATER_SOURCES.find((s) => s.id === id) || null;
  }
}

export async function getAllWaterSourcesAdmin(): Promise<WaterSourceWithPhotos[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_IROSIN_WATER_SOURCES;
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("water_sources")
      .select("*, photos:water_photos(*)")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_IROSIN_WATER_SOURCES;
    }
    return data as WaterSourceWithPhotos[];
  } catch {
    return MOCK_IROSIN_WATER_SOURCES;
  }
}
