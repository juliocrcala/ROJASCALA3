import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyekcfjulzgvziqpyfod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZWtjZmp1bHpndnppcXB5Zm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NjkzNjQsImV4cCI6MjA2NjE0NTM2NH0.UVCqAK9eodnYaVxZyrrD6n7aU5x3cNC92ypaVgM0krQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);