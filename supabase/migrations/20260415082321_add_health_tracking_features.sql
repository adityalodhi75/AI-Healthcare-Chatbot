/*
  # Add Comprehensive Health Tracking Features

  1. New Tables
    - `daily_health_metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date)
      - `steps` (integer)
      - `heart_rate` (integer)
      - `sleep_hours` (decimal)
      - `calories_burned` (integer)
      - `water_intake` (integer in ml)
      - `exercise_minutes` (integer)
      - `mood` (text: great, good, ok, bad)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `nutrition_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `meal_type` (text: breakfast, lunch, dinner, snack)
      - `food_items` (text array)
      - `calories` (integer)
      - `protein` (decimal)
      - `carbs` (decimal)
      - `fat` (decimal)
      - `logged_at` (timestamptz)
      - `created_at` (timestamptz)

    - `wellness_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `goal_type` (text: steps, weight, sleep, water, exercise)
      - `target_value` (integer)
      - `current_value` (integer)
      - `unit` (text: steps, kg, hours, ml, minutes)
      - `start_date` (date)
      - `end_date` (date)
      - `progress_percentage` (integer 0-100)
      - `status` (text: active, completed, paused)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `health_recommendations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `recommendation_type` (text: diet, exercise, sleep, stress)
      - `description` (text)
      - `priority` (text: high, medium, low)
      - `is_read` (boolean)
      - `created_at` (timestamptz)

    - `symptom_tracker`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `symptom` (text)
      - `severity` (integer 1-10)
      - `duration_hours` (integer)
      - `triggered_by` (text)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

CREATE TABLE IF NOT EXISTS daily_health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  steps integer DEFAULT 0,
  heart_rate integer,
  sleep_hours decimal,
  calories_burned integer DEFAULT 0,
  water_intake integer DEFAULT 0,
  exercise_minutes integer DEFAULT 0,
  mood text CHECK (mood IN ('great', 'good', 'ok', 'bad')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items text[] DEFAULT ARRAY[]::text[],
  calories integer DEFAULT 0,
  protein decimal DEFAULT 0,
  carbs decimal DEFAULT 0,
  fat decimal DEFAULT 0,
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wellness_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('steps', 'weight', 'sleep', 'water', 'exercise')),
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  unit text NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('diet', 'exercise', 'sleep', 'stress')),
  description text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS symptom_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom text NOT NULL,
  severity integer NOT NULL CHECK (severity >= 1 AND severity <= 10),
  duration_hours integer,
  triggered_by text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own health metrics"
  ON daily_health_metrics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own nutrition logs"
  ON nutrition_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own wellness goals"
  ON wellness_goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own recommendations"
  ON health_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own symptom tracking"
  ON symptom_tracker FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_daily_metrics_user_date ON daily_health_metrics(user_id, date);
CREATE INDEX idx_nutrition_user_date ON nutrition_logs(user_id, logged_at);
CREATE INDEX idx_goals_user_status ON wellness_goals(user_id, status);
CREATE INDEX idx_recommendations_user ON health_recommendations(user_id);
CREATE INDEX idx_symptoms_user_date ON symptom_tracker(user_id, created_at);
