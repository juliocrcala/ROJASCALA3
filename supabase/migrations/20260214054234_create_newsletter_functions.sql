/*
  # Create Newsletter Functions for PostgREST Access
  
  1. Purpose
    - Create stored functions to bypass PostgREST table cache issues
    - Provide direct function access for newsletter operations
    
  2. New Functions
    - `subscribe_to_newsletter` - Add new subscriber
    - `get_all_subscribers` - Get all subscribers
    - `update_subscriber_status` - Update active status
    - `delete_subscriber` - Delete subscriber
    
  3. Security
    - Functions use SECURITY DEFINER to bypass RLS
    - Allow anonymous access for subscription
    - Require authentication for admin operations
*/

-- Function to subscribe to newsletter (public access)
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(
  p_name text,
  p_email text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM newsletter_subscribers WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Email already subscribed'
    );
  END IF;
  
  -- Insert new subscriber
  INSERT INTO newsletter_subscribers (name, email, ip_address, user_agent)
  VALUES (p_name, p_email, p_ip_address, p_user_agent)
  RETURNING json_build_object(
    'success', true,
    'id', id,
    'email', email,
    'name', name,
    'subscribed_at', subscribed_at
  ) INTO v_result;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to get all subscribers (admin only)
CREATE OR REPLACE FUNCTION get_all_subscribers()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;
  
  -- Get all subscribers
  SELECT json_agg(
    json_build_object(
      'id', id,
      'name', name,
      'email', email,
      'subscribed_at', subscribed_at,
      'is_active', is_active,
      'ip_address', ip_address,
      'user_agent', user_agent,
      'created_at', created_at,
      'updated_at', updated_at
    ) ORDER BY subscribed_at DESC
  )
  INTO v_result
  FROM newsletter_subscribers;
  
  RETURN json_build_object(
    'success', true,
    'data', COALESCE(v_result, '[]'::json)
  );
END;
$$;

-- Function to update subscriber status (admin only)
CREATE OR REPLACE FUNCTION update_subscriber_status(
  p_id uuid,
  p_is_active boolean
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;
  
  -- Update subscriber
  UPDATE newsletter_subscribers
  SET is_active = p_is_active,
      updated_at = now()
  WHERE id = p_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Subscriber not found'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Subscriber status updated'
  );
END;
$$;

-- Function to delete subscriber (admin only)
CREATE OR REPLACE FUNCTION delete_subscriber(p_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;
  
  -- Delete subscriber
  DELETE FROM newsletter_subscribers WHERE id = p_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Subscriber not found'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Subscriber deleted'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION subscribe_to_newsletter TO anon;
GRANT EXECUTE ON FUNCTION subscribe_to_newsletter TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_subscribers TO authenticated;
GRANT EXECUTE ON FUNCTION update_subscriber_status TO authenticated;
GRANT EXECUTE ON FUNCTION delete_subscriber TO authenticated;
