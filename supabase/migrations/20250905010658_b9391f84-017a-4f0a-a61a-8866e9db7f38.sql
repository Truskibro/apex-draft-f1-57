-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view league members for leagues they belong to" ON public.league_members;
DROP POLICY IF EXISTS "League owners can insert members" ON public.league_members;
DROP POLICY IF EXISTS "League owners can update members" ON public.league_members;
DROP POLICY IF EXISTS "League owners can remove members" ON public.league_members;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.user_can_view_league(league_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.leagues 
    WHERE id = league_id AND (
      visibility = 'public' OR 
      owner_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_is_league_owner(league_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.leagues 
    WHERE id = league_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create new policies using the security definer functions
CREATE POLICY "Users can view league members for accessible leagues" 
ON public.league_members 
FOR SELECT 
USING (public.user_can_view_league(league_id));

CREATE POLICY "League owners can insert members" 
ON public.league_members 
FOR INSERT 
WITH CHECK (public.user_is_league_owner(league_id));

CREATE POLICY "League owners can update members" 
ON public.league_members 
FOR UPDATE 
USING (public.user_is_league_owner(league_id));

CREATE POLICY "League owners can remove members" 
ON public.league_members 
FOR DELETE 
USING (public.user_is_league_owner(league_id));