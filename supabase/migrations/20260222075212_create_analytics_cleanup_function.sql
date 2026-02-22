/*
  # Automatic Analytics Cleanup System

  1. New Function
    - `cleanup_old_page_views()` - Deletes page_views older than 45 days
    - Keeps analytics_summary forever (compact data)
    - Runs automatically via pg_cron extension

  2. Scheduled Job
    - Executes daily at 3:00 AM
    - Keeps detailed views for last 45 days only
    - Preserves daily summaries indefinitely

  3. Security
    - Function runs with SECURITY DEFINER (admin privileges)
    - Scheduled job runs automatically
*/

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to cleanup old page views
CREATE OR REPLACE FUNCTION cleanup_old_page_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM page_views
  WHERE viewed_at < NOW() - INTERVAL '45 days';
END;
$$;

-- Schedule the cleanup to run daily at 3:00 AM
SELECT cron.schedule(
  'cleanup-old-analytics',
  '0 3 * * *',
  'SELECT cleanup_old_page_views();'
);

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION cleanup_old_page_views() TO service_role;
