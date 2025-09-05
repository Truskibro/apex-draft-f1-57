-- Create leagues table
CREATE TABLE public.leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')) DEFAULT 'public',
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create league_members table
CREATE TABLE public.league_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(league_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

-- Create policies for leagues
CREATE POLICY "Users can view public leagues and their own leagues" 
ON public.leagues 
FOR SELECT 
USING (
  visibility = 'public' OR 
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.league_members 
    WHERE league_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own leagues" 
ON public.leagues 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "League owners can update their leagues" 
ON public.leagues 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "League owners can delete their leagues" 
ON public.leagues 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Create policies for league_members
CREATE POLICY "Users can view league members for leagues they belong to" 
ON public.league_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.leagues 
    WHERE id = league_id AND (
      visibility = 'public' OR 
      owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.league_members lm 
        WHERE lm.league_id = league_id AND lm.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "League owners can insert members" 
ON public.league_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leagues 
    WHERE id = league_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "League owners can update members" 
ON public.league_members 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.leagues 
    WHERE id = league_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "League owners can remove members" 
ON public.league_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.leagues 
    WHERE id = league_id AND owner_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leagues_updated_at
BEFORE UPDATE ON public.leagues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();