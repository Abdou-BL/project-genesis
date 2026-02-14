
-- 1. FIX SIGNUP: Attach the trigger for handle_new_user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Add organization_id to courses table for government segregation
ALTER TABLE public.courses ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 3. Add organization_id to terminology_terms for government segregation
ALTER TABLE public.terminology_terms ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 4. Create meetings table (currently hardcoded)
CREATE TABLE public.meetings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  meeting_date date NOT NULL,
  meeting_time time NOT NULL,
  participants integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming',
  link text DEFAULT '',
  created_by uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view meetings in their org"
ON public.meetings FOR SELECT
USING (
  organization_id IS NULL 
  OR organization_id IN (
    SELECT p.organization_id FROM public.profiles p WHERE p.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Administrative can insert meetings"
ON public.meetings FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'administrative'::app_role)
);

CREATE POLICY "Administrative can update meetings"
ON public.meetings FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'administrative'::app_role)
);

CREATE POLICY "Administrative can delete meetings"
ON public.meetings FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'administrative'::app_role)
);

-- 5. Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  link text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'administrative'::app_role)
  OR auth.uid() = user_id
);

-- 6. Update RLS on courses for org-based filtering
DROP POLICY IF EXISTS "Authenticated users can view courses" ON public.courses;
CREATE POLICY "Authenticated users can view courses in their org"
ON public.courses FOR SELECT
USING (
  organization_id IS NULL 
  OR organization_id IN (
    SELECT p.organization_id FROM public.profiles p WHERE p.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 7. Update RLS on terminology_terms for org-based filtering
DROP POLICY IF EXISTS "Authenticated users can view terms" ON public.terminology_terms;
CREATE POLICY "Authenticated users can view terms in their org"
ON public.terminology_terms FOR SELECT
USING (
  organization_id IS NULL 
  OR organization_id IN (
    SELECT p.organization_id FROM public.profiles p WHERE p.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 8. Function to notify all users in an org
CREATE OR REPLACE FUNCTION public.notify_org_users(
  _org_id uuid,
  _title text,
  _message text,
  _type text DEFAULT 'info',
  _link text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT p.user_id, _title, _message, _type, _link
  FROM public.profiles p
  WHERE p.organization_id = _org_id;
END;
$$;
