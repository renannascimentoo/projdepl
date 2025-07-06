/*
  # Create LoveCleanup AI Database Schema

  1. New Tables
    - `social_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `platform` (text, platform name)
      - `platform_user_id` (text, user ID on platform)
      - `platform_username` (text, username on platform)
      - `access_token` (text, encrypted access token)
      - `is_connected` (boolean, connection status)
      - `connected_at` (timestamptz, when connected)
      - `last_sync` (timestamptz, last sync time)
      - `cached_data` (text, cached platform data)
      - `created_at` (timestamptz, creation time)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Create indexes for performance

  3. Updates
    - Add missing columns to existing tables if needed
*/

-- Create social_connections table
CREATE TABLE IF NOT EXISTS social_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  platform text NOT NULL,
  platform_user_id text,
  platform_username text,
  access_token text,
  is_connected boolean DEFAULT false,
  connected_at timestamptz,
  last_sync timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  cached_data text
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'social_connections_user_id_fkey'
    AND table_name = 'social_connections'
  ) THEN
    ALTER TABLE social_connections 
    ADD CONSTRAINT social_connections_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- Create policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own social connections" ON social_connections;
DROP POLICY IF EXISTS "Users can insert own social connections" ON social_connections;
DROP POLICY IF EXISTS "Users can update own social connections" ON social_connections;
DROP POLICY IF EXISTS "Users can delete own social connections" ON social_connections;

CREATE POLICY "Users can view own social connections" 
  ON social_connections FOR SELECT 
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social connections" 
  ON social_connections FOR INSERT 
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social connections" 
  ON social_connections FOR UPDATE 
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social connections" 
  ON social_connections FOR DELETE 
  TO public
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_connections(platform);
CREATE INDEX IF NOT EXISTS idx_social_connections_user_platform ON social_connections(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_social_connections_connected ON social_connections(is_connected);