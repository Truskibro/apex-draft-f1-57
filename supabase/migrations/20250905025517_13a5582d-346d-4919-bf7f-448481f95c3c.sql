-- Add policy to allow users to join leagues themselves
CREATE POLICY "Users can join leagues themselves" 
ON public.league_members 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);