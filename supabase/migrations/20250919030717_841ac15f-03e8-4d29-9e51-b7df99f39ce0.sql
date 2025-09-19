-- Replace single predicted_winner with multi-prediction approach by removing the column
ALTER TABLE public.user_predictions
  DROP CONSTRAINT IF EXISTS user_predictions_predicted_winner_fkey;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_predictions' AND column_name = 'predicted_winner'
  ) THEN
    ALTER TABLE public.user_predictions DROP COLUMN predicted_winner;
  END IF;
END $$;