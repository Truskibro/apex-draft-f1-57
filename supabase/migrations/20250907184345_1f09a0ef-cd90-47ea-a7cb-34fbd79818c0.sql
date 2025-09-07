-- Enable the pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to automatically update driver points based on race results
CREATE OR REPLACE FUNCTION public.update_driver_championship_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  race_record record;
  driver_record record;
  points_awarded integer;
BEGIN
  -- Points system for F1 championship
  -- Only award points for completed races where we have a winner
  FOR race_record IN 
    SELECT id, name, winner 
    FROM races 
    WHERE status = 'completed' 
    AND winner IS NOT NULL
  LOOP
    -- Award 25 points to the race winner
    UPDATE drivers 
    SET championship_points = COALESCE(championship_points, 0) + 25
    WHERE name = race_record.winner;
    
    -- Log the update
    RAISE NOTICE 'Awarded 25 points to % for winning %', race_record.winner, race_record.name;
  END LOOP;
  
  -- Recalculate prediction points for all users after driver points update
  PERFORM update_user_standings(user_id) 
  FROM user_standings;
  
  RAISE NOTICE 'Driver championship points update completed';
END;
$$;

-- Create a function to trigger driver points update via HTTP
CREATE OR REPLACE FUNCTION public.trigger_driver_points_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the edge function to update driver points
  PERFORM net.http_post(
    url := 'https://klpuiqqyfemqzljqttnq.supabase.co/functions/v1/update-driver-points',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHVpcXF5ZmVtcXpsanF0dG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDU0NDcsImV4cCI6MjA3MjUyMTQ0N30.69OXOIAsCvhS4rgJibGmlk9ipk-PesDJy9WLg5qwe6o"}'::jsonb,
    body := '{"trigger": "automatic"}'::jsonb
  );
END;
$$;

-- Schedule the driver points update to run daily at 6 AM UTC
SELECT cron.schedule(
  'update-driver-points-daily',
  '0 6 * * *', -- Daily at 6 AM UTC
  $$
  SELECT public.trigger_driver_points_update();
  $$
);