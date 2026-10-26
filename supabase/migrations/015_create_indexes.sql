-- 015_create_indexes.sql
CREATE INDEX IF NOT EXISTS idx_water_sources_published ON public.water_sources(is_published, archived_at);
CREATE INDEX IF NOT EXISTS idx_water_sources_category ON public.water_sources(category);
CREATE INDEX IF NOT EXISTS idx_water_sources_availability ON public.water_sources(availability_status);
CREATE INDEX IF NOT EXISTS idx_water_sources_coords ON public.water_sources(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_water_sources_slug ON public.water_sources(slug);

CREATE INDEX IF NOT EXISTS idx_water_photos_source_id ON public.water_photos(water_source_id);
CREATE INDEX IF NOT EXISTS idx_water_submissions_status ON public.water_submissions(status);
CREATE INDEX IF NOT EXISTS idx_water_submissions_visitor ON public.water_submissions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_submission_photos_sub_id ON public.submission_photos(submission_id);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_source_id ON public.chat_rooms(water_source_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages(chat_room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_visitor ON public.chat_messages(visitor_id);

CREATE INDEX IF NOT EXISTS idx_notifications_visitor_read ON public.notifications(visitor_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_subs_visitor ON public.push_subscriptions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_saved_water_visitor ON public.saved_water_sources(visitor_id);

CREATE INDEX IF NOT EXISTS idx_water_reports_status ON public.water_reports(status);
CREATE INDEX IF NOT EXISTS idx_water_reports_source ON public.water_reports(water_source_id);

CREATE INDEX IF NOT EXISTS idx_announcements_status_pub ON public.announcements(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
