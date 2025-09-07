-- Update Italian Grand Prix to completed status with winner
UPDATE public.races 
SET 
  status = 'completed',
  winner = 'Charles Leclerc',
  updated_at = NOW()
WHERE name = 'Italian Grand Prix' AND race_date::date = '2025-09-07';

-- Trigger point calculations for all predictions for this race
DO $$
DECLARE
  race_record RECORD;
  prediction_record RECORD;
BEGIN
  -- Get the Italian Grand Prix race
  SELECT id INTO race_record FROM public.races 
  WHERE name = 'Italian Grand Prix' AND race_date::date = '2025-09-07';
  
  -- Calculate points for all predictions for this race
  FOR prediction_record IN 
    SELECT id, user_id FROM public.user_predictions 
    WHERE race_id = race_record.id
  LOOP
    -- Calculate points for each prediction
    PERFORM public.calculate_prediction_points(prediction_record.id, race_record.id);
    
    -- Update user standings
    PERFORM public.update_user_standings(prediction_record.user_id);
  END LOOP;
END $$;