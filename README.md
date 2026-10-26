# IroWa - Irosin Water Resources Map

IroWa is a web application designed for locating, sharing, and discussing public and natural water resources across Irosin, Sorsogon, Philippines (centered at 12.7042 N, 124.0326 E).

The application assists residents and visitors during El Nino droughts, municipal water shortages, typhoons, and emergencies, while also cataloging springs, waterfalls, rivers, refilling stations, and public water distribution points.

---

## Technology Stack

- Framework: Next.js (App Router, Turbopack, Server Actions)
- Frontend: React 19, TypeScript (Strict Mode)
- Styling: Tailwind CSS v4, Lucide React (outline icons only)
- Mapping: Leaflet, React-Leaflet, Esri Satellite Imagery, OpenStreetMap
- In-App Routing: OSRM (Open Source Routing Machine) with off-road mountain trail connectors
- Backend and Database: Supabase PostgreSQL, Row-Level Security (RLS), Supabase SSR
- Realtime and Storage: Supabase Realtime (chat and updates), Supabase Storage
- Push Notifications: Dual Web Push (VAPID) and Firebase Cloud Messaging (FCM) support
- Testing: Vitest (Unit and Integration), Playwright (End-to-End)

---

## Prerequisites

Before starting, ensure you have the following installed on your computer:

1. Node.js: version 18.18 or higher (Node.js 20 LTS recommended).
2. npm: version 9 or higher.
3. Git: installed and configured.
4. Supabase Account: free or paid account at supabase.com (or local Supabase CLI).

---

## Step-by-Step Setup Guide

### Step 1: Clone the Repository and Install Dependencies

Open your terminal (PowerShell or Bash) and execute:

```powershell
# Clone the project repository
git clone https://github.com/your-username/irowa.git

# Move into the project directory
cd irowa

# Install project dependencies
npm install --legacy-peer-deps
```

---

### Step 2: Configure Environment Variables

Create your local environment configuration file by copying `.env.example`:

```powershell
# On Windows PowerShell
Copy-Item .env.example .env.local

# On Linux or macOS
cp .env.example .env.local
```

Open `.env.local` in your editor and configure your credentials:

```dotenv
# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:5000

# Supabase Credentials (obtain from Supabase Dashboard > Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key

# Optional: Map Tile Provider (defaults to OpenStreetMap when standard layer is chosen)
NEXT_PUBLIC_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png

# Optional: Native Web Push Configuration (generate via npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@irowa.local

# Optional: Firebase Cloud Messaging Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_firebase_web_push_certificate_key
```

Note on Offline Fallback: If Supabase credentials are not yet configured or left with placeholder values, IroWa automatically operates in demo fallback mode with curated mock water sources, mock chat rooms, and mock advisories so you can develop and test immediately without errors.

---

### Step 3: Set Up the Supabase Database

If you are using a live Supabase project:

1. Open the Supabase Dashboard and go to the SQL Editor.
2. Run the 16 migration scripts in order from the `supabase/migrations/` directory:
   - `001_create_admin_profiles.sql`
   - `002_create_water_sources.sql`
   - `003_create_water_photos.sql`
   - `004_create_water_submissions.sql`
   - `005_create_chat_rooms.sql`
   - `006_create_chat_messages.sql`
   - `007_create_notifications.sql`
   - `008_create_push_subscriptions.sql`
   - `009_create_saved_water_sources.sql`
   - `010_create_water_reports.sql`
   - `011_create_visitor_sessions.sql`
   - `012_create_announcements.sql`
   - `013_create_audit_logs.sql`
   - `014_create_moderation_tables.sql`
   - `015_create_indexes.sql`
   - `016_enable_rls_policies.sql`
3. Load the initial curated Irosin data by running `supabase/seed.sql`.
4. Create Storage Buckets:
   - Navigate to Storage in your Supabase Dashboard.
   - Create bucket `water-photos` and set Public to true.
   - Create bucket `submission-photos` and set Public to false.
5. Enable Realtime Replication:
   - Navigate to Database > Replication in the Supabase Dashboard.
   - Enable replication for `chat_messages`, `water_sources`, and `announcements`.

---

### Step 4: Create an Administrator Account

Public user registration and public admin registration are disabled by design. Follow these steps to create an authorized administrator:

1. Go to Supabase Dashboard > Authentication > Users.
2. Click Add User > Create User.
3. Enter an admin email address (for example: `admin@irowa.local`) and a secure password.
4. Copy the generated User UID.
5. Open the Supabase SQL Editor and execute:

```sql
INSERT INTO admin_profiles (auth_user_id, display_name, role, is_active)
VALUES (
  'PASTE-COPIED-USER-UID-HERE',
  'Municipal Administrator',
  'super_admin',
  true
);
```

You can now log in at `/admin/login` using these credentials.

---

### Step 5: Start the Development Server

Start the Next.js development server:

```powershell
npm run dev
```

The application will bind to `0.0.0.0:5000` and can be accessed from multiple environments:

- From your computer browser: `http://localhost:5000`
- From an Android Emulator (Google Pixel / AVD): `http://10.0.2.2:5000`
- From mobile devices on the same Wi-Fi network: `http://<your-computer-ip>:5000`

---

### Step 6: Testing and Code Quality Verification

Run the automated test suite to ensure all unit and integration validations pass:

```powershell
# Run Vitest unit and integration test suite
npm test

# Run Vitest in watch mode during development
npm run test:watch

# Run Playwright end-to-end tests
npm run test:e2e
```

---

### Step 7: Build and Production Deployment

To test the production build locally:

```powershell
# Create production build and run strict TypeScript checks
npm run build

# Start the compiled production server
npm run start
```

Deploying to Vercel:

1. Push your repository to GitHub or GitLab.
2. Log in to Vercel and click Add New > Project.
3. Select the `irowa` repository.
4. Under Environment Variables, copy and paste all keys from your `.env.local` file.
5. Click Deploy.

---

## Application Structure and Features

### 1. Interactive GIS Map
- Default layer: High-resolution satellite imagery (Esri World Imagery).
- Supported layers: Satellite, Street (OpenStreetMap), and Terrain (OpenTopoMap).
- Smooth deep-zoom: Configured with `maxNativeZoom: 17` to prevent white or blank tiles when zooming into rural areas.
- Single-screen fit: The layout dynamically adjusts to fit the viewport height (`100dvh`) without window scrollbars, adapting automatically to the presence or absence of the municipal announcement banner.

### 2. In-App Navigation and Directions
- Directly calculates routes on the map without redirecting out of the application.
- Includes turn-by-turn directions, total distance, and estimated travel time.
- Off-road mountain connector: Automatically extends routes across fields and mountain terrain directly into water source pins, rendering an emerald green dashed trail for hiking sections.

### 3. Public Visitor Experience
- Zero-friction onboarding: Visitors can search, view details, bookmark water sources, and join discussions without password registration.
- Display names and anonymous visitor IDs are stored locally in the browser (`localStorage`).

### 4. Per-Resource Real-Time Group Chat
- Every verified water point has its own isolated chat room (`/chat/[waterId]`).
- Live message delivery powered by Supabase Realtime channels.
- Integrated rate limiting and automated moderation filters.

### 5. Community Submissions and Reporting
- `/submit-water`: Citizens can propose new water sources by clicking on the map, entering details, and uploading photos.
- `/report/[waterId]`: Citizens can report dried springs, contaminated water, or broken pumps.
- All submissions and reports enter an administrative moderation queue before public display.

### 6. Admin Control Center
- Accessible at `/admin/login`.
- Role-based access control validated through `admin_profiles` table (`super_admin`, `water_admin`, `moderator`).
- Administrative tools: Resource editor, submission approval, report resolution, chat moderation, announcement broadcaster, audit logs, and analytics.

---

## Common Troubleshooting

### Issue: Android Emulator cannot open `http://localhost:5000`
Inside an Android emulator, `localhost` refers to the emulator itself. Use `http://10.0.2.2:5000`, which routes directly to your host computer.

### Issue: Port 5000 shows an error or conflict
If port 5000 is occupied by another service, check listening ports in PowerShell using:
```powershell
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 5000 }
```
Terminate the conflicting process and restart `npm run dev`.

### Issue: Deep zoom causes white tiles on the map
Rural areas often do not have native tile imagery beyond zoom level 17. The map includes `maxNativeZoom: 17` on satellite layers to ensure tiles are upscaled cleanly rather than requesting missing tiles.

---

## License

Developed for the Municipality of Irosin, Sorsogon community. Distributed under the MIT License.
#   i r o w a  
 