
-- Create chapters table for courses
CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pdf_url TEXT,
  link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Chapters inherit course access: if user can see the course, they can see its chapters
CREATE POLICY "Users can view chapters of accessible courses"
ON public.chapters
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = chapters.course_id
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR c.organization_id = get_user_organization_id(auth.uid())
    )
  )
);

CREATE POLICY "Admins and course creators can insert chapters"
ON public.chapters
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = chapters.course_id
    AND (has_role(auth.uid(), 'admin'::app_role) OR c.created_by = auth.uid())
  )
);

CREATE POLICY "Admins and course creators can update chapters"
ON public.chapters
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = chapters.course_id
    AND (has_role(auth.uid(), 'admin'::app_role) OR c.created_by = auth.uid())
  )
);

CREATE POLICY "Admins and course creators can delete chapters"
ON public.chapters
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = chapters.course_id
    AND (has_role(auth.uid(), 'admin'::app_role) OR c.created_by = auth.uid())
  )
);

-- Create storage bucket for course PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('course-pdfs', 'course-pdfs', true);

-- Storage policies for course PDFs
CREATE POLICY "Course PDFs are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-pdfs');

CREATE POLICY "Authenticated users can upload course PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-pdfs');

CREATE POLICY "Authenticated users can delete course PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-pdfs');
