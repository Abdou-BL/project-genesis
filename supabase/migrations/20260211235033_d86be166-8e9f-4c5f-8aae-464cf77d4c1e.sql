
-- Create quiz_results table for storing user quiz history
CREATE TABLE public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_type TEXT NOT NULL, -- 'multiple_choice', 'fill_blank', 'match_terms'
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  questions JSONB NOT NULL, -- store the questions and user answers
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Users can only see their own quiz results
CREATE POLICY "Users can view their own quiz results"
ON public.quiz_results FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own quiz results
CREATE POLICY "Users can insert their own quiz results"
ON public.quiz_results FOR INSERT
WITH CHECK (auth.uid() = user_id);
