-- Drop the restrictive SELECT policy and replace with one that allows all authenticated users to view standings
DROP POLICY IF EXISTS "Users can view standings for their leagues" ON public.user_standings;

CREATE POLICY "All authenticated users can view standings"
ON public.user_standings
FOR SELECT
USING (auth.role() = 'authenticated');
