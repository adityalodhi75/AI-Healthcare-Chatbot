/*
  # Healthcare Chatbot Database Schema

  1. New Tables
    - `diseases`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Disease name
      - `symptoms` (text[]) - Array of symptoms
      - `advice` (text) - Medical advice
      - `is_critical` (boolean) - Whether disease requires immediate attention
      - `created_at` (timestamptz) - Record creation time
    
    - `chat_history`
      - `id` (uuid, primary key) - Unique identifier
      - `user_message` (text) - User's input message
      - `bot_response` (text) - Bot's response
      - `disease_matched` (text) - Matched disease name (if any)
      - `is_alert` (boolean) - Whether response was an alert
      - `created_at` (timestamptz) - Message timestamp

  2. Security
    - Enable RLS on all tables
    - Public read access for diseases (medical information)
    - Public insert and read for chat history (anonymous users can chat)
*/

CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  symptoms text[] NOT NULL,
  advice text NOT NULL,
  is_critical boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_message text NOT NULL,
  bot_response text NOT NULL,
  disease_matched text,
  is_alert boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read diseases"
  ON diseases FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert chat history"
  ON chat_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read chat history"
  ON chat_history FOR SELECT
  TO anon, authenticated
  USING (true);