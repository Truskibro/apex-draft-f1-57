-- Update points system: fastest lap and DNF both worth 10 points
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
  
  -- Check ALL position predictions (top 10 positions)
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
  
  -- Check fastest lap prediction (10 points)
  IF prediction_record.predicted_fastest_lap IS NOT NULL THEN
    SELECT name INTO predicted_driver_name
    FROM drivers 
    WHERE id = prediction_record.predicted_fastest_lap;
    
    IF predicted_driver_name = race_record.fastest_lap_driver THEN
      total_points := total_points + 10;
      RAISE NOTICE 'Awarding 10 points for correct fastest lap: %', predicted_driver_name;
    END IF;
  END IF;
  
  -- Check DNF prediction (10 points)
  IF prediction_record.predicted_dnf IS NOT NULL THEN
    SELECT name INTO predicted_driver_name
    FROM drivers 
    WHERE id = prediction_record.predicted_dnf;
    
    -- Check if predicted driver is in the DNF list
    IF predicted_driver_name = ANY(race_record.dnf_drivers) THEN
      total_points := total_points + 10;
      RAISE NOTICE 'Awarding 10 points for correct DNF prediction: %', predicted_driver_name;
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

-- Reset all points and recalculate with corrected system
UPDATE user_predictions SET points_earned = 0;
SELECT public.recalculate_all_prediction_points();