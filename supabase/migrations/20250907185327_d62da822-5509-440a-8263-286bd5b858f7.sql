-- Add columns to races table to store complete podium results
ALTER TABLE public.races 
ADD COLUMN IF NOT EXISTS second_place text,
ADD COLUMN IF NOT EXISTS third_place text,
ADD COLUMN IF NOT EXISTS fastest_lap_driver text;

-- Update the Italian Grand Prix with complete podium results
UPDATE public.races 
SET 
  winner = 'Max Verstappen',
  second_place = 'Lando Norris', 
  third_place = 'Charles Leclerc',
  fastest_lap_driver = 'Max Verstappen'
WHERE name = 'Italian Grand Prix';

-- Updated function to award points for ALL correct predictions
CREATE OR REPLACE FUNCTION public.calculate_prediction_points(prediction_id uuid, race_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_points integer := 0;
  prediction_record record;
  race_record record;
  predicted_driver_name text;
  podium_driver_name text;
  driver_names text[] := ARRAY[]::text[];
  i integer;
BEGIN
  -- Get the prediction details
  SELECT * INTO prediction_record 
  FROM user_predictions 
  WHERE id = prediction_id;
  
  -- Get the race results (only when completed)
  SELECT * INTO race_record 
  FROM races 
  WHERE id = race_id AND status = 'completed' AND winner IS NOT NULL;
  
  -- If race not completed yet or no winner set, return 0
  IF race_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Award 25 points for correct winner prediction
  IF prediction_record.predicted_winner IS NOT NULL THEN
    SELECT name INTO predicted_driver_name
    FROM drivers 
    WHERE id = prediction_record.predicted_winner;
    
    IF predicted_driver_name = race_record.winner THEN
      total_points := total_points + 25;
      RAISE NOTICE 'Awarding 25 points for correct winner: %', predicted_driver_name;
    END IF;
  END IF;
  
  -- Award points for correct podium predictions (18, 15, 12 points for 2nd, 3rd, 4th)
  IF prediction_record.predicted_podium IS NOT NULL AND array_length(prediction_record.predicted_podium, 1) >= 3 THEN
    -- Convert predicted podium driver IDs to names
    FOR i IN 1..LEAST(array_length(prediction_record.predicted_podium, 1), 4) LOOP
      SELECT name INTO podium_driver_name
      FROM drivers 
      WHERE id = prediction_record.predicted_podium[i];
      
      driver_names := array_append(driver_names, podium_driver_name);
    END LOOP;
    
    -- Check 1st place (25 points) - already handled above
    
    -- Check 2nd place (18 points)
    IF array_length(driver_names, 1) >= 2 AND driver_names[2] = race_record.second_place THEN
      total_points := total_points + 18;
      RAISE NOTICE 'Awarding 18 points for correct 2nd place: %', driver_names[2];
    END IF;
    
    -- Check 3rd place (15 points)
    IF array_length(driver_names, 1) >= 3 AND driver_names[3] = race_record.third_place THEN
      total_points := total_points + 15;
      RAISE NOTICE 'Awarding 15 points for correct 3rd place: %', driver_names[3];
    END IF;
    
    -- Check 4th place (12 points) - if we have 4th place data
    -- For now, skip 4th place as we don't have that data
  END IF;
  
  -- Update the prediction with calculated points
  UPDATE user_predictions 
  SET points_earned = total_points 
  WHERE id = prediction_id;
  
  RAISE NOTICE 'Total points awarded for prediction %: %', prediction_id, total_points;
  
  RETURN total_points;
END;
$$;

-- Reset all points and recalculate with new system
UPDATE user_predictions SET points_earned = 0;
SELECT public.recalculate_all_prediction_points();