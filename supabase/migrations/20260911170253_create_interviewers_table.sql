/*
# Create Interviewers Table

## Overview
Creates a table to store registered interviewers that the administrator can
manage. Each interviewer has a name, optional phone, active status, and
tracks who created them. This replaces the previous "type your name" model
with a proper registration system controlled by the admin.

## New Tables
- `interviewers`
  - `id` (uuid, PK)
  - `name` (text, not null): Display name of the interviewer
  - `phone` (text): Optional contact phone
  - `is_active` (boolean, default true): Whether the interviewer can currently log in
  - `created_by` (text): Name/email of the admin who registered them
  - `created_at` (timestamptz): Registration timestamp

## Security
- RLS enabled on `interviewers`.
- CRUD open to `anon, authenticated` — the app uses the anon key for both
  admin (who signs in via Supabase Auth) and interviewer selection. The
  interviewer list is intentionally visible so the login screen can show it.
*/

CREATE TABLE IF NOT EXISTS interviewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interviewers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_interviewers" ON interviewers;
CREATE POLICY "anon_select_interviewers" ON interviewers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_interviewers" ON interviewers;
CREATE POLICY "anon_insert_interviewers" ON interviewers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_interviewers" ON interviewers;
CREATE POLICY "anon_update_interviewers" ON interviewers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_interviewers" ON interviewers;
CREATE POLICY "anon_delete_interviewers" ON interviewers FOR DELETE
  TO anon, authenticated USING (true);
