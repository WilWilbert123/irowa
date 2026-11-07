# IroWa - Irosin Water Resources Map

IroWa is a web-based geographic information system and community resilience platform engineered for cataloging, locating, and managing water resources across the Municipality of Irosin, Sorsogon, Philippines (centered at 12.7042 N, 124.0326 E).

The platform serves as an essential municipal utility for residents, local disaster response teams, and visitors during El Nino dry spells, municipal water service interruptions, volcanic activity from Mount Bulusan, and extreme weather disturbances. It maps natural springs, communal deep wells, waterfalls, rivers, commercial refilling stations, and municipal tap stands across all 28 barangays of Irosin.

---

## Project Overview

IroWa addresses critical water accessibility challenges by combining public crowdsourced reporting with municipal administrative verification. It bridges community-level field observations with emergency services coordination, offering real-time status updates, turn-by-turn navigation, and offline resilience when telecommunications infrastructure is impaired.

### Key Capabilities

- Interactive Municipal Water Map: High-performance cartographic interface supporting Street (OpenStreetMap) and High-Resolution Satellite (Esri World Imagery) views, current GPS positioning, and custom category-colored markers.
- Filterable Water Resource Directory: Real-time directory searchable by resource name, barangay, availability status (Available, Limited, Unavailable), and resource category.
- Turn-by-Turn Navigation and Routing: In-app routing powered by the Open Source Routing Machine (OSRM) with foot and driving profiles, complete with synthetic off-road path connections for remote mountain springs and waterfalls.
- Community Contribution Pipeline: Citizen submission system allowing users to suggest new water points with GPS pin placement, photo attachments, flow descriptions, and operational schedules, feeding into an administrative moderation queue.
- Emergency Advisory Broadcasts: Real-time municipal emergency banner system that instantly displays urgent water conservation guidelines, delivery schedules, and boil-water alerts across public screens.
- Offline-First Architecture: Client-side caching using IndexedDB and Web Storage, allowing citizens to search, inspect, and retrieve previously loaded water points and emergency contacts without active cellular data.
- Per-Point Community Discussions: Real-time interactive discussion threads for each cataloged water point to report immediate water pressure, line queues, or maintenance issues.
- Administrative Management Console: Protected operational dashboard featuring CRUD management of water resources, pending submission review, report auditing, advisory broadcasts, and runtime municipal system settings.
- Bilingual Localization: Tagalog-first interface design with real-time toggle support between Tagalog (default) and English.
- Adaptive Theming: Complete dark and light mode support with high-contrast accessibility standards.

---

## Technology Stack

### Frontend Architecture

- Framework: Next.js 16 (App Router, Turbopack, Partial Prerendering)
- Core Library: React 19 (Server and Client Components)
- Programming Language: TypeScript 5 (Strict Mode)
- Styling: Tailwind CSS v4 (CSS-first configuration and design tokens)
- Iconography: Lucide React (Clean outline vector icons)
- Theme System: next-themes (Light, Dark, and System modes)

### Geospatial and Routing

- Map Rendering: Leaflet and React-Leaflet
- Tile Providers:
  - Street View: OpenStreetMap Standard Cartography
  - Satellite View: Esri World Imagery with Clarity tiles
- Routing Engine: OSRM (Open Source Routing Machine) API
- Path Interpolation: Geometric distance algorithms and off-road trail connector synthesis

### State Management and Data Fetching

- Server State: TanStack React Query v5 (Optimistic caching, background refetching)
- Form Architecture: React Hook Form
- Schema Validation: Zod
- Offline Storage: IndexedDB via native Web APIs, LocalStorage

### Backend and Cloud Infrastructure

- Database: Supabase PostgreSQL (Custom schemas, spatial indexing, Row Level Security)
- Authentication: Supabase Auth (Session management, secure cookies via @supabase/ssr)
- Realtime Engine: Supabase Realtime (WebSocket channels for instant chat and advisory synchronization)
- Storage: Supabase Storage Buckets (Water source photography, community submission uploads)
- Push Notifications: Web Push Protocol (VAPID keys) and Service Worker notification dispatch

### Quality Assurance and Testing

- Unit and Component Testing: Vitest, React Testing Library, JSDOM
- End-to-End Testing: Playwright
- Code Quality: ESLint with Next.js Core Web Vitals configuration

---

## System Architecture

The application is structured around a modular, client-resilient architecture designed for fast initial render and continuous offline operation:

```
[Public Client / Mobile Viewport]
       |
       +---> [Next.js App Router (Turbopack)]
       |        |
       |        +---> Leaflet Mapping Engine (Esri / OpenStreetMap)
       |        +---> OSRM Routing & Navigation Services
       |        +---> Bilingual Translation Engine (Tagalog / English)
       |        +---> Offline Storage & Service Worker Cache
       |
       +---> [Supabase Managed Backend]
                |
                +---> PostgreSQL Database with Row Level Security (RLS)
                +---> WebSocket Realtime Channels (Chat & Advisories)
                +---> Storage Buckets (Citizen Photos & Documentation)
```

---

## Geographic Scope

The platform is calibrated specifically for the geographic and topographical characteristics of the Municipality of Irosin, Sorsogon:

- Municipal Center Coordinates: 12.7042 N, 124.0326 E
- Default Navigation Zoom: Level 13
- Coverage: Bacolod, Bagsangan, Batang, Bolos, Buenavista, Bulawan, Carriedo, Casiguran border, Cawayan, Cogon, Gabao, Gulang-Gulang, Liang, Macawayan, Mapaso, Monbon, Patag, Salvacion, San Agustin, San Antonio, San Isidro, San Juan, San Julian, San Pedro, Santo Domingo, Tabon-Tabon, Tinampo, Tongdol.
- Special Landforms: Bulusan Volcano Natural Park slopes, Valley aquifer basins, and natural cold/hot thermal springs.
