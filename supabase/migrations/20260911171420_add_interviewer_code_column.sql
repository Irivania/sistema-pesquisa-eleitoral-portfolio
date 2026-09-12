-- Add code/ID column to interviewers table
ALTER TABLE interviewers ADD COLUMN IF NOT EXISTS code text;

-- Create unique index on code (excluding nulls) to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS interviewers_code_key ON interviewers (code) WHERE code IS NOT NULL;

-- Backfill existing rows with a generated code if empty
UPDATE interviewers
SET code = 'ENT-' || upper(substr(md5(random()::text), 1, 5))
WHERE code IS NULL;
