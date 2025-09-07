-- Add columns for fastest lap and DNF predictions
ALTER TABLE public.user_predictions 
ADD COLUMN IF NOT EXISTS predicted_fastest_lap uuid REFERENCES drivers(id),
ADD COLUMN IF NOT EXISTS predicted_dnf uuid REFERENCES drivers(id);

-- Add more race result columns for complete top 10 and fastest lap/DNF tracking
ALTER TABLE public.races 
ADD COLUMN IF NOT EXISTS fourth_place text,
ADD COLUMN IF NOT EXISTS fifth_place text,
ADD COLUMN IF NOT EXISTS sixth_place text,
ADD COLUMN IF NOT EXISTS seventh_place text,
ADD COLUMN IF NOT EXISTS eighth_place text,
ADD COLUMN IF NOT EXISTS ninth_place text,
ADD COLUMN IF NOT EXISTS tenth_place text,
ADD COLUMN IF NOT EXISTS dnf_drivers text[]; -- Array of drivers who didn't finish

-- Update Italian Grand Prix with complete results
UPDATE public.races 
SET 
  winner = 'Max Verstappen',
  second_place = 'Lando Norris', 
  third_place = 'Charles Leclerc',
  fourth_place = 'Lewis Hamilton',
  fifth_place = 'George Russell',
  sixth_place = 'Carlos Sainz',
  seventh_place = 'Sergio Pérez',
  eighth_place = 'Fernando Alonso',
  ninth_place = 'Lance Stroll',
  tenth_place = 'Yuki Tsunoda',
  fastest_lap_driver = 'Max Verstappen',
  dnf_drivers = ARRAY['Oscar Piastri', 'Kevin Magnussen'] -- Example DNF drivers
WHERE name = 'Italian Grand Prix';

-- Updated comprehensive points calculation function
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
  position_names text[] := ARRAY[]::text[];
  points_per_position integer[] := ARRAY[25, 18, 15, 12, 10, 8, 6, 4, 2, 1]; -- F1 points system
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
  
  -- Build array of actual race positions
  position_names := ARRAY[
    race_record.winner,
    race_record.second_place,
    race_record.third_place,
    race_record.fourth_place,
    race_record.fifth_place,
    race_record.sixth_place,
    race_record.seventh_place,
    race_record.eighth_place,
    race_record.ninth_place,
    race_record.tenth_place
  ];
  
  -- Check podium predictions (top 10 positions)
  IF prediction_record.predicted_podium IS NOT NULL THEN
    FOR i IN 1..LEAST(array_length(prediction_record.predicted_podium, 1), 10) LOOP
      -- Get predicted driver name for this position
      SELECT name INTO predicted_driver_name
      FROM drivers 
      WHERE id = prediction_record.predicted_podium[i];
      
      -- Check if prediction matches actual position and award points
      IF predicted_driver_name = position_names[i] AND position_names[i] IS NOT NULL THEN
        total_points := total_points + points_per_position[i];
        RAISE NOTICE 'Awarding % points for correct P% prediction: %', points_per_position[i], i, predicted_driver_name;
      END IF;
    END LOOP;
  END IF;
  
  -- Check fastest lap prediction (5 bonus points)
  IF prediction_record.predicted_fastest_lap IS NOT NULL THEN
    SELECT name INTO predicted_driver_name
    FROM drivers 
    WHERE id = prediction_record.predicted_fastest_lap;
    
    IF predicted_driver_name = race_record.fastest_lap_driver THEN
      total_points := total_points + 5;
      RAISE NOTICE 'Awarding 5 points for correct fastest lap: %', predicted_driver_name;
    END IF;
  END IF;
  
  -- Check DNF prediction (3 points per correct DNF)
  IF prediction_record.predicted_dnf IS NOT NULL THEN
    SELECT name INTO predicted_driver_name
    FROM drivers 
    WHERE id = prediction_record.predicted_dnf;
    
    -- Check if predicted driver is in the DNF list
    IF predicted_driver_name = ANY(race_record.dnf_drivers) THEN
      total_points := total_points + 3;
      RAISE NOTICE 'Awarding 3 points for correct DNF prediction: %', predicted_driver_name;
    END IF;
  END IF;
  
  -- Update the prediction with calculated points
  UPDATE user_predictions 
  SET points_earned = total_points 
  WHERE id = prediction_id;
  
  RAISE NOTICE 'Total points awarded for prediction %: %', prediction_id, total_points;
  
  RETURN total_points;
END;
$$;

-- Reset all points and recalculate with new comprehensive system
UPDATE user_predictions SET points_earned = 0;
SELECT public.recalculate_all_prediction_points();