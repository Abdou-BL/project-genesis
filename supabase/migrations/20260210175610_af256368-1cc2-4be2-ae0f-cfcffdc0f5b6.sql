
-- Create terminology_terms table
CREATE TABLE public.terminology_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fr TEXT NOT NULL,
  en TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  context TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.terminology_terms ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view terms
CREATE POLICY "Authenticated users can view terms"
ON public.terminology_terms FOR SELECT
TO authenticated
USING (true);

-- Administrative and admin can insert terms
CREATE POLICY "Administrative can insert terms"
ON public.terminology_terms FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'administrative'::app_role)
);

-- Administrative and admin can update terms
CREATE POLICY "Administrative can update terms"
ON public.terminology_terms FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'administrative'::app_role)
);

-- Administrative and admin can delete terms
CREATE POLICY "Administrative can delete terms"
ON public.terminology_terms FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'administrative'::app_role)
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'Beginner',
  duration TEXT NOT NULL DEFAULT '',
  modules INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view courses
CREATE POLICY "Authenticated users can view courses"
ON public.courses FOR SELECT
TO authenticated
USING (true);

-- Administrative and admin can insert courses
CREATE POLICY "Administrative can insert courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'administrative'::app_role)
);

-- Administrative and admin can update courses
CREATE POLICY "Administrative can update courses"
ON public.courses FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'administrative'::app_role)
);

-- Administrative and admin can delete courses
CREATE POLICY "Administrative can delete courses"
ON public.courses FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'administrative'::app_role)
);
