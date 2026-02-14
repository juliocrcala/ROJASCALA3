/*
  # Force PostgREST Function Cache Reload
  
  1. Purpose
    - Force PostgREST to reload function definitions in API cache
    - Ensure functions are properly exposed to REST API
    
  2. Actions
    - Verify and regrant function execution permissions
    - Send reload signal to PostgREST
    - Add comments to trigger cache update
*/

-- Revoke and regrant to force permission refresh
REVOKE ALL ON FUNCTION subscribe_to_newsletter FROM anon, authenticated;
REVOKE ALL ON FUNCTION get_all_subscribers FROM anon, authenticated;
REVOKE ALL ON FUNCTION update_subscriber_status FROM anon, authenticated;
REVOKE ALL ON FUNCTION delete_subscriber FROM anon, authenticated;

-- Grant permissions
GRANT EXECUTE ON FUNCTION subscribe_to_newsletter TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_all_subscribers TO authenticated;
GRANT EXECUTE ON FUNCTION update_subscriber_status TO authenticated;
GRANT EXECUTE ON FUNCTION delete_subscriber TO authenticated;

-- Add comments to functions to trigger cache reload
COMMENT ON FUNCTION subscribe_to_newsletter IS 'Subscribe a new user to newsletter - Public access';
COMMENT ON FUNCTION get_all_subscribers IS 'Get all newsletter subscribers - Admin only';
COMMENT ON FUNCTION update_subscriber_status IS 'Update subscriber active status - Admin only';
COMMENT ON FUNCTION delete_subscriber IS 'Delete a subscriber - Admin only';

-- Send reload signal
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Force schema cache update by altering search path
ALTER DATABASE postgres SET search_path TO public;
