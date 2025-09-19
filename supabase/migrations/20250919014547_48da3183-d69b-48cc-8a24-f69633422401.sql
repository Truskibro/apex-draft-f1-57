-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule race results fetching every 6 hours
SELECT cron.schedule(
  'fetch-race-results-every-6-hours',
  '0 */6 * * *', -- Every 6 hours at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://klpuiqqyfemqzljqttnq.supabase.co/functions/v1/fetch-race-results',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHVpcXF5ZmVtcXpsanF0dG5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk0NTQ0NywiZXhwIjoyMDcyNTIxNDQ3fQ.0VPQcbhCJcQs_CRNFLhNprnfH9P01Eu0n-Q6zf0jK8A"}'::jsonb,
        body:='{"trigger": "automatic_cron"}'::jsonb
    ) as request_id;
  $$
);

-- Schedule driver points update every 8 hours (offset from race results)
SELECT cron.schedule(
  'update-driver-points-every-8-hours',
  '30 */8 * * *', -- Every 8 hours at minute 30
  $$
  SELECT
    net.http_post(
        url:='https://klpuiqqyfemqzljqttnq.supabase.co/functions/v1/update-driver-points',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHVpcXF5ZmVtcXpsanF0dG5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk0NTQ0NywiZXhwIjoyMDcyNTIxNDQ3fQ.0VPQcbhCJcQs_CRNFLhNprnfH9P01Eu0n-Q6zf0jK8A"}'::jsonb,
        body:='{"trigger": "automatic_cron"}'::jsonb
    ) as request_id;
  $$
);

-- Create a manual trigger function for immediate updates
CREATE OR REPLACE FUNCTION public.trigger_race_updates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Trigger race results fetch
  PERFORM net.http_post(
    url := 'https://klpuiqqyfemqzljqttnq.supabase.co/functions/v1/fetch-race-results',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHVpcXF5ZmVtcXpsanF0dG5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk0NTQ0NywiZXhwIjoyMDcyNTIxNDQ3fQ.0VPQcbhCJcQs_CRNFLhNprnfH9P01Eu0n-Q6zf0jK8A"}'::jsonb,
    body := '{"trigger": "manual"}'::jsonb
  );
  
  -- Wait a moment then trigger points update
  PERFORM pg_sleep(5);
  
  PERFORM net.http_post(
    url := 'https://klpuiqqyfemqzljqttnq.supabase.co/functions/v1/update-driver-points',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHVpcXF5ZmVtcXpsanF0dG5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk0NTQ0NywiZXhwIjoyMDcyNTIxNDQ3fQ.0VPQcbhCJcQs_CRNFLhNprnfH9P01Eu0n-Q6zf0jK8A"}'::jsonb,
    body := '{"trigger": "manual"}'::jsonb
  );
END;
$function$;