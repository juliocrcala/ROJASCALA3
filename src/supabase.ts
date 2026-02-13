import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzqwatrhficgrioidxnw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6cXdhdHJoZmljZ3Jpb2lkeG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDE0MjMsImV4cCI6MjA4MTQxNzQyM30.4Kr3t_fHTbwjbNG-bYCmU87mlKa35LSomIy-XOruEgY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);