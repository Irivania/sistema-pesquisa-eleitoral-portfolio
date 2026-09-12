/*
# Create Settings Table for Access Control

## Overview
Creates a singleton settings table that stores the administrator-controlled
override flag and exception codes for interviewer time restrictions.
Interviewers can normally only collect data between 08:00 and 16:00.
The admin can toggle a global override or generate single-use exception codes.

## New Tables
- `app_settings`
  - `id` (int, PK, always 1): singleton row
  - `override_active` (boolean, default false): when true, all interviewers can collect outside hours
  - `override_expires_at` (timestamptz): optional expiry for the override
  - `updated_at` (timestamptz): last modification timestamp
  - `updated_by` (text): admin who made the change

- `exception_codes`
  - `id` (uuid, PK)
  - `code` (text, unique, not null): the code string an interviewer enters
  - `used` (boolean, default false): whether this code has been consumed
  - `created_by` (text): admin who generated it
  - `created_at` (timestamptz)
  - `used_at` (timestamptz): when it was consumed

## Security
- RLS enabled on both tables.
- CRUD open to anon, authenticated — the app uses the anon key for both profiles.
  The settings and codes are intentionally readable so the interviewer screen
  can check the override status and validate codes client-side.
*/

CREATE TABLE IF NOT EXISTS app_settings (
  id int PRIMARY KEY DEFAULT 1,
  override_active boolean NOT NULL DEFAULT false,
  override_expires_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  updated_by text,
  CONSTRAINT singleton_only CHECK (id = 1)
);

INSERT INTO app_settings (id, override_active)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON app_settings;
CREATE POLICY "anon_select_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_settings" ON app_settings;
CREATE POLICY "anon_update_settings" ON app_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON app_settings;
CREATE POLICY "anon_insert_settings" ON app_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS exception_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_by text,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz
);

ALTER TABLE exception_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_codes" ON exception_codes;
CREATE POLICY "anon_select_codes" ON exception_codes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_codes" ON exception_codes;
CREATE POLICY "anon_insert_codes" ON exception_codes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_codes" ON exception_codes;
CREATE POLICY "anon_update_codes" ON exception_codes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_codes" ON exception_codes;
CREATE POLICY "anon_delete_codes" ON exception_codes FOR DELETE
  TO anon, authenticated USING (true);
