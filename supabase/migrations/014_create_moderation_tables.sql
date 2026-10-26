-- 014_create_moderation_tables.sql
CREATE TABLE IF NOT EXISTS public.application_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER set_application_settings_updated_at
BEFORE UPDATE ON public.application_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.chat_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  moderator_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('hide', 'restore', 'delete', 'flag')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
