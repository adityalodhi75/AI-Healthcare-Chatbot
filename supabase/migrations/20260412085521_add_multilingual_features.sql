/*
  # Add Multilingual Support and Alert System

  1. New Tables
    - `health_alerts`
      - `id` (uuid, primary key)
      - `disease_name` (text)
      - `alert_message` (text)
      - `severity` (text: low, medium, high, critical)
      - `regions_affected` (text array)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `language_support`
      - `id` (uuid, primary key)
      - `disease_id` (uuid, references diseases)
      - `language_code` (text: en, hi, es, fr, etc.)
      - `disease_name_translated` (text)
      - `advice_translated` (text)
      - `symptoms_translated` (text array)
      - `created_at` (timestamptz)

    - `epidemic_data`
      - `id` (uuid, primary key)
      - `disease_name` (text)
      - `region` (text)
      - `confirmed_cases` (integer)
      - `date_reported` (timestamptz)
      - `trend` (text: increasing, stable, decreasing)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Health alerts are public (community health info)
    - Epidemic data is public (awareness)
*/

CREATE TABLE IF NOT EXISTS health_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name text NOT NULL,
  alert_message text NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  regions_affected text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS language_support (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid REFERENCES diseases(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  disease_name_translated text,
  advice_translated text,
  symptoms_translated text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS epidemic_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name text NOT NULL,
  region text NOT NULL,
  confirmed_cases integer DEFAULT 0,
  date_reported timestamptz DEFAULT now(),
  trend text CHECK (trend IN ('increasing', 'stable', 'decreasing')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE epidemic_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view health alerts"
  ON health_alerts FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can view language support"
  ON language_support FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view epidemic data"
  ON epidemic_data FOR SELECT
  TO anon, authenticated
  USING (true);
