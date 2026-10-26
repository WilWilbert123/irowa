-- 016_enable_rls_policies.sql

-- Helper function to check if current user is an active administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. admin_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin profiles"
  ON public.admin_profiles FOR SELECT
  USING (auth.uid() = auth_user_id OR public.is_admin());

CREATE POLICY "Admins can update own profile"
  ON public.admin_profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- 2. water_sources
ALTER TABLE public.water_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published active water sources"
  ON public.water_sources FOR SELECT
  USING ((is_published = true AND archived_at IS NULL) OR public.is_admin());

CREATE POLICY "Admins can insert water sources"
  ON public.water_sources FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update water sources"
  ON public.water_sources FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete water sources"
  ON public.water_sources FOR DELETE
  USING (public.is_admin());

-- 3. water_photos
ALTER TABLE public.water_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view photos of published sources"
  ON public.water_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.water_sources ws
      WHERE ws.id = water_photos.water_source_id
        AND ws.is_published = true
        AND ws.archived_at IS NULL
    ) OR public.is_admin()
  );

CREATE POLICY "Admins can manage water photos"
  ON public.water_photos FOR ALL
  USING (public.is_admin());

-- 4. water_submissions
ALTER TABLE public.water_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert pending submissions"
  ON public.water_submissions FOR INSERT
  WITH CHECK (status = 'pending');

CREATE POLICY "Admins can view all submissions"
  ON public.water_submissions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update submissions"
  ON public.water_submissions FOR UPDATE
  USING (public.is_admin());

-- 5. submission_photos
ALTER TABLE public.submission_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can upload submission photos"
  ON public.submission_photos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view submission photos"
  ON public.submission_photos FOR SELECT
  USING (public.is_admin());

-- 6. chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage chat rooms"
  ON public.chat_rooms FOR ALL
  USING (public.is_admin());

-- 7. chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published chat messages"
  ON public.chat_messages FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Public can insert chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (status = 'published' AND length(message) <= 1000);

CREATE POLICY "Admins can moderate chat messages"
  ON public.chat_messages FOR UPDATE
  USING (public.is_admin());

-- 8. notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view announcements or own notifications"
  ON public.notifications FOR SELECT
  USING (visitor_id IS NULL OR true);

CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  USING (public.is_admin());

-- 9. push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (true);

-- 10. saved_water_sources
ALTER TABLE public.saved_water_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage own saved water sources"
  ON public.saved_water_sources FOR ALL
  USING (true);

-- 11. water_reports
ALTER TABLE public.water_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit water reports"
  ON public.water_reports FOR INSERT
  WITH CHECK (status = 'pending');

CREATE POLICY "Admins can view and manage reports"
  ON public.water_reports FOR ALL
  USING (public.is_admin());

-- 12. visitor_sessions
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage own visitor session"
  ON public.visitor_sessions FOR ALL
  USING (true);

-- 13. announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active published announcements"
  ON public.announcements FOR SELECT
  USING (
    (status = 'published' AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now())))
    OR public.is_admin()
  );

CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (public.is_admin());

-- 14. audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can create audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin());

-- 15. application_settings
ALTER TABLE public.application_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view application settings"
  ON public.application_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage application settings"
  ON public.application_settings FOR ALL
  USING (public.is_admin());

-- Enable Realtime for selected tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.water_sources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
