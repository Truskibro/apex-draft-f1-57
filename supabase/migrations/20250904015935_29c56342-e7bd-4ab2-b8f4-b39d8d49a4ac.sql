-- Create race status enum
CREATE TYPE race_status AS ENUM ('upcoming', 'live', 'completed');

-- Create races table
CREATE TABLE public.races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  country_flag TEXT NOT NULL,
  race_date TIMESTAMP WITH TIME ZONE NOT NULL,
  race_time TEXT NOT NULL,
  status race_status NOT NULL DEFAULT 'upcoming',
  current_lap TEXT,
  total_laps INTEGER,
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  number INTEGER NOT NULL UNIQUE,
  country TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  team_name TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user predictions table
CREATE TABLE public.user_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  race_id UUID NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
  predicted_winner UUID REFERENCES public.drivers(id),
  predicted_podium UUID[] DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, race_id)
);

-- Create user standings table (calculated view)
CREATE TABLE public.user_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  rank INTEGER,
  previous_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_standings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Races are viewable by everyone
CREATE POLICY "Races are viewable by everyone" 
ON public.races FOR SELECT USING (true);

-- Teams are viewable by everyone
CREATE POLICY "Teams are viewable by everyone" 
ON public.teams FOR SELECT USING (true);

-- Drivers are viewable by everyone
CREATE POLICY "Drivers are viewable by everyone" 
ON public.drivers FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User predictions policies
CREATE POLICY "Users can view their own predictions" 
ON public.user_predictions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own predictions" 
ON public.user_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions" 
ON public.user_predictions FOR UPDATE USING (auth.uid() = user_id);

-- User standings are viewable by everyone
CREATE POLICY "Standings are viewable by everyone" 
ON public.user_standings FOR SELECT USING (true);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_races_updated_at BEFORE UPDATE ON public.races FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_predictions_updated_at BEFORE UPDATE ON public.user_predictions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_standings_updated_at BEFORE UPDATE ON public.user_standings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
-- Insert teams
INSERT INTO public.teams (name, color) VALUES
('Red Bull Racing', '#1E3A8A'),
('Ferrari', '#DC2626'),
('Mercedes', '#06B6D4'),
('McLaren', '#F97316'),
('Aston Martin', '#22C55E'),
('Alpine', '#EC4899'),
('Williams', '#3B82F6'),
('RB', '#6366F1'),
('Kick Sauber', '#10B981'),
('Haas', '#EF4444');

-- Insert drivers
INSERT INTO public.drivers (name, team_id, number, country) VALUES
('Max Verstappen', (SELECT id FROM public.teams WHERE name = 'Red Bull Racing'), 1, 'Netherlands'),
('Sergio Pérez', (SELECT id FROM public.teams WHERE name = 'Red Bull Racing'), 11, 'Mexico'),
('Charles Leclerc', (SELECT id FROM public.teams WHERE name = 'Ferrari'), 16, 'Monaco'),
('Carlos Sainz', (SELECT id FROM public.teams WHERE name = 'Ferrari'), 55, 'Spain'),
('Lewis Hamilton', (SELECT id FROM public.teams WHERE name = 'Mercedes'), 44, 'United Kingdom'),
('George Russell', (SELECT id FROM public.teams WHERE name = 'Mercedes'), 63, 'United Kingdom'),
('Lando Norris', (SELECT id FROM public.teams WHERE name = 'McLaren'), 4, 'United Kingdom'),
('Oscar Piastri', (SELECT id FROM public.teams WHERE name = 'McLaren'), 81, 'Australia'),
('Fernando Alonso', (SELECT id FROM public.teams WHERE name = 'Aston Martin'), 14, 'Spain'),
('Lance Stroll', (SELECT id FROM public.teams WHERE name = 'Aston Martin'), 18, 'Canada');

-- Insert sample races
INSERT INTO public.races (name, location, country_flag, race_date, race_time, status, winner) VALUES
('Saudi Arabian Grand Prix', 'Jeddah', '🇸🇦', '2024-03-17 15:00:00+00', '18:00 GMT', 'completed', 'Max Verstappen'),
('Australian Grand Prix', 'Melbourne', '🇦🇺', '2024-03-24 02:00:00+00', '05:00 GMT', 'completed', 'Carlos Sainz'),
('Japanese Grand Prix', 'Suzuka', '🇯🇵', '2024-04-07 02:00:00+00', '05:00 GMT', 'live', NULL),
('Chinese Grand Prix', 'Shanghai', '🇨🇳', '2024-04-21 04:00:00+00', '07:00 GMT', 'upcoming', NULL),
('Miami Grand Prix', 'Miami Gardens', '🇺🇸', '2024-05-05 16:30:00+00', '19:30 GMT', 'upcoming', NULL),
('Emilia Romagna Grand Prix', 'Imola', '🇮🇹', '2024-05-19 10:00:00+00', '13:00 GMT', 'upcoming', NULL);

-- Update current live race
UPDATE public.races 
SET current_lap = '42', total_laps = 53 
WHERE name = 'Japanese Grand Prix' AND status = 'live';