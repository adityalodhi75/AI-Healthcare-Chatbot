/*
  # Add User Authentication and Profiles

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `age` (integer)
      - `gender` (text - enum: male, female, other)
      - `blood_type` (text)
      - `medical_conditions` (text array - pre-existing conditions)
      - `allergies` (text array)
      - `medications` (text array)
      - `emergency_contact` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `consultation_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `symptoms` (text)
      - `diagnosis` (text)
      - `severity_level` (text - enum: mild, moderate, severe, critical)
      - `recommended_action` (text)
      - `specialist_recommended` (text)
      - `follow_up_required` (boolean)
      - `notes` (text)
      - `created_at` (timestamptz)

    - `user_analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `total_consultations` (integer)
      - `most_common_symptom` (text)
      - `last_consultation_date` (timestamptz)
      - `health_score` (integer 0-100)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only view and edit their own data
    - Analytics are private to user
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  age integer,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  blood_type text,
  medical_conditions text[] DEFAULT ARRAY[]::text[],
  allergies text[] DEFAULT ARRAY[]::text[],
  medications text[] DEFAULT ARRAY[]::text[],
  emergency_contact text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms text NOT NULL,
  diagnosis text,
  severity_level text CHECK (severity_level IN ('mild', 'moderate', 'severe', 'critical')),
  recommended_action text,
  specialist_recommended text,
  follow_up_required boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_consultations integer DEFAULT 0,
  most_common_symptom text,
  last_consultation_date timestamptz,
  health_score integer DEFAULT 75 CHECK (health_score >= 0 AND health_score <= 100),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own consultations"
  ON consultation_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultations"
  ON consultation_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics"
  ON user_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON user_analytics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert analytics"
  ON user_analytics FOR INSERT
  WITH CHECK (true);