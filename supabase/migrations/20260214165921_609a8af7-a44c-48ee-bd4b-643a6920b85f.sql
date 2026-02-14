
-- Fix the notifications INSERT policy to be more restrictive
-- Only admins and the system (via service role) should insert notifications for users
DROP POLICY "Authenticated can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
