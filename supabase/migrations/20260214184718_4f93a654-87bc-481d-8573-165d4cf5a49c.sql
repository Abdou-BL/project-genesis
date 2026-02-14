
-- Drop existing SELECT policies for terminology_terms, meetings, courses
DROP POLICY IF EXISTS "Terms are viewable by everyone" ON public.terminology_terms;
DROP POLICY IF EXISTS "Meetings are viewable by authenticated" ON public.meetings;
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;

-- Create a security definer function to get a user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Terminology: users see only their org's terms, admins see all
CREATE POLICY "Users see own org terms, admins see all"
ON public.terminology_terms
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR organization_id = get_user_organization_id(auth.uid())
);

-- Meetings: users see only their org's meetings, admins see all
CREATE POLICY "Users see own org meetings, admins see all"
ON public.meetings
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR organization_id = get_user_organization_id(auth.uid())
);

-- Courses: users see only their org's courses, admins see all
CREATE POLICY "Users see own org courses, admins see all"
ON public.courses
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR organization_id = get_user_organization_id(auth.uid())
);
