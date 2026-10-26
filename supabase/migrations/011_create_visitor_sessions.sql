-- 011_create_visitor_sessions.sql
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  is_restricted BOOLEAN NOT NULL DEFAULT false,
  restriction_reason TEXT,
  restricted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
