-- 006_create_chat_messages.sql
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'flagged', 'deleted')),
  moderation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER set_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
