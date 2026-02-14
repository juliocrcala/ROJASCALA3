/*
  # Create Analytics Summary Table

  1. Purpose
    - Store daily analytics summaries for historical reporting
    - Support the "Generar Reporte" button in the admin panel
    - Provide aggregated data for quick access to historical stats

  2. New Table
    - `analytics_summary`
      - `id` (uuid, primary key)
      - `date` (date, unique) - The date for this summary
      - `total_views` (integer) - Total page views for the day
      - `unique_visitors` (integer) - Unique visitors for the day
      - `top_pages` (jsonb) - Array of top pages with their view counts
      - `created_at` (timestamptz) - When this summary was generated
      - `updated_at` (timestamptz) - Last update timestamp

  3. Security
    - Enable RLS on analytics_summary table
    - Allow anon and authenticated to read all summaries
    - Allow anon and authenticated to insert new summaries (for report generation)
    - Allow anon and authenticated to update summaries
    
  4. Grants
    - Grant ALL privileges to anon and authenticated roles
*/

-- Create analytics_summary table
CREATE TABLE IF NOT EXISTS analytics_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  total_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  top_pages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all operations on analytics_summary"
  ON analytics_summary
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON analytics_summary TO anon, authenticated;

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(date DESC);

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';